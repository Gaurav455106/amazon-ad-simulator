// Sponsored Brands ads inside an ad group, as the console's Ads tab, "Manage ad" panel and
// "New Ad" page show them (observed Oct 2026). Pure helpers: no store access.
import { BRAND_NAME } from '../../data/demoProducts';

export const SB_HEADLINE_MAX = 50;
export const SB_MIN_PRODUCTS = 3;
export const SB_RECOMMENDED_IMAGES = 5;
export const STORE_PAGES = ['Home', 'Makhana', 'Seeds', 'Dry Fruits'];
export const TRANSLATION_LOCALES = ['Hindi', 'Telegu', 'Malayalam', 'Kannada', 'Marathi'];

/** The brand's page on amazon.in (the simulator has no real Store, so this is the brand's search page). */
export const brandPageUrl = (brand) => `https://www.amazon.in/s?k=${encodeURIComponent(brand)}`;

const FORMAT_LABEL = { 'product-collection': 'Product collection', 'store-spotlight': 'Store spotlight', video: 'Video' };
export const formatLabel = (adFormat) => FORMAT_LABEL[adFormat] || 'Product collection';

/** "Ad - 22/10/2026 12:57:58.701", the console's default ad name. */
export function defaultAdName(date = new Date()) {
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `Ad - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

const normalise = (ad, campaign) => ({
  id: ad.id,
  campaignId: campaign.id,
  adGroupId: ad.adGroupId,
  name: ad.name || ad.headline || campaign.name,
  status: ad.status || 'Enabled',
  brandName: ad.brandName || campaign.sbCreative?.brandName || BRAND_NAME,
  headline: ad.headline || '',
  products: ad.products || [],
  images: ad.images || 0,
  optimiseHeadline: Boolean(ad.optimiseHeadline),
  landingPage: ad.landingPage === 'new' ? 'new' : 'store',
  storePage: ad.storePage || 'Home',
  pendingReview: Boolean(ad.pendingReview),
  createdAt: ad.createdAt,
  metrics: ad.metrics,
});

/**
 * The ads of one SB ad group. Campaigns launched from the builder keep their creative on the
 * campaign (`sbCreative`) until the first edit, so that becomes the ad group's first ad.
 * @returns {Array<object>} ads with `isVirtual` true when not yet stored in `sbAds`
 */
export function sbAdsFor(campaign, adGroup, sbAds = []) {
  const stored = sbAds.filter(a => a.campaignId === campaign.id && (!a.adGroupId || a.adGroupId === adGroup.id));
  if (stored.length) return stored.map(a => ({ ...normalise(a, campaign), isVirtual: false }));
  const c = campaign.sbCreative || {};
  return [{
    ...normalise({ ...c, id: `sbc-${campaign.id}`, adGroupId: adGroup.id, name: c.adName || c.headline || adGroup.name, products: c.products || adGroup.products, landingPage: c.landingPage === 'new-landing-page' ? 'new' : 'store' }, campaign),
    isVirtual: true,
  }];
}

/**
 * Creative strength as the console rates it: assets present out of what it recommends.
 * @returns {{ score: number, label: 'Incomplete'|'Low'|'Medium'|'High', suggestions: string[] }}
 */
export function creativeStrength(ad) {
  const missing = [];
  if (!ad.headline.trim()) missing.push('Add 1 headline');
  if (ad.products.length < SB_MIN_PRODUCTS) missing.push(`Add ${SB_MIN_PRODUCTS - ad.products.length} product${SB_MIN_PRODUCTS - ad.products.length === 1 ? '' : 's'}`);
  const imagesShort = Math.max(0, SB_RECOMMENDED_IMAGES - ad.images);
  if (imagesShort) missing.push(`Add ${imagesShort} image${imagesShort === 1 ? '' : 's'}`);
  const checks = [Boolean(ad.brandName.trim()), Boolean(ad.headline.trim()), ad.products.length >= SB_MIN_PRODUCTS, ad.images > 0, ad.images >= SB_RECOMMENDED_IMAGES];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const isComplete = checks[0] && checks[1] && checks[2];
  const label = !isComplete ? 'Incomplete' : score >= 100 ? 'High' : score >= 80 ? 'Medium' : 'Low';
  return { score, label, suggestions: missing };
}

/** Problems that block "Submit for review". */
export function validateSbAd(ad) {
  const errors = [];
  if (!ad.name.trim()) errors.push('Enter an ad name.');
  if (!ad.brandName.trim()) errors.push('Enter a brand name.');
  if (!ad.headline.trim()) errors.push('Add a headline.');
  if (ad.headline.length > SB_HEADLINE_MAX) errors.push(`Keep the headline to ${SB_HEADLINE_MAX} characters.`);
  if (ad.products.length < SB_MIN_PRODUCTS) errors.push(`Add at least ${SB_MIN_PRODUCTS} products.`);
  return errors;
}

/** Fields stored for an SB ad (drops view-only fields). */
export const toStoredAd = (ad) => ({
  campaignId: ad.campaignId, adGroupId: ad.adGroupId, name: ad.name.trim(), status: ad.status, brandName: ad.brandName.trim(),
  headline: ad.headline.trim(), products: ad.products, images: ad.images, optimiseHeadline: ad.optimiseHeadline,
  landingPage: ad.landingPage, storePage: ad.storePage, pendingReview: ad.pendingReview,
  ...(ad.createdAt ? { createdAt: ad.createdAt } : {}),
});

/** Moves an item one place up or down (the console uses drag handles; the simulator uses arrows). */
export function moveItem(list, index, delta) {
  const to = index + delta;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
