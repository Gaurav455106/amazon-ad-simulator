// Sponsored Products builder options, worded exactly as on advertising.amazon.in.

export const SITE_OPTIONS = [
  { key: 'amazon-and-beyond', label: 'Amazon and beyond', desc: 'Ads appear on Amazon—including both Amazon retail and Amazon Business—as well as select sites and apps off Amazon.' },
  { key: 'amazon-business', label: 'Amazon Business', desc: 'Use a B2B strategy to increase sales and exclusively reach business shoppers on Amazon Business.' },
];

export const SITE_AMAZON_BUSINESS = 'amazon-business';

// "Audiences" bid adjustments (Bid adjustments → Audiences tab).
export const AMAZON_AUDIENCES = [
  { key: 'cart', label: "Clicked or Added brand's product to cart", id: '416393295884078164' },
  { key: 'purchased', label: "Purchased brand's product", id: '387057969895653460' },
  { key: 'high-interest', label: 'High interest based on shopping history', id: '409816952926330179' },
];
export const MAX_AUDIENCE_ADJUSTMENT = 900;
// Dynamic bids - up and down can raise a bid by up to 100% on top of adjustments.
export const DYNAMIC_UP_FACTOR = 2;
