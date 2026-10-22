import { COMPETITORS } from '../../../data/demoAccount';

// Targeting taxonomy for the Sponsored Display builder. Top-level names follow the console's
// browse lists; leaves relevant to the demo snacks catalogue carry addable segments.

/** Deterministic pseudo "suggested bid" so a target always shows the same value. */
export function pseudoSugg(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const sugg = 6 + (hash % 1800) / 100; // ₹6.00 – ₹24.00 CPC
  return { sugg: +sugg.toFixed(2), suggMin: +(sugg * 0.6).toFixed(2), suggMax: +(sugg * 1.5).toFixed(2) };
}

const node = (id, name, children = []) => ({ id, name, children });

/** Contextual → Categories → Browse ("All product categories"). */
export const PRODUCT_CATEGORY_TREE = [
  node('pc-alexa', 'Alexa Skills'),
  node('pc-devices', 'Amazon Devices & Accessories'),
  node('pc-apps', 'Apps & Games'),
  node('pc-baby', 'Baby Products'),
  node('pc-beauty', 'Beauty'),
  node('pc-books', 'Books'),
  node('pc-car', 'Car & Motorbike'),
  node('pc-clothing', 'Clothing & Accessories'),
  node('pc-computers', 'Computers & Accessories'),
  node('pc-electronics', 'Electronics'),
  node('pc-grocery', 'Grocery & Gourmet Foods', [
    node('pc-dry-fruits', 'Dried Fruits, Nuts & Seeds', [
      node('pc-edible-seeds', 'Edible Seeds'),
      node('pc-mixed-nuts', 'Mixed Nuts'),
      node('pc-dried-dates', 'Dried Dates'),
      node('pc-dried-figs', 'Dried Figs'),
      node('pc-dried-berries', 'Dried Berries'),
    ]),
    node('pc-snack-foods', 'Snack Foods', [
      node('pc-makhana', 'Makhana & Fox Nuts'),
      node('pc-trail-mix', 'Trail Mix'),
      node('pc-namkeen', 'Namkeen'),
    ]),
    node('pc-gift-hampers', 'Gift Hampers'),
  ]),
  node('pc-health', 'Health & Personal Care', [node('pc-superfoods', 'Superfoods')]),
  node('pc-home', 'Home & Kitchen'),
  node('pc-music', 'Musical Instruments'),
  node('pc-sports', 'Sports, Fitness & Outdoors', [node('pc-sports-nutrition', 'Sports Nutrition Snacks')]),
  node('pc-toys', 'Toys & Games'),
  node('pc-video-games', 'Video Games'),
];

/** Remarketing → Browse ("All audience categories"): category-based views/purchases audiences. */
export const AUDIENCE_CATEGORY_TREE = [
  node('ac-devices', 'Amazon Devices & Accessories'),
  node('ac-apps', 'Apps & Games'),
  node('ac-audible', 'Audible Books & Originals'),
  node('ac-beauty', 'Beauty'),
  node('ac-books', 'Books'),
  node('ac-car', 'Car & Motorbike'),
  node('ac-electronics', 'Electronics'),
  node('ac-fashion', 'Fashion'),
  node('ac-grocery', 'Grocery & Gourmet Foods', [
    node('ac-dry-fruits', 'Dried Fruits, Nuts & Seeds'),
    node('ac-snacks', 'Snack Foods'),
    node('ac-sweets', 'Indian Sweets'),
  ]),
  node('ac-home', 'Home & Kitchen'),
  node('ac-music', 'Musical Instruments'),
  node('ac-sports', 'Sports, Fitness & Outdoors'),
  node('ac-toys', 'Toys & Games'),
];

export const IN_MARKET_TREE = [
  node('im-arts', 'Arts & Crafts'),
  node('im-baby', 'Baby Products'),
  node('im-beauty', 'Beauty & Personal Care'),
  node('im-books', 'Books & Magazines'),
  node('im-business', 'Business & Industrial'),
  node('im-electronics', 'Electronics'),
  node('im-fashion', 'Fashion'),
  node('im-food', 'Food & Beverage', [
    node('im-snacks', 'IM - Healthy Snacks'),
    node('im-dry-fruits', 'IM - Dry Fruits & Nuts'),
    node('im-seeds', 'IM - Edible Seeds & Superfoods'),
    node('im-gifting', 'IM - Festive Food Gifting'),
  ]),
  node('im-gift-cards', 'Gift Cards'),
  node('im-home', 'Home & Garden'),
  node('im-kitchen', 'Kitchen & Dining'),
  node('im-office', 'Office Products'),
  node('im-outdoor', 'Outdoor Recreation'),
  node('im-pets', 'Pet Supplies'),
  node('im-sports', 'Sports & Fitness'),
  node('im-toys', 'Toys & Games'),
];

export const INTEREST_TREE = [
  node('ls-games', 'Games'),
  node('ls-movies', 'Movies & TV'),
  node('ls-music', 'Music & Radio'),
  node('ls-automotive', 'Automotive Ownership'),
  node('ls-beauty', 'Beauty & Grooming'),
  node('ls-careers', 'Business & Careers'),
  node('ls-industry', 'Business & Industry'),
  node('ls-conscious', 'Conscious Consumption'),
  node('ls-entertainment', 'Entertainment'),
  node('ls-family', 'Family'),
  node('ls-health', 'Health & Wellness', [
    node('ls-fitness', 'LS - Fitness Enthusiasts'),
    node('ls-healthy-eaters', 'LS - Healthy Eaters'),
    node('ls-weight', 'LS - Weight Management'),
  ]),
  node('ls-home', 'Home & Garden'),
  node('ls-pets', 'Pet Ownership'),
  node('ls-shoppers', 'Shoppers'),
];

/** Suggestions that only appear once at least one product has been added. */
export const PRODUCT_GATED_SUGGESTIONS = {
  contextual: ['pc-makhana', 'pc-edible-seeds', 'pc-mixed-nuts', 'pc-dried-dates'],
  remarketing: ['ac-dry-fruits', 'ac-snacks'],
  'in-market': ['im-snacks', 'im-dry-fruits', 'im-seeds'],
  'interest-lifestyle': ['ls-healthy-eaters', 'ls-fitness'],
};

/** Competitor products offered under Contextual → Individual products. */
export const COMPETITOR_PRODUCTS = COMPETITORS.map(({ asin, name, price, rating, reviews }) => ({ asin, name, price, rating, reviews }));

export const TREE_FOR_GROUP = {
  contextual: PRODUCT_CATEGORY_TREE,
  remarketing: AUDIENCE_CATEGORY_TREE,
  'in-market': IN_MARKET_TREE,
  'interest-lifestyle': INTEREST_TREE,
};

/** Flattens a tree into [{ id, name, path }] for search and lookups. */
export function flattenTree(tree, path = []) {
  return tree.flatMap(n => [{ id: n.id, name: n.name, path }, ...flattenTree(n.children, [...path, n.name])]);
}
