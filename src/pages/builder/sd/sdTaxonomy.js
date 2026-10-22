// Targeting taxonomy for the Sponsored Display builder. Top-level names follow the console's
// browse lists; leaves relevant to the simulator's audio catalogue carry addable segments.

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
  node('pc-computers', 'Computers & Accessories', [
    node('pc-pc-gaming-hs', 'PC Gaming Headsets'),
    node('pc-pc-speakers', 'PC Speakers'),
  ]),
  node('pc-electronics', 'Electronics', [
    node('pc-headphones', 'Headphones, Earbuds & Accessories', [
      node('pc-over-ear', 'Over-Ear Headphones'),
      node('pc-in-ear', 'In-Ear Headphones'),
      node('pc-tws', 'True Wireless Earbuds'),
      node('pc-neckband', 'Neckband Earphones'),
      node('pc-gaming-hs', 'Gaming Headsets'),
    ]),
    node('pc-speakers', 'Bluetooth Speakers'),
    node('pc-wearables', 'Smart Watches'),
  ]),
  node('pc-grocery', 'Grocery & Gourmet Foods'),
  node('pc-health', 'Health & Personal Care'),
  node('pc-home', 'Home & Kitchen'),
  node('pc-music', 'Musical Instruments', [node('pc-studio-hp', 'Studio Headphones')]),
  node('pc-sports', 'Sports, Fitness & Outdoors', [node('pc-sports-hp', 'Sports Headphones')]),
  node('pc-toys', 'Toys & Games'),
  node('pc-video-games', 'Video Games', [node('pc-console-hs', 'Console Gaming Headsets')]),
];

/** Remarketing → Browse ("All audience categories"): category-based views/purchases audiences. */
export const AUDIENCE_CATEGORY_TREE = [
  node('ac-devices', 'Amazon Devices & Accessories'),
  node('ac-apps', 'Apps & Games'),
  node('ac-audible', 'Audible Books & Originals'),
  node('ac-beauty', 'Beauty'),
  node('ac-books', 'Books'),
  node('ac-car', 'Car & Motorbike'),
  node('ac-electronics', 'Electronics', [
    node('ac-headphones', 'Headphones'),
    node('ac-earbuds', 'True Wireless Earbuds'),
    node('ac-speakers', 'Bluetooth Speakers'),
  ]),
  node('ac-fashion', 'Fashion'),
  node('ac-grocery', 'Grocery & Gourmet Foods'),
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
  node('im-electronics', 'Electronics', [
    node('im-headphones', 'IM - Headphones & Earbuds'),
    node('im-tws', 'IM - True Wireless Earbuds'),
    node('im-speakers', 'IM - Bluetooth Speakers'),
    node('im-watches', 'IM - Smart Watches'),
    node('im-home-audio', 'IM - Home Audio Systems'),
  ]),
  node('im-fashion', 'Fashion'),
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
  node('ls-music', 'Music & Radio', [
    node('ls-audiophiles', 'LS - Audiophiles & Music Enthusiasts'),
    node('ls-streaming', 'LS - Music Streaming Subscribers'),
    node('ls-podcasts', 'LS - Podcast Listeners'),
  ]),
  node('ls-automotive', 'Automotive Ownership'),
  node('ls-beauty', 'Beauty & Grooming'),
  node('ls-careers', 'Business & Careers'),
  node('ls-industry', 'Business & Industry'),
  node('ls-conscious', 'Conscious Consumption'),
  node('ls-entertainment', 'Entertainment', [
    node('ls-tech', 'LS - Tech Enthusiasts'),
    node('ls-gadgets', 'LS - Gadget Early Adopters'),
  ]),
  node('ls-family', 'Family'),
  node('ls-health', 'Health & Wellness'),
  node('ls-home', 'Home & Garden'),
  node('ls-pets', 'Pet Ownership'),
  node('ls-shoppers', 'Shoppers'),
];

/** Suggestions that only appear once at least one product has been added. */
export const PRODUCT_GATED_SUGGESTIONS = {
  contextual: ['pc-over-ear', 'pc-tws', 'pc-in-ear', 'pc-gaming-hs'],
  remarketing: ['ac-headphones', 'ac-earbuds'],
  'in-market': ['im-headphones', 'im-tws', 'im-speakers'],
  'interest-lifestyle': ['ls-audiophiles', 'ls-tech'],
};

/** Competitor products offered under Contextual → Individual products. */
export const COMPETITOR_PRODUCTS = [
  { asin: 'B09XS7JWHH', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 24990, rating: 4.7, reviews: 12847 },
  { asin: 'B09B8FW7Y9', name: 'JBL Live 660NC Wireless Over-Ear Noise Cancelling Headphones', price: 8999, rating: 4.4, reviews: 7234 },
  { asin: 'B08QCY3MWF', name: 'boAt Rockerz 550 Bluetooth On Ear Headphones with Mic', price: 1299, rating: 4.2, reviews: 45231 },
  { asin: 'B085RGRPMN', name: 'Sennheiser HD 450BT Bluetooth Wireless Headphone with ANC', price: 7990, rating: 4.3, reviews: 3812 },
  { asin: 'B098FKXT8L', name: 'Bose QuietComfort 45 Wireless Noise Cancelling Headphones', price: 22900, rating: 4.6, reviews: 9102 },
  { asin: 'B08HMWZBXN', name: 'Soundcore by Anker Life Q35 Active Noise Cancelling Headphones', price: 5999, rating: 4.4, reviews: 6123 },
];

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
