// "Export → Current table data → Download": the visible columns of the filtered rows as CSV.

const escapeCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * @param {Array<{ label: string, csv: (row: object) => unknown }>} columns
 * @param {object[]} rows
 * @returns {string} CSV text with a header row
 */
export function toCsv(columns, rows) {
  const header = columns.map(c => escapeCell(c.label)).join(',');
  const body = rows.map(row => columns.map(c => escapeCell(c.csv(row))).join(','));
  return [header, ...body].join('\n');
}

/** File name like "Campaigns_2026-10-22.csv". */
export const csvFileName = (name, date = new Date()) =>
  `${name.replace(/[^A-Za-z0-9_-]+/g, '_')}_${date.toISOString().slice(0, 10)}.csv`;

/** Triggers a browser download of the CSV text. */
export function downloadCsv(fileName, csv) {
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
