import { describe, expect, test } from 'vitest';
import { applyTick, trafficForBid, todayKey } from '../liveTick';

const NOW = new Date(2026, 9, 21, 12, 0, 0);
const TODAY = todayKey(NOW);

// Deterministic generator returning 0.01: every impression is clicked and every
// click converts, so each tick produces measurable spend.
const alwaysWin = () => 0.01;

const baseState = () => ({
  campaigns: [{ id: 'c1', status: 'Enabled', startDate: '2026-01-01', endDate: '', budget: 500, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }],
  adGroups: [{ id: 'ag1', campaignId: 'c1', status: 'Enabled', defaultBid: 10, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }],
  keywords: [{ id: 'k1', adGroupId: 'ag1', campaignId: 'c1', status: 'Enabled', bid: 10, suggestedBid: 10, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }],
});

describe('applyTick', () => {
  test('adds the same traffic to the campaign, its ad group and the serving keyword', () => {
    const next = applyTick(baseState(), { now: NOW, rand: alwaysWin });
    const c = next.campaigns[0].metrics;
    expect(c.clicks).toBeGreaterThan(0);
    expect(next.adGroups[0].metrics).toEqual(c);
    expect(next.keywords[0].metrics).toEqual(c);
    expect(next.campaigns[0].daily[TODAY]).toEqual(c);
  });

  test('paused campaigns do not serve', () => {
    const state = baseState();
    state.campaigns[0].status = 'Paused';
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].metrics.impressions).toBe(0);
  });

  test('a campaign whose ad groups are all paused does not serve', () => {
    const state = baseState();
    state.adGroups[0].status = 'Paused';
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].metrics.impressions).toBe(0);
  });

  test('a manual ad group with every keyword paused does not serve', () => {
    const state = baseState();
    state.keywords[0].status = 'Paused';
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].metrics.impressions).toBe(0);
  });

  test('ended and not-yet-started campaigns do not serve', () => {
    const ended = baseState();
    ended.campaigns[0].endDate = '2026-10-01';
    const scheduled = baseState();
    scheduled.campaigns[0].startDate = '2026-12-01';
    expect(applyTick(ended, { now: NOW, rand: alwaysWin }).campaigns[0].metrics.impressions).toBe(0);
    expect(applyTick(scheduled, { now: NOW, rand: alwaysWin }).campaigns[0].metrics.impressions).toBe(0);
  });

  test('stops spending once the daily budget is used up', () => {
    const state = baseState();
    state.campaigns[0].budget = 50;
    state.campaigns[0].daily = { [TODAY]: { spend: 50 } };
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].metrics.spend).toBe(0);
  });

  test('never spends past the daily budget within a tick', () => {
    const state = baseState();
    state.campaigns[0].budget = 50;
    state.campaigns[0].daily = { [TODAY]: { spend: 49 } };
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].daily[TODAY].spend).toBeLessThanOrEqual(50);
  });

  test("yesterday's spend does not count against today's budget", () => {
    const state = baseState();
    state.campaigns[0].budget = 50;
    state.campaigns[0].daily = { '2026-10-20': { spend: 50 } };
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].metrics.spend).toBeGreaterThan(0);
  });

  test('a lifetime budget caps all-time spend, not daily spend', () => {
    const state = baseState();
    state.campaigns[0].budgetType = 'Lifetime';
    state.campaigns[0].budget = 1000;
    state.campaigns[0].metrics.spend = 1000;
    state.campaigns[0].daily = { '2026-10-20': { spend: 1000 } };
    expect(applyTick(state, { now: NOW, rand: alwaysWin }).campaigns[0].metrics.spend).toBe(1000);
  });

  test('an ad group with a 0 default bid still pays for its clicks', () => {
    const state = baseState();
    state.keywords = [];
    state.adGroups[0].defaultBid = 0;
    const c = applyTick(state, { now: NOW, rand: alwaysWin }).campaigns[0].metrics;
    expect(c.clicks).toBeGreaterThan(0);
    expect(c.spend).toBeGreaterThan(0);
  });

  test('earlier days in the ledger are never changed by a tick', () => {
    const state = baseState();
    state.campaigns[0].daily = { '2026-10-20': { impressions: 5, clicks: 1, spend: 9, orders: 0, sales: 0 } };
    const next = applyTick(state, { now: NOW, rand: alwaysWin });
    expect(next.campaigns[0].daily['2026-10-20']).toEqual(state.campaigns[0].daily['2026-10-20']);
  });

  test('does not mutate the input state', () => {
    const state = baseState();
    const snapshot = JSON.stringify(state);
    applyTick(state, { now: NOW, rand: alwaysWin });
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});

describe('trafficForBid', () => {
  test('CPC never exceeds the bid', () => {
    const t = trafficForBid(12, 12, alwaysWin);
    expect(t.clicks).toBeGreaterThan(0);
    expect(t.spend / t.clicks).toBeLessThanOrEqual(12);
  });

  test('a bid far below the market rate wins only a small share of traffic', () => {
    const mid = () => 0.5;
    expect(trafficForBid(3, 9, mid).impressions).toBeLessThan(trafficForBid(9, 9, mid).impressions * 0.2);
  });

  test('bidding above the suggested bid wins more impressions than bidding below it', () => {
    const mid = () => 0.5;
    expect(trafficForBid(20, 10, mid).impressions).toBeGreaterThan(trafficForBid(5, 10, mid).impressions);
  });
});
