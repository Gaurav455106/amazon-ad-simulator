import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { applyTick } from '../utils/liveTick';
import { localISODate } from '../utils/dateRanges';
import { BRAND_NAME, DEMO_PRODUCTS, SEED_KEYWORDS } from '../data/demoAccount';

// ── User management (plain localStorage, not in Zustand) ──
export const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('amazon-ads-users') || JSON.stringify([BRAND_NAME])); }
  catch { return [BRAND_NAME]; }
};
export const getCurrentUser = () => localStorage.getItem('amazon-ads-current-user') || BRAND_NAME;
export const saveUserToList = (name) => {
  const users = getUsers();
  if (!users.includes(name)) {
    localStorage.setItem('amazon-ads-users', JSON.stringify([...users, name]));
  }
  localStorage.setItem('amazon-ads-current-user', name);
};

// The default account used to be "SoundMax". Hand its saved data to the new default
// account once, so existing campaigns survive the switch (the v5 migration then converts them).
const LEGACY_DEFAULT_USER = 'SoundMax';
export function adoptLegacyDefaultUser(storage) {
  const legacyKey = `amazon-ads-store__${LEGACY_DEFAULT_USER}`;
  const newKey = `amazon-ads-store__${BRAND_NAME}`;
  const current = storage.getItem('amazon-ads-current-user');
  if (current && current !== LEGACY_DEFAULT_USER) return;
  const legacy = storage.getItem(legacyKey);
  const canMove = Boolean(legacy) && !storage.getItem(newKey);
  if (canMove) {
    storage.setItem(newKey, legacy);
    storage.removeItem(legacyKey);
  }
  // If both saves exist, keep the old account listed so its data stays reachable via "Switch account".
  const keepLegacy = Boolean(legacy) && !canMove;
  try {
    const users = JSON.parse(storage.getItem('amazon-ads-users') || '[]');
    const renamed = [...new Set([BRAND_NAME, ...users.filter(u => keepLegacy || u !== LEGACY_DEFAULT_USER)])];
    storage.setItem('amazon-ads-users', JSON.stringify(renamed.length ? renamed : [BRAND_NAME]));
  } catch {
    storage.setItem('amazon-ads-users', JSON.stringify([BRAND_NAME]));
  }
  storage.setItem('amazon-ads-current-user', BRAND_NAME);
}
if (typeof localStorage !== 'undefined') adoptLegacyDefaultUser(localStorage);

// ── Per-user storage adapter ──
const userStorage = createJSONStorage(() => ({
  getItem: (name) => localStorage.getItem(`${name}__${getCurrentUser()}`),
  setItem: (name, value) => localStorage.setItem(`${name}__${getCurrentUser()}`, value),
  removeItem: (name) => localStorage.removeItem(`${name}__${getCurrentUser()}`),
}));

const daysAgo = (n) => localISODate(new Date(Date.now() - n * 86400000));

const initialCampaigns = [
  {
    id: 'c1',
    name: 'Festive Sale - Sponsored Products',
    type: 'Sponsored Products',
    status: 'Enabled',
    targetingType: 'Manual',
    budget: 500,
    budgetType: 'Daily',
    startDate: daysAgo(75),
    endDate: '',
    biddingStrategy: 'Dynamic bids - down only',
    portfolioId: 'p1',
    createdAt: daysAgo(75),
    metrics: { impressions: 45320, clicks: 1240, spend: 10752.00, orders: 62, sales: 21918.00 }
  },
  {
    id: 'c2',
    name: 'Brand Defense - Sponsored Brands',
    type: 'Sponsored Brands',
    status: 'Enabled',
    targetingType: 'Manual',
    budget: 300,
    budgetType: 'Daily',
    startDate: daysAgo(60),
    endDate: '',
    biddingStrategy: 'Fixed bid',
    portfolioId: 'p1',
    createdAt: daysAgo(60),
    metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 110, sales: 41800.00 }
  },
  {
    id: 'c3',
    name: 'Competitor Targeting - Sponsored Display',
    type: 'Sponsored Display',
    status: 'Paused',
    targetingType: 'Contextual + Audiences',
    budget: 200,
    budgetType: 'Daily',
    startDate: daysAgo(45),
    endDate: '',
    biddingStrategy: 'Optimize for page visits',
    costType: 'CPC',
    goal: 'consideration',
    // The five targets the console's Display builder pre-adds.
    sdTargets: [
      { type: 'Contextual', name: 'Similar to advertised products', bid: 10.8 },
      { type: 'Audience', name: 'Views remarketing · Similar to advertised products · 30 days', bid: 10.8 },
      { type: 'Audience', name: 'Views remarketing · Advertised products · 30 days', bid: 10.8 },
      { type: 'Audience', name: 'Purchases remarketing · Related to advertised products · 30 days', bid: 10.8 },
      { type: 'Audience', name: 'Purchases remarketing · Advertised products · 30 days', bid: 10.8 },
    ],
    sdCreative: { adFormat: 'image', products: ['B0D3M4ZNKS'] },
    portfolioId: 'p2',
    createdAt: daysAgo(45),
    metrics: { impressions: 12400, clicks: 180, spend: 3976.00, orders: 9, sales: 8091.00 }
  }
];

const initialAdGroups = [
  { id: 'ag1', products: ['B0BSXC1Z63', 'B09J578NDM'], campaignId: 'c1', name: 'Core Keywords', status: 'Enabled', defaultBid: 9.00, metrics: { impressions: 28000, clicks: 780, spend: 6748.00, orders: 40, sales: 15340.00 } },
  { id: 'ag2', products: ['B0DFML8557'], campaignId: 'c1', name: 'Long Tail', status: 'Enabled', defaultBid: 5.40, metrics: { impressions: 17320, clicks: 460, spend: 4004.00, orders: 22, sales: 6578.00 } },
  { id: 'ag3', products: ['B0BSXC1Z63', 'B09J578NDM', 'B0DFML8557'], campaignId: 'c2', name: 'Brand Terms', status: 'Enabled', defaultBid: 7.20, metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 110, sales: 41800.00 } },
  { id: 'ag4', products: ['B0D3M4ZNKS'], campaignId: 'c3', name: 'Competitor ASINs', status: 'Paused', defaultBid: 10.80, metrics: { impressions: 12400, clicks: 180, spend: 3976.00, orders: 9, sales: 8091.00 } },
];

const seedKeyword = (id, adGroupId, campaignId, [keyword, matchType, bid, suggestedBid], status, metrics) =>
  ({ id, adGroupId, campaignId, keyword, matchType, bid, status, suggestedBid, metrics });
const initialKeywords = [
  seedKeyword('k1', 'ag1', 'c1', SEED_KEYWORDS.core[0], 'Enabled', { impressions: 12000, clicks: 380, spend: 3192.00, orders: 20, sales: 8300.00 }),
  seedKeyword('k2', 'ag1', 'c1', SEED_KEYWORDS.core[1], 'Enabled', { impressions: 9500, clicks: 240, spend: 2184.00, orders: 13, sales: 4590.00 }),
  seedKeyword('k3', 'ag1', 'c1', SEED_KEYWORDS.core[2], 'Enabled', { impressions: 6500, clicks: 160, spend: 1372.00, orders: 7, sales: 2450.00 }),
  seedKeyword('k4', 'ag2', 'c1', SEED_KEYWORDS.longTail[0], 'Enabled', { impressions: 3200, clicks: 95, spend: 896.00, orders: 8, sales: 2392.00 }),
  seedKeyword('k5', 'ag2', 'c1', SEED_KEYWORDS.longTail[1], 'Paused', { impressions: 2100, clicks: 58, spend: 588.00, orders: 4, sales: 1196.00 }),
  seedKeyword('k6', 'ag3', 'c2', SEED_KEYWORDS.brand[0], 'Enabled', { impressions: 28900, clicks: 820, spend: 8036.00, orders: 110, sales: 41800.00 }),
];

const initialNegativeKeywords = [
  { id: 'nk1', campaignId: 'c1', adGroupId: null, keyword: 'cheap', matchType: 'Broad', level: 'Campaign' },
  { id: 'nk2', campaignId: 'c1', adGroupId: null, keyword: 'free', matchType: 'Exact', level: 'Campaign' },
  { id: 'nk3', campaignId: 'c1', adGroupId: 'ag1', keyword: 'recipe', matchType: 'Phrase', level: 'Ad Group' },
];

const initialSbAds = [
  {
    id: 'sba1',
    campaignId: 'c2',
    name: 'Brand Defense Ad',
    status: 'Enabled',
    adFormat: 'product-collection',
    brandName: BRAND_NAME,
    headline: 'Snack smarter with real dry fruits',
    landingPage: 'store',
    products: ['B0BSXC1Z63', 'B09J578NDM', 'B0DFML8557'],
    metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 110, sales: 41800.00 }
  }
];

const initialPortfolios = [
  { id: 'p1', name: 'Main Products Portfolio', budget: 100, budgetType: 'Monthly', status: 'Active' },
  { id: 'p2', name: 'Competitor Targeting Portfolio', budget: 30, budgetType: 'Monthly', status: 'Active' },
];

const initialProducts = DEMO_PRODUCTS;

const generateChartData = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      impressions: Math.floor(2000 + Math.random() * 3000),
      clicks: Math.floor(50 + Math.random() * 150),
      spend: parseFloat((2 + Math.random() * 8).toFixed(2)),
      orders: Math.floor(2 + Math.random() * 15),
      sales: parseFloat((60 + Math.random() * 400).toFixed(2)),
    });
  }
  return data;
};

const EMPTY_AG_METRICS = { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 };

/**
 * v4: the real console nests every SB and Display ad inside an ad group.
 * Older saves created SB/SD campaigns without one, so give each campaign a
 * default ad group and move its loose keywords into it.
 */
export function ensureAdGroupsForAllCampaigns(state) {
  const campaigns = state.campaigns || [];
  const adGroups = state.adGroups || [];
  const created = campaigns
    .filter(c => !adGroups.some(ag => ag.campaignId === c.id))
    .map(c => ({ id: `ag-${c.id}`, campaignId: c.id, name: 'Ad group 1', status: 'Enabled', defaultBid: 0, metrics: { ...EMPTY_AG_METRICS } }));
  const firstAdGroupOf = (campaignId) =>
    created.find(ag => ag.campaignId === campaignId)?.id || adGroups.find(ag => ag.campaignId === campaignId)?.id || null;
  const keywords = (state.keywords || []).map(k => (k.adGroupId ? k : { ...k, adGroupId: firstAdGroupOf(k.campaignId) }));
  return { ...state, adGroups: [...adGroups, ...created], keywords };
}

/** v5: the demo account moved from the made-up SoundMax headphones to Farmley's real products. */
const LEGACY_ASIN_MAP = {
  B0CF244HDV: 'B0BSXC1Z63', B0CF24MSGB: 'B09J578NDM', B0CF277SZN: 'B0DFML8557', B0CF23X3HB: 'B0D3M4ZNKS',
  B0CF234LT4: 'B0CJY8F1DG', B0CF2X8MNP: 'B0D4M8QBJJ', B0CF2Y9QRS: 'B0BS8RDYBC', B0CF2Z1TUV: 'B09LD3ZB96',
};
const remapAsins = (list) => (Array.isArray(list) ? list.map(a => LEGACY_ASIN_MAP[a] || a) : list);
const replaceSeed = (items, seed) => {
  const seedIds = new Set(seed.map(x => x.id));
  return [...seed, ...(items || []).filter(x => !seedIds.has(x.id))];
};

/**
 * Replaces the seed campaigns, ad groups, keywords and ads with the Farmley versions,
 * keeps everything a student created, and points their product references at the new ASINs.
 */
export function migrateToFarmley(state) {
  const remapCampaign = (c) => (c.sdCreative ? { ...c, sdCreative: { ...c.sdCreative, products: remapAsins(c.sdCreative.products) } } : c);
  return {
    ...state,
    products: DEMO_PRODUCTS,
    campaigns: replaceSeed(state.campaigns, initialCampaigns).map(remapCampaign),
    adGroups: replaceSeed(state.adGroups, initialAdGroups).map(ag => ({ ...ag, products: remapAsins(ag.products) })),
    keywords: replaceSeed(state.keywords, initialKeywords),
    negativeKeywords: replaceSeed(state.negativeKeywords, initialNegativeKeywords),
    sbAds: replaceSeed(state.sbAds, initialSbAds).map(ad => ({ ...ad, products: remapAsins(ad.products) })),
  };
}

// ── Change history (what the console's History pages show) ──
const HISTORY_LIMIT = 500;
const TRACKED_FIELDS = {
  name: 'Name', status: 'Status', budget: 'Budget', defaultBid: 'Default bid', bid: 'Bid',
  endDate: 'End date', startDate: 'Start date', biddingStrategy: 'Bidding strategy', portfolioId: 'Portfolio',
  placementAdjustments: 'Placement bid adjustment',
};
const STATUS_WORD = { Enabled: 'Delivering', Paused: 'Paused', Archived: 'Archived' };
const displayValue = (field, v) => {
  if (v === undefined || v === null || v === '') return '-';
  if (field === 'status') return STATUS_WORD[v] || v;
  if (field === 'budget' || field === 'defaultBid' || field === 'bid') return `₹${Number(v).toFixed(2)}`;
  if (field === 'placementAdjustments') return Object.entries(v).map(([k, n]) => `${k}: ${n}%`).join(', ');
  return String(v);
};
const historyEntry = (e) => ({ id: `h${Date.now()}${Math.random()}`, at: new Date().toISOString(), ...e });
const appendHistory = (history, entries) => (entries.length ? [...entries, ...(history || [])].slice(0, HISTORY_LIMIT) : history || []);
function changeEntries(level, before, updates, ctx) {
  if (!before) return [];
  return Object.entries(updates)
    .filter(([field, v]) => TRACKED_FIELDS[field] && JSON.stringify(before[field]) !== JSON.stringify(v))
    .map(([field, v]) => historyEntry({
      level: level === 'Keyword' ? 'Ad group' : level,
      ...ctx,
      changeType: level === 'Keyword' ? `Keyword ${TRACKED_FIELDS[field].toLowerCase()} - ${ctx.subject}` : `${level} ${TRACKED_FIELDS[field].toLowerCase()}`,
      from: displayValue(field, before[field]),
      to: displayValue(field, v),
    }));
}

export const useStore = create(
  persist(
    (set, get) => ({
      currentUserName: getCurrentUser(),

      // Data
      campaigns: initialCampaigns,
      adGroups: initialAdGroups,
      keywords: initialKeywords,
      negativeKeywords: initialNegativeKeywords,
      portfolios: initialPortfolios,
      products: initialProducts,
      history: [],
      negativeProducts: [],
      accountSettings: { budgetCap: 'campaign', budgetCapAmount: '', dailyIncrease: '25' },
      sbAds: initialSbAds,
      chartData: generateChartData(),
      dateRange: '30',
      // Console date range: a preset key, or 'custom' with ISO from/to dates.
      consoleRange: { preset: 'last7', from: null, to: null },
      selectedCampaignIds: [],
      notifications: [
        { id: 'n1', type: 'warning', message: 'Campaign "Festive Sale" is running low on daily budget', time: '2 hours ago', read: false },
        { id: 'n2', type: 'info', message: 'New search term report is available', time: '5 hours ago', read: false },
        { id: 'n3', type: 'success', message: 'Bid optimization applied to 3 campaigns', time: '1 day ago', read: true },
      ],

      // Campaign Actions
      addCampaign: (campaign) => set((state) => ({
        campaigns: [...state.campaigns, { id: `c${Date.now()}`, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 }, ...campaign, createdAt: localISODate() }]
      })),
      updateCampaign: (id, updates) => set((state) => {
        const before = state.campaigns.find(c => c.id === id);
        return {
          campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c),
          history: appendHistory(state.history, changeEntries('Campaign', before, updates, { campaignId: id })),
        };
      }),
      deleteCampaigns: (ids) => set((state) => ({
        campaigns: state.campaigns.filter(c => !ids.includes(c.id)),
        adGroups: state.adGroups.filter(ag => !ids.includes(ag.campaignId)),
        keywords: state.keywords.filter(k => !ids.includes(k.campaignId)),
        negativeKeywords: state.negativeKeywords.filter(n => !ids.includes(n.campaignId)),
        negativeProducts: (state.negativeProducts || []).filter(n => !ids.includes(n.campaignId)),
      })),
      toggleCampaignStatus: (id) => get().updateCampaign(id, {
        status: get().campaigns.find(c => c.id === id)?.status === 'Enabled' ? 'Paused' : 'Enabled',
      }),

      // Ad Group Actions
      addAdGroup: (adGroup) => set((state) => ({
        adGroups: [...state.adGroups, { id: `ag${Date.now()}`, ...adGroup, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }]
      })),
      updateAdGroup: (id, updates) => set((state) => {
        const before = state.adGroups.find(ag => ag.id === id);
        return {
          adGroups: state.adGroups.map(ag => ag.id === id ? { ...ag, ...updates } : ag),
          history: appendHistory(state.history, changeEntries('Ad group', before, updates, { campaignId: before?.campaignId, adGroupId: id })),
        };
      }),
      deleteAdGroup: (id) => set((state) => ({
        adGroups: state.adGroups.filter(ag => ag.id !== id),
        keywords: state.keywords.filter(k => k.adGroupId !== id),
        negativeKeywords: state.negativeKeywords.filter(n => n.adGroupId !== id),
        negativeProducts: (state.negativeProducts || []).filter(n => n.adGroupId !== id),
      })),

      // Keyword Actions
      addKeyword: (keyword) => set((state) => ({
        keywords: [...state.keywords, { ...keyword, id: `k${Date.now()}`, suggestedBid: parseFloat((keyword.bid * 1.1).toFixed(2)), metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }]
      })),
      addKeywords: (kws) => set((state) => ({
        keywords: [...state.keywords, ...kws.map(k => ({ ...k, id: `k${Date.now()}${Math.random()}`, suggestedBid: parseFloat((k.bid * 1.1).toFixed(2)), metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }))],
        history: appendHistory(state.history, kws.map(k => historyEntry({
          level: 'Ad group', campaignId: k.campaignId, adGroupId: k.adGroupId,
          changeType: `Keyword (${(k.matchType || '').toLowerCase()}) - ${k.keyword}`, from: '-', to: 'Added',
        }))),
      })),
      updateKeyword: (id, updates) => set((state) => {
        const before = state.keywords.find(k => k.id === id);
        return {
          keywords: state.keywords.map(k => k.id === id ? { ...k, ...updates } : k),
          history: appendHistory(state.history, changeEntries('Keyword', before, updates, { campaignId: before?.campaignId, adGroupId: before?.adGroupId, subject: before?.keyword })),
        };
      }),
      deleteKeyword: (id) => set((state) => ({
        keywords: state.keywords.filter(k => k.id !== id)
      })),

      // Negative Keyword Actions
      addNegativeKeywords: (nks) => set((state) => ({
        negativeKeywords: [...state.negativeKeywords, ...nks.map(nk => ({ ...nk, id: `nk${Date.now()}${Math.random()}` }))],
        history: appendHistory(state.history, nks.map(nk => historyEntry({
          level: nk.adGroupId ? 'Ad group' : 'Campaign', campaignId: nk.campaignId, adGroupId: nk.adGroupId,
          changeType: `Negative keywords(${(nk.matchType || '').toLowerCase()}) - ${nk.keyword}`, from: '-', to: 'Added',
        }))),
      })),
      addNegativeProducts: (nps) => set((state) => ({
        negativeProducts: [...(state.negativeProducts || []), ...nps.map(np => ({ ...np, id: `np${Date.now()}${Math.random()}` }))],
        history: appendHistory(state.history, nps.map(np => historyEntry({
          level: np.adGroupId ? 'Ad group' : 'Campaign', campaignId: np.campaignId, adGroupId: np.adGroupId,
          changeType: `Negative product - ${np.asin || `brand: ${np.brand}`}`, from: '-', to: 'Added',
        }))),
      })),
      deleteNegativeProduct: (id) => set((state) => ({
        negativeProducts: (state.negativeProducts || []).filter(np => np.id !== id),
      })),
      deleteNegativeKeyword: (id) => set((state) => ({
        negativeKeywords: state.negativeKeywords.filter(nk => nk.id !== id)
      })),

      // SB Ad Actions
      addSbAd: (ad) => set((state) => ({
        sbAds: [...(state.sbAds || []), { ...ad, id: `sba${Date.now()}`, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }]
      })),
      updateSbAd: (id, updates) => set((state) => ({
        sbAds: (state.sbAds || []).map(a => a.id === id ? { ...a, ...updates } : a)
      })),

      // Portfolio Actions
      addPortfolio: (portfolio) => set((state) => ({
        portfolios: [...state.portfolios, { ...portfolio, id: `p${Date.now()}` }]
      })),
      updatePortfolio: (id, updates) => set((state) => ({
        portfolios: state.portfolios.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      // UI
      setDateRange: (range) => set({ dateRange: range }),
      setConsoleRange: (consoleRange) => set({ consoleRange }),
      setAccountSettings: (accountSettings) => set({ accountSettings }),
      setSelectedCampaignIds: (ids) => set({ selectedCampaignIds: ids }),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      switchUser: (userId) => {
        saveUserToList(userId);
        localStorage.setItem('amazon-ads-current-user', userId);
        set({ currentUserName: userId });
        // Rehydrate from the new user's persisted data
        useStore.persist.rehydrate();
      },

      // Simulate live data tick (see utils/liveTick.js for the delivery rules)
      simulateTick: () => set((state) => applyTick(state)),
    }),
    {
      name: 'amazon-ads-store',
      storage: userStorage,
      version: 5,
      migrate: (persisted, version) => {
        const v4 = version < 4 ? ensureAdGroupsForAllCampaigns(persisted) : persisted;
        return version < 5 ? migrateToFarmley(v4) : v4;
      },
      partialize: (state) => {
        // eslint-disable-next-line no-unused-vars
        const { currentUserName, switchUser, ...rest } = state;
        return rest;
      },
    }
  )
);
