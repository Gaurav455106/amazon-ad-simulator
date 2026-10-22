import { withDerived } from './performance';

export const PLACEMENTS = [
  { key: 'top', label: 'Top of search (first page)', baseShare: 0.45 },
  { key: 'rest', label: 'Rest of search', baseShare: 0.35 },
  { key: 'product', label: 'Product pages', baseShare: 0.2 },
];
/**
 * Splits campaign totals across placements. Raising a placement's adjustment
 * wins it a larger share of traffic, which is the behaviour students should see.
 */
export function placementBreakdown(totals, adjustments = {}) {
  const weights = PLACEMENTS.map(p => p.baseShare * (1 + (adjustments[p.key] || 0) / 100));
  const sum = weights.reduce((a, b) => a + b, 0);
  return PLACEMENTS.map((p, i) => {
    const share = weights[i] / sum;
    const base = ['impressions', 'clicks', 'spend', 'orders', 'sales'].reduce((acc, k) => ({ ...acc, [k]: totals[k] * share }), {});
    return { ...p, m: withDerived(base) };
  });
}
