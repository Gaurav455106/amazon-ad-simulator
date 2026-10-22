import { describe, expect, test } from 'vitest';
import { validateSbDraft, buildSbLaunch } from '../launch';
import { parseAsinList } from '../limits';

const product = (asin) => ({ asin, name: `Product ${asin}` });
const baseDraft = (over = {}) => ({
  name: 'Campaign - test', adGroupName: 'Ad group - test', budget: '500', budgetType: 'Daily',
  startDate: '2026-10-21', endDate: '', portfolioId: '', goal: 'page-visits', site: 'amazon',
  adFormat: 'product-collection', collectionType: 'automatic', products: [],
  titleMode: 'auto', customTitle: '', brandName: 'Farmley', landingPage: 'new-landing-page',
  targetType: 'keyword', keywords: [{ keyword: 'roasted makhana', matchType: 'Broad', bid: '4.00' }],
  productTargets: [], negativeKeywords: [], ...over,
});
const ids = { campaignId: 'cB', adGroupId: 'agB', today: '2026-10-21' };

describe('validateSbDraft', () => {
  test('an automatic collection needs no products', () => {
    expect(validateSbDraft(baseDraft())).toEqual([]);
  });

  test('a manual collection needs at least three products', () => {
    const d = baseDraft({ collectionType: 'manual', products: [product('B0000000A1'), product('B0000000A2')] });
    expect(validateSbDraft(d)).toContain('Add at least three products to advertise.');
  });

  test('a manual collection with three products is valid', () => {
    const d = baseDraft({ collectionType: 'manual', products: ['B0000000A1', 'B0000000A2', 'B0000000A3'].map(product) });
    expect(validateSbDraft(d)).toEqual([]);
  });

  test('the generated ad title needs no headline', () => {
    expect(validateSbDraft(baseDraft({ titleMode: 'auto', customTitle: '' }))).toEqual([]);
  });

  test('writing your own title requires the title text', () => {
    expect(validateSbDraft(baseDraft({ titleMode: 'custom', customTitle: ' ' }))).toContain('Write your ad title.');
  });

  test('requires a budget and at least one keyword', () => {
    const errors = validateSbDraft(baseDraft({ budget: '', keywords: [] }));
    expect(errors).toEqual(expect.arrayContaining(['Enter a budget.', 'Add at least one keyword.']));
  });

  test('a lifetime budget needs an end date', () => {
    expect(validateSbDraft(baseDraft({ budgetType: 'Lifetime' }))).toContain('A lifetime budget needs an end date.');
  });

  test('every target needs a bid', () => {
    const d = baseDraft({ keywords: [{ keyword: 'Keywords related to your brand', matchType: 'Theme', bid: '' }] });
    expect(validateSbDraft(d)).toContain('Enter a bid for every target.');
  });
});

describe('buildSbLaunch', () => {
  test('creates the campaign, ad group and keywords', () => {
    const out = buildSbLaunch(baseDraft({ site: 'amazon-business' }), ids);
    expect(out.campaign).toMatchObject({ id: 'cB', type: 'Sponsored Brands', budget: 500, site: 'amazon-business', costType: 'CPC' });
    expect(out.adGroup).toMatchObject({ id: 'agB', campaignId: 'cB' });
    expect(out.keywords[0]).toMatchObject({ keyword: 'roasted makhana', matchType: 'Broad', bid: 4, adGroupId: 'agB' });
  });

  test('stores manual collection products on the creative and ad group', () => {
    const products = ['B0000000A1', 'B0000000A2', 'B0000000A3'].map(product);
    const out = buildSbLaunch(baseDraft({ collectionType: 'manual', products }), ids);
    expect(out.campaign.sbCreative.products).toEqual(['B0000000A1', 'B0000000A2', 'B0000000A3']);
    expect(out.adGroup.products).toHaveLength(3);
  });

  test('product targeting saves targets instead of keywords', () => {
    const d = baseDraft({ collectionType: 'manual', targetType: 'product', productTargets: [{ id: 't1', name: 'Headphones', bid: '12.50' }] });
    expect(buildSbLaunch(d, ids).keywords).toEqual([
      expect.objectContaining({ keyword: 'category="Headphones"', targetKind: 'product', matchType: 'Category', bid: 12.5 }),
    ]);
  });

  test('vCPM cost type for the brand impression share goal', () => {
    expect(buildSbLaunch(baseDraft({ goal: 'impression-share' }), ids).campaign.costType).toBe('vCPM');
  });
});

describe('parseAsinList', () => {
  const catalogue = [product('B0BSXC1Z63'), product('B09J578NDM')];
  test('finds catalogue ASINs separated by commas, spaces or new lines', () => {
    const { found, invalid } = parseAsinList('b0bsxc1z63, B09J578NDM\nB0BSXC1Z63', catalogue);
    expect(found.map(p => p.asin)).toEqual(['B0BSXC1Z63', 'B09J578NDM']);
    expect(invalid).toEqual([]);
  });

  test('reports malformed or unknown ASINs', () => {
    expect(parseAsinList('XYZ B0ZZZZZZZZ', catalogue).invalid).toEqual(['XYZ', 'B0ZZZZZZZZ']);
  });
});
