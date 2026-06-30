import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generatePerformanceData, simulateAuction } from '../utils/simulation';

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

const initialCampaigns = [
  {
    id: 'c1',
    name: 'Summer Sale - Sponsored Products',
    type: 'Sponsored Products',
    status: 'Enabled',
    targetingType: 'Manual',
    budget: 50,
    budgetType: 'Daily',
    startDate: '2024-01-01',
    endDate: '',
    biddingStrategy: 'Dynamic bids - down only',
    portfolioId: 'p1',
    createdAt: '2024-01-01',
    metrics: { impressions: 45320, clicks: 1240, spend: 38.40, orders: 62, sales: 1890.50, ctr: 2.74, cpc: 0.31, acos: 2.03, roas: 49.23, cvr: 5.0 }
  },
  {
    id: 'c2',
    name: 'Brand Defense - Sponsored Brands',
    type: 'Sponsored Brands',
    status: 'Enabled',
    targetingType: 'Manual',
    budget: 30,
    budgetType: 'Daily',
    startDate: '2024-01-15',
    endDate: '',
    biddingStrategy: 'Fixed bid',
    portfolioId: 'p1',
    createdAt: '2024-01-15',
    metrics: { impressions: 28900, clicks: 820, spend: 28.70, orders: 41, sales: 1120.00, ctr: 2.84, cpc: 0.35, acos: 2.56, roas: 39.02, cvr: 5.0 }
  },
  {
    id: 'c3',
    name: 'Competitor Targeting - Sponsored Display',
    type: 'Sponsored Display',
    status: 'Paused',
    targetingType: 'Auto',
    budget: 20,
    budgetType: 'Daily',
    startDate: '2024-02-01',
    endDate: '',
    biddingStrategy: 'Dynamic bids - up and down',
    portfolioId: 'p2',
    createdAt: '2024-02-01',
    metrics: { impressions: 12400, clicks: 180, spend: 14.20, orders: 9, sales: 245.00, ctr: 1.45, cpc: 0.79, acos: 5.80, roas: 17.25, cvr: 5.0 }
  }
];

const initialAdGroups = [
  { id: 'ag1', campaignId: 'c1', name: 'Core Keywords', status: 'Enabled', defaultBid: 0.75, metrics: { impressions: 28000, clicks: 780, spend: 24.10, orders: 40, sales: 1200.00 } },
  { id: 'ag2', campaignId: 'c1', name: 'Long Tail', status: 'Enabled', defaultBid: 0.45, metrics: { impressions: 17320, clicks: 460, spend: 14.30, orders: 22, sales: 690.50 } },
  { id: 'ag3', campaignId: 'c2', name: 'Brand Terms', status: 'Enabled', defaultBid: 0.60, metrics: { impressions: 28900, clicks: 820, spend: 28.70, orders: 41, sales: 1120.00 } },
  { id: 'ag4', campaignId: 'c3', name: 'Competitor ASINs', status: 'Paused', defaultBid: 0.90, metrics: { impressions: 12400, clicks: 180, spend: 14.20, orders: 9, sales: 245.00 } },
];

const initialKeywords = [
  { id: 'k1', adGroupId: 'ag1', campaignId: 'c1', keyword: 'wireless headphones', matchType: 'Exact', bid: 0.85, status: 'Enabled', suggestedBid: 0.92, metrics: { impressions: 12000, clicks: 380, spend: 11.40, orders: 20, sales: 620.00 } },
  { id: 'k2', adGroupId: 'ag1', campaignId: 'c1', keyword: 'bluetooth headphones', matchType: 'Phrase', bid: 0.70, status: 'Enabled', suggestedBid: 0.78, metrics: { impressions: 9500, clicks: 240, spend: 7.80, orders: 13, sales: 390.00 } },
  { id: 'k3', adGroupId: 'ag1', campaignId: 'c1', keyword: 'noise cancelling', matchType: 'Broad', bid: 0.55, status: 'Enabled', suggestedBid: 0.60, metrics: { impressions: 6500, clicks: 160, spend: 4.90, orders: 7, sales: 190.00 } },
  { id: 'k4', adGroupId: 'ag2', campaignId: 'c1', keyword: 'best wireless headphones for running', matchType: 'Phrase', bid: 0.45, status: 'Enabled', suggestedBid: 0.50, metrics: { impressions: 3200, clicks: 95, spend: 3.20, orders: 8, sales: 240.00 } },
  { id: 'k5', adGroupId: 'ag2', campaignId: 'c1', keyword: 'affordable noise cancelling headphones', matchType: 'Broad', bid: 0.40, status: 'Paused', suggestedBid: 0.45, metrics: { impressions: 2100, clicks: 58, spend: 2.10, orders: 4, sales: 120.00 } },
  { id: 'k6', adGroupId: 'ag3', campaignId: 'c2', keyword: 'SoundMax headphones', matchType: 'Exact', bid: 0.60, status: 'Enabled', suggestedBid: 0.65, metrics: { impressions: 28900, clicks: 820, spend: 28.70, orders: 41, sales: 1120.00 } },
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
    metrics: { impressions: 28900, clicks: 820, spend: 28.70, orders: 41, sales: 1120.00 }
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
      sbAds: initialSbAds,
      chartData: generateChartData(),
      dateRange: '30',
      selectedCampaignIds: [],
      notifications: [
        { id: 'n1', type: 'warning', message: 'Campaign "Summer Sale" is running low on daily budget', time: '2 hours ago', read: false },
        { id: 'n2', type: 'info', message: 'New search term report is available', time: '5 hours ago', read: false },
        { id: 'n3', type: 'success', message: 'Bid optimization applied to 3 campaigns', time: '1 day ago', read: true },
      ],

      // Campaign Actions
      addCampaign: (campaign) => set((state) => ({
        campaigns: [...state.campaigns, { ...campaign, id: `c${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 } }]
      })),
      updateCampaign: (id, updates) => set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCampaigns: (ids) => set((state) => ({
        campaigns: state.campaigns.filter(c => !ids.includes(c.id))
      })),
      toggleCampaignStatus: (id) => set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, status: c.status === 'Enabled' ? 'Paused' : 'Enabled' } : c)
      })),

      // Ad Group Actions
      addAdGroup: (adGroup) => set((state) => ({
        adGroups: [...state.adGroups, { ...adGroup, id: `ag${Date.now()}`, metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }]
      })),
      updateAdGroup: (id, updates) => set((state) => ({
        adGroups: state.adGroups.map(ag => ag.id === id ? { ...ag, ...updates } : ag)
      })),
      deleteAdGroup: (id) => set((state) => ({
        adGroups: state.adGroups.filter(ag => ag.id !== id)
      })),

      // Keyword Actions
      addKeyword: (keyword) => set((state) => ({
        keywords: [...state.keywords, { ...keyword, id: `k${Date.now()}`, suggestedBid: parseFloat((keyword.bid * 1.1).toFixed(2)), metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }]
      })),
      addKeywords: (kws) => set((state) => ({
        keywords: [...state.keywords, ...kws.map(k => ({ ...k, id: `k${Date.now()}${Math.random()}`, suggestedBid: parseFloat((k.bid * 1.1).toFixed(2)), metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } }))]
      })),
      updateKeyword: (id, updates) => set((state) => ({
        keywords: state.keywords.map(k => k.id === id ? { ...k, ...updates } : k)
      })),
      deleteKeyword: (id) => set((state) => ({
        keywords: state.keywords.filter(k => k.id !== id)
      })),

      // Negative Keyword Actions
      addNegativeKeywords: (nks) => set((state) => ({
        negativeKeywords: [...state.negativeKeywords, ...nks.map(nk => ({ ...nk, id: `nk${Date.now()}${Math.random()}` }))]
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

      // Simulate live data tick
      simulateTick: () => set((state) => ({
        campaigns: state.campaigns.map(c => {
          if (c.status !== 'Enabled') return c;
          const delta = generatePerformanceData();
          return {
            ...c,
            metrics: {
              impressions: c.metrics.impressions + delta.impressions,
              clicks: c.metrics.clicks + delta.clicks,
              spend: parseFloat((c.metrics.spend + delta.spend).toFixed(2)),
              orders: c.metrics.orders + delta.orders,
              sales: parseFloat((c.metrics.sales + delta.sales).toFixed(2)),
              ctr: parseFloat(((c.metrics.clicks + delta.clicks) / (c.metrics.impressions + delta.impressions) * 100).toFixed(2)),
              cpc: parseFloat(((c.metrics.spend + delta.spend) / Math.max(1, c.metrics.clicks + delta.clicks)).toFixed(2)),
              acos: parseFloat(((c.metrics.spend + delta.spend) / Math.max(1, c.metrics.sales + delta.sales) * 100).toFixed(2)),
              roas: parseFloat(((c.metrics.sales + delta.sales) / Math.max(0.01, c.metrics.spend + delta.spend)).toFixed(2)),
              cvr: parseFloat(((c.metrics.orders + delta.orders) / Math.max(1, c.metrics.clicks + delta.clicks) * 100).toFixed(2)),
            }
          };
        })
      })),
    }),
    {
      name: 'amazon-ads-store',
      storage: userStorage,
      version: 3,
      partialize: (state) => {
        // eslint-disable-next-line no-unused-vars
        const { currentUserName, switchUser, ...rest } = state;
        return rest;
      },
    }
  )
);
