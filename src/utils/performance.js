// Turns an entity's lifetime metrics into per-day numbers so the console's
// date range, metric strip, chart and table all agree with each other.
// Each day's share is a deterministic pseudo-random weight, so numbers stay
// stable between renders and only move when the live simulation ticks.

import { parseLocalDate, localISODate } from './dateRanges';

const DAY_MS = 86400000;
const BASE_KEYS = ['impressions', 'clicks', 'spend', 'orders', 'sales'];
const WEIGHT_MIN = 0.55;
const WEIGHT_SPAN = 0.9;
// Derived console metrics the simulator does not model directly.
const DPV_PER_CLICK = 0.86;
const BRANDED_SEARCH_PER_IMPRESSION = 0.0035;
const NTB_SHARE_OF_ORDERS = 0.38;

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // murmur3 fmix32: spreads small input differences (consecutive dates) across all bits
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

// Each metric also wobbles on its own, so clicks, cost and orders don't move in lockstep.
const METRIC_JITTER = { impressions: 0.15, clicks: 0.3, spend: 0.3, orders: 0.8, sales: 0.8 };

/** Un-normalised weight of metric `k` on day `d` for a seed (campaign) key. */
const rawWeight = (seed, d, k) => {
  const day = WEIGHT_MIN + hash(`${seed}|${dayKey(d)}`) * WEIGHT_SPAN;
  const jitter = 1 - METRIC_JITTER[k] / 2 + hash(`${seed}|${dayKey(d)}|${k}`) * METRIC_JITTER[k];
  return day * jitter;
};

// Sum of raw weights over the days that carry seeded history, per metric, so
// those days' shares add up to exactly 1. Keyed by seed + span; only the
// current day's spans are kept, so the cache can't grow without bound.
const weightSums = new Map();
let weightSumsDay = null;
function seedWeightSums(seed, spanFrom, spanTo) {
  if (weightSumsDay !== spanTo.getTime()) { weightSums.clear(); weightSumsDay = spanTo.getTime(); }
  const key = `${seed}|${spanFrom.getTime()}`;
  if (!weightSums.has(key)) {
    const sums = emptyTotals();
    for (let d = spanFrom; d <= spanTo; d = new Date(d.getTime() + DAY_MS)) {
      BASE_KEYS.forEach(k => { sums[k] += rawWeight(seed, d, k); });
    }
    weightSums.set(key, sums);
  }
  return weightSums.get(key);
}

function lifetimeStart(entity, today) {
  const start = entity.startDate || entity.createdAt || Object.keys(entity.daily || {}).sort()[0];
  const from = start ? parseLocalDate(start.slice(0, 10)) : today;
  return from > today ? today : from;
}

function emptyTotals() { return Object.fromEntries(BASE_KEYS.map(k => [k, 0])); }

/** Child entities (ad groups, keywords) inherit their campaign's start date. */
export const withParentStart = (child, campaign) => ({ ...child, startDate: campaign.startDate || campaign.createdAt });

/**
 * Per-day base metrics for one entity across a date range.
 *  • Traffic from the live simulation is read from the entity's per-day ledger
 *    (`daily`), so past days never change once they're over.
 *  • Seeded history (lifetime metrics not in the ledger) is spread over the days
 *    before today with a deterministic weight; ad groups and keywords use their
 *    campaign as the seed so children always add up to the parent.
 * @param {{ id: string, campaignId?: string, metrics: object, daily?: object, startDate?: string, createdAt?: string }} entity
 * @param {{ from: Date, to: Date }} range
 * @returns {Array<{ date: Date } & Record<string, number>>}
 */
export function dailyMetrics(entity, { from, to }) {
  const today = startOfDay(new Date());
  const seed = entity.campaignId || entity.id;
  const lifeFrom = lifetimeStart(entity, today);
  const ledger = entity.daily || {};
  const ledgerTotals = emptyTotals();
  Object.values(ledger).forEach(m => BASE_KEYS.forEach(k => { ledgerTotals[k] += m[k] || 0; }));
  const seeded = Object.fromEntries(BASE_KEYS.map(k => [k, Math.max(0, (entity.metrics?.[k] || 0) - ledgerTotals[k])]));

  // Seeded history lives on days before today; a campaign started today keeps it on today.
  const spanTo = lifeFrom < today ? new Date(today.getTime() - DAY_MS) : today;
  const sums = seedWeightSums(seed, lifeFrom, spanTo);

  const rows = [];
  for (let d = startOfDay(from); d <= to; d = new Date(d.getTime() + DAY_MS)) {
    const inSeedSpan = d >= lifeFrom && d <= spanTo;
    const live = ledger[localISODate(d)];
    const row = { date: d };
    BASE_KEYS.forEach(k => {
      const fromSeed = inSeedSpan && sums[k] ? seeded[k] * (rawWeight(seed, d, k) / sums[k]) : 0;
      row[k] = fromSeed + (live?.[k] || 0);
    });
    rows.push(row);
  }
  return rows;
}

/** Adds ratio metrics (CTR, CPC, ACOS, ROAS, CVR) and console extras to base totals. */
export function withDerived(t) {
  return {
    ...t,
    ctr: t.impressions ? (t.clicks / t.impressions) * 100 : 0,
    cpc: t.clicks ? t.spend / t.clicks : 0,
    acos: t.sales ? (t.spend / t.sales) * 100 : 0,
    roas: t.spend ? t.sales / t.spend : 0,
    cvr: t.clicks ? (t.orders / t.clicks) * 100 : 0,
    dpv: t.clicks * DPV_PER_CLICK,
    brandedSearches: t.impressions * BRANDED_SEARCH_PER_IMPRESSION,
    ntbOrders: t.orders * NTB_SHARE_OF_ORDERS,
    ntbSales: t.sales * NTB_SHARE_OF_ORDERS,
  };
}

/** Range totals (with derived metrics) for one entity. */
export function rangeMetrics(entity, range) {
  const totals = emptyTotals();
  dailyMetrics(entity, range).forEach(row => BASE_KEYS.forEach(k => { totals[k] += row[k]; }));
  totals.impressions = Math.round(totals.impressions);
  totals.clicks = Math.round(totals.clicks);
  totals.orders = Math.round(totals.orders);
  return withDerived(totals);
}

/** Sums range totals across many entities. */
export function sumMetrics(list) {
  const totals = emptyTotals();
  list.forEach(m => BASE_KEYS.forEach(k => { totals[k] += m[k] || 0; }));
  return withDerived(totals);
}

/** Day-by-day series across entities, for the performance chart. */
export function dailySeries(entities, range) {
  const perEntity = entities.map(e => dailyMetrics(e, range));
  const days = perEntity[0]?.length ?? dailyMetrics({ id: 'x', metrics: {} }, range).length;
  return Array.from({ length: days }, (_, i) => {
    const totals = emptyTotals();
    perEntity.forEach(rows => BASE_KEYS.forEach(k => { totals[k] += rows[i][k]; }));
    const date = perEntity[0]?.[i]?.date ?? new Date(range.from.getTime() + i * DAY_MS);
    return { ...withDerived(totals), label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });
}
