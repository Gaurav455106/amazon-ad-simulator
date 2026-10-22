import { ROUTES, createCampaignPath } from '../../routes';

// Global navigation captured from advertising.amazon.in (Oct 2026).
// `to` points at a simulator page; items the simulator does not model
// open the "not in simulator" page so the menu stays complete and honest.
const unavailable = (feature) => `/unavailable/${encodeURIComponent(feature)}`;

export const GLOBAL_NAV = [
  { key: 'create', label: 'Create campaign', icon: 'create', to: ROUTES.createCampaign, matches: ['/cb'] },
  { key: 'campaigns', label: 'Campaigns', icon: 'campaigns', to: ROUTES.allCampaigns, matches: ['/campaign-manager', '/cm'] },
  { key: 'recommendations', label: 'Recommendations', icon: 'recommendations', to: ROUTES.recommendations },
  {
    key: 'brand-content',
    label: 'Brand content',
    icon: 'brand',
    children: [
      { label: 'Brand profiles', badge: 'New', to: unavailable('Brand profiles') },
      { label: 'Brand Stores', to: unavailable('Brand Stores') },
    ],
  },
  {
    key: 'creative-tools',
    label: 'Creative tools',
    icon: 'creative',
    children: [
      { label: 'Creative assets', to: unavailable('Creative assets') },
      { label: 'Creative Studio', badge: 'Beta', to: unavailable('Creative Studio') },
      { label: 'Translations', to: unavailable('Translations') },
    ],
  },
  {
    key: 'insights',
    label: 'Insights & planning',
    icon: 'insights',
    children: [
      { label: 'Brand metrics', badge: 'Beta', to: ROUTES.brandMetrics },
      { label: 'Brand impression share', badge: 'Beta', to: '/auction-insights' },
      { label: 'Ads planner', to: '/bid-recommendations' },
    ],
  },
  {
    key: 'measurement',
    label: 'Measurement & reporting',
    icon: 'measurement',
    children: [
      { label: 'Amazon Attribution', badge: 'Beta', to: unavailable('Amazon Attribution') },
      { label: 'Amazon Marketing Cloud', to: unavailable('Amazon Marketing Cloud') },
      { divider: true },
      { label: 'Reporting', to: ROUTES.reports },
      { label: 'Sponsored ads reports', to: ROUTES.reports },
    ],
  },
  { key: 'data-manager', label: 'Data manager', icon: 'data', to: unavailable('Data manager') },
  {
    key: 'tools',
    label: 'Tools & resources',
    icon: 'tools',
    children: [
      { heading: 'More advertising tools' },
      { label: 'Partner Directory', to: unavailable('Partner Directory'), isExternal: true },
      { label: 'Amazon Ads Academy', to: ROUTES.learn, isExternal: true },
      { divider: true },
      { heading: 'Amazon selling tools' },
      { label: 'Seller Central', to: unavailable('Seller Central'), isExternal: true },
    ],
  },
  {
    key: 'all-tools',
    label: 'All tools',
    icon: 'allTools',
    children: [
      { heading: 'Create campaign' },
      { label: 'Sponsored Products', to: createCampaignPath('sp') },
      { label: 'Sponsored Brands', to: createCampaignPath('sb') },
      { label: 'Display', to: createCampaignPath('sd') },
    ],
  },
  {
    key: 'admin',
    label: 'Administration',
    icon: 'admin',
    children: [
      { label: 'Account access & settings', to: unavailable('Account access & settings') },
      { divider: true },
      { heading: 'Billing and payment' },
      { label: 'Billing', badge: 'New', to: unavailable('Billing') },
      { label: 'Verification Center', to: unavailable('Verification Center') },
    ],
  },
];

// Campaign manager secondary navigation, grouped exactly as the console shows it.
export const CM_SUBNAV = [
  [
    { label: 'Portfolios', to: ROUTES.portfolios },
    { label: 'Campaigns', to: ROUTES.allCampaigns, matches: ['/campaign-manager', '/cm/sp', '/cm/sb', '/cm/sd'] },
    { label: 'Drafts', to: ROUTES.drafts },
  ],
  [
    { label: 'Products', to: ROUTES.products },
    { label: 'Targeting', to: ROUTES.targeting },
    { label: 'Budgets', to: ROUTES.budgets },
  ],
  [
    { label: 'History', to: ROUTES.history },
    { label: 'Bulk operations', to: ROUTES.bulkOperations },
    { label: 'Rules', to: ROUTES.rules },
    { label: 'Settings', to: ROUTES.settings },
  ],
];
