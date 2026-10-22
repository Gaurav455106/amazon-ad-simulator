import { describe, expect, test, beforeAll } from 'vitest';

// The store module reads localStorage at import time.
beforeAll(() => {
  const mem = {};
  globalThis.localStorage = {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; },
  };
});

describe('ensureAdGroupsForAllCampaigns (v4 migration)', () => {
  test('gives SB/SD campaigns without ad groups a default ad group and moves loose keywords into it', async () => {
    const { ensureAdGroupsForAllCampaigns } = await import('../useStore');
    const before = {
      campaigns: [{ id: 'c1' }, { id: 'c2' }],
      adGroups: [{ id: 'ag1', campaignId: 'c1' }],
      keywords: [{ id: 'k1', campaignId: 'c2', adGroupId: null }, { id: 'k2', campaignId: 'c1', adGroupId: 'ag1' }],
    };
    const after = ensureAdGroupsForAllCampaigns(before);
    const created = after.adGroups.find(ag => ag.campaignId === 'c2');
    expect(created).toBeDefined();
    expect(after.adGroups).toHaveLength(2);
    expect(after.keywords.find(k => k.id === 'k1').adGroupId).toBe(created.id);
    expect(after.keywords.find(k => k.id === 'k2').adGroupId).toBe('ag1');
    expect(before.adGroups).toHaveLength(1);
  });
});

describe('store actions', () => {
  test('addAdGroup keeps the id the caller supplies (keywords reference it)', async () => {
    const { useStore } = await import('../useStore');
    useStore.getState().addAdGroup({ id: 'agFixed', campaignId: 'c1', name: 'X', status: 'Enabled', defaultBid: 5 });
    expect(useStore.getState().adGroups.some(ag => ag.id === 'agFixed')).toBe(true);
  });

  test('changing a budget records a History entry with from/to values', async () => {
    const { useStore } = await import('../useStore');
    const c = useStore.getState().campaigns[0];
    useStore.getState().updateCampaign(c.id, { budget: c.budget + 100 });
    const h = useStore.getState().history[0];
    expect(h.campaignId).toBe(c.id);
    expect(h.changeType).toBe('Campaign budget');
    expect(h.to).toBe(`₹${(c.budget + 100).toFixed(2)}`);
  });

  test('no-op updates do not create History entries', async () => {
    const { useStore } = await import('../useStore');
    const c = useStore.getState().campaigns[0];
    const count = useStore.getState().history.length;
    useStore.getState().updateCampaign(c.id, { budget: c.budget });
    expect(useStore.getState().history.length).toBe(count);
  });
});
