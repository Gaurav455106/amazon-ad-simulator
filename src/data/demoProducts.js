// Farmley's amazon.in products (read from amazon.in search results on 22 Oct 2026).
// Plain module with no Vite-only syntax, so the Node fetch script can import it too.
export const BRAND_NAME = 'Farmley';

/** Amazon product image by its media id (the `images/I/<id>` part of an amazon.in image URL). */
export const amazonImage = (id) => `https://m.media-amazon.com/images/I/${id}._AC_UL320_.jpg`;

const GROCERY = 'Grocery & Gourmet Foods';
const farmley = (asin, sku, name, price, listPrice, rating, reviews, imageId) => ({
  asin, sku, name: `${BRAND_NAME} ${name}`, price, listPrice, rating, reviews,
  status: 'In stock', category: GROCERY, brand: BRAND_NAME, imageType: 'snack-pouch', imageUrl: amazonImage(imageId),
});

export const BASE_PRODUCTS = [
  farmley('B0BSXC1Z63', 'FM-DATEBITE-200', 'Date Bites, Dates Barfi Made with Dates, Pista, Cashews, Almonds, Honey and Pure Ghee, Dry Fruits Nuts, Healthy Snacks, Healthy Sweets, Gluten Free, No Refined Sugar, 200g (10 Pieces)', 299, 425, 4.3, 4000, '61gjai3z-6L'),
  farmley('B09J578NDM', 'FM-MAKHANA-250', 'Prasadam Makhana, 250 g, Fit for Fasting | Foxnuts, Lotus Puffs | Rich in Calcium, Maintains Weight, Healthy Snacks', 415, 699, 4.2, 2300, '71xWx6fGHQL'),
  farmley('B0DFML8557', 'FM-CHIA-500', 'Chia Seeds 500g, Pack of 1 I Seeds for Eating | Seeds for Weight Management | Rich in Calcium, Protein & Fibre', 299, 599, 4.3, 5400, '71b5V-mfDzL'),
  farmley('B0D3M4ZNKS', 'FM-PANCHMEVA-905', 'Panchmeva Dry Fruits Mix, 905 g I Fit for Fasting | Healthy Snacks Mixed Nuts Contain Almonds, Cashews, Dates, Black Raisin, Green Raisin', 899, 1249, 4.1, 3600, '716+gUF0vIL'),
  farmley('B0CJY8F1DG', 'FM-CHIA-1KG', 'Chia Seeds 1 Kg, I Seeds for Eating | Seeds for Weight Management | Rich in Calcium, Omega-3, Protein, Fibre, & Non GMO, Reusable Jar (Pack of 1)', 539, 1199, 4.4, 2000, '81BNpRriWEL'),
  farmley('B0D4M8QBJJ', 'FM-MAKHANA-FLV5', 'Flavoured Roasted Makhana I 385 gram, (Pack of 5, 77 gram each) I Healthy Party, Namkeen Snacks, Puffed Makhana Snacks Minty Pudina, Peri Peri, Tangy Tomato, Cream & Onion, Himalayan Salted', 1062, 1175, 4.5, 14, '81lGNfJjTBL'),
  farmley('B0BS8RDYBC', 'FM-PERIPERI-325', 'Mexican Peri Peri Snack Mix 325g | 7 Superfoods in 1 | Dry Fruits & Nuts Mix with Almonds, Cashews, Pumpkin, Sunflower & Flax Seeds | Guilt-Free Snack (Pack of 1)', 359, 489, 4.0, 602, '61e3v7OC4pL'),
  farmley('B09LD3ZB96', 'FM-BERRIES-160', 'Berries Mix 160g | 8-In-1 Healthly Snacks Contains Cranberry,Black Raisins,Strawberry,Black Currant & More (Pack of 1)', 309, 399, 4.1, 2600, '71jNIW7k6cL'),
  farmley('B08CN882JT', 'FM-ANJEER-250', 'Anjeer/Figs 250g | Afghani Anjeer I Low in Fat | Healthy Snack I Rich Source of Vitamins Dietary Fiber (Pack of 1)', 549, 699, 4.1, 2300, '71aRlUtpkVL'),
  farmley('B0BT7Y7NM1', 'FM-SEEDCOMBO-400', 'Edible Seeds Combo 400 g | Sunflower Seeds + Pumpkin Seeds | Superfood Mix for Healthy Eating | Rich in Protein & Fiber (200g, each)', 324, 404, 4.4, 1400, '71S64gnHavL'),
  farmley('B0BRQJLP5Q', 'FM-SUNFLOWER-200', 'Sunflower Seeds 200 gram I Sunflower Seeds for Eating | Diet Food | Healthy Snack | Raw seeds | Weight management | Source of Antioxidants Pack of 1', 109, 159, 4.3, 487, '71ZjhLjvcrL'),
];

