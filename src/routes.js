// URL scheme mirrors the real Amazon Ads console (advertising.amazon.in)
// so students build muscle memory for the same paths they will see at work.

export const TYPE_SLUG = {
  'Sponsored Products': 'sp',
  'Sponsored Brands': 'sb',
  'Sponsored Display': 'sd',
};

export const SLUG_TYPE = {
  sp: 'Sponsored Products',
  sb: 'Sponsored Brands',
  sd: 'Sponsored Display',
};

export const ROUTES = {
  allCampaigns: '/campaign-manager/all-campaigns',
  adGroupsView: '/campaign-manager/ad-groups',
  targetsView: '/campaign-manager/targets',
  portfolios: '/cm/portfolios',
  drafts: '/cm/drafts',
  products: '/cm/products',
  targeting: '/cm/targeting',
  budgets: '/cm/budgets',
  history: '/cm/history',
  bulkOperations: '/cm/bulk-operations',
  rules: '/cm/rules',
  settings: '/cm/settings',
  createCampaign: '/cb',
  recommendations: '/recommendations',
  reports: '/reports',
  brandMetrics: '/bb/bm',
  learn: '/learn',
};

/** @param {string} type campaign type label, e.g. "Sponsored Products" */
export const typeSlug = (type) => TYPE_SLUG[type] || 'sp';

/** @param {'sp'|'sb'|'sd'} slug */
export const createCampaignPath = (slug) => `/cb/${slug}`;

/**
 * @param {{ id: string, type: string }} campaign
 * @param {string} [tab]
 */
export const campaignPath = (campaign, tab = 'ad-groups') =>
  `/cm/${typeSlug(campaign.type)}/campaigns/${campaign.id}/${tab}`;

/**
 * @param {{ id: string, type: string }} campaign
 * @param {string} adGroupId
 * @param {string} [tab]
 */
export const adGroupPath = (campaign, adGroupId, tab = 'ads') =>
  `/cm/${typeSlug(campaign.type)}/campaigns/${campaign.id}/ad-groups/${adGroupId}/${tab}`;

/**
 * Sponsored Products ad groups are created in the campaign builder, exactly
 * where the console sends you (/cb/sp/campaigns/:id/adGroups).
 * @param {{ id: string, type: string }} campaign
 */
export const createAdGroupPath = (campaign) => (typeSlug(campaign.type) === 'sp'
  ? `/cb/sp/campaigns/${campaign.id}/adGroups`
  : `/cm/${typeSlug(campaign.type)}/campaigns/${campaign.id}/create-ad-group`);

// Left-hand tab lists, exactly as the real console shows them per campaign type.
export const CAMPAIGN_TABS = {
  sp: [
    { key: 'ad-groups', label: 'Ad groups' },
    { key: 'bid-adjustments', label: 'Bid adjustments' },
    { key: 'negative-targeting', label: 'Negative targeting' },
    { key: 'budget-rules', label: 'Budget rules' },
    { key: 'settings', label: 'Campaign settings' },
    { key: 'history', label: 'History' },
  ],
  sb: [
    { key: 'ad-groups', label: 'Ad groups' },
    { key: 'bid-adjustments', label: 'Bid adjustments' },
    { key: 'budget-rules', label: 'Budget rules' },
    { key: 'settings', label: 'Campaign settings' },
    { key: 'history', label: 'History' },
  ],
  sd: [
    { key: 'ad-groups', label: 'Ad groups' },
    { key: 'budget-rules', label: 'Budget rules' },
    { key: 'settings', label: 'Campaign settings' },
  ],
};

export const AD_GROUP_TABS = {
  sp: [
    { key: 'ads', label: 'Ads' },
    { key: 'targeting', label: 'Targeting' },
    { key: 'negative-targeting', label: 'Negative targeting' },
    { key: 'search-terms', label: 'Search terms' },
    { key: 'settings', label: 'Ad group settings' },
    { key: 'history', label: 'History' },
  ],
  sb: [
    { key: 'ads', label: 'Ads' },
    { key: 'targeting', label: 'Targeting' },
    { key: 'negative-targeting', label: 'Negative targeting' },
    { key: 'search-terms', label: 'Search terms' },
    { key: 'settings', label: 'Ad group settings' },
    { key: 'history', label: 'History' },
  ],
  sd: [
    { key: 'ads', label: 'Ads' },
    { key: 'targeting', label: 'Targeting' },
    { key: 'negative-targeting', label: 'Negative targeting' },
    { key: 'settings', label: 'Ad group settings' },
    { key: 'creative', label: 'Creative' },
  ],
};
