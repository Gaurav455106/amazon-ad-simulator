import { describe, it, expect } from 'vitest';
import {
  applyFilters, matchesFilter, describeFilter, isFilterValid, upsertFilter,
  DEFAULT_STATUS_FILTER, statusField, numberField, choiceField,
} from '../tableFilters';

const fields = [
  statusField(r => r.status),
  numberField('clicks', 'Clicks', r => r.m.clicks),
  choiceField('targeting', 'Targeting', [{ value: 'Manual', label: 'Manual Targeting' }, { value: 'Auto', label: 'Automatic Targeting' }], r => r.targeting),
  choiceField('portfolio', 'Portfolio name', [{ value: 'none', label: 'No portfolio' }, { value: 'p1', label: 'Main' }], r => r.portfolioId || 'none', true),
];
const rows = [
  { id: 'a', status: 'Enabled', targeting: 'Manual', portfolioId: 'p1', m: { clicks: 120 } },
  { id: 'b', status: 'Paused', targeting: 'Auto', m: { clicks: 10 } },
  { id: 'c', status: 'Archived', targeting: 'Manual', m: { clicks: 50 } },
];
const ids = (list) => list.map(r => r.id);
const run = (filters) => ids(applyFilters(rows, filters, fields));

describe('applyFilters', () => {
  it('hides archived rows with the default status filter', () => {
    expect(run([DEFAULT_STATUS_FILTER])).toEqual(['a', 'b']);
  });

  it('filters by an exact status, or shows everything with All', () => {
    expect(run([{ key: 'status', value: 'Paused' }])).toEqual(['b']);
    expect(run([{ key: 'status', value: 'all' }])).toEqual(['a', 'b', 'c']);
  });

  it('combines filters with AND', () => {
    expect(run([DEFAULT_STATUS_FILTER, { key: 'clicks', op: 'gte', value: '10' }, { key: 'targeting', value: 'Manual' }])).toEqual(['a']);
  });

  it('supports every number operator', () => {
    const clicks = (op, value, value2) => run([{ key: 'clicks', op, value, value2 }]);
    expect(clicks('gt', '50')).toEqual(['a']);
    expect(clicks('eq', '50')).toEqual(['c']);
    expect(clicks('lt', '50')).toEqual(['b']);
    expect(clicks('lte', '50')).toEqual(['b', 'c']);
    expect(clicks('between', '100', '5')).toEqual(['b', 'c']);
    expect(clicks('between', '20', '60')).toEqual(['c']);
  });

  it('matches rows without a portfolio and ignores unknown fields', () => {
    expect(matchesFilter(rows[1], { key: 'portfolio', value: 'none' }, fields)).toBe(true);
    expect(matchesFilter(rows[0], { key: 'nope', value: 'x' }, fields)).toBe(true);
  });
});

describe('describeFilter', () => {
  it('builds the pill text', () => {
    expect(describeFilter(DEFAULT_STATUS_FILTER, fields)).toEqual({ label: 'Active status', value: 'All but archived' });
    expect(describeFilter({ key: 'clicks', op: 'between', value: '1', value2: '5' }, fields)).toEqual({ label: 'Clicks', value: 'between 1 and 5' });
    expect(describeFilter({ key: 'portfolio', value: 'p1' }, fields).value).toBe('Main');
  });
});

describe('isFilterValid / upsertFilter', () => {
  it('requires a numeric value, and a second one for between', () => {
    expect(isFilterValid({ key: 'clicks', op: 'gt', value: '' }, fields)).toBe(false);
    expect(isFilterValid({ key: 'clicks', op: 'between', value: '1' }, fields)).toBe(false);
    expect(isFilterValid({ key: 'clicks', op: 'between', value: '1', value2: '3' }, fields)).toBe(true);
    expect(isFilterValid({ key: 'targeting' }, fields)).toBe(false);
  });

  it('replaces a filter on the same field without mutating the list', () => {
    const before = [DEFAULT_STATUS_FILTER];
    expect(upsertFilter(before, { key: 'status', value: 'Paused' })).toEqual([{ key: 'status', value: 'Paused' }]);
    expect(before).toEqual([DEFAULT_STATUS_FILTER]);
  });
});
