// One live-simulation tick (~5s). Mirrors how delivery works on Amazon Ads:
//  • only enabled campaigns → enabled ad groups → enabled keywords serve
//  • a bid above the suggested bid wins more impressions; CPC never exceeds the bid
//  • once today's spend reaches the daily budget the campaign stops ("Out of budget")

const BASE_IMPRESSIONS = 40;
const BASE_CTR = 0.025;
const CPC_FLOOR_SHARE = 0.55; // second-price auctions clear somewhere between ~55% and 100% of the bid
const CONVERSION_RATE = 0.1;
const AOV_MIN = 999;
const AOV_SPAN = 1500;
const BID_REACH_MIN = 0.05;
const BID_REACH_MAX = 2;
const DEFAULT_BID = 8;
// Typical clearing price (₹) when a target has no suggested bid of its own (auto
// targeting, product ads). Bidding far below it should win very little traffic.
export const MARKET_SUGGESTED_BID = 9;

import { localISODate } from './dateRanges';

/** Local calendar date (YYYY-MM-DD); budgets reset at local midnight, as on the console. */
export const todayKey = (now = new Date()) => localISODate(now);

const addMetrics = (m = {}, d) => ({
  impressions: (m.impressions || 0) + d.impressions,
  clicks: (m.clicks || 0) + d.clicks,
  spend: +((m.spend || 0) + d.spend).toFixed(2),
  orders: (m.orders || 0) + d.orders,
  sales: +((m.sales || 0) + d.sales).toFixed(2),
});

function pickWeighted(items, weightOf, rand) {
  const total = items.reduce((s, x) => s + weightOf(x), 0);
  if (total <= 0) return items[0];
  let r = rand() * total;
  for (const x of items) {
    r -= weightOf(x);
    if (r <= 0) return x;
  }
  return items[items.length - 1];
}

function isLive(c, today) {
  if (c.status !== 'Enabled') return false;
  if (c.startDate && c.startDate > today) return false;
  if (c.endDate && c.endDate < today) return false;
  return true;
}

/**
 * Traffic won by one bid in one tick. Reach scales with the square of
 * bid / suggested bid: underbidding loses most auctions, overbidding has
 * diminishing returns (capped at 2x).
 */
export function trafficForBid(bid, suggestedBid, rand) {
  const ratio = bid / (suggestedBid || MARKET_SUGGESTED_BID);
  const reach = Math.min(BID_REACH_MAX, Math.max(BID_REACH_MIN, ratio * ratio));
  const impressions = Math.round(BASE_IMPRESSIONS * reach * (0.5 + rand()));
  const clicks = Array.from({ length: impressions }).filter(() => rand() < BASE_CTR).length;
  const cpc = bid * (CPC_FLOOR_SHARE + rand() * (1 - CPC_FLOOR_SHARE));
  const orders = Array.from({ length: clicks }).filter(() => rand() < CONVERSION_RATE).length;
  return {
    impressions,
    clicks,
    spend: +(clicks * cpc).toFixed(2),
    orders,
    sales: +(orders * (AOV_MIN + rand() * AOV_SPAN)).toFixed(2),
  };
}

// Per-day ledger of live traffic, kept for this many most-recent days.
const LEDGER_DAYS = 120;

/** Adds a delta to an entity's lifetime metrics and to its per-day ledger. */
function accrue(entity, delta, today) {
  const daily = { ...(entity.daily || {}), [today]: addMetrics(entity.daily?.[today], delta) };
  const keys = Object.keys(daily).sort();
  const trimmed = keys.length > LEDGER_DAYS ? Object.fromEntries(keys.slice(-LEDGER_DAYS).map(k => [k, daily[k]])) : daily;
  return { ...entity, metrics: addMetrics(entity.metrics, delta), daily: trimmed };
}

/** Spend that counts against the budget: today's for daily budgets, all-time for lifetime budgets. */
export function spendAgainstBudget(c, today) {
  return c.budgetType === 'Lifetime' ? (c.metrics?.spend || 0) : (c.daily?.[today]?.spend || 0);
}

/** Display ad groups bid through their targets (or cost control), not a default bid. */
function displayBid(c) {
  const bids = (c.sdTargets || []).filter(t => t.status !== 'Paused').map(t => t.bid).filter(b => b > 0);
  return bids.length ? bids.reduce((a, b) => a + b, 0) / bids.length : c.bid;
}

/**
 * Applies one tick to the store slices it touches and returns the new slices.
 * @param {{ campaigns: object[], adGroups: object[], keywords: object[] }} state
 * @param {{ now?: Date, rand?: () => number }} [opts]
 */
export function applyTick({ campaigns, adGroups, keywords }, { now = new Date(), rand = Math.random } = {}) {
  const today = todayKey(now);
  const agDelta = {};
  const kwDelta = {};

  const nextCampaigns = campaigns.map(c => {
    if (!isLive(c, today)) return c;
    const spent = spendAgainstBudget(c, today);
    if (c.budget > 0 && spent >= c.budget) return c;

    const groups = adGroups.filter(ag => ag.campaignId === c.id && ag.status === 'Enabled');
    if (groups.length === 0) return c;
    const ag = pickWeighted(groups, g => g.defaultBid || 1, rand);

    const liveKeywords = keywords.filter(k => k.adGroupId === ag.id && k.status === 'Enabled');
    const hasKeywordTargets = keywords.some(k => k.adGroupId === ag.id);
    // Manual ad groups with every keyword paused have nothing to serve.
    if (hasKeywordTargets && liveKeywords.length === 0) return c;
    const kw = liveKeywords.length ? pickWeighted(liveKeywords, k => k.bid || 1, rand) : null;

    // `||` (not `??`): a 0 bid means "not set", never a free click.
    const isDisplay = c.type === 'Sponsored Display';
    const bid = kw?.bid || (isDisplay && displayBid(c)) || ag.defaultBid || DEFAULT_BID;
    const suggested = kw?.suggestedBid || MARKET_SUGGESTED_BID;
    const raw = trafficForBid(bid, suggested, rand);
    // Never spend past the budget.
    const room = c.budget > 0 ? c.budget - spent : Infinity;
    const delta = raw.spend > room ? { ...raw, spend: +room.toFixed(2) } : raw;

    agDelta[ag.id] = delta;
    if (kw) kwDelta[kw.id] = delta;
    return accrue(c, delta, today);
  });

  return {
    campaigns: nextCampaigns,
    adGroups: adGroups.map(ag => (agDelta[ag.id] ? accrue(ag, agDelta[ag.id], today) : ag)),
    keywords: keywords.map(k => (kwDelta[k.id] ? accrue(k, kwDelta[k.id], today) : k)),
  };
}
