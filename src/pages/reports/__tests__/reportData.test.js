import { describe, it, expect } from 'vitest';
import { buildReportRows } from '../reportData';

const range = { from: new Date('2026-10-15T00:00:00'), to: new Date('2026-10-21T23:59:59') };
const metrics = { impressions: 7000, clicks: 140, spend: 1400, orders: 14, sales: 5600 };
const state = {
  campaigns: [
    { id: 'c1', name: 'SP', type: 'Sponsored Products', status: 'Enabled', startDate: '2026-08-01', createdAt: '2026-08-01', metrics },
    { id: 'c3', name: 'SD', type: 'Sponsored Display', status: 'Enabled', startDate: '2026-08-01', createdAt: '2026-08-01', metrics },
  ],
  adGroups: [{ id: 'ag1', campaignId: 'c1', name: 'AG', status: 'Enabled', products: ['B0BSXC1Z63', 'B09J578NDM'], metrics }],
  keywords: [{ id: 'k1', campaignId: 'c1', adGroupId: 'ag1', keyword: 'chia seeds', matchType: 'Broad', bid: 5, status: 'Enabled', metrics }],
  products: [{ asin: 'B0BSXC1Z63', name: 'Date Bites' }],
};

describe('buildReportRows', () => {
  it('builds one row per campaign, ad group and keyword', () => {
    expect(buildReportRows('campaign', state, range).map(r => r.id)).toEqual(['c1', 'c3']);
    expect(buildReportRows('adGroup', state, range).map(r => r.id)).toEqual(['ag1']);
    expect(buildReportRows('keyword', state, range)[0]).toMatchObject({ id: 'k1', campaign: { id: 'c1' }, adGroup: { id: 'ag1' } });
  });

  it('splits placements for search campaigns only, keeping the campaign total', () => {
    const rows = buildReportRows('placement', state, range);
    expect(new Set(rows.map(r => r.campaign.id))).toEqual(new Set(['c1']));
    const campaignSpend = buildReportRows('campaign', state, range)[0].m.spend;
    expect(rows.reduce((s, r) => s + r.m.spend, 0)).toBeCloseTo(campaignSpend, 6);
  });

  it('splits an ad group across its advertised products', () => {
    const rows = buildReportRows('product', state, range);
    expect(rows.map(r => r.asin)).toEqual(['B0BSXC1Z63', 'B09J578NDM']);
    expect(rows[0].product.name).toBe('Date Bites');
    const agSpend = buildReportRows('adGroup', state, range)[0].m.spend;
    expect(rows[0].m.spend + rows[1].m.spend).toBeCloseTo(agSpend, 6);
  });

  it('lists search terms with their campaign', () => {
    const rows = buildReportRows('searchTerm', state, range);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(r => r.campaign.id === 'c1' && r.term)).toBe(true);
  });
});
