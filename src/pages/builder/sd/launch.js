import { goalConfig, HEADLINE_MAX } from './sdConfig';

// Typical display funnel rates used to turn cost-control targets into an effective CPC bid
// for the delivery engine (which simulates clicks).
const DISPLAY_CTR = 0.004;
const DISPLAY_CVR = 0.08;
const VIEWABLE_SHARE = 0.55;
const FORECAST_CLICK_SHARE = 0.257;
const FORECAST_ORDER_RATE = 0.004;

/**
 * @typedef {object} SdTarget
 * @property {string} key
 * @property {string} group   contextual | remarketing | in-market | interest-lifestyle | product
 * @property {string} type    e.g. "Views remarketing", "Contextual", "In-market"
 * @property {string} label
 * @property {string} bid
 * @property {'views'|'purchases'} [lookbackType]
 * @property {number} [lookbackDays]
 */

/**
 * @typedef {object} SdDraft
 * @property {string} name
 * @property {string} adGroupName
 * @property {string} budget
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} portfolioId
 * @property {'reach'|'consideration'|'conversion'} goal
 * @property {boolean} costControl
 * @property {string} costControlValue
 * @property {'image'|'video'} adFormat
 * @property {Array<{ asin: string, price?: number }>} products
 * @property {SdTarget[]} targets
 * @property {boolean} optimisedTargeting   Conversions only
 * @property {string} [optimisedBid]         Conversions only, used when cost control is off
 * @property {{ logo: boolean, headlineOn: boolean, headline: string, imageOn: boolean, video: string }} creative
 */

const num = (v) => parseFloat(v);
const isPositive = (v) => num(v) > 0;
const hasTargets = (d) => d.targets.length > 0 || (d.goal === 'conversion' && d.optimisedTargeting);

/** Every message that blocks "Launch campaign"; empty when the draft can launch. */
export function validateSdDraft(d) {
  const errors = [];
  const cfg = goalConfig(d.goal);
  if (!d.name.trim()) errors.push('Enter a campaign name.');
  if (!isPositive(d.budget)) errors.push('Enter a daily budget.');
  if (d.endDate && d.endDate < d.startDate) errors.push('The end date must be after the start date.');
  if (!d.adGroupName.trim()) errors.push('Enter an ad group name.');
  if (d.costControl && !(num(d.costControlValue) >= cfg.ccMin)) {
    errors.push(d.goal === 'conversion' ? 'Minimum cost per order is ₹50.00.' : `Enter a ${cfg.ccLabel.toLowerCase()} value.`);
  }
  if (d.products.length === 0) errors.push('Add at least one product to advertise.');
  if (!hasTargets(d)) errors.push('Add at least one target.');
  const isOptimised = d.goal === 'conversion' && d.optimisedTargeting;
  if (!d.costControl && (d.targets.some(t => !isPositive(t.bid)) || (isOptimised && !isPositive(d.optimisedBid)))) errors.push('Enter a bid for every target.');
  if (d.creative.headlineOn && !d.creative.headline.trim()) errors.push('Add a headline or turn the headline off.');
  if (d.creative.headline.length > HEADLINE_MAX) errors.push(`Headlines can be up to ${HEADLINE_MAX} characters.`);
  if (d.adFormat === 'video' && !d.creative.video) errors.push('Add a video for your video ad.');
  return errors;
}

/** Cost-control values converted to the CPC the delivery engine bids with. */
export function effectiveCpc(goal, costControlValue) {
  const v = num(costControlValue) || 0;
  if (goal === 'reach') return +((v / 1000) * VIEWABLE_SHARE / DISPLAY_CTR).toFixed(2);
  if (goal === 'conversion') return +(v * DISPLAY_CVR).toFixed(2);
  return +v.toFixed(2);
}

const targetName = (t) => [t.type, t.label, t.lookbackDays ? `${t.lookbackDays} days` : null].filter(Boolean).join(' · ');

/** Builds the store records for a valid draft. */
export function buildSdLaunch(d, { campaignId, adGroupId, today }) {
  const cfg = goalConfig(d.goal);
  const asins = d.products.map(p => p.asin);
  const ccBid = d.costControl ? effectiveCpc(d.goal, d.costControlValue) : null;
  const sdTargets = [
    ...(d.goal === 'conversion' && d.optimisedTargeting ? [{ type: 'Optimised', name: 'Reach audiences who are likely to be interested in your ad', bid: d.costControl ? ccBid : num(d.optimisedBid), status: 'Enabled' }] : []),
    ...d.targets.map(t => ({
      type: t.group === 'contextual' || t.group === 'product' ? 'Contextual' : 'Audience',
      name: targetName(t), bid: d.costControl ? ccBid : num(t.bid), status: 'Enabled',
    })),
  ];
  const hasContextual = sdTargets.some(t => t.type === 'Contextual');
  const hasAudience = sdTargets.some(t => t.type !== 'Contextual');
  return {
    campaign: {
      id: campaignId, name: d.name.trim(), type: 'Sponsored Display', status: 'Enabled',
      targetingType: hasContextual && hasAudience ? 'Contextual + Audiences' : hasContextual ? 'Contextual' : 'Audiences',
      budget: num(d.budget), budgetType: 'Daily',
      biddingStrategy: `Optimize for ${cfg.label.toLowerCase()}`,
      costType: cfg.costType, goal: d.goal,
      costControlEnabled: d.costControl, costControlValue: d.costControl ? num(d.costControlValue) : null,
      bid: ccBid, portfolioId: d.portfolioId, startDate: d.startDate, endDate: d.endDate,
      sdTargets,
      sdCreative: {
        adFormat: d.adFormat, products: asins, logo: d.creative.logo,
        headline: d.creative.headlineOn ? d.creative.headline.trim() : '',
        customImage: d.adFormat === 'image' && d.creative.imageOn, video: d.adFormat === 'video' ? d.creative.video : '',
      },
      createdAt: today,
      metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 },
    },
    adGroup: {
      id: adGroupId, campaignId, name: d.adGroupName.trim(), status: 'Enabled',
      defaultBid: ccBid ?? 0, products: asins, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 },
    },
  };
}

const rangeLabel = (lo, hi) => `${compact(lo)}-${compact(hi)}`;
function compact(n) {
  const r = Math.round(n);
  return r >= 1000 ? `${+(r / 1000).toFixed(1)}K` : String(r);
}

/**
 * Forecast panel state. Returns the checklist while inputs are missing, otherwise weekly ranges
 * for the goal's two metrics.
 * @returns {{ missing: string[], values: Record<string, string> | null }}
 */
export function sdForecast(d) {
  const cfg = goalConfig(d.goal);
  const missing = [];
  if (!isPositive(d.budget)) missing.push('Enter a budget');
  if (d.products.length === 0) missing.push('Choose products');
  if (!hasTargets(d)) missing.push('Add targets');
  const bidMissing = d.costControl ? !isPositive(d.costControlValue) : (d.targets.length === 0 || d.targets.some(t => !isPositive(t.bid)));
  if (bidMissing) missing.push('Enter a bid');
  if (missing.length) return { missing, values: null };

  const weeklyBudget = num(d.budget) * 7;
  const cpc = d.costControl ? effectiveCpc(d.goal, d.costControlValue)
    : d.targets.reduce((s, t) => s + num(t.bid), 0) / Math.max(1, d.targets.length);
  // Calibrated to the console: ₹1,000/day at a ₹5 CPC target forecasts 90-360 clicks, 0-3.6K impressions a week.
  const clicksHi = (weeklyBudget / Math.max(cpc, 1)) * FORECAST_CLICK_SHARE;
  const clicksLo = clicksHi / 4;
  const imprHi = clicksHi * 10;
  const metric = {
    Impressions: rangeLabel(0, imprHi),
    'Viewable impressions': rangeLabel(0, imprHi * VIEWABLE_SHARE),
    Clicks: rangeLabel(clicksLo, clicksHi),
    Orders: rangeLabel(0, Math.max(1, clicksHi * FORECAST_ORDER_RATE)),
  };
  return { missing: [], values: Object.fromEntries(cfg.forecastMetrics.map(m => [m, metric[m]])) };
}
