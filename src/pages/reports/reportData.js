// Rows for each report type on the Reports page, built from the simulator's own campaigns
// so a report always matches what the Campaign manager shows for the same date range.
import { rangeMetrics, withParentStart, withDerived } from '../../utils/performance';
import { buildSearchTerms } from '../../utils/searchTerms';
import { placementBreakdown } from '../../utils/placements';

export const REPORT_TYPES = [
  { key: 'campaign', label: 'Campaign performance' },
  { key: 'adGroup', label: 'Ad group performance' },
  { key: 'keyword', label: 'Keyword performance' },
  { key: 'searchTerm', label: 'Search term report' },
  { key: 'placement', label: 'Placement report' },
  { key: 'product', label: 'Advertised product report' },
];

const BASE_KEYS = ['impressions', 'clicks', 'spend', 'orders', 'sales'];
// Stable share of an ad group's delivery per product, so report rows don't jump on re-render.
const productWeight = (asin, i) => 1 + ((asin.charCodeAt(asin.length - 1) + i) % 5) / 4;

/**
 * @param {string} type a REPORT_TYPES key
 * @param {{ campaigns: object[], adGroups: object[], keywords: object[], products: object[] }} state
 * @param {{ from: Date, to: Date }} range
 * @returns {object[]} rows with `id`, `campaign` and metrics in `m`
 */
export function buildReportRows(type, { campaigns, adGroups, keywords, products }, range) {
  const campaignOf = Object.fromEntries(campaigns.map(c => [c.id, c]));
  const adGroupRows = () => adGroups.filter(ag => campaignOf[ag.campaignId])
    .map(ag => ({ id: ag.id, adGroup: ag, campaign: campaignOf[ag.campaignId], m: rangeMetrics(withParentStart(ag, campaignOf[ag.campaignId]), range) }));
  const keywordRows = () => keywords.filter(k => campaignOf[k.campaignId])
    .map(k => ({ id: k.id, keyword: k, campaign: campaignOf[k.campaignId], adGroup: adGroups.find(ag => ag.id === k.adGroupId), m: rangeMetrics(withParentStart(k, campaignOf[k.campaignId]), range) }));

  switch (type) {
    case 'adGroup':
      return adGroupRows();
    case 'keyword':
      return keywordRows();
    case 'searchTerm':
      return buildSearchTerms(keywordRows().map(r => ({ k: r.keyword, m: r.m })))
        .filter(t => t.impressions >= 1)
        .map(t => ({ id: t.id, term: t.term, keyword: t.keyword, campaign: campaignOf[t.keyword.campaignId], m: t }));
    case 'placement':
      return campaigns.filter(c => c.type !== 'Sponsored Display').flatMap(c =>
        placementBreakdown(rangeMetrics(c, range), c.placementAdjustments || {})
          .map(p => ({ id: `${c.id}|${p.key}`, campaign: c, placement: p.label, m: p.m })));
    case 'product':
      return adGroupRows().flatMap(({ adGroup: ag, campaign, m }) => {
        const asins = ag.products || [];
        const weights = asins.map(productWeight);
        const total = weights.reduce((a, b) => a + b, 0) || 1;
        return asins.map((asin, i) => {
          const share = weights[i] / total;
          const base = Object.fromEntries(BASE_KEYS.map(k => [k, (m[k] || 0) * share]));
          return { id: `${ag.id}|${asin}`, campaign, adGroup: ag, asin, product: products.find(p => p.asin === asin), m: withDerived(base) };
        });
      });
    default:
      return campaigns.map(c => ({ id: c.id, campaign: c, m: rangeMetrics(c, range) }));
  }
}
