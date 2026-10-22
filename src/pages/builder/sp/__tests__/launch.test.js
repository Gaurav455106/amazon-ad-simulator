import { describe, expect, test } from 'vitest';
import { validateSpDraft, buildSpLaunch, KEYWORD_GROUP_LABEL } from '../launch';
import { spForecast } from '../../../../utils/spForecast';

const baseDraft = (over = {}) => ({
  mode: 'campaign',
  setup: 'standard',
  name: 'Campaign - test',
  adGroupName: 'Ad Group - test',
  budget: '500',
  startDate: '2026-10-21',
  endDate: '',
  portfolioId: '',
  biddingStrategy: 'Dynamic bids - down only',
  targetingType: 'Auto',
  manualType: 'keyword',
  autoBidMode: 'default',
  defaultBid: '3.00',
  autoGroups: [{ key: 'close', on: true, bid: '6.72' }, { key: 'loose', on: false, bid: '3.00' }],
  keywords: [],
  productTargets: [],
  negativeKeywords: [],
  products: ['B0CF244HDV'],
  site: 'amazon-and-beyond',
  placements: { top: '30', rest: '0', product: '0' },
  audience: { mode: 'none', audience: '', pct: '0' },
  ...over,
});
const ids = { campaignId: 'cX', adGroupId: 'agX', today: '2026-10-21' };

describe('validateSpDraft', () => {
  test('a complete automatic campaign is valid', () => {
    expect(validateSpDraft(baseDraft())).toEqual([]);
  });

  test('requires at least one product', () => {
    expect(validateSpDraft(baseDraft({ products: [] }))).toContain('Add at least one product.');
  });

  test('enforces the ₹50 minimum daily budget', () => {
    expect(validateSpDraft(baseDraft({ budget: '20' })).join()).toMatch(/₹50/);
  });

  test('every manual keyword needs a bid (the pre-added keyword group starts empty)', () => {
    const d = baseDraft({ targetingType: 'Manual', keywords: [{ type: 'group', bid: '' }] });
    expect(validateSpDraft(d).join()).toMatch(/enter a bid/i);
  });

  test('increasing bids for an audience requires choosing one', () => {
    expect(validateSpDraft(baseDraft({ audience: { mode: 'increase', audience: '', pct: '20' } }))).toContain('Add a bid adjustments audience.');
  });

  test('preset campaigns only need products, a name and a budget', () => {
    expect(validateSpDraft(baseDraft({ setup: 'preset', adGroupName: '', defaultBid: '' }))).toEqual([]);
  });

  test('adding an ad group does not ask for a campaign name or budget', () => {
    expect(validateSpDraft(baseDraft({ mode: 'adGroup', name: '', budget: '' }))).toEqual([]);
  });
});

describe('buildSpLaunch', () => {
  test('saves placement adjustments, site and strategy on the campaign', () => {
    const out = buildSpLaunch(baseDraft(), ids);
    expect(out.campaign.placementAdjustments).toEqual({ top: 30, rest: 0, product: 0 });
    expect(out.campaign.site).toBe('amazon-and-beyond');
    expect(out.campaign.biddingStrategy).toBe('Dynamic bids - down only');
    expect(out.adGroup.products).toEqual(['B0CF244HDV']);
  });

  test('keeps the keyword group as a target instead of dropping it', () => {
    const d = baseDraft({ targetingType: 'Manual', keywords: [{ type: 'group', bid: '8.03' }, { keyword: 'wireless headphones', matchType: 'Exact', bid: '10' }] });
    const kws = buildSpLaunch(d, ids).keywords;
    expect(kws.map(k => k.keyword)).toEqual([KEYWORD_GROUP_LABEL, 'wireless headphones']);
    expect(kws.every(k => k.adGroupId === 'agX' && k.campaignId === 'cX')).toBe(true);
  });

  test('saves product targets with their match type', () => {
    const d = baseDraft({ targetingType: 'Manual', manualType: 'product', productTargets: [{ id: 'c1', name: 'Over-Ear Headphones', bid: '9.15' }, { id: 'p', name: 'Sony WH-1000XM5', type: 'Expanded', bid: '3' }] });
    expect(buildSpLaunch(d, ids).keywords.map(k => k.matchType)).toEqual(['Category', 'Expanded']);
  });

  test('saves negative keywords on the new ad group', () => {
    const d = baseDraft({ negativeKeywords: [{ keyword: 'cheap', matchType: 'Exact' }] });
    expect(buildSpLaunch(d, ids).negativeKeywords[0]).toMatchObject({ keyword: 'cheap', adGroupId: 'agX', level: 'Ad Group' });
  });

  test('saves excluded brands and products on the new ad group', () => {
    const d = baseDraft({ negativeProducts: [{ kind: 'brand', brand: 'SoundMax' }, { kind: 'product', asin: 'B09XS7JWHH', name: 'Sony' }] });
    const out = buildSpLaunch(d, ids).negativeProducts;
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({ asin: 'B09XS7JWHH', campaignId: 'cX', adGroupId: 'agX', level: 'Ad Group' });
  });

  test('a draft without negative products launches with none', () => {
    expect(buildSpLaunch(baseDraft(), ids).negativeProducts).toEqual([]);
  });

  test('auto targeting group bids are stored on the ad group', () => {
    const out = buildSpLaunch(baseDraft({ autoBidMode: 'groups' }), ids);
    expect(out.adGroup.autoTargets.close).toEqual({ status: 'Enabled', bid: 6.72 });
    expect(out.adGroup.autoTargets.loose.status).toBe('Paused');
  });

  test('preset creates a keyword-group campaign with dynamic up-and-down bidding', () => {
    const out = buildSpLaunch(baseDraft({ setup: 'preset' }), ids);
    expect(out.campaign).toMatchObject({ preset: true, targetingType: 'Manual', biddingStrategy: 'Dynamic bids - up and down' });
    expect(out.keywords).toHaveLength(1);
    expect(out.keywords[0].matchType).toBe('Keyword group');
  });

  test('adding an ad group creates no campaign and inherits the targeting type', () => {
    const out = buildSpLaunch(baseDraft({ mode: 'adGroup' }), { ...ids, parentCampaign: { targetingType: 'Auto' } });
    expect(out.campaign).toBeNull();
    expect(out.adGroup.campaignId).toBe('cX');
  });
});

describe('spForecast', () => {
  test('asks for products first', () => {
    expect(spForecast({ products: 0 })).toMatchObject({ kind: 'todo', items: ['Choose products', 'Add targets', 'Enter a bid'] });
  });

  test('is unavailable for product targeting', () => {
    expect(spForecast({ products: 1, targeting: 'Manual', manualType: 'product' })).toEqual({ kind: 'unavailable', items: ['Product targeting'] });
  });

  test('needs 3 keywords with bids in the suggested range', () => {
    const kw = { bid: '5', suggMin: 4, suggMax: 8 };
    expect(spForecast({ products: 1, targeting: 'Manual', manualType: 'keyword', keywords: [kw, kw], budget: 500 }).kind).toBe('message');
    expect(spForecast({ products: 1, targeting: 'Manual', manualType: 'keyword', keywords: [kw, kw, kw], budget: 500, bid: 5 }).kind).toBe('estimate');
  });

  test('needs a budget of at least ₹300', () => {
    expect(spForecast({ products: 1, targeting: 'Auto', budget: 200, bid: 3 }).text).toMatch(/₹300\.00/);
  });

  test('estimates more clicks for a weekly than a daily period', () => {
    const weekly = spForecast({ products: 1, targeting: 'Auto', budget: 500, bid: 5, period: 'Weekly' });
    const daily = spForecast({ products: 1, targeting: 'Auto', budget: 500, bid: 5, period: 'Daily' });
    expect(weekly.clicks[1]).toBeGreaterThan(daily.clicks[1]);
    expect(weekly.orders[0]).toBeLessThanOrEqual(weekly.clicks[0]);
  });
});
