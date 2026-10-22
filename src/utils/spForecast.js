// Forecast panel rules for the Sponsored Products builder, as observed on
// advertising.amazon.in (Oct 2026). The real panel only shows numbers once the
// draft has products, valid targets and bids, and a large enough budget.

export const MIN_FORECAST_BUDGET = 300;
export const MIN_FORECAST_KEYWORDS = 3;
const DAYS = { Weekly: 7, Daily: 1 };
const CVR_LOW = 0.07;
const CVR_HIGH = 0.12;
const SPEND_SHARE_LOW = 0.55; // campaigns rarely spend their full budget every day
const SPEND_SHARE_HIGH = 0.9;

const inRange = (k) => {
  const bid = parseFloat(k.bid);
  return k.suggMin !== undefined && bid >= k.suggMin && bid <= k.suggMax;
};

/**
 * @param {{ products: number, targeting: 'Auto'|'Manual', manualType?: 'keyword'|'product',
 *           keywords?: Array<{ bid: string|number, suggMin?: number, suggMax?: number }>,
 *           bid?: number, budget?: number, period?: 'Weekly'|'Daily' }} draft
 * @returns {{ kind: 'todo', title: string, items: string[] }
 *         | { kind: 'unavailable', items: string[] }
 *         | { kind: 'message', text: string }
 *         | { kind: 'estimate', clicks: [number, number], orders: [number, number] }}
 */
export function spForecast(draft) {
  if (!draft.products) {
    return { kind: 'todo', title: 'To see a forecast:', items: ['Choose products', 'Add targets', 'Enter a bid'] };
  }
  if (draft.targeting === 'Manual' && draft.manualType === 'product') {
    return { kind: 'unavailable', items: ['Product targeting'] };
  }
  if (draft.targeting === 'Manual') {
    const valid = (draft.keywords || []).filter(inRange).length;
    if (valid < MIN_FORECAST_KEYWORDS) {
      return { kind: 'message', text: `Add at least ${MIN_FORECAST_KEYWORDS} keywords with bids in the suggested bid range to see forecast.` };
    }
  }
  const budget = parseFloat(draft.budget) || 0;
  if (budget < MIN_FORECAST_BUDGET) {
    return { kind: 'message', text: `To see a forecast, enter a budget of at least ₹${MIN_FORECAST_BUDGET.toFixed(2)}` };
  }
  const bid = Math.max(1, parseFloat(draft.bid) || 1);
  const days = DAYS[draft.period] || DAYS.Weekly;
  const clicksLow = Math.round((budget * SPEND_SHARE_LOW * days) / (bid * 1.1));
  const clicksHigh = Math.round((budget * SPEND_SHARE_HIGH * days) / (bid * 0.8));
  return {
    kind: 'estimate',
    clicks: [clicksLow, clicksHigh],
    orders: [Math.round(clicksLow * CVR_LOW), Math.round(clicksHigh * CVR_HIGH)],
  };
}
