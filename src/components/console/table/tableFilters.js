// Table filters modelled on the console's "Filter by" menu (observed Oct 2026).
// Each table supplies its own fields; a field reads its value from a row with `get(row)`.
// A filter is { key, value, op?, value2? }.

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'allButArchived', label: 'All but archived' },
  { value: 'Enabled', label: 'Enabled' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Archived', label: 'Archived' },
];

export const NUMBER_OPERATORS = [
  { value: 'gt', label: 'greater than' },
  { value: 'eq', label: 'equals' },
  { value: 'lt', label: 'less than' },
  { value: 'gte', label: 'greater than or equal to' },
  { value: 'lte', label: 'less than or equal to' },
  { value: 'between', label: 'between' },
];

export const DEFAULT_STATUS_FILTER = { key: 'status', value: 'allButArchived' };

/** Field helpers so tables declare filters in one line each. */
export const statusField = (get) => ({ key: 'status', label: 'Active status', kind: 'status', get });
export const numberField = (key, label, get) => ({ key, label, kind: 'number', get });
export const choiceField = (key, label, options, get, isSearchable = false) => ({ key, label, kind: 'choice', options, get, isSearchable });
/** Number fields for the metrics a row carries in `row.m`. */
export const metricFields = (metrics, labels) => metrics.map(k => numberField(k, labels[k], (row) => row.m?.[k] ?? 0));

const compare = (v, { op, value, value2 }) => {
  const a = Number(value);
  const b = Number(value2);
  switch (op) {
    case 'eq': return v === a;
    case 'lt': return v < a;
    case 'gte': return v >= a;
    case 'lte': return v <= a;
    case 'between': return v >= Math.min(a, b) && v <= Math.max(a, b);
    default: return v > a;
  }
};

const fieldFor = (fields, key) => fields.find(f => f.key === key);

/** True when the row passes one filter. Unknown fields never hide rows. */
export function matchesFilter(row, filter, fields) {
  const field = fieldFor(fields, filter.key);
  if (!field) return true;
  const v = field.get(row);
  if (field.kind === 'status') {
    if (filter.value === 'all') return true;
    if (filter.value === 'allButArchived') return v !== 'Archived';
    return v === filter.value;
  }
  if (field.kind === 'number') return compare(Number(v) || 0, filter);
  return v === filter.value;
}

/** Rows passing every filter (filters combine with AND, as on the console). */
export const applyFilters = (rows, filters, fields) => rows.filter(row => filters.every(f => matchesFilter(row, f, fields)));

/** Whether a draft filter is complete enough to apply. */
export function isFilterValid(filter, fields) {
  const field = fieldFor(fields, filter?.key);
  if (!field || filter.value === undefined || filter.value === '') return false;
  if (field.kind !== 'number') return true;
  if (!Number.isFinite(Number(filter.value))) return false;
  return filter.op !== 'between' || (filter.value2 !== undefined && filter.value2 !== '' && Number.isFinite(Number(filter.value2)));
}

/**
 * Pill text, e.g. "Active status: All but archived" or "Clicks: between 10 and 50".
 * @returns {{ label: string, value: string }}
 */
export function describeFilter(filter, fields) {
  const field = fieldFor(fields, filter.key);
  if (!field) return { label: filter.key, value: String(filter.value) };
  if (field.kind === 'status') return { label: field.label, value: STATUS_OPTIONS.find(o => o.value === filter.value)?.label || filter.value };
  if (field.kind === 'choice') return { label: field.label, value: field.options.find(o => o.value === filter.value)?.label || filter.value };
  const op = NUMBER_OPERATORS.find(o => o.value === (filter.op || 'gt'))?.label;
  return { label: field.label, value: filter.op === 'between' ? `${op} ${filter.value} and ${filter.value2}` : `${op} ${filter.value}` };
}

/** Adds a filter, or replaces the existing one for the same field. */
export const upsertFilter = (filters, next) =>
  (filters.some(f => f.key === next.key) ? filters.map(f => (f.key === next.key ? next : f)) : [...filters, next]);
