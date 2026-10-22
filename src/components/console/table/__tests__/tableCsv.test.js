import { describe, it, expect } from 'vitest';
import { toCsv, csvFileName } from '../tableCsv';

describe('toCsv', () => {
  it('writes a header and one line per row, quoting commas, quotes and new lines', () => {
    const columns = [{ label: 'Campaign name', csv: r => r.name }, { label: 'Clicks', csv: r => r.clicks }];
    const csv = toCsv(columns, [{ name: 'Festive, "Sale"', clicks: 12 }, { name: 'Plain', clicks: null }]);
    expect(csv).toBe('Campaign name,Clicks\n"Festive, ""Sale""",12\nPlain,');
  });
});

describe('csvFileName', () => {
  it('uses the table name and the date', () => {
    expect(csvFileName('Ad groups', new Date('2026-10-22T10:00:00Z'))).toBe('Ad_groups_2026-10-22.csv');
  });
});
