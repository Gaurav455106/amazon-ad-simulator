import { formatCurrency, formatNumber, formatPercent } from '../../utils/simulation';

const fmtRoas = (v) => Number(v || 0).toFixed(2);
// Counts are split across days/placements as fractions; the console only ever shows whole numbers.
const fmtCount = (v) => formatNumber(Math.round(v || 0));

// Console metric names. `key` maps onto utils/performance.js totals.
export const METRICS = {
  impressions: { label: 'Impressions', format: fmtCount, agg: 'TOTAL' },
  clicks: { label: 'Clicks', format: fmtCount, agg: 'TOTAL' },
  spend: { label: 'Total cost', format: formatCurrency, agg: 'TOTAL' },
  orders: { label: 'Purchases', format: fmtCount, agg: 'TOTAL' },
  sales: { label: 'Sales', format: formatCurrency, agg: 'TOTAL' },
  ctr: { label: 'CTR', format: formatPercent, agg: 'AVERAGE' },
  cpc: { label: 'CPC', format: formatCurrency, agg: 'AVERAGE' },
  acos: { label: 'ACOS', format: formatPercent, agg: 'AVERAGE' },
  roas: { label: 'ROAS', format: fmtRoas, agg: 'AVERAGE' },
  cvr: { label: 'Purchase rate', format: formatPercent, agg: 'AVERAGE' },
  dpv: { label: 'Detail page views', format: fmtCount, agg: 'TOTAL' },
  brandedSearches: { label: 'Branded searches', format: fmtCount, agg: 'TOTAL' },
  ntbOrders: { label: 'Purchases (new to brand)', format: fmtCount, agg: 'TOTAL' },
  ntbSales: { label: 'Sales (new to brand)', format: formatCurrency, agg: 'TOTAL' },
};

export const formatMetric = (key, value) => (METRICS[key]?.format || formatNumber)(value);

// Chart series colours, in the order the console assigns them.
export const SERIES_COLORS = ['#5b7cfa', '#c41c8a', '#0f9488', '#e8692c'];
