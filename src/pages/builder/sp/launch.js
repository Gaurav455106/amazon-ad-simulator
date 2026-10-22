// Sponsored Products builder: validation and the entities a launch creates.
// Pure functions so the rules can be unit-tested without rendering the builder.

export const MIN_DAILY_BUDGET = 50;
export const MIN_BID = 1;
export const KEYWORD_GROUP_LABEL = 'Keywords related to your product category';
const PRESET_GROUP_BID = 8.03;
const EMPTY_METRICS = { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 };

const num = (v) => parseFloat(v);
export const validBid = (v) => num(v) >= MIN_BID;

/**
 * @typedef {object} SpDraft
 * @property {'campaign'|'adGroup'} mode
 * @property {'standard'|'preset'} setup
 * @property {string} name  campaign name
 * @property {string} adGroupName
 * @property {string|number} budget
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} portfolioId
 * @property {string} biddingStrategy
 * @property {'Auto'|'Manual'} targetingType
 * @property {'keyword'|'product'} manualType
 * @property {'default'|'groups'} autoBidMode
 * @property {string|number} defaultBid
 * @property {Array<{ key: string, on: boolean, bid: string }>} autoGroups
 * @property {Array<{ type?: string, keyword?: string, matchType?: string, bid: string }>} keywords
 * @property {Array<{ id: string, name: string, bid: string, type?: 'Exact'|'Expanded' }>} productTargets
 * @property {Array<{ keyword: string, matchType: string }>} negativeKeywords
 * @property {Array<{ kind: 'brand'|'product', brand?: string, asin?: string, name?: string }>} [negativeProducts]
 * @property {string[]} products  ASINs
 * @property {string} site
 * @property {{ top: string, rest: string, product: string }} placements
 * @property {{ mode: string, audience: string, pct: string }} audience
 */

/** @param {SpDraft} d @returns {string[]} messages, empty when the draft can launch */
export function validateSpDraft(d) {
  const errors = [];
  const isCampaign = d.mode === 'campaign';
  if (d.products.length === 0) errors.push('Add at least one product.');
  if (isCampaign) {
    if (!d.name.trim()) errors.push('Enter a campaign name.');
    if (!(num(d.budget) >= MIN_DAILY_BUDGET)) errors.push(`Enter a daily budget of at least ₹${MIN_DAILY_BUDGET}.00.`);
    if (d.endDate && d.endDate < d.startDate) errors.push('End date can’t be before the start date.');
  }
  if (d.setup === 'preset') return errors;

  if (!d.adGroupName.trim()) errors.push('Enter an ad group name.');
  if (d.targetingType === 'Auto') {
    if (d.autoBidMode === 'groups') {
      const on = d.autoGroups.filter(g => g.on);
      if (on.length === 0) errors.push('Turn on at least one targeting group.');
      if (on.some(g => !validBid(g.bid))) errors.push(`Each targeting group needs a bid of at least ₹${MIN_BID}.00.`);
    } else if (!validBid(d.defaultBid)) {
      errors.push(`Enter a default bid of at least ₹${MIN_BID}.00.`);
    }
  } else if (d.manualType === 'keyword') {
    if (d.keywords.length === 0) errors.push('Add at least one keyword.');
    if (d.keywords.some(k => !validBid(k.bid))) errors.push('You have one or more errors in this list: enter a bid for every keyword.');
  } else if (d.productTargets.length === 0) {
    errors.push('Add at least one category or product to target.');
  } else if (d.productTargets.some(t => !validBid(t.bid))) {
    errors.push(`Each category or product target needs a bid of at least ₹${MIN_BID}.00.`);
  }
  if (isCampaign && d.audience?.mode === 'increase' && !d.audience.audience) errors.push('Add a bid adjustments audience.');
  return errors;
}

const toKeyword = (k) => (k.type === 'group'
  ? { keyword: KEYWORD_GROUP_LABEL, matchType: 'Keyword group', bid: num(k.bid) }
  : { keyword: k.keyword, matchType: k.matchType, bid: num(k.bid) });

// Individual products carry type 'Exact' | 'Expanded'; categories have no type.
const toProductTarget = (t) => ({
  keyword: t.type ? `product="${t.name}"` : `category="${t.name}"`,
  label: t.name,
  matchType: t.type || 'Category',
  targetKind: 'product',
  bid: num(t.bid),
});

/**
 * Entities to create for a valid draft.
 * @param {SpDraft} d
 * @param {{ campaignId: string, adGroupId: string, today: string, parentCampaign?: object }} ids
 */
export function buildSpLaunch(d, { campaignId, adGroupId, today, parentCampaign }) {
  if (d.mode === 'adGroup' && !parentCampaign) throw new Error('Cannot add an ad group: campaign not found.');
  const isPreset = d.setup === 'preset';
  const targetingType = d.mode === 'adGroup' ? parentCampaign.targetingType : (isPreset ? 'Manual' : d.targetingType);

  const campaign = d.mode === 'campaign' ? {
    id: campaignId,
    name: d.name.trim(),
    type: 'Sponsored Products',
    status: 'Enabled',
    targetingType,
    budget: num(d.budget),
    budgetType: 'Daily',
    biddingStrategy: isPreset ? 'Dynamic bids - up and down' : d.biddingStrategy,
    portfolioId: d.portfolioId,
    startDate: d.startDate,
    endDate: d.endDate,
    site: d.site,
    preset: isPreset,
    placementAdjustments: isPreset ? {} : {
      top: num(d.placements.top) || 0,
      rest: num(d.placements.rest) || 0,
      product: num(d.placements.product) || 0,
    },
    audienceAdjustment: !isPreset && d.audience?.mode === 'increase' ? { ...d.audience, pct: num(d.audience.pct) || 0 } : { mode: 'none' },
    createdAt: today,
    metrics: { ...EMPTY_METRICS },
  } : null;

  const isAuto = targetingType === 'Auto';
  const adGroup = {
    id: adGroupId,
    campaignId,
    name: isPreset ? `Ad group - ${d.name.trim()}` : d.adGroupName.trim(),
    status: 'Enabled',
    defaultBid: isAuto && d.autoBidMode === 'default' ? num(d.defaultBid) : (num(d.defaultBid) || MIN_BID),
    products: [...d.products],
    ...(isAuto && d.autoBidMode === 'groups' && {
      autoTargets: Object.fromEntries(d.autoGroups.map(g => [g.key, { status: g.on ? 'Enabled' : 'Paused', bid: num(g.bid) }])),
    }),
    metrics: { ...EMPTY_METRICS },
  };

  let keywords = [];
  if (isPreset) keywords = [{ keyword: KEYWORD_GROUP_LABEL, matchType: 'Keyword group', bid: PRESET_GROUP_BID }];
  else if (!isAuto && d.manualType === 'keyword') keywords = d.keywords.map(toKeyword);
  else if (!isAuto && d.manualType === 'product') keywords = d.productTargets.map(toProductTarget);

  return {
    campaign,
    adGroup,
    keywords: keywords.map(k => ({ ...k, campaignId, adGroupId, status: 'Enabled', metrics: { ...EMPTY_METRICS } })),
    negativeKeywords: d.negativeKeywords.map(n => ({ ...n, campaignId, adGroupId, level: 'Ad Group' })),
    negativeProducts: (d.negativeProducts || []).map(n => ({ ...n, campaignId, adGroupId, level: 'Ad Group' })),
  };
}
