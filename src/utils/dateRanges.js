// Date-range presets, in the order the Amazon Ads console lists them.
export const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'lastWeek', label: 'Last Week' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'ytd', label: 'Year to Date' },
];

export const DEFAULT_PRESET = 'last7';

const pad = (n) => String(n).padStart(2, '0');
/** Local calendar date as YYYY-MM-DD (toISOString would give the UTC date, a day early before 05:30 IST). */
export const localISODate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Parses "YYYY-MM-DD" as a local date (new Date(str) would treat it as UTC midnight). */
export const parseLocalDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

const DAY_MS = 86400000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(startOfDay(d).getTime() + n * DAY_MS);
// Console weeks start on Monday.
const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7));

/**
 * @param {string} preset
 * @param {Date} [now]
 * @returns {{ from: Date, to: Date }}
 */
export function rangeForPreset(preset, now = new Date()) {
  const today = startOfDay(now);
  const yesterday = addDays(today, -1);
  switch (preset) {
    case 'today': return { from: today, to: today };
    case 'yesterday': return { from: yesterday, to: yesterday };
    case 'thisWeek': return { from: startOfWeek(today), to: today };
    case 'lastWeek': { const s = addDays(startOfWeek(today), -7); return { from: s, to: addDays(s, 6) }; }
    case 'last30': return { from: addDays(yesterday, -29), to: yesterday };
    case 'thisMonth': return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    case 'lastMonth': return { from: new Date(today.getFullYear(), today.getMonth() - 1, 1), to: new Date(today.getFullYear(), today.getMonth(), 0) };
    case 'ytd': return { from: new Date(today.getFullYear(), 0, 1), to: today };
    case 'last7':
    default: return { from: addDays(yesterday, -6), to: yesterday };
  }
}

const MONTH = { month: 'short' };

/** "Oct 14 - Oct 20, 2026" — the console's range label format. */
export function formatRangeLabel({ from, to }) {
  const f = `${from.toLocaleDateString('en-US', MONTH)} ${from.getDate()}`;
  const t = `${to.toLocaleDateString('en-US', MONTH)} ${to.getDate()}, ${to.getFullYear()}`;
  return from.getTime() === to.getTime() ? t : `${f} - ${t}`;
}

/** "20 Oct, 2026" — the single-date label used in table toolbars. */
export const formatDayLabel = (d) =>
  `${d.getDate()} ${d.toLocaleDateString('en-US', MONTH)}, ${d.getFullYear()}`;

/** Number of days in a range, inclusive. */
export const daysInRange = ({ from, to }) => Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS) + 1;

/** Calendar grid (Mon-first) for a month: array of weeks, each 7 Date|null cells. */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

/** "21/10/2026 15:31:21.060" — the console's default-name timestamp. */
export function consoleTimestamp(d = new Date()) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}
