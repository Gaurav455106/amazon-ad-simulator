import { describe, it, expect } from 'vitest';
import { sbAdsFor, creativeStrength, validateSbAd, defaultAdName, moveItem, toStoredAd } from '../sbAds';

const campaign = { id: 'c2', name: 'Brand Defense', sbCreative: { brandName: 'Farmley', headline: 'Snack smarter', products: ['A', 'B', 'C'], landingPage: 'store' } };
const adGroup = { id: 'ag3', name: 'Brand Terms', products: ['A', 'B', 'C'] };
const ad = (over = {}) => ({ name: 'Ad', brandName: 'Farmley', headline: 'Snack smarter', products: ['A', 'B', 'C'], images: 0, ...over });

describe('sbAdsFor', () => {
  it('uses stored ads for the ad group, including legacy ads without an ad group id', () => {
    const ads = sbAdsFor(campaign, adGroup, [{ id: 'sba1', campaignId: 'c2', name: 'Old' }, { id: 'x', campaignId: 'c9' }]);
    expect(ads.map(a => [a.id, a.isVirtual])).toEqual([['sba1', false]]);
  });

  it('falls back to the campaign creative as a virtual first ad', () => {
    const [first] = sbAdsFor(campaign, adGroup, []);
    expect(first).toMatchObject({ id: 'sbc-c2', isVirtual: true, headline: 'Snack smarter', products: ['A', 'B', 'C'], landingPage: 'store' });
  });
});

describe('creativeStrength', () => {
  it('is incomplete without a headline or three products', () => {
    expect(creativeStrength(ad({ headline: '' })).label).toBe('Incomplete');
    expect(creativeStrength(ad({ products: ['A'] })).suggestions).toContain('Add 2 products');
  });

  it('rises with images', () => {
    expect(creativeStrength(ad()).label).toBe('Low');
    expect(creativeStrength(ad({ images: 1 })).label).toBe('Medium');
    expect(creativeStrength(ad({ images: 5 }))).toMatchObject({ label: 'High', score: 100, suggestions: [] });
  });
});

describe('validateSbAd', () => {
  it('requires a name, brand, headline within 50 characters and three products', () => {
    expect(validateSbAd(ad())).toEqual([]);
    expect(validateSbAd(ad({ headline: 'x'.repeat(51), products: [] }))).toEqual(['Keep the headline to 50 characters.', 'Add at least 3 products.']);
  });
});

describe('helpers', () => {
  it('formats the default ad name like the console', () => {
    expect(defaultAdName(new Date(2026, 9, 22, 12, 57, 58, 701))).toBe('Ad - 22/10/2026 12:57:58.701');
  });

  it('moves products without mutating the list', () => {
    const list = ['A', 'B', 'C'];
    expect(moveItem(list, 2, -1)).toEqual(['A', 'C', 'B']);
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(list).toEqual(['A', 'B', 'C']);
  });

  it('trims stored text fields', () => {
    expect(toStoredAd({ ...ad({ name: ' Ad ', headline: ' Hi ' }), campaignId: 'c2', adGroupId: 'ag3', status: 'Enabled', landingPage: 'store', storePage: 'Home' }))
      .toMatchObject({ name: 'Ad', headline: 'Hi' });
  });
});
