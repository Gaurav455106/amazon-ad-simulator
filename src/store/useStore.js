import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { applyTick } from '../utils/liveTick';
import { localISODate } from '../utils/dateRanges';

// ── User management (plain localStorage, not in Zustand) ──
export const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('amazon-ads-users') || '["SoundMax"]'); }
  catch { return ['SoundMax']; }
};
export const getCurrentUser = () => localStorage.getItem('amazon-ads-current-user') || 'SoundMax';
export const saveUserToList = (name) => {
  const users = getUsers();
  if (!users.includes(name)) {
    localStorage.setItem('amazon-ads-users', JSON.stringify([...users, name]));
  }
  localStorage.setItem('amazon-ads-current-user', name);
};

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
    name: 'Summer Sale - Sponsored Products',
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
    metrics: { impressions: 45320, clicks: 1240, spend: 10752.00, orders: 62, sales: 103977.50 }
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
    metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 41, sales: 61600.00 }
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
    sdCreative: { adFormat: 'image', products: ['B0CF23X3HB'] },
    portfolioId: 'p2',
    createdAt: daysAgo(45),
    metrics: { impressions: 12400, clicks: 180, spend: 3976.00, orders: 9, sales: 13475.00 }
  }
];

const initialAdGroups = [
  { id: 'ag1', products: ['B0CF244HDV', 'B0CF24MSGB'], campaignId: 'c1', name: 'Core Keywords', status: 'Enabled', defaultBid: 9.00, metrics: { impressions: 28000, clicks: 780, spend: 6748.00, orders: 40, sales: 66000.00 } },
  { id: 'ag2', products: ['B0CF277SZN'], campaignId: 'c1', name: 'Long Tail', status: 'Enabled', defaultBid: 5.40, metrics: { impressions: 17320, clicks: 460, spend: 4004.00, orders: 22, sales: 37977.50 } },
  { id: 'ag3', products: ['B0CF244HDV', 'B0CF24MSGB', 'B0CF277SZN'], campaignId: 'c2', name: 'Brand Terms', status: 'Enabled', defaultBid: 7.20, metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 41, sales: 61600.00 } },
  { id: 'ag4', products: ['B0CF23X3HB'], campaignId: 'c3', name: 'Competitor ASINs', status: 'Paused', defaultBid: 10.80, metrics: { impressions: 12400, clicks: 180, spend: 3976.00, orders: 9, sales: 13475.00 } },
];

const initialKeywords = [
  { id: 'k1', adGroupId: 'ag1', campaignId: 'c1', keyword: 'wireless headphones', matchType: 'Exact', bid: 10.20, status: 'Enabled', suggestedBid: 11.04, metrics: { impressions: 12000, clicks: 380, spend: 3192.00, orders: 20, sales: 34100.00 } },
  { id: 'k2', adGroupId: 'ag1', campaignId: 'c1', keyword: 'bluetooth headphones', matchType: 'Phrase', bid: 8.40, status: 'Enabled', suggestedBid: 9.36, metrics: { impressions: 9500, clicks: 240, spend: 2184.00, orders: 13, sales: 21450.00 } },
  { id: 'k3', adGroupId: 'ag1', campaignId: 'c1', keyword: 'noise cancelling', matchType: 'Broad', bid: 6.60, status: 'Enabled', suggestedBid: 7.20, metrics: { impressions: 6500, clicks: 160, spend: 1372.00, orders: 7, sales: 10450.00 } },
  { id: 'k4', adGroupId: 'ag2', campaignId: 'c1', keyword: 'best wireless headphones for running', matchType: 'Phrase', bid: 5.40, status: 'Enabled', suggestedBid: 6.00, metrics: { impressions: 3200, clicks: 95, spend: 896.00, orders: 8, sales: 13200.00 } },
  { id: 'k5', adGroupId: 'ag2', campaignId: 'c1', keyword: 'affordable noise cancelling headphones', matchType: 'Broad', bid: 4.80, status: 'Paused', suggestedBid: 5.40, metrics: { impressions: 2100, clicks: 58, spend: 588.00, orders: 4, sales: 6600.00 } },
  { id: 'k6', adGroupId: 'ag3', campaignId: 'c2', keyword: 'SoundMax headphones', matchType: 'Exact', bid: 7.20, status: 'Enabled', suggestedBid: 7.80, metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 41, sales: 61600.00 } },
];

const initialNegativeKeywords = [
  { id: 'nk1', campaignId: 'c1', adGroupId: null, keyword: 'cheap', matchType: 'Broad', level: 'Campaign' },
  { id: 'nk2', campaignId: 'c1', adGroupId: null, keyword: 'free', matchType: 'Exact', level: 'Campaign' },
  { id: 'nk3', campaignId: 'c1', adGroupId: 'ag1', keyword: 'used', matchType: 'Phrase', level: 'Ad Group' },
];

const initialSbAds = [
  {
    id: 'sba1',
    campaignId: 'c2',
    name: 'Brand Defense Ad',
    status: 'Enabled',
    adFormat: 'product-collection',
    brandName: 'SoundMax',
    headline: 'Premium Audio for Every Moment',
    landingPage: 'store',
    products: ['B0CF244HDV', 'B0CF24MSGB', 'B0CF277SZN'],
    metrics: { impressions: 28900, clicks: 820, spend: 8036.00, orders: 41, sales: 61600.00 }
  }
];

const initialPortfolios = [
  { id: 'p1', name: 'Main Products Portfolio', budget: 100, budgetType: 'Monthly', status: 'Active' },
  { id: 'p2', name: 'Competitor Targeting Portfolio', budget: 30, budgetType: 'Monthly', status: 'Active' },
];

const initialProducts = [
  { asin: 'B0CF244HDV', sku: 'SM-PRO-BLK', name: 'SoundMax Pro Wireless Noise Cancelling Headphones | 40Hr Battery | Hi-Res Audio | Foldable Over-Ear Design', price: 2499, imageType: 'over-ear-black', category: 'Electronics', rating: 4.5, reviews: 2847, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF24MSGB', sku: 'SM-LITE-WHT', name: 'SoundMax Lite True Wireless Earbuds | Active Noise Cancellation | IPX5 Waterproof | 30Hr Total Battery', price: 1799, imageType: 'earbuds-white', category: 'Electronics', rating: 4.8, reviews: 1203, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF277SZN', sku: 'SM-SPORT-BLU', name: 'SoundMax Sport Wireless Earbuds | Ear Hook Design | IPX7 Waterproof | 8Hr Playback | Deep Bass', price: 999, imageType: 'sport-blue', category: 'Electronics', rating: 4.3, reviews: 876, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF23X3HB', sku: 'SM-STD-BLK', name: 'SoundMax Studio Headphones | Professional Monitor | 50mm Drivers | Detachable Cable | Foldable', price: 3299, imageType: 'studio-gray', category: 'Electronics', rating: 4.1, reviews: 431, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF234LT4', sku: 'SM-KIDS-RED', name: 'SoundMax Kids Volume Limited Headphones | 85dB Safe | Soft Ear Cushions | Adjustable Headband | Wired', price: 699, imageType: 'kids-red', category: 'Electronics', rating: 4.4, reviews: 612, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF2X8MNP', sku: 'SM-GAME-BLK', name: 'SoundMax Pro Gaming Headset | 7.1 Surround Sound | Noise Cancelling Mic | RGB | PC PS5 Xbox Compatible', price: 1999, imageType: 'gaming-rgb', category: 'Electronics', rating: 4.2, reviews: 389, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF2Y9QRS', sku: 'SM-OPEN-SLV', name: 'SoundMax Open Back Audiophile Headphones | 250 Ohm | Velour Earpads | Hi-Fi Reference Grade Sound', price: 4999, imageType: 'open-back', category: 'Electronics', rating: 4.6, reviews: 218, status: 'In stock', brand: 'SoundMax' },
  { asin: 'B0CF2Z1TUV', sku: 'SM-NECK-GLD', name: 'SoundMax Neckband Wireless Earphones | Magnetic Clasp | 15Hr Battery | Dual Device Connect | Voice Assist', price: 899, imageType: 'neckband-gold', category: 'Electronics', rating: 4.0, reviews: 934, status: 'In stock', brand: 'SoundMax' },
];

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
        { id: 'n1', type: 'warning', message: 'Campaign "Summer Sale" is running low on daily budget', time: '2 hours ago', read: false },
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
      version: 4,
      migrate: (persisted, version) => (version < 4 ? ensureAdGroupsForAllCampaigns(persisted) : persisted),
      partialize: (state) => {
        // eslint-disable-next-line no-unused-vars
        const { currentUserName, switchUser, ...rest } = state;
        return rest;
      },
    }
  )
);
