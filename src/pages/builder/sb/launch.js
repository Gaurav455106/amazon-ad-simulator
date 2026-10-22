import { SB_MIN_PRODUCTS, SB_MAX_PRODUCTS } from './limits';

const COST_TYPE = { 'impression-share': 'vCPM', 'share-of-voice': 'Fixed price' };
const DEFAULT_KEYWORD_BID = 25;

/**
 * @typedef {object} SbDraft
 * @property {string} name
 * @property {string} adGroupName
 * @property {string} budget
 * @property {'Daily'|'Lifetime'} budgetType
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} portfolioId
 * @property {string} goal                 'page-visits' | 'impression-share' | 'share-of-voice'
 * @property {string} site                 'amazon' | 'amazon-business'
 * @property {string} adFormat             'product-collection' | 'store-spotlight' | 'video'
 * @property {'automatic'|'manual'} collectionType
 * @property {Array<{ asin: string }>} products
 * @property {'auto'|'standard'|'custom'} titleMode
 * @property {string} customTitle
 * @property {string} brandName
 * @property {string} landingPage
 * @property {'keyword'|'product'} targetType
 * @property {Array<{ keyword: string, matchType: string, bid: string }>} keywords   theme groups use matchType 'Theme'
 * @property {Array<{ id: string, name: string, bid: string, type?: string }>} productTargets
 * @property {Array<{ keyword: string, matchType: string }>} negativeKeywords
 */

const toKeyword = (k) => ({ keyword: k.keyword, matchType: k.matchType, bid: parseFloat(k.bid) || DEFAULT_KEYWORD_BID });
// Individual products carry type 'Exact' | 'Expanded'; categories have no type (same shape as SP).
const toProductTarget = (t) => ({
  keyword: t.type ? `product="${t.name}"` : `category="${t.name}"`,
  label: t.name, matchType: t.type || 'Category', targetKind: 'product', bid: parseFloat(t.bid),
});

const needsProducts = (d) => d.adFormat === 'product-collection' && d.collectionType === 'manual';

/** Returns the messages that block "Submit for review"; empty when the draft can be submitted. */
export function validateSbDraft(d) {
  const errors = [];
  if (!d.name.trim()) errors.push('Enter a campaign name.');
  const budget = parseFloat(d.budget);
  if (!(budget > 0)) errors.push('Enter a budget.');
  if (d.budgetType === 'Lifetime' && !d.endDate) errors.push('A lifetime budget needs an end date.');
  if (d.endDate && d.endDate < d.startDate) errors.push('The end date must be after the start date.');
  if (d.goal === 'share-of-voice') return errors;
  if (needsProducts(d) && d.products.length < SB_MIN_PRODUCTS) errors.push('Add at least three products to advertise.');
  if (needsProducts(d) && d.products.length > SB_MAX_PRODUCTS) errors.push('You can feature up to 10 products.');
  if (d.titleMode === 'custom' && !d.customTitle.trim()) errors.push('Write your ad title.');
  const isKeyword = d.adFormat === 'product-collection' && d.collectionType === 'automatic' ? true : d.targetType === 'keyword';
  if (isKeyword && d.keywords.length === 0) errors.push('Add at least one keyword.');
  if (!isKeyword && d.productTargets.length === 0) errors.push('Add at least one product target.');
  const targets = isKeyword ? d.keywords : d.productTargets;
  if (targets.some(t => !(parseFloat(t.bid) > 0))) errors.push('Enter a bid for every target.');
  return errors;
}

/** Builds the store records for a valid SB draft. */
export function buildSbLaunch(d, { campaignId, adGroupId, today }) {
  const asins = needsProducts(d) ? d.products.map(p => p.asin) : [];
  const isKeyword = d.adFormat === 'product-collection' && d.collectionType === 'automatic' ? true : d.targetType === 'keyword';
  return {
    campaign: {
      id: campaignId, name: d.name.trim(), type: 'Sponsored Brands', status: 'Enabled',
      targetingType: 'Manual', budget: parseFloat(d.budget), budgetType: d.budgetType,
      biddingStrategy: 'Fixed bid', portfolioId: d.portfolioId, startDate: d.startDate, endDate: d.endDate,
      adFormat: d.adFormat, site: d.site, sbGoal: d.goal, costType: COST_TYPE[d.goal] || 'CPC',
      sbCreative: {
        brandName: d.brandName, collectionType: d.collectionType, titleMode: d.titleMode,
        headline: d.titleMode === 'custom' ? d.customTitle.trim() : '', landingPage: d.landingPage, products: asins,
      },
      createdAt: today,
      metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 },
    },
    adGroup: {
      id: adGroupId, campaignId, name: d.adGroupName.trim() || `Ad group - ${today}`, status: 'Enabled',
      defaultBid: 0, products: asins, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 },
    },
    keywords: (isKeyword ? d.keywords.map(toKeyword) : d.productTargets.map(toProductTarget)).map(k => ({
      ...k, adGroupId, campaignId, status: 'Enabled', metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 },
    })),
    negativeKeywords: d.negativeKeywords.map(n => ({ ...n, campaignId, adGroupId, level: 'Ad Group' })),
  };
}
