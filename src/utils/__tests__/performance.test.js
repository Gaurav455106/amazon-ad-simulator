import { describe, expect, test } from 'vitest';
import { dailyMetrics, rangeMetrics, sumMetrics, withDerived, dailySeries } from '../performance';
import { placementBreakdown } from '../placements';
import { buildSearchTerms } from '../searchTerms';
import { localISODate } from '../dateRanges';

const daysAgo = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
const iso = (d) => localISODate(d);

const campaign = {
  id: 'c1',
  startDate: iso(daysAgo(29)),
  metrics: { impressions: 30000, clicks: 900, spend: 9000, orders: 90, sales: 135000 },
};

describe('dailyMetrics / rangeMetrics', () => {
  test('lifetime range adds back up to exactly the lifetime totals', () => {
    const m = rangeMetrics(campaign, { from: daysAgo(29), to: daysAgo(0) });
    expect(m.spend).toBeCloseTo(campaign.metrics.spend, 4);
    expect(m.sales).toBeCloseTo(campaign.metrics.sales, 4);
  });

  test('a campaign launched today has all its traffic on today', () => {
    const fresh = { ...campaign, id: 'cNew', startDate: iso(daysAgo(0)) };
    const m = rangeMetrics(fresh, { from: daysAgo(0), to: daysAgo(0) });
    expect(m.spend).toBeCloseTo(fresh.metrics.spend, 4);
  });

  test("live traffic in the ledger shows on its own day and doesn't reshape past days", () => {
    const before = rangeMetrics(campaign, { from: daysAgo(3), to: daysAgo(3) });
    const live = { ...campaign, metrics: { ...campaign.metrics, spend: campaign.metrics.spend + 40 }, daily: { [iso(daysAgo(0))]: { impressions: 0, clicks: 0, spend: 40, orders: 0, sales: 0 } } };
    expect(rangeMetrics(live, { from: daysAgo(3), to: daysAgo(3) }).spend).toBeCloseTo(before.spend, 6);
    expect(rangeMetrics(live, { from: daysAgo(0), to: daysAgo(0) }).spend).toBeCloseTo(40, 6);
  });

  test('ad groups add up to their campaign for any date range', () => {
    const ag1 = { id: 'agA', campaignId: 'c1', startDate: campaign.startDate, metrics: { impressions: 20000, clicks: 600, spend: 6000, orders: 60, sales: 90000 } };
    const ag2 = { id: 'agB', campaignId: 'c1', startDate: campaign.startDate, metrics: { impressions: 10000, clicks: 300, spend: 3000, orders: 30, sales: 45000 } };
    const range = { from: daysAgo(6), to: daysAgo(2) };
    const parent = rangeMetrics(campaign, range);
    const children = sumMetrics([rangeMetrics(ag1, range), rangeMetrics(ag2, range)]);
    expect(children.spend).toBeCloseTo(parent.spend, 4);
  });

  test('days before the campaign started have no traffic', () => {
    const rows = dailyMetrics(campaign, { from: daysAgo(40), to: daysAgo(31) });
    expect(rows.every(r => r.impressions === 0 && r.spend === 0)).toBe(true);
  });

  test('is stable between calls (no random reshuffle on re-render)', () => {
    const range = { from: daysAgo(6), to: daysAgo(0) };
    expect(rangeMetrics(campaign, range)).toEqual(rangeMetrics(campaign, range));
  });

  test('consecutive days differ (traffic is not flat)', () => {
    const rows = dailyMetrics(campaign, { from: daysAgo(10), to: daysAgo(1) });
    const distinct = new Set(rows.map(r => r.impressions.toFixed(3)));
    expect(distinct.size).toBeGreaterThan(5);
  });

  test('returns whole-number counts for impressions, clicks and orders', () => {
    const m = rangeMetrics(campaign, { from: daysAgo(6), to: daysAgo(0) });
    expect(Number.isInteger(m.impressions)).toBe(true);
    expect(Number.isInteger(m.clicks)).toBe(true);
    expect(Number.isInteger(m.orders)).toBe(true);
  });

  test('dailySeries has one row per day in the range', () => {
    expect(dailySeries([campaign], { from: daysAgo(6), to: daysAgo(0) })).toHaveLength(7);
  });
});

describe('withDerived', () => {
  test('computes console ratio metrics', () => {
    const m = withDerived({ impressions: 1000, clicks: 50, spend: 500, orders: 5, sales: 5000 });
    expect(m.ctr).toBeCloseTo(5);
    expect(m.cpc).toBeCloseTo(10);
    expect(m.acos).toBeCloseTo(10);
    expect(m.roas).toBeCloseTo(10);
    expect(m.cvr).toBeCloseTo(10);
  });

  test('returns zero ratios rather than NaN when there is no traffic', () => {
    const m = withDerived({ impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 });
    expect([m.ctr, m.cpc, m.acos, m.roas, m.cvr]).toEqual([0, 0, 0, 0, 0]);
  });

  test('sumMetrics recomputes ratios from summed totals, not averaged ratios', () => {
    const a = withDerived({ impressions: 100, clicks: 10, spend: 100, orders: 1, sales: 1000 });
    const b = withDerived({ impressions: 100, clicks: 30, spend: 300, orders: 1, sales: 500 });
    expect(sumMetrics([a, b]).acos).toBeCloseTo(400 / 1500 * 100);
  });
});

describe('placementBreakdown', () => {
  const totals = withDerived({ impressions: 1000, clicks: 100, spend: 1000, orders: 10, sales: 10000 });

  test('placements add back up to the campaign totals', () => {
    const rows = placementBreakdown(totals, {});
    const clicks = rows.reduce((s, r) => s + r.m.clicks, 0);
    expect(clicks).toBeCloseTo(100);
  });

  test('raising top-of-search adjustment shifts traffic to top of search', () => {
    const before = placementBreakdown(totals, {})[0].m.clicks;
    const after = placementBreakdown(totals, { top: 200 })[0].m.clicks;
    expect(after).toBeGreaterThan(before);
  });
});

describe('buildSearchTerms', () => {
  const m = withDerived({ impressions: 900, clicks: 90, spend: 900, orders: 9, sales: 9000 });

  test('exact match keywords only match themselves', () => {
    const terms = buildSearchTerms([{ k: { id: 'k1', keyword: 'kerala banana chips', matchType: 'Exact', bid: 10 }, m }]);
    expect(terms.map(t => t.term)).toEqual(['kerala banana chips']);
  });

  test('broad match keywords expand to several terms that share the keyword traffic', () => {
    const terms = buildSearchTerms([{ k: { id: 'k1', keyword: 'banana chips', matchType: 'Broad', bid: 10 }, m }]);
    expect(terms.length).toBeGreaterThan(1);
    expect(terms.reduce((s, t) => s + t.clicks, 0)).toBeCloseTo(90);
  });
});
