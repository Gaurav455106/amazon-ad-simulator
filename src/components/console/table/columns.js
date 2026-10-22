// Column builders shared by the console tables (see ConsoleTable for the column shape).
import { METRICS, formatMetric } from '../metrics';
import { sumMetrics } from '../../../utils/performance';
import { metricFields } from './tableFilters';

/** Console column-picker groups, in the order the "Customise columns" dialog lists them. */
export const GROUPS = {
  detail: 'Level of detail',
  settings: 'Settings',
  delivery: 'Delivery',
  costs: 'Costs and fees',
  conversions: 'Amazon retail conversions',
};

const METRIC_GROUP = { impressions: GROUPS.delivery, clicks: GROUPS.delivery, ctr: GROUPS.delivery, cpc: GROUPS.delivery, spend: GROUPS.costs };
// The console's long names in the column picker and filters.
export const METRIC_LABELS = { ...Object.fromEntries(Object.entries(METRICS).map(([k, v]) => [k, v.label])), acos: 'ACOS', roas: 'ROAS' };

/**
 * A metric column reading `row.m[key]`; totals are recomputed from the summed base metrics.
 * @param {string} key metric key from components/console/metrics
 * @param {{ isDefault?: boolean, metricsOf?: (row: object) => object }} [opts]
 */
export function metricColumn(key, { isDefault = true, metricsOf = (r) => r.m } = {}) {
  const value = (row) => metricsOf(row)?.[key] ?? 0;
  return {
    key,
    label: METRIC_LABELS[key],
    group: METRIC_GROUP[key] || GROUPS.conversions,
    num: true,
    info: true,
    isDefault,
    cell: (row) => (value(row) ? formatMetric(key, value(row)) : '—'),
    csv: (row) => Number(value(row).toFixed(2)),
    sortValue: value,
    total: (rows) => {
      const t = sumMetrics(rows.map(metricsOf))[key];
      return t ? formatMetric(key, t) : '—';
    },
  };
}

/** Metric columns for a list of keys; `defaults` are shown before the student customises. */
export const metricColumns = (keys, defaults = keys, opts = {}) => keys.map(k => metricColumn(k, { ...opts, isDefault: defaults.includes(k) }));

/** Filter fields for the same metrics. */
export const metricFilterFields = (keys) => metricFields(keys, METRIC_LABELS);
