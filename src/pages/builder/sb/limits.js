/** Sponsored Brands manual collections feature 3–10 products. */
export const SB_MIN_PRODUCTS = 3;
export const SB_MAX_PRODUCTS = 10;

const ASIN_RE = /^B[0-9A-Z]{9}$/;

/** Parses ASINs typed or uploaded by the student; returns found catalogue products and rejects. */
export function parseAsinList(text, catalogue) {
  const asins = [...new Set(text.split(/[\s,;]+/).map(a => a.trim().toUpperCase()).filter(Boolean))];
  const found = asins.map(a => catalogue.find(p => p.asin === a)).filter(Boolean);
  const invalid = asins.filter(a => !ASIN_RE.test(a) || !catalogue.some(p => p.asin === a));
  return { found, invalid };
}
