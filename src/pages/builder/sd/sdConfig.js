// Sponsored Display builder configuration, captured from advertising.amazon.in (21 Oct 2026).

export const SD_DEFAULT_BUDGET = '1000.00';

/** Optimisation strategies. `ccDefault` is the console's pre-filled cost-control value. */
export const SD_GOALS = [
  {
    key: 'reach', label: 'Reach', costType: 'VCPM',
    desc: 'We will optimise your bids for higher viewable impressions. Drive brand or product awareness by showing your ad to relevant audiences to maximise reach.',
    costLine: 'Cost type: Cost per 1,000 viewable impressions (VCPM) | Conversion attributed to viewable impressions and clicks',
    ccLabel: 'Cost per 1,000 viewable impressions', ccDefault: '50.00', ccMin: 0.01, ccDuration: '72 hours',
    ccHelper: (v) => `A value of ₹${v} or higher may lead to more viewable impressions.`,
    forecastMetrics: ['Impressions', 'Viewable impressions'], bidUnit: 'per 1,000 viewable impressions (VCPM)',
  },
  {
    key: 'consideration', label: 'Page visits', costType: 'CPC',
    desc: 'We will optimize your bids for higher page visits. Drive brand or product consideration by showing your ads to customers more likely to click.',
    costLine: 'Cost type: Cost per click (CPC) | Conversion attributed to clicks',
    ccLabel: 'Cost per click', ccDefault: '5.00', ccMin: 0.01, ccDuration: '72 hours',
    ccHelper: (v) => `A value of ₹${v} or higher may lead to more page visits.`,
    forecastMetrics: ['Impressions', 'Clicks'], bidUnit: 'per click (CPC)',
  },
  {
    key: 'conversion', label: 'Conversions', costType: 'CPC',
    desc: 'We will optimise your bids for higher conversion rates. Drive sales by showing your ad to shoppers more likely to purchase your product.',
    costLine: 'Cost type: Cost per click (CPC) | Conversion attributed to clicks',
    ccLabel: 'Cost per order', ccDefault: '130.00', ccMin: 50, ccDuration: '14 days',
    ccHelper: () => 'A higher value may lead to more conversions. But we recommend not entering a value higher than the price of the products you want to advertise. Minimum cost per order is ₹50.00.',
    forecastMetrics: ['Clicks', 'Orders'], bidUnit: 'per click (CPC)',
  },
];
export const goalConfig = (key) => SD_GOALS.find(g => g.key === key) || SD_GOALS[1];

export const SD_TARGET_GROUPS = [
  { key: 'contextual', label: 'Contextual', desc: 'Reach audiences who are browsing products and content matching criteria you choose.' },
  { key: 'remarketing', label: 'Remarketing audiences', desc: 'Reach relevant audiences who have viewed, purchased, or are browsing products and content matching criteria you choose.' },
  { key: 'in-market', label: 'In-market audiences', desc: 'Reach audiences whose recent activity suggests they are likely to buy products in a certain category.' },
  { key: 'interest-lifestyle', label: 'Interest and lifestyle audiences', desc: 'Reach audiences whose shopping and entertainment activity suggests certain interest or lifestyle preferences.' },
];

export const LOOKBACK_DAYS = [7, 14, 30, 60, 90, 180, 365];
export const DEFAULT_LOOKBACK = 30;

/** Behaviour-based "dynamic segments" — suggested even before products are added. */
export const SD_DYNAMIC_SEGMENTS = [
  { key: 'ctx-similar', group: 'contextual', type: 'Contextual', label: 'Similar to advertised products', desc: 'Shows your ad on pages and products that are contextually similar to the products you are advertising.' },
  { key: 'views-similar', group: 'remarketing', type: 'Views remarketing', label: 'Similar to advertised products', lookbackType: 'views', desc: 'Reach shoppers who viewed products similar to the ones you are advertising.' },
  { key: 'views-advertised', group: 'remarketing', type: 'Views remarketing', label: 'Advertised products', lookbackType: 'views', desc: 'Reach shoppers who viewed the products you are advertising.' },
  { key: 'purchases-related', group: 'remarketing', type: 'Purchases remarketing', label: 'Related to advertised products', lookbackType: 'purchases', desc: 'Reach shoppers who purchased products related or complementary to the ones you are advertising.' },
  { key: 'purchases-advertised', group: 'remarketing', type: 'Purchases remarketing', label: 'Advertised products', lookbackType: 'purchases', desc: 'Reach shoppers who purchased the products you are advertising — useful for replenishment or cross-sell.' },
];

/** The five targets the console pre-adds to every new Display ad group (bids empty). */
export const defaultTargets = () => SD_DYNAMIC_SEGMENTS.map(s => ({
  key: s.key, group: s.group, type: s.type, label: s.label, desc: s.desc,
  lookbackType: s.lookbackType, lookbackDays: s.lookbackType ? DEFAULT_LOOKBACK : undefined, bid: '',
}));

/** Creative preview sizes ("Key ad sizes" carousel, 12 sizes). */
export const SD_PREVIEW_SIZES = [
  { key: 'pdp-right', label: 'Amazon product page right', w: 146, h: 148, layout: 'tall' },
  { key: 'medium-rectangle', label: 'Medium rectangle', w: 180, h: 148, layout: 'tall', hasButton: true },
  { key: 'mobile-pages', label: 'Amazon mobile pages', w: 226, h: 66, layout: 'wide', hasButton: true },
  { key: 'pdp-middle', label: 'Amazon product detail page middle', w: 226, h: 46, layout: 'wide', hasButton: true },
  { key: 'billboard', label: 'Billboard', w: 232, h: 60, layout: 'wide', hasButton: true },
  { key: 'mobile-leaderboard', label: 'Mobile leaderboard', w: 210, h: 36, layout: 'wide' },
  { key: 'leaderboard', label: 'Leaderboard', w: 232, h: 32, layout: 'wide' },
  { key: 'top-stripe', label: 'Amazon top stripe', w: 232, h: 40, layout: 'wide' },
  { key: 'large-rectangle', label: 'Large rectangle', w: 170, h: 142, layout: 'tall', hasButton: true },
  { key: 'wide-skyscraper', label: 'Wide skyscraper', w: 84, h: 160, layout: 'tall' },
  { key: 'tall-skyscraper', label: 'Tall skyscraper', w: 70, h: 164, layout: 'tall' },
  { key: 'amazon-apps', label: 'Amazon apps', w: 150, h: 150, layout: 'tall', hasButton: true },
];
export const PREVIEWS_PER_PAGE = 4;
export const HEADLINE_MAX = 50;
