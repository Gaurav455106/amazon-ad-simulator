import { withDerived } from './performance';
import { SEARCH_TERM_EXPANSIONS as EXPANSIONS } from '../data/demoAccount';

const FALLBACK = [(k) => k, (k) => `${k} combo`, (k) => (k.startsWith('best ') ? `${k} online` : `best ${k}`), (k) => `${k} under 500`];
const BASE_KEYS = ['impressions', 'clicks', 'spend', 'orders', 'sales'];

const shareWeight = (term) => 1 + (term.length % 7) / 3;

/**
 * Customer search terms that matched each keyword, with the keyword's range
 * metrics split across them. Exact-match keywords only match themselves.
 * @param {Array<{ k: { id: string, keyword: string, matchType: string, bid: number }, m: object }>} keywordRows
 */
export function buildSearchTerms(keywordRows) {
  return keywordRows.flatMap(({ k, m }) => {
    const base = k.keyword.toLowerCase();
    const terms = k.matchType === 'Exact'
      ? [base]
      : (EXPANSIONS[base] || FALLBACK.map(f => f(base)));
    const total = terms.reduce((s, t) => s + shareWeight(t), 0);
    return terms.map(term => {
      const share = shareWeight(term) / total;
      const split = Object.fromEntries(BASE_KEYS.map(key => [key, (m[key] || 0) * share]));
      return { id: `${k.id}|${term}`, term, keyword: k, ...withDerived(split) };
    });
  });
}
