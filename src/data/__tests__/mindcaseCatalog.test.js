import { describe, it, expect } from 'vitest';
import { mapMindcaseRow, mapMindcaseRows, buildProductsRequest } from '../mindcaseCatalog';

const row = {
  asin: 'B0CDLC4HG5', title: 'Seasoned Banana Chips 200g', brand: 'Seasoned Snacks',
  price: '₹149.00', listPrice: 199, rating: '4.3', ratingsCount: '1,204',
  availability: 'In stock', categoryPath: ['Grocery & Gourmet Foods', 'Snacks'],
  mainImage: 'https://m.media-amazon.com/images/I/x.jpg',
};

describe('mapMindcaseRow', () => {
  it('maps a Mindcase row to the simulator product shape', () => {
    const p = mapMindcaseRow(row);
    expect(p).toMatchObject({
      asin: 'B0CDLC4HG5', name: 'Seasoned Banana Chips 200g', brand: 'Seasoned Snacks',
      price: 149, listPrice: 199, rating: 4.3, reviews: 1204, status: 'In stock',
      category: 'Grocery & Gourmet Foods', imageUrl: 'https://m.media-amazon.com/images/I/x.jpg',
    });
    expect(p.sku).toBe('SEASON-C4HG5');
  });

  it('marks unavailable products out of stock and falls back to the first image', () => {
    const p = mapMindcaseRow({ ...row, availability: 'Currently unavailable.', mainImage: null, images: ['a.jpg'] });
    expect(p.status).toBe('Out of stock');
    expect(p.imageUrl).toBe('a.jpg');
  });

  it('returns null for rows without a valid ASIN or title', () => {
    expect(mapMindcaseRow({ ...row, asin: 'nope' })).toBeNull();
    expect(mapMindcaseRow({ ...row, title: '' })).toBeNull();
    expect(mapMindcaseRow(null)).toBeNull();
  });
});

describe('mapMindcaseRows', () => {
  it('drops invalid rows and duplicate ASINs', () => {
    expect(mapMindcaseRows([row, { asin: 'x' }, { ...row, title: 'dup' }])).toHaveLength(1);
    expect(mapMindcaseRows(undefined)).toEqual([]);
  });
});

describe('buildProductsRequest', () => {
  it('builds amazon.in product URLs from unique valid ASINs', () => {
    expect(buildProductsRequest(['b0cdlc4hg5', 'B0CDLC4HG5', 'bad'])).toEqual({
      params: { urls: ['https://www.amazon.in/dp/B0CDLC4HG5'] },
    });
  });

  it('throws when no ASIN is valid', () => {
    expect(() => buildProductsRequest(['bad'])).toThrow('No valid ASINs');
  });
});

describe('withFetchedData', () => {
  it('overlays fetched live fields by ASIN and ignores empty values', async () => {
    const { withFetchedData } = await import('../demoAccount');
    const base = [{ asin: 'B0BSXC1Z63', name: 'Date Bites', price: 299, rating: 4.3 }, { asin: 'B09J578NDM', price: 415 }];
    const out = withFetchedData(base, [{ asin: 'B0BSXC1Z63', price: 279, rating: 0, name: 'ignored' }]);
    expect(out[0]).toEqual({ asin: 'B0BSXC1Z63', name: 'Date Bites', price: 279, rating: 4.3 });
    expect(out[1]).toBe(base[1]);
  });
});
