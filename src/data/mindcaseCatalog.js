// Maps Mindcase `amazon/products` rows to the simulator's product shape.
// Pure (no fetch, no key) so it can be tested and imported by the Node fetch script.

export const MINDCASE_PRODUCTS_URL = 'https://api.mindcase.co/v1/data/amazon/products/run?wait=true';
export const ASIN_RE = /^B[A-Z0-9]{9}$/;
const FALLBACK_IMAGE_TYPE = 'snack-pouch';

const toNumber = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const n = Number(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && v.trim() !== '' ? n : null;
};

/** Short SKU derived from the brand and ASIN, since Amazon pages don't expose seller SKUs. */
const makeSku = (brand, asin) => `${String(brand || 'SKU').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}-${asin.slice(-5)}`;

const categoryOf = (row) => {
  if (Array.isArray(row.categoryPath) && row.categoryPath.length) return row.categoryPath[0];
  if (typeof row.categoryPath === 'string' && row.categoryPath) return row.categoryPath.split(/\s*[›>]\s*/)[0];
  return row.bsrCategory || 'Uncategorised';
};

/**
 * @param {object} row one Mindcase product row
 * @returns {object|null} simulator product, or null when the row has no valid ASIN or title
 */
export function mapMindcaseRow(row) {
  const asin = String(row?.asin || '').trim().toUpperCase();
  const title = String(row?.title || '').trim();
  if (!ASIN_RE.test(asin) || !title) return null;
  const imageUrl = row.mainImage || (Array.isArray(row.images) ? row.images[0] : null) || null;
  const availability = String(row.availability || '');
  return {
    asin,
    sku: makeSku(row.brand, asin),
    name: title,
    brand: row.brand || '',
    price: toNumber(row.price) ?? 0,
    listPrice: toNumber(row.listPrice),
    rating: toNumber(row.rating) ?? 0,
    reviews: toNumber(row.ratingsCount) ?? 0,
    status: /out of stock|unavailable/i.test(availability) ? 'Out of stock' : 'In stock',
    category: categoryOf(row),
    imageType: FALLBACK_IMAGE_TYPE,
    imageUrl,
  };
}

/** Maps rows, drops invalid ones and de-duplicates by ASIN (first row wins). */
export function mapMindcaseRows(rows) {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  return rows.map(mapMindcaseRow).filter(p => p && !seen.has(p.asin) && seen.add(p.asin));
}

/** Request body for a batch ASIN lookup on amazon.in. */
export function buildProductsRequest(asins) {
  const clean = [...new Set(asins.map(a => String(a).trim().toUpperCase()))].filter(a => ASIN_RE.test(a));
  if (!clean.length) throw new Error('No valid ASINs to fetch');
  return { params: { urls: clean.map(a => `https://www.amazon.in/dp/${a}`) } };
}
