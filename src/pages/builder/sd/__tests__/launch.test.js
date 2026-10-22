import { describe, expect, test } from 'vitest';
import { validateSdDraft, buildSdLaunch, sdForecast, effectiveCpc } from '../launch';
import { defaultTargets, goalConfig } from '../sdConfig';
import { pseudoSugg, flattenTree, PRODUCT_CATEGORY_TREE } from '../sdTaxonomy';

const baseDraft = (over = {}) => ({
  name: 'Campaign - test', adGroupName: 'Ad group - test', budget: '1000.00',
  startDate: '2026-10-21', endDate: '', portfolioId: '',
  goal: 'consideration', costControl: true, costControlValue: '5.00',
  adFormat: 'image', products: [{ asin: 'B0CF244HDV', price: 2499 }],
  targets: defaultTargets(), optimisedTargeting: true,
  creative: { logo: true, headlineOn: false, headline: '', imageOn: false, video: '' },
  ...over,
});
const ids = { campaignId: 'cD', adGroupId: 'agD', today: '2026-10-21' };

describe('sdConfig', () => {
  test('pre-adds the five console targets with empty bids', () => {
    const t = defaultTargets();
    expect(t.map(x => x.key)).toEqual(['ctx-similar', 'views-similar', 'views-advertised', 'purchases-related', 'purchases-advertised']);
    expect(t.every(x => x.bid === '')).toBe(true);
    expect(t.filter(x => x.lookbackDays === 30)).toHaveLength(4);
  });

  test('cost control defaults match the console per goal', () => {
    expect(goalConfig('reach').ccDefault).toBe('50.00');
    expect(goalConfig('consideration').ccDefault).toBe('5.00');
    expect(goalConfig('conversion').ccDefault).toBe('130.00');
  });
});

describe('validateSdDraft', () => {
  test('the console defaults plus one product are launchable (cost control covers bids)', () => {
    expect(validateSdDraft(baseDraft())).toEqual([]);
  });

  test('needs at least one product', () => {
    expect(validateSdDraft(baseDraft({ products: [] }))).toContain('Add at least one product to advertise.');
  });

  test('without cost control every target needs a bid', () => {
    expect(validateSdDraft(baseDraft({ costControl: false }))).toContain('Enter a bid for every target.');
    const withBids = baseDraft({ costControl: false, targets: defaultTargets().map(t => ({ ...t, bid: '8' })) });
    expect(validateSdDraft(withBids)).toEqual([]);
  });

  test('conversions need a cost per order of at least ₹50', () => {
    expect(validateSdDraft(baseDraft({ goal: 'conversion', costControlValue: '40' }))).toContain('Minimum cost per order is ₹50.00.');
  });

  test('conversions can launch on optimised targeting alone', () => {
    expect(validateSdDraft(baseDraft({ goal: 'conversion', costControlValue: '130', targets: [] }))).toEqual([]);
  });

  test('optimised targeting needs a bid when cost control is off', () => {
    const d = baseDraft({ goal: 'conversion', costControl: false, targets: [], optimisedBid: '' });
    expect(validateSdDraft(d)).toContain('Enter a bid for every target.');
    expect(validateSdDraft({ ...d, optimisedBid: '9' })).toEqual([]);
  });

  test('a headline that is switched on must be written', () => {
    const d = baseDraft({ creative: { logo: true, headlineOn: true, headline: ' ', imageOn: false, video: '' } });
    expect(validateSdDraft(d)).toContain('Add a headline or turn the headline off.');
  });

  test('a video ad needs a video', () => {
    expect(validateSdDraft(baseDraft({ adFormat: 'video' }))).toContain('Add a video for your video ad.');
  });
});

describe('effectiveCpc', () => {
  test('page visits bid the cost-per-click target', () => {
    expect(effectiveCpc('consideration', '5.00')).toBe(5);
  });
  test('reach and conversions convert to a sensible CPC', () => {
    expect(effectiveCpc('reach', '50')).toBeGreaterThan(1);
    expect(effectiveCpc('reach', '50')).toBeLessThan(20);
    expect(effectiveCpc('conversion', '130')).toBeCloseTo(10.4);
  });
});

describe('buildSdLaunch', () => {
  test('saves the targets, goal and cost control on the campaign', () => {
    const out = buildSdLaunch(baseDraft(), ids);
    expect(out.campaign).toMatchObject({ id: 'cD', type: 'Sponsored Display', goal: 'consideration', costType: 'CPC', costControlEnabled: true, bid: 5 });
    expect(out.campaign.sdTargets).toHaveLength(5);
    expect(out.campaign.sdTargets[1].name).toBe('Views remarketing · Similar to advertised products · 30 days');
    expect(out.campaign.targetingType).toBe('Contextual + Audiences');
  });

  test('manual bids are kept when cost control is off', () => {
    const d = baseDraft({ costControl: false, targets: [{ ...defaultTargets()[0], bid: '12.5' }] });
    const out = buildSdLaunch(d, ids);
    expect(out.campaign.sdTargets).toEqual([expect.objectContaining({ type: 'Contextual', bid: 12.5 })]);
    expect(out.campaign.bid).toBeNull();
  });

  test('conversions add an optimised-targeting entry', () => {
    const out = buildSdLaunch(baseDraft({ goal: 'conversion', costControlValue: '130', targets: [] }), ids);
    expect(out.campaign.sdTargets[0]).toMatchObject({ type: 'Optimised', name: 'Reach audiences who are likely to be interested in your ad' });
    expect(out.campaign.costType).toBe('CPC');
  });

  test('stores the creative and the ad group products', () => {
    const d = baseDraft({ creative: { logo: true, headlineOn: true, headline: 'Crunchy & fresh', imageOn: false, video: '' } });
    const out = buildSdLaunch(d, ids);
    expect(out.campaign.sdCreative).toMatchObject({ adFormat: 'image', headline: 'Crunchy & fresh', products: ['B0CF244HDV'] });
    expect(out.adGroup).toMatchObject({ id: 'agD', campaignId: 'cD', products: ['B0CF244HDV'] });
  });
});

describe('sdForecast', () => {
  test('lists what is missing before products are added', () => {
    expect(sdForecast(baseDraft({ products: [] })).missing).toEqual(['Choose products']);
  });
  test('asks for bids when cost control is off and bids are empty', () => {
    expect(sdForecast(baseDraft({ costControl: false })).missing).toContain('Enter a bid');
  });
  test('matches the console forecast for ₹1,000 a day at a ₹5 CPC target', () => {
    expect(sdForecast(baseDraft()).values).toEqual({ Impressions: '0-3.6K', Clicks: '90-360' });
  });
  test('shows the goal metrics once complete', () => {
    expect(Object.keys(sdForecast(baseDraft()).values)).toEqual(['Impressions', 'Clicks']);
    expect(Object.keys(sdForecast(baseDraft({ goal: 'reach', costControlValue: '50' })).values)).toEqual(['Impressions', 'Viewable impressions']);
  });
});

describe('sdTaxonomy', () => {
  test('suggested bids are stable per key', () => {
    expect(pseudoSugg('im-headphones')).toEqual(pseudoSugg('im-headphones'));
  });
  test('flattens nested categories with their path', () => {
    const flat = flattenTree(PRODUCT_CATEGORY_TREE);
    expect(flat.find(n => n.id === 'pc-tws').path).toEqual(['Electronics', 'Headphones, Earbuds & Accessories']);
  });
});
