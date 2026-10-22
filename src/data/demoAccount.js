// The simulator's demo advertiser: Farmley (dry fruits, makhana, seeds and healthy snacks) on amazon.in.
// Products, prices, ratings and competitors were read from amazon.in search results on 22 Oct 2026.
// Category trees, suggested bids and product counts are illustrative, not Amazon data.

import { BASE_PRODUCTS } from './demoProducts';

export { BRAND_NAME, amazonImage } from './demoProducts';

const GROCERY = 'Grocery & Gourmet Foods';

// Fresh Mindcase data (`npm run fetch:catalog`) overrides price, rating, stock and image per ASIN when present.
const fetchedCatalog = Object.values(import.meta.glob('./catalog.json', { eager: true, import: 'default' }))[0] || [];
const LIVE_FIELDS = ['price', 'listPrice', 'rating', 'reviews', 'status', 'imageUrl'];

/** Overlays fetched values onto the base products, ignoring empty fields. */
export function withFetchedData(products, fetched) {
  const byAsin = new Map(fetched.map(f => [f.asin, f]));
  return products.map(p => {
    const f = byAsin.get(p.asin);
    if (!f) return p;
    const live = Object.fromEntries(LIVE_FIELDS.filter(k => f[k] !== null && f[k] !== undefined && f[k] !== 0).map(k => [k, f[k]]));
    return { ...p, ...live };
  });
}

export const DEMO_PRODUCTS = withFetchedData(BASE_PRODUCTS, fetchedCatalog);

/** Real competitor listings from the same amazon.in searches, used for product targeting. */
export const COMPETITORS = [
  { id: 'te-chia', brand: 'True Elements', asin: 'B06WWMXY3B', name: 'True Elements Chia Seeds 500g - Dirt & Stone Free Premium Seeds', price: 284, rating: 4.4, reviews: 14200, sugg: 7.43, suggMin: 5.81, suggMax: 9.32, suggExpanded: 4.97, imgColor: '#2e7d32' },
  { id: 'tata-chia', brand: 'Tata Sampann', asin: 'B0C65VB4F1', name: 'Tata Sampann Pure Chia Seeds, 200g, Rich in Calcium & Protein, Source of Iron, Trans Fat Free', price: 150, rating: 4.3, reviews: 3700, sugg: 9.82, suggMin: 7.64, suggMax: 12.26, suggExpanded: 6.54, imgColor: '#1f3b73' },
  { id: 'paperboat-mix', brand: 'Paper Boat', asin: 'B09QGTVT5B', name: 'Paper Boat Absolute Health Dry Fruits Mix, Premium Trail Mix', price: 1150, rating: 4.1, reviews: 3900, sugg: 10.54, suggMin: 8.32, suggMax: 13.21, suggExpanded: 7.12, imgColor: '#8d5524' },
  { id: 'mom-makhana', brand: 'MOM', asin: 'B09RMFQR5S', name: 'MOM - Meal of the Moment, Roasted Premium Raw Makhana, 100g | No Added Preservatives | Source of Protein', price: 130, rating: 3.9, reviews: 1600, sugg: null, suggExpanded: null, imgColor: '#c62828' },
  { id: 'te-pumpkin', brand: 'True Elements', asin: 'B01M3SDPPK', name: 'True Elements Pumpkin Seeds 250g - 30g Protein per 100g', price: 219, rating: 4.4, reviews: 4700, sugg: 8.14, suggMin: 6.23, suggMax: 10.05, suggExpanded: 5.43, imgColor: '#33691e' },
  { id: 'pureheart-mix', brand: 'Pureheart', asin: 'B0D6YZWTNF', name: 'Pureheart Cherokee Premium Trail Mix | An Eclectic Mix of 8 Healthy Nuts, Seeds & Berries', price: 1299, rating: 4.1, reviews: 852, sugg: 6.32, suggMin: 4.87, suggMax: 7.96, suggExpanded: 4.18, imgColor: '#6a1b9a' },
  { id: 'mr-makhana', brand: 'Mr Makhana', asin: 'B0CMV2M9J9', name: 'Mr Makhana Roasted Flavoured Makhana Himalayan Salt & Pepper 55g, Roasted in Olive Oil', price: 123, rating: 4.2, reviews: 307, sugg: 12.74, suggMin: 9.84, suggMax: 15.93, suggExpanded: 8.62, imgColor: '#f9a825' },
  { id: 'earthen-chia', brand: 'Earthen Story', asin: 'B0CM64S7T5', name: 'Earthen Story Organic Chia Seeds 500 g | Lab Tested for 250+ Pesticides', price: 365, rating: 4.3, reviews: 338, sugg: 5.87, suggMin: 4.42, suggMax: 7.34, suggExpanded: 3.94, imgColor: '#5d4037' },
];

const BRANDS = {
  seeds: ['Farmley', 'True Elements', 'Tata Sampann', 'Earthen Story', 'Happilo', 'Nutraj'],
  makhana: ['Farmley', 'Mr Makhana', 'MOM', 'Happilo', 'Too Yumm!', 'Tata Soulfull'],
  nuts: ['Farmley', 'Happilo', 'Nutraj', 'Paper Boat', 'Pureheart', 'PrettyNutty', 'Wonderland Foods'],
  dried: ['Farmley', 'Happilo', 'Nutraj', 'Wonderland Foods', 'Lion'],
  namkeen: ['Haldiram\'s', 'Bikaji', 'Too Yumm!', 'Farmley', 'Tata Simply Better'],
};
const ALL_BRANDS = [...new Set(Object.values(BRANDS).flat())];
const DRY_FRUITS_PATH = `/${GROCERY}/Dried Fruits, Nuts & Seeds`;

/** Product targeting → Categories → Suggested. */
export const SUGGESTED_CATS = [
  { id: 'edible-seeds', path: `${DRY_FRUITS_PATH}/Edible Seeds`, name: 'Edible Seeds', sugg: null, prodMin: 284, prodMax: 412, brands: BRANDS.seeds },
  { id: 'makhana', path: `/${GROCERY}/Snack Foods/Makhana & Fox Nuts`, name: 'Makhana & Fox Nuts', sugg: null, prodMin: 389, prodMax: 521, brands: BRANDS.makhana },
  { id: 'mixed-nuts', path: `${DRY_FRUITS_PATH}/Mixed Nuts`, name: 'Mixed Nuts', sugg: 6.87, suggMin: 5.23, suggMax: 8.44, prodMin: 198, prodMax: 325, brands: BRANDS.nuts },
];

/** Product targeting → Categories → Browse. */
export const ALL_CATEGORIES = [
  { id: 'grocery', name: GROCERY, sugg: null, children: [
    { id: 'dry-fruits-all', name: 'Dried Fruits, Nuts & Seeds', sugg: 8.42, suggMin: 6.52, suggMax: 10.74, prodMin: 1284, prodMax: 1892, brands: ALL_BRANDS, children: [
      { id: 'edible-seeds-s', name: 'Edible Seeds', sugg: 9.15, suggMin: 7.24, suggMax: 11.44, prodMin: 284, prodMax: 412, brands: BRANDS.seeds },
      { id: 'mixed-nuts-s', name: 'Mixed Nuts', sugg: 7.23, suggMin: 5.89, suggMax: 8.91, prodMin: 412, prodMax: 634, brands: BRANDS.nuts },
      { id: 'dried-dates', name: 'Dried Dates', sugg: 9.18, suggMin: 7.24, suggMax: 11.52, prodMin: 389, prodMax: 521, brands: BRANDS.dried },
      { id: 'dried-figs', name: 'Dried Figs', sugg: 6.87, suggMin: 5.23, suggMax: 8.44, prodMin: 198, prodMax: 325, brands: BRANDS.dried },
      { id: 'dried-berries', name: 'Dried Berries', sugg: 5.44, suggMin: 4.12, suggMax: 6.80, prodMin: 156, prodMax: 289, brands: BRANDS.dried },
    ]},
    { id: 'snack-foods', name: 'Snack Foods', sugg: null, children: [
      { id: 'makhana-s', name: 'Makhana & Fox Nuts', sugg: 7.82, suggMin: 5.91, suggMax: 9.78, prodMin: 892, prodMax: 1234, brands: BRANDS.makhana },
      { id: 'trail-mix', name: 'Trail Mix', sugg: 6.23, suggMin: 4.87, suggMax: 7.79, prodMin: 234, prodMax: 389, brands: BRANDS.nuts },
      { id: 'namkeen', name: 'Namkeen', sugg: 5.47, suggMin: 4.20, suggMax: 6.84, prodMin: 384, prodMax: 612, brands: BRANDS.namkeen },
    ]},
    { id: 'sweets', name: 'Indian Sweets', sugg: null, children: [
      { id: 'barfi', name: 'Barfi & Burfi', sugg: 4.18, suggMin: 3.12, suggMax: 5.23, prodMin: 198, prodMax: 342, brands: ['Farmley', 'Haldiram\'s', 'Bikanervala', 'MTR'] },
    ]},
    { id: 'gift-hampers', name: 'Gift Hampers', sugg: 12.34, suggMin: 9.87, suggMax: 15.43, prodMin: 45, prodMax: 89, brands: ['Farmley', 'Happilo', 'Nutraj', 'Ferrero Rocher'] },
  ]},
  { id: 'health', name: 'Health & Personal Care', sugg: null, children: [
    { id: 'diet-nutrition', name: 'Diet & Nutrition', sugg: null, children: [
      { id: 'superfoods', name: 'Superfoods', sugg: 6.12, suggMin: 4.78, suggMax: 7.65, prodMin: 87, prodMax: 143, brands: BRANDS.seeds },
    ]},
  ]},
  { id: 'sports', name: 'Sports, Fitness & Outdoors', sugg: null, children: [
    { id: 'sports-nutrition', name: 'Sports Nutrition Snacks', sugg: 6.45, suggMin: 4.89, suggMax: 8.01, prodMin: 212, prodMax: 378, brands: ['The Whole Truth', 'Yoga Bar', 'Farmley', 'RiteBite'] },
  ]},
];

/** Customer search terms a keyword's traffic splits into (Search terms report). */
export const SEARCH_TERM_EXPANSIONS = {
  'roasted makhana': ['roasted makhana flavoured', 'makhana peri peri', 'roasted makhana pack of 5'],
  'chia seeds': ['chia seeds for weight loss', 'chia seeds 500g', 'organic chia seeds'],
  'healthy snacks': ['healthy snacks for weight loss', 'healthy snacks for kids', 'healthy snacks combo'],
};

/** Seed keywords for the demo campaigns: [keyword, match type, bid, suggested bid]. */
export const SEED_KEYWORDS = {
  core: [['roasted makhana', 'Exact', 10.2, 11.04], ['chia seeds', 'Phrase', 8.4, 9.36], ['healthy snacks', 'Broad', 6.6, 7.2]],
  longTail: [['chia seeds for weight loss', 'Phrase', 5.4, 6.0], ['date bites sugar free', 'Broad', 4.8, 5.4]],
  brand: [['farmley', 'Exact', 7.2, 7.8]],
};
