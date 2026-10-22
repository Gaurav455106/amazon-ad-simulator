// Illustrated product thumbnails keyed by product.imageType (used until real
// catalogue images are wired in).
export const PRODUCT_IMAGES = {
  'over-ear-black': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#f0f2f4"/>
      <path d="M22 54 C22 28 78 28 78 54" stroke="#1a1a2e" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <rect x="12" y="50" width="18" height="26" rx="9" fill="#1a1a2e"/>
      <rect x="70" y="50" width="18" height="26" rx="9" fill="#1a1a2e"/>
      <rect x="15" y="53" width="12" height="20" rx="6" fill="#2d2d4e"/>
      <rect x="73" y="53" width="12" height="20" rx="6" fill="#2d2d4e"/>
      <circle cx="21" cy="63" r="3" fill="#e47911" opacity="0.8"/>
    </svg>
  ),
  'earbuds-white': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#f8f8f8"/>
      <ellipse cx="33" cy="54" rx="11" ry="14" fill="white" stroke="#ddd" strokeWidth="1.5"/>
      <rect x="29" y="30" width="8" height="24" rx="4" fill="white" stroke="#ddd" strokeWidth="1.5"/>
      <circle cx="33" cy="54" r="4" fill="#eee" stroke="#ccc" strokeWidth="1"/>
      <ellipse cx="67" cy="54" rx="11" ry="14" fill="white" stroke="#ddd" strokeWidth="1.5"/>
      <rect x="63" y="30" width="8" height="24" rx="4" fill="white" stroke="#ddd" strokeWidth="1.5"/>
      <circle cx="67" cy="54" r="4" fill="#eee" stroke="#ccc" strokeWidth="1"/>
      <rect x="25" y="72" width="50" height="16" rx="8" fill="white" stroke="#ddd" strokeWidth="1.5"/>
      <circle cx="40" cy="80" r="3" fill="#f0f0f0"/>
      <circle cx="60" cy="80" r="3" fill="#f0f0f0"/>
    </svg>
  ),
  'sport-blue': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#eef4ff"/>
      <ellipse cx="32" cy="58" rx="10" ry="12" fill="#1a6fd4"/>
      <path d="M32 46 C32 36 22 30 20 25" stroke="#1a6fd4" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M20 25 C18 20 24 17 26 22" stroke="#1a6fd4" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="68" cy="58" rx="10" ry="12" fill="#1a6fd4"/>
      <path d="M68 46 C68 36 78 30 80 25" stroke="#1a6fd4" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M80 25 C82 20 76 17 74 22" stroke="#1a6fd4" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="32" cy="58" r="5" fill="#0d4fa8"/>
      <circle cx="68" cy="58" r="5" fill="#0d4fa8"/>
      <path d="M42 65 Q50 72 58 65" stroke="#1a6fd4" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'studio-gray': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#f5f5f5"/>
      <path d="M20 56 C20 26 80 26 80 56" stroke="#555" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <rect x="10" y="50" width="20" height="28" rx="10" fill="#666"/>
      <rect x="70" y="50" width="20" height="28" rx="10" fill="#666"/>
      <rect x="13" y="53" width="14" height="22" rx="7" fill="#888"/>
      <rect x="73" y="53" width="14" height="22" rx="7" fill="#888"/>
      <line x1="10" y1="56" x2="10" y2="76" stroke="#444" strokeWidth="2"/>
      <line x1="90" y1="56" x2="90" y2="76" stroke="#444" strokeWidth="2"/>
    </svg>
  ),
  'kids-red': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#fff5f5"/>
      <path d="M22 52 C22 30 78 30 78 52" stroke="#e53935" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <rect x="12" y="48" width="18" height="22" rx="9" fill="#e53935"/>
      <rect x="70" y="48" width="18" height="22" rx="9" fill="#e53935"/>
      <rect x="15" y="51" width="12" height="16" rx="6" fill="#ef9a9a"/>
      <rect x="73" y="51" width="12" height="16" rx="6" fill="#ef9a9a"/>
      <circle cx="21" cy="59" r="4" fill="#ffcdd2"/>
      <circle cx="79" cy="59" r="4" fill="#ffcdd2"/>
      <path d="M42 72 Q50 78 58 72" stroke="#e53935" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'gaming-rgb': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#0d0d1a"/>
      <path d="M20 52 C20 28 80 28 80 52" stroke="#222" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M20 52 C20 28 80 28 80 52" stroke="#9c27b0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
      <rect x="10" y="48" width="20" height="26" rx="5" fill="#1a1a2e"/>
      <rect x="70" y="48" width="20" height="26" rx="5" fill="#1a1a2e"/>
      <rect x="12" y="50" width="16" height="22" rx="4" fill="#9c27b0" opacity="0.4"/>
      <rect x="72" y="50" width="16" height="22" rx="4" fill="#9c27b0" opacity="0.4"/>
      <line x1="10" y1="68" x2="2" y2="82" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
      <rect x="0" y="80" width="8" height="10" rx="2" fill="#444"/>
      <circle cx="16" cy="61" r="5" fill="#e040fb"/>
      <circle cx="74" cy="61" r="5" fill="#e040fb"/>
    </svg>
  ),
  'open-back': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#fafafa"/>
      <path d="M22 54 C22 28 78 28 78 54" stroke="#8d6e63" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <circle cx="21" cy="62" r="14" fill="#8d6e63" stroke="#6d4c41" strokeWidth="1.5"/>
      <circle cx="79" cy="62" r="14" fill="#8d6e63" stroke="#6d4c41" strokeWidth="1.5"/>
      <circle cx="21" cy="62" r="11" fill="none" stroke="#a1887f" strokeWidth="1" strokeDasharray="3,2"/>
      <circle cx="79" cy="62" r="11" fill="none" stroke="#a1887f" strokeWidth="1" strokeDasharray="3,2"/>
      <circle cx="21" cy="62" r="5" fill="#6d4c41"/>
      <circle cx="79" cy="62" r="5" fill="#6d4c41"/>
    </svg>
  ),
  'neckband-gold': (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#fffdf0"/>
      <path d="M18 35 C18 65 82 65 82 35" stroke="#c9a84c" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <ellipse cx="18" cy="33" rx="8" ry="11" fill="#c9a84c"/>
      <ellipse cx="82" cy="33" rx="8" ry="11" fill="#c9a84c"/>
      <ellipse cx="18" cy="33" rx="5" ry="7" fill="#ffd700"/>
      <ellipse cx="82" cy="33" rx="5" ry="7" fill="#ffd700"/>
      <circle cx="18" cy="33" r="2" fill="#b8860b"/>
      <circle cx="82" cy="33" r="2" fill="#b8860b"/>
      <line x1="50" y1="65" x2="50" y2="72" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round"/>
      <rect x="44" y="70" width="12" height="7" rx="3" fill="#c9a84c"/>
    </svg>
  ),
};
