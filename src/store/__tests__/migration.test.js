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

describe('migrateToFarmley (v5 migration)', () => {
  test('swaps the seed data for Farmley and remaps old ASINs in student-created entities', async () => {
    const { migrateToFarmley } = await import('../useStore');
    const before = {
      products: [{ asin: 'B0CF244HDV', name: 'SoundMax Pro' }],
      campaigns: [{ id: 'c1', name: 'Summer Sale - Sponsored Products' }, { id: 'c99', name: 'Student SD', sdCreative: { products: ['B0CF24MSGB'] } }],
      adGroups: [{ id: 'ag1', products: ['B0CF244HDV'] }, { id: 'ag99', campaignId: 'c99', products: ['B0CF244HDV', 'B0XXXXXXXX'] }],
      keywords: [{ id: 'k1', keyword: 'wireless headphones' }, { id: 'k99', keyword: 'student keyword' }],
      negativeKeywords: [],
      sbAds: [],
    };
    const after = migrateToFarmley(before);
    expect(after.products.every(p => p.brand === 'Farmley')).toBe(true);
    expect(after.campaigns.find(c => c.id === 'c1').name).toBe('Festive Sale - Sponsored Products');
    expect(after.campaigns.find(c => c.id === 'c99').sdCreative.products).toEqual(['B09J578NDM']);
    expect(after.adGroups.find(ag => ag.id === 'ag99').products).toEqual(['B0BSXC1Z63', 'B0XXXXXXXX']);
    expect(after.keywords.find(k => k.id === 'k1').keyword).toBe('roasted makhana');
    expect(after.keywords.find(k => k.id === 'k99').keyword).toBe('student keyword');
    expect(before.adGroups[1].products[0]).toBe('B0CF244HDV');
  });
});

describe('adoptLegacyDefaultUser', () => {
  const memStorage = (init) => {
    const mem = { ...init };
    return { mem, getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
  };

  test('moves the old default account data to the Farmley account', async () => {
    const { adoptLegacyDefaultUser } = await import('../useStore');
    const st = memStorage({ 'amazon-ads-store__SoundMax': '{"v":1}', 'amazon-ads-users': '["SoundMax","Priya"]' });
    adoptLegacyDefaultUser(st);
    expect(st.mem['amazon-ads-store__Farmley']).toBe('{"v":1}');
    expect(st.mem['amazon-ads-store__SoundMax']).toBeUndefined();
    expect(JSON.parse(st.mem['amazon-ads-users'])).toEqual(['Farmley', 'Priya']);
    expect(st.mem['amazon-ads-current-user']).toBe('Farmley');
  });

  test('never deletes the old save when the Farmley account already has data', async () => {
    const { adoptLegacyDefaultUser } = await import('../useStore');
    const st = memStorage({ 'amazon-ads-store__SoundMax': '{"old":1}', 'amazon-ads-store__Farmley': '{"new":1}', 'amazon-ads-users': '["SoundMax"]' });
    adoptLegacyDefaultUser(st);
    expect(st.mem['amazon-ads-store__SoundMax']).toBe('{"old":1}');
    expect(st.mem['amazon-ads-store__Farmley']).toBe('{"new":1}');
    expect(JSON.parse(st.mem['amazon-ads-users'])).toEqual(['Farmley', 'SoundMax']);
  });

  test('leaves other signed-in accounts alone', async () => {
    const { adoptLegacyDefaultUser } = await import('../useStore');
    const st = memStorage({ 'amazon-ads-current-user': 'Priya', 'amazon-ads-store__SoundMax': '{}' });
    adoptLegacyDefaultUser(st);
    expect(st.mem['amazon-ads-store__SoundMax']).toBe('{}');
    expect(st.mem['amazon-ads-current-user']).toBe('Priya');
  });
});
