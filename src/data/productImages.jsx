// Product thumbnails. Catalogue products carry a real amazon.in `imageUrl`; the drawn
// pouch is the fallback for products without one (e.g. ASINs added by list or upload).
export const PRODUCT_IMAGES = {
  'snack-pouch': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#f4f1ea"/>
      <path d="M30 18 H70 L74 30 V82 Q74 86 70 86 H30 Q26 86 26 82 V30 Z" fill="#e8a33d"/>
      <rect x="30" y="18" width="40" height="7" fill="#c9862a"/>
      <rect x="33" y="40" width="34" height="22" rx="3" fill="#fff8e7"/>
      <circle cx="44" cy="51" r="5" fill="#8d5524"/>
      <circle cx="55" cy="49" r="4" fill="#c58940"/>
      <circle cx="52" cy="56" r="3" fill="#6b3e1d"/>
      <rect x="36" y="68" width="28" height="4" rx="2" fill="#fff8e7" opacity="0.8"/>
    </svg>
  ),
};

/**
 * The thumbnail for a product: its real image when it has one, otherwise the drawn pouch.
 * @param {{ imageUrl?: string|null, imageType?: string, name?: string }} [product]
 */
export function productVisual(product) {
  if (product?.imageUrl) {
    return (
      <img src={product.imageUrl} alt={product.name || ''} loading="lazy" referrerPolicy="no-referrer"
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', display: 'block' }} />
    );
  }
  return PRODUCT_IMAGES[product?.imageType] || PRODUCT_IMAGES['snack-pouch'];
}
