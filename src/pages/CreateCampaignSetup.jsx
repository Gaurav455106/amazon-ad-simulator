import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Info, ChevronDown, ChevronUp, ChevronRight, Search, X, ToggleLeft, ToggleRight, Shirt, Image as ImageIcon, Play } from 'lucide-react';

const TYPE_MAP = {
  'sponsored-products': 'Sponsored Products',
  'sponsored-brands': 'Sponsored Brands',
  'display': 'Sponsored Display',
};

const PRODUCT_IMAGES = {
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

function ProductImage({ imageType, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8', background: '#f8f8f8' }}>
      {PRODUCT_IMAGES[imageType] || PRODUCT_IMAGES['over-ear-black']}
    </div>
  );
}

// Generic SD image-ad mockup used by the Creative preview panel. Purely decorative — uses
// whichever products have been added (or a placeholder box if none yet) plus a monogram
// standing in for the advertiser's logo, since we don't have a real uploaded logo asset.
function SdAdMockup({ layout, hasButton, brandName, products, headlineOn, headlineText }) {
  const wide = layout === 'wide' || layout === 'banner';
  const p1 = products[0], p2 = products[1];
  return (
    <div style={{ background: 'white', width: '100%', height: '100%', display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 8, padding: 10, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: 4, background: '#232f3e', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {(brandName || 'AD').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {p1 ? <ProductImage imageType={p1.imageType} size={30} /> : <div style={{ width: 30, height: 30, borderRadius: 4, background: '#eee' }} />}
          {p2 && <ProductImage imageType={p2.imageType} size={30} />}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        <div style={{ fontSize: 11, color: '#0073bb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {headlineOn && headlineText ? headlineText : `${brandName || 'Your Brand'} — Shop now on Amazon`}
        </div>
        {hasButton && (
          <span style={{ alignSelf: 'flex-start', background: 'var(--amazon-orange)', borderRadius: 14, padding: '3px 12px', fontSize: 11, fontWeight: 600, color: '#111' }}>Shop now</span>
        )}
      </div>
    </div>
  );
}

// Generic SD video-ad mockup: a muted autoplay placeholder on one side, brand/logo on the other.
function SdVideoMockup({ brandName, headlineOn, headlineText, logoOn }) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={{ flex: 1.3, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={20} color="white" fill="white" />
        </div>
      </div>
      <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 8 }}>
        <div style={{ fontSize: 12, textAlign: 'center', color: '#0073bb' }}>{headlineOn && headlineText ? headlineText : `${brandName || 'Your Brand'}…`}</div>
        {logoOn && (
          <div style={{ width: 30, height: 30, borderRadius: 4, background: '#232f3e', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(brandName || 'AD').slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <span className="ccs-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#e47911' : '#ccc', fontSize: 12 }}>★</span>
      ))}
    </span>
  );
}

// Plain, static icon when no `tip` is given (the overwhelming majority of usages across this
// file) — unchanged from before. When a `tip` string is passed, the icon becomes clickable and
// opens a small popover with the definition text (reusing the same popup styling as TipIcon
// below), matching the real console's info tooltips.
function InfoIcon({ tip }) {
  const [open, setOpen] = useState(false);
  if (!tip) return <span className="ccs-info-icon"><Info size={12} /></span>;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button className="ccs-info-icon ccs-info-clickable" onClick={e => { e.stopPropagation(); e.preventDefault(); setOpen(o => !o); }}><Info size={12} /></button>
      {open && (
        <div className="ccs-tooltip-popup" onClick={e => e.stopPropagation()}>
          <button className="ccs-tooltip-close" onClick={() => setOpen(false)}>×</button>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: '#111' }}>{tip}</div>
        </div>
      )}
    </span>
  );
}

// Deterministic pseudo "suggested bid" for simulated SD targets that don't already carry real
// sugg/suggMin/suggMax data (dynamic segments, named audience leaves/categories). Hashing the
// key keeps the value stable across re-renders instead of re-rolling on every render.
function sdPseudoSugg(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const sugg = 20 + (hash % 7000) / 100; // ₹20.00 – ₹90.00
  return { sugg, suggMin: sugg * 0.58, suggMax: sugg * 1.55 };
}

const TIP_IS_IR = (
  <div>
    <p><strong>Impression share (IS)</strong> is the percentage of impressions you are getting on this term relative to all the impressions it is generating.</p>
    <p style={{ marginTop: 8 }}><strong>Impression rank</strong> is where your IS stands relative to other advertiser's share of impressions for the same term.</p>
    <p style={{ marginTop: 8 }}>Use these to understand your impression coverage and help you decide how much to bid.</p>
  </div>
);
const TIP_MATCH_TYPE = (
  <div>
    <p>Match types allow you to fine-tune which customer searches trigger your ads.</p>
    <p style={{ marginTop: 8 }}><strong>Broad:</strong> Contains all the keywords in any order and includes plurals, variations and related keywords.</p>
    <p style={{ marginTop: 6 }}><strong>Phrase:</strong> Contains the exact phrase or sequence of keywords.</p>
    <p style={{ marginTop: 6 }}><strong>Exact:</strong> Exactly matches the keyword or sequence of keywords. <span style={{ color: '#0066c0' }}>Learn More</span></p>
  </div>
);
const TIP_SUGG_BID = (
  <div>
    <p>Suggested bids are calculated daily based on past bidding activity for ads similar to yours to predict bids that are more likely to win. <span style={{ color: '#0066c0' }}>Learn More</span></p>
  </div>
);
const TIP_BID = (
  <div>
    <p>The maximum amount you are willing to pay when a shopper clicks your ad. Your actual cost may be lower.</p>
  </div>
);

function TipIcon({ tip }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <button className="ccs-info-icon ccs-info-clickable" onClick={() => setOpen(o => !o)}><Info size={12} /></button>
      {open && (
        <div className="ccs-tooltip-popup" onClick={e => e.stopPropagation()}>
          <button className="ccs-tooltip-close" onClick={() => setOpen(false)}>×</button>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: '#111' }}>{tip}</div>
        </div>
      )}
    </span>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      className={`ccs-toggle ${on ? 'on' : 'off'}`}
      onClick={() => onChange(!on)}
      title={on ? 'Enabled' : 'Disabled'}
    >
      <span className="ccs-toggle-knob" />
    </button>
  );
}

function CatRow({ cat, depth, expandedCats, setExpandedCats, addedProdTargets, addProdTarget, setRefineTarget, catSearch }) {
  const isExpanded = !!expandedCats[cat.id];
  const hasChildren = cat.children && cat.children.length > 0;
  const isLeaf = !hasChildren;
  const isAdded = !!addedProdTargets.find(t => t.id === cat.id);

  const visible = !catSearch || cat.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    (hasChildren && cat.children.some(c => c.name.toLowerCase().includes(catSearch.toLowerCase())));
  if (!visible && !catSearch) return null;

  return (
    <div>
      <div className="ccs-cat-row" style={{ paddingLeft: 14 + depth * 16 }}>
        <div className="ccs-cat-row-left">
          {hasChildren ? (
            <button className="ccs-cat-expand" onClick={() => setExpandedCats(e => ({ ...e, [cat.id]: !e[cat.id] }))}>
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          ) : <span style={{ width: 16, display: 'inline-block' }} />}
          <span className="ccs-cat-name">{cat.name}</span>
        </div>
        <div className="ccs-cat-row-right">
          {cat.sugg ? (
            <div>
              <span className="ccs-cat-sugg-val">₹{cat.sugg.toFixed(2)}</span><br/>
              <span className="ccs-cat-sugg-range">₹{cat.suggMin.toFixed(2)} - ₹{cat.suggMax.toFixed(2)}</span>
            </div>
          ) : <span className="ccs-cat-dash">-</span>}
          {isLeaf || cat.sugg ? (
            <div className="ccs-cat-actions">
              {isAdded
                ? <span className="ccs-kw-added-text">Added</span>
                : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget(cat)}>Add</button>
              }
              <button className="link-btn ccs-kw-add-link" onClick={() => setRefineTarget(cat)}>Refine</button>
            </div>
          ) : <div className="ccs-cat-actions" />}
        </div>
      </div>
      {isExpanded && hasChildren && cat.children.map(child => (
        <CatRow key={child.id} cat={child} depth={depth + 1} expandedCats={expandedCats} setExpandedCats={setExpandedCats}
          addedProdTargets={addedProdTargets} addProdTarget={addProdTarget} setRefineTarget={setRefineTarget} catSearch={catSearch} />
      ))}
    </div>
  );
}

// Lightweight expandable row for the SD audience taxonomy (In-market / Interest & lifestyle
// "Browse" tree). Unlike CatRow this has no bid/refine columns — it's a plain expand/collapse
// category with addable named leaf segments, matching the real console's audience browser.
function AudCatRow({ cat, expandedAudCats, setExpandedAudCats, addedKeys, onAdd, audSearch }) {
  const hasChildren = cat.items && cat.items.length > 0;
  const isExpanded = !!expandedAudCats[cat.id] || !!audSearch;
  const isAdded = addedKeys.has(cat.id);
  const visible = !audSearch || cat.name.toLowerCase().includes(audSearch.toLowerCase()) ||
    (hasChildren && cat.items.some(it => it.name.toLowerCase().includes(audSearch.toLowerCase())));
  if (!visible) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        {/* The category itself is a targetable interest (e.g. "Music & Radio") — the chevron
            only expands to reveal more specific sub-segments underneath it. */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: hasChildren ? 'pointer' : 'default', flex: 1, minWidth: 0 }}
          onClick={() => hasChildren && setExpandedAudCats(e => ({ ...e, [cat.id]: !e[cat.id] }))}
        >
          {hasChildren ? (isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 13, display: 'inline-block' }} />}
          <span style={{ fontSize: 13 }}>{cat.name}</span>
        </div>
        {isAdded
          ? <span className="ccs-kw-added-text">Added</span>
          : <button className="link-btn ccs-kw-add-link" onClick={() => onAdd(cat)}>Add</button>
        }
      </div>
      {isExpanded && hasChildren && cat.items
        .filter(item => !audSearch || item.name.toLowerCase().includes(audSearch.toLowerCase()) || cat.name.toLowerCase().includes(audSearch.toLowerCase()))
        .map(item => {
          const isAdded = addedKeys.has(item.id);
          return (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px 10px 34px', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: 13 }}>{item.name} <InfoIcon tip={item.desc || `Reach shoppers whose activity suggests an interest in ${item.name.replace(/^(IM|LS) - /, '')}.`} /></span>
              {isAdded
                ? <span className="ccs-kw-added-text">Added</span>
                : <button className="link-btn ccs-kw-add-link" onClick={() => onAdd(item)}>Add</button>
              }
            </div>
          );
        })}
    </div>
  );
}

export default function CreateCampaignSetup() {
  const { type, campaignId: paramCampaignId } = useParams();
  const navigate = useNavigate();
  const addCampaign = useStore(s => s.addCampaign);
  const addAdGroup = useStore(s => s.addAdGroup);
  const addKeywords = useStore(s => s.addKeywords);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const allProducts = useStore(s => s.products);
  const campaigns = useStore(s => s.campaigns);

  const adGroupMode = !!paramCampaignId;
  const parentCampaign = adGroupMode ? campaigns.find(c => c.id === paramCampaignId) : null;
  const campaignType = adGroupMode ? (parentCampaign?.type || 'Sponsored Products') : (TYPE_MAP[type] || 'Sponsored Products');
  const today = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }).replace(',','');

  // ── Ad Group ──
  const [adGroupName, setAdGroupName] = useState(`Ad Group - ${todayDisplay}`);

  // ── Products ──
  const [productTab, setProductTab] = useState('search'); // search | list | upload
  const [productSearch, setProductSearch] = useState('');
  const [asinListText, setAsinListText] = useState('');
  const [addedProducts, setAddedProducts] = useState([]);
  const [uploadState, setUploadState] = useState(null); // null | { fileName, results: [{asin, product, found}] }
  const [dragOver, setDragOver] = useState(false);
  const [productSort, setProductSort] = useState('newest');
  const [productSortOpen, setProductSortOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    let list = q
      ? allProducts.filter(p => p.name.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      : [...allProducts];
    if (productSort === 'oldest') list = list.reverse();
    return list;
  }, [allProducts, productSearch, productSort]);

  const PROD_ASIN_RE = /^B[A-Z0-9]{9}$/;

  const makePlaceholderProduct = (asin) => ({
    asin,
    name: `Product (${asin})`,
    sku: `SKU-${asin.slice(-6)}`,
    price: 999,
    rating: 4.0,
    reviews: 0,
    status: 'In stock',
    imageType: 'over-ear-black',
  });

  const addProduct = (p) => {
    if (!addedProducts.find(x => x.asin === p.asin)) {
      setAddedProducts(prev => [...prev, p]);
    }
  };
  const removeProduct = (asin) => setAddedProducts(prev => prev.filter(p => p.asin !== asin));

  const handleAddFromList = () => {
    const asins = asinListText.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    asins.forEach(asin => {
      if (!PROD_ASIN_RE.test(asin)) return; // skip invalid format
      if (addedProducts.find(x => x.asin === asin)) return; // skip duplicates
      const product = allProducts.find(p => p.asin === asin);
      if (product) setAddedProducts(prev => [...prev, product]); // catalog only — non-catalog ASINs are skipped
    });
    setAsinListText('');
  };

  // ── CSV upload parsing ──
  const parseCSVAndAdd = (text, fileName) => {
    const lines = text.split('\n').map(l => l.trim());
    // Template format: 4 header rows, then ASINs one per row
    const asinLines = lines.slice(4).filter(Boolean).map(l => l.replace(/[",\r]/g, '').trim().toUpperCase());
    const results = asinLines.map(asin => {
      const validFormat = PROD_ASIN_RE.test(asin);
      const product = allProducts.find(p => p.asin === asin);
      return { asin, product: product || null, found: !!product, validFormat };
    });
    setUploadState({ fileName, results });
    // Catalog-only: only add ASINs found in allProducts
    results.filter(r => r.found).forEach(r => {
      if (!addedProducts.find(x => x.asin === r.asin)) {
        setAddedProducts(prev => [...prev, r.product]);
      }
    });
  };

  const handleFileInput = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => parseCSVAndAdd(e.target.result, file.name);
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const content = `ASIN bulk import template\nList ASINs you would like to add to your campaign.\n\n"ASINs (list below, one ASIN per row)"\n${allProducts.map(p => p.asin).join('\n')}`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Targeting ──
  const [targetingType, setTargetingType] = useState('Auto');
  const [autoBidMode, setAutoBidMode] = useState('default'); // default | groups
  const [defaultBid, setDefaultBid] = useState('3.00');
  const [autoGroups, setAutoGroups] = useState([
    { key: 'close',       label: 'Close match',  on: true, bid: '3.00', sugg: 50.10, suggMin: 45.09, suggMax: 55.11 },
    { key: 'loose',       label: 'Loose match',  on: true, bid: '3.00', sugg: 33.80, suggMin: 25.35, suggMax: 41.37 },
    { key: 'substitutes', label: 'Substitutes',  on: true, bid: '3.00', sugg: 50.10, suggMin: 40.70, suggMax: 55.11 },
    { key: 'complements', label: 'Complements',  on: true, bid: '3.00', sugg: 23.52, suggMin: 17.64, suggMax: 29.40 },
  ]);
  const updateGroup = (key, field, val) =>
    setAutoGroups(g => g.map(x => x.key === key ? { ...x, [field]: val } : x));

  // ── Manual keywords ──
  const [manualTargetType, setManualTargetType] = useState('keyword');
  const [kwSugTab, setKwSugTab] = useState('suggested');
  const [kwSortBy, setKwSortBy] = useState('orders');
  const [kwSortOpen, setKwSortOpen] = useState(false);
  const [kwText, setKwText] = useState('');
  const [kwFilters, setKwFilters] = useState({ broad: true, phrase: true, exact: true });
  const [kwDragOver, setKwDragOver] = useState(false);
  const [kwBidMode, setKwBidMode] = useState('suggested'); // suggested | custom | default
  const [kwCustomBid, setKwCustomBid] = useState('50.10');
  const [kwBidWarn, setKwBidWarn] = useState(false);
  const [kwBidDropOpen, setKwBidDropOpen] = useState(false);
  const [addedKws, setAddedKws] = useState([]);

  // Add-rule modal
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleDateMode, setRuleDateMode] = useState('recommended');
  const [ruleEvent, setRuleEvent] = useState('prime-day');
  const [ruleRecurrence, setRuleRecurrence] = useState('daily');
  const [ruleHours, setRuleHours] = useState('all-day');
  const [ruleBidAdj, setRuleBidAdj] = useState('50');
  const [ruleName, setRuleName] = useState(`Prime Day - Scheduled bid rule - ${todayDisplay}`);

  const RULE_EVENTS = [
    { value: 'prime-day',        label: 'Prime Day (4 Jul - 7 Jul 2026)' },
    { value: 'independence-day', label: 'Independence Day (14 Aug - 16 Aug 2026)' },
    { value: 'navratri',         label: 'Navratri (22 Sep - 1 Oct 2026)' },
    { value: 'dussehra',         label: 'Dussehra (1 Oct - 3 Oct 2026)' },
    { value: 'diwali',           label: 'Diwali (18 Oct - 22 Oct 2026)' },
    { value: 'dhanteras',        label: 'Dhanteras (17 Oct - 18 Oct 2026)' },
    { value: 'christmas',        label: 'Christmas (22 Dec - 26 Dec 2026)' },
    { value: 'new-year',         label: 'New Year (30 Dec 2026 - 2 Jan 2027)' },
  ];

  const KW_GROUP = { type: 'group', name: 'Keywords related to your product category', suggBid: 22.06, suggMin: 16.45, suggMax: 27.57, bid: '22.06' };
  const SUGGESTED_KWS = [
    { kw: 'wireless headphones',         is: 0,       ir: 0,
      broad:  { sugg: 12.37, min: 8.12,  max: 15.46 },
      phrase: { sugg: 9.64,  min: 6.34,  max: 12.05 },
      exact:  { sugg: 10.12, min: 7.59,  max: 13.73 } },
    { kw: 'bluetooth headphones',        is: '0.03%', ir: 13,
      broad:  { sugg: 13.79, min: 10.04, max: 17.24 },
      phrase: { sugg: 10.91, min: 7.90,  max: 13.64 },
      exact:  { sugg: 17.75, min: 9.13,  max: 22.19 } },
    { kw: 'noise cancelling headphones', is: 0,       ir: 0,
      broad:  { sugg: 7.13,  min: 3.91,  max: 8.91  },
      phrase: { sugg: 5.56,  min: 3.04,  max: 6.95  },
      exact:  { sugg: 5.99,  min: 3.46,  max: 7.31  } },
    { kw: 'over ear headphones',         is: 0,       ir: 0,
      broad:  { sugg: 4.59,  min: 2.87,  max: 5.74  },
      phrase: { sugg: 4.02,  min: 2.52,  max: 5.03  },
      exact:  { sugg: 3.06,  min: 1.91,  max: 3.83  } },
    { kw: 'earbuds wireless',            is: 0,       ir: 0,
      broad:  { sugg: 3.61,  min: 2.26,  max: 4.52  },
      phrase: { sugg: 4.88,  min: 3.05,  max: 6.10  },
      exact:  { sugg: 3.78,  min: 2.36,  max: 4.73  } },
    { kw: 'gaming headset',              is: 0,       ir: 0,
      broad:  { sugg: 7.96,  min: 4.98,  max: 9.96  },
      phrase: { sugg: 3.06,  min: 1.91,  max: 3.83  },
      exact:  { sugg: 3.56,  min: 2.23,  max: 4.45  } },
    { kw: 'sports earbuds',              is: 0,       ir: 0,
      broad:  { sugg: 7.14,  min: 4.46,  max: 8.93  },
      phrase: { sugg: 5.22,  min: 3.26,  max: 6.53  },
      exact:  { sugg: 6.45,  min: 4.03,  max: 8.07  } },
    { kw: 'true wireless earbuds',       is: 0,       ir: 0,
      broad:  { sugg: 8.92,  min: 5.58,  max: 11.15 },
      phrase: { sugg: 6.75,  min: 4.22,  max: 8.44  },
      exact:  { sugg: 9.23,  min: 5.77,  max: 11.54 } },
    { kw: 'headphones with mic',         is: 0,       ir: 0,
      broad:  { sugg: 5.44,  min: 3.40,  max: 6.80  },
      phrase: { sugg: 4.18,  min: 2.61,  max: 5.23  },
      exact:  { sugg: 6.02,  min: 3.76,  max: 7.53  } },
    { kw: 'bass headphones',             is: 0,       ir: 0,
      broad:  { sugg: 3.87,  min: 2.42,  max: 4.84  },
      phrase: { sugg: 2.94,  min: 1.84,  max: 3.68  },
      exact:  { sugg: 4.11,  min: 2.57,  max: 5.14  } },
  ];

  const kwEffBid = (kwData) => kwBidMode === 'suggested'
    ? kwData.sugg.toFixed(2)
    : kwCustomBid; // both 'custom' and 'default' use the bid input value

  const kwGroupAdded = !!addedKws.find(k => k.type === 'group');
  const addKwGroup = () => {
    if (!kwGroupAdded) {
      const bid = kwBidMode === 'suggested' ? KW_GROUP.suggBid.toFixed(2) : kwCustomBid;
      setAddedKws(prev => [...prev, { ...KW_GROUP, bid, isDefaultBid: kwBidMode === 'default' }]);
    }
  };
  const addKwFromSugg = (kw, matchType, kwData) => {
    if (!addedKws.find(k => k.type !== 'group' && k.keyword === kw && k.matchType === matchType)) {
      setAddedKws(prev => [...prev, {
        type: 'kw', keyword: kw, matchType,
        suggBid: kwData.sugg, suggMin: kwData.min, suggMax: kwData.max,
        bid: kwEffBid(kwData), isDefaultBid: kwBidMode === 'default',
      }]);
    }
  };
  const addAllSuggKws = () => {
    const toAdd = [];
    SUGGESTED_KWS.forEach(s => {
      ['broad', 'phrase', 'exact'].filter(m => kwFilters[m]).forEach(m => {
        const mt = m.charAt(0).toUpperCase() + m.slice(1);
        if (!addedKws.find(k => k.type !== 'group' && k.keyword === s.kw && k.matchType === mt)) {
          const kd = s[m];
          toAdd.push({ type: 'kw', keyword: s.kw, matchType: mt, suggBid: kd.sugg, suggMin: kd.min, suggMax: kd.max, bid: kwEffBid(kd), isDefaultBid: kwBidMode === 'default' });
        }
      });
    });
    setAddedKws(prev => [...prev, ...toAdd]);
  };
  // SB-specific add helpers — use sbKwBidMode + VCPM multiplier
  const sbKwEffBid = (kwData) => {
    const M = sbGoal === 'impression-share' ? 29.43 : 1;
    return sbKwBidMode === 'suggested'
      ? (kwData.sugg * M).toFixed(2)
      : sbKwBid;
  };
  const sbAddKwFromSugg = (kw, matchType, kwData) => {
    if (!addedKws.find(k => k.type !== 'group' && k.keyword === kw && k.matchType === matchType)) {
      setAddedKws(prev => [...prev, {
        type: 'kw', keyword: kw, matchType,
        suggBid: kwData.sugg, suggMin: kwData.min, suggMax: kwData.max,
        bid: sbKwEffBid(kwData), isDefaultBid: sbKwBidMode === 'default',
      }]);
    }
  };
  const sbAddAllSuggKws = () => {
    const toAdd = [];
    SUGGESTED_KWS.forEach(s => {
      ['broad', 'phrase', 'exact'].filter(m => kwFilters[m]).forEach(m => {
        const mt = m.charAt(0).toUpperCase() + m.slice(1);
        if (!addedKws.find(k => k.type !== 'group' && k.keyword === s.kw && k.matchType === mt)) {
          const kd = s[m];
          toAdd.push({ type: 'kw', keyword: s.kw, matchType: mt, suggBid: kd.sugg, suggMin: kd.min, suggMax: kd.max, bid: sbKwEffBid(kd), isDefaultBid: sbKwBidMode === 'default' });
        }
      });
    });
    setAddedKws(prev => [...prev, ...toAdd]);
  };
  const sbAddKwsFromText = () => {
    const lines = kwText.split('\n').map(l => l.trim()).filter(Boolean);
    const matchTypes = Object.entries(kwFilters).filter(([, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    const M = sbGoal === 'impression-share' ? 29.43 : 1;
    const toAdd = [];
    const errors = [];
    lines.forEach(kw => {
      matchTypes.forEach(mt => {
        if (addedKws.find(k => k.type !== 'group' && k.keyword === kw && k.matchType === mt)) {
          errors.push({ input: kw, type: mt, error: `"${kw}" (${mt}) is already added` });
        } else {
          // For suggested: random CPC in ₹7–₹20 range, scaled by VCPM multiplier
          const randCpc = parseFloat((7 + (kw.length % 13)).toFixed(2)); // deterministic per keyword length so same kw always gets same bid
          const bid = sbKwBidMode === 'suggested' ? (randCpc * M).toFixed(2) : sbKwBid;
          const suggBid = sbKwBidMode === 'suggested' ? randCpc : null;
          toAdd.push({ type: 'kw', keyword: kw, matchType: mt, suggBid, bid, isDefaultBid: false });
        }
      });
    });
    setAddedKws(prev => [...prev, ...toAdd]);
    setKwEnterListErrors(errors);
    setKwText('');
  };

  const addKwsFromText = () => {
    const lines = kwText.split('\n').map(l => l.trim()).filter(Boolean);
    const matchTypes = Object.entries(kwFilters).filter(([, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    const toAdd = [];
    const errors = [];
    lines.forEach(kw => {
      matchTypes.forEach(mt => {
        if (addedKws.find(k => k.type !== 'group' && k.keyword === kw && k.matchType === mt)) {
          errors.push({ input: kw, type: mt, error: `"${kw}" (${mt}) is already added` });
        } else {
          toAdd.push({ type: 'kw', keyword: kw, matchType: mt, suggBid: null, bid: kwBidMode === 'suggested' ? defaultBid : kwCustomBid, isDefaultBid: kwBidMode === 'default' });
        }
      });
    });
    setAddedKws(prev => [...prev, ...toAdd]);
    setKwEnterListErrors(errors);
    setKwText('');
  };

  const downloadErrorReport = (errors, filename) => {
    const header = 'Targeting,Type,Error\n';
    const rows = errors.map(e => `"${e.input}","${e.type}","${e.error}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Negative keyword targeting ──
  const [negKwOpen, setNegKwOpen] = useState(false);
  const [negKwMatchType, setNegKwMatchType] = useState('Negative exact');
  const [negKwText, setNegKwText] = useState('');
  const [addedNegKws, setAddedNegKws] = useState([]);
  const addNegKws = () => {
    const lines = negKwText.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(kw => {
      if (!addedNegKws.find(k => k.keyword === kw)) {
        setAddedNegKws(prev => [...prev, { keyword: kw, matchType: negKwMatchType }]);
      }
    });
    setNegKwText('');
  };

  // ── Negative product targeting ──
  const [negProdOpen, setNegProdOpen] = useState(false);
  const [negProdTab, setNegProdTab] = useState('brands');
  const [addedNegProds, setAddedNegProds] = useState([]);

  // ── Product targeting ──
  const [addedProdTargets, setAddedProdTargets] = useState([]);
  const [ptMainTab, setPtMainTab] = useState('categories');
  const [ptCatTab, setPtCatTab] = useState('suggested');
  const [catSearch, setCatSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState({});
  const [expandedAudCats, setExpandedAudCats] = useState({});
  const [refineTarget, setRefineTarget] = useState(null);
  const [refineBrand, setRefineBrand] = useState([]);
  const [refineBrandSearch, setRefineBrandSearch] = useState('');
  const [refineBrandDropOpen, setRefineBrandDropOpen] = useState(false);
  const [refinePriceMin, setRefinePriceMin] = useState('');
  const [refinePriceMax, setRefinePriceMax] = useState('');
  const [refineStarsMin, setRefineStarsMin] = useState(0);
  const [refineStarsMax, setRefineStarsMax] = useState(5);
  const [refineShipping, setRefineShipping] = useState('all');
  const [ptIndivSubTab, setPtIndivSubTab] = useState('suggested');
  const [ptIndivSearch, setPtIndivSearch] = useState('');
  const [ptIndivFilterExact, setPtIndivFilterExact] = useState(true);
  const [ptIndivFilterExpanded, setPtIndivFilterExpanded] = useState(true);
  const [ptIndivEnterList, setPtIndivEnterList] = useState('');
  const [ptIndivDragOver, setPtIndivDragOver] = useState(false);
  const [ptEnterListErrors, setPtEnterListErrors] = useState([]);
  const [ptEnterListSummary, setPtEnterListSummary] = useState(null); // {added, total, invalidAsins}
  const [kwEnterListErrors, setKwEnterListErrors] = useState([]);
  const [ptBidMode, setPtBidMode] = useState('suggested');
  const [ptCustomBid, setPtCustomBid] = useState('3.00');
  const [ptBidDropOpen, setPtBidDropOpen] = useState(false);

  // ── Campaign settings (declared here so effectiveBiddingStrategy can reference biddingStrategy) ──
  const [campaignName, setCampaignName] = useState('');
  const [portfolioId, setPortfolioId] = useState('');
  const [budget, setBudget] = useState(() => campaignType === 'Sponsored Display' ? '1000' : '500');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [biddingStrategy, setBiddingStrategy] = useState('Dynamic bids - up and down');

  // In adGroupMode, targeting type and bidding strategy come from the parent campaign
  const effectiveTargetingType = adGroupMode ? (parentCampaign?.targetingType || 'Auto') : targetingType;
  const effectiveBiddingStrategy = adGroupMode ? (parentCampaign?.biddingStrategy || 'Dynamic bids - up and down') : biddingStrategy;

  useEffect(() => {
    if (!refineTarget) return;
    const handler = (e) => {
      if (!e.target.closest('.ccs-refine-panel') && !e.target.closest('.ccs-brand-dropdown')) {
        setRefineTarget(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [refineTarget]);
  const [placementTop, setPlacementTop] = useState('0');
  const [placementRest, setPlacementRest] = useState('0');
  const [placementPages, setPlacementPages] = useState('0');
  const [placementTab, setPlacementTab] = useState('placements'); // placements | audiences
  const [bizCheck, setBizCheck] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [rulesBannerDismissed, setRulesBannerDismissed] = useState(false);
  const [bidScheduleChecked, setBidScheduleChecked] = useState(true);
  const [ruleDetailsOpen, setRuleDetailsOpen] = useState(true);

  // ── SB form ──
  const [sbAdFormat, setSbAdFormat] = useState('product-collection');
  const [sbBudgetType, setSbBudgetType] = useState('Daily');
  const [sbProducts, setSbProducts] = useState([]);
  const [sbHeadline, setSbHeadline] = useState('');
  const [sbLandingPage, setSbLandingPage] = useState('store');
  const [sbProductSearch, setSbProductSearch] = useState('');
  const [sbGoal, setSbGoal] = useState('drive-visits');
  const [sbGoalPending, setSbGoalPending] = useState(null);
  const [sbGoalModalOpen, setSbGoalModalOpen] = useState(false);
  const [sbAdGroupName, setSbAdGroupName] = useState('');
  const [sbCollectionType, setSbCollectionType] = useState('automatic');
  const [sbLifetimeTooltip, setSbLifetimeTooltip] = useState(false);
  const [sbBudgetDropOpen, setSbBudgetDropOpen] = useState(false);
  const [sbAdName, setSbAdName] = useState('');
  const [sbBrandName, setSbBrandName] = useState('SoundMax');
  const [sbLogoDropOpen, setSbLogoDropOpen] = useState(false);
  const [sbLogoUrl, setSbLogoUrl] = useState({ type: 'asset', bg: '#6c2eb9', lines: [{ t: 'SOUND', c: 'white' }, { t: 'MAX', c: '#febd69' }] });
  const [sbCreativeAssetsOpen, setSbCreativeAssetsOpen] = useState(false);
  const [sbAdTitle, setSbAdTitle] = useState('standard');
  const [sbStandardTitle, setSbStandardTitle] = useState('Browse the collection');
  const [sbStandardTitleOpen, setSbStandardTitleOpen] = useState(false);
  const [sbAdTitleText, setSbAdTitleText] = useState('');
  const [sbLandingPageType, setSbLandingPageType] = useState('new-landing-page');
  const [sbProductTab, setSbProductTab] = useState('search');
  const [sbProductAutoComplete, setSbProductAutoComplete] = useState(false);
  const [sbExclOpen, setSbExclOpen] = useState(false);
  const [sbExclTab, setSbExclTab] = useState('enter-list');
  const [sbExclText, setSbExclText] = useState('');
  const [sbExcludedAsins, setSbExcludedAsins] = useState([]);
  const [sbKwTab, setSbKwTab] = useState('suggested');
  const [sbKwBid, setSbKwBid] = useState('4.00');
  const [sbKwBidWarn, setSbKwBidWarn] = useState(false);
  const [sbKwBidMode, setSbKwBidMode] = useState('suggested');
  const [sbKwBidDropOpen, setSbKwBidDropOpen] = useState(false);
  const [sbTargetType, setSbTargetType] = useState('keyword');
  const [sbAddedTargetGroups, setSbAddedTargetGroups] = useState([
    { key: 'brand', label: 'Keywords related to your brand', matchType: 'Theme', bid: '29.75', suggBid: 29.75, min: 21.89, max: 45.64 },
    { key: 'landing', label: 'Keywords related to your landing pages', matchType: 'Theme', bid: '29.75', suggBid: 29.75, min: 21.89, max: 45.64 },
  ]);
  const [sbBidAdjTab, setSbBidAdjTab] = useState('placements');
  const [sbTopOfSearch, setSbTopOfSearch] = useState('0');
  const [sbRestOfSearch, setSbRestOfSearch] = useState('0');
  const [sbProductDetailPages, setSbProductDetailPages] = useState('0');
  const [sbAudienceIncrease, setSbAudienceIncrease] = useState(true);
  const [sbAudienceAdj, setSbAudienceAdj] = useState('0');
  const [sbCostControlEnabled, setSbCostControlEnabled] = useState(true);
  const [sbTargetCPC, setSbTargetCPC] = useState('10');
  // Reserve share of voice
  const [sovBrand, setSovBrand] = useState('SoundMax');
  const [sovKwTab, setSovKwTab] = useState('suggested');
  const [sovAddedKws, setSovAddedKws] = useState([]);
  const [sovKwInput, setSovKwInput] = useState('');
  const [sovKwError, setSovKwError] = useState(null);
  const [sovBudget, setSovBudget] = useState('');
  // Store Spotlight ad settings
  const [sbSSStore, setSbSSStore] = useState('');
  const [sbSSAdName, setSbSSAdName] = useState('');
  const [sbSSSection, setSbSSSection] = useState(null);
  const [sbSSHeadline, setSbSSHeadline] = useState('');
  const [sbSSLogoChangeOpen, setSbSSLogoChangeOpen] = useState(false);
  const [sbSSSpecsOpen, setSbSSSpecsOpen] = useState(false);
  const [sbSSPreviewFormatOpen, setSbSSPreviewFormatOpen] = useState(false);
  const [sbSSPreviewPage, setSbSSPreviewPage] = useState(1);
  const [sbSSPreviewFormat, setSbSSPreviewFormat] = useState('mobile-top');
  const [sbSSStorePages, setSbSSStorePages] = useState([
    { pageId: 'earbuds', displayName: 'Earbuds', imageType: null },
    { pageId: 'headphones', displayName: 'Headphones', imageType: null },
    { pageId: 'gaming', displayName: 'Gaming', imageType: null },
  ]);
  const [sbSSImgPickerIdx, setSbSSImgPickerIdx] = useState(null);
  const [sbSSImgPickerQuery, setSbSSImgPickerQuery] = useState('');
  // ── Video Ad state ──
  const [sbVidAdName, setSbVidAdName] = useState('');
  const [sbVidSection, setSbVidSection] = useState(null);
  const [sbVidHeadline, setSbVidHeadline] = useState('');
  const [sbVidFile, setSbVidFile] = useState(null);
  const [sbVidPreviewPage, setSbVidPreviewPage] = useState(1);
  const [sbVidPreviewFormat, setSbVidPreviewFormat] = useState('mobile-search');
  const [sbVidPreviewFormatOpen, setSbVidPreviewFormatOpen] = useState(false);
  const [sbVidLogoChangeOpen, setSbVidLogoChangeOpen] = useState(false);
  const [sbVidSpecsOpen, setSbVidSpecsOpen] = useState(false);
  const [sbVidAddVideoOpen, setSbVidAddVideoOpen] = useState(false);
  const [sbVidProducts, setSbVidProducts] = useState(() => allProducts.slice(0, 3));
  const [sbVidProductPicker, setSbVidProductPicker] = useState(null); // null | 'add' | index (for change)
  const [sbVidProductPickerQuery, setSbVidProductPickerQuery] = useState('');
  const [sbVidProductPickerPage, setSbVidProductPickerPage] = useState(1);
  const [sbVidAddTooltip, setSbVidAddTooltip] = useState(false);
  const [sbVidAddTooltipPos, setSbVidAddTooltipPos] = useState(null);
  const [sbVidProductCarouselIdx, setSbVidProductCarouselIdx] = useState(0);
  const [sbVidPDPProduct, setSbVidPDPProduct] = useState(null); // product selected when landing=product-detail
  const [sbVidPDPSearch, setSbVidPDPSearch] = useState('');
  const [sbVidPDPPage, setSbVidPDPPage] = useState(1);

  // ── SD form ──
  const [sdAdGroupName, setSdAdGroupName] = useState(`Ad group - ${todayDisplay}`);
  const [sdGoal, setSdGoal] = useState('consideration'); // reach | consideration | conversion
  const [sdTargetView, setSdTargetView] = useState(null); // null (category list) | contextual | remarketing | in-market | interest-lifestyle
  const [sdTargetSearch, setSdTargetSearch] = useState('');
  const [sdTargetFilterOpen, setSdTargetFilterOpen] = useState(false);
  const [sdCostControlEnabled, setSdCostControlEnabled] = useState(true);
  const [sdCostControlValue, setSdCostControlValue] = useState('4.00');
  // Default dynamic-segment suggestions Amazon auto-populates before any product is chosen
  const [sdAddedAudiences, setSdAddedAudiences] = useState([
    { key: 'ctx-similar', type: 'Contextual', label: 'Similar to advertised products', desc: 'Shows your ad on pages and products that are contextually similar to the products you are advertising, without relying on shopper browsing or purchase history.', bid: sdPseudoSugg('ctx-similar').sugg.toFixed(2), ...sdPseudoSugg('ctx-similar') },
    { key: 'views-similar', type: 'Views remarketing', label: 'Similar to advertised products', desc: 'Reach shoppers who viewed products similar to the ones you are advertising within the lookback window.', bid: sdPseudoSugg('views-similar').sugg.toFixed(2), ...sdPseudoSugg('views-similar'), lookbackType: 'views', lookbackDays: 30 },
    { key: 'views-advertised', type: 'Views remarketing', label: 'Advertised products', desc: 'Reach shoppers who viewed the exact products you are advertising within the lookback window.', bid: sdPseudoSugg('views-advertised').sugg.toFixed(2), ...sdPseudoSugg('views-advertised'), lookbackType: 'views', lookbackDays: 30 },
    { key: 'purchases-related', type: 'Purchases remarketing', label: 'Related to advertised products', desc: 'Reach shoppers who purchased products related or complementary to the ones you are advertising within the lookback window.', bid: sdPseudoSugg('purchases-related').sugg.toFixed(2), ...sdPseudoSugg('purchases-related'), lookbackType: 'purchases', lookbackDays: 30 },
    { key: 'purchases-advertised', type: 'Purchases remarketing', label: 'Advertised products', desc: 'Reach shoppers who already purchased the exact products you are advertising within the lookback window — useful for replenishment or cross-sell.', bid: sdPseudoSugg('purchases-advertised').sugg.toFixed(2), ...sdPseudoSugg('purchases-advertised'), lookbackType: 'purchases', lookbackDays: 30 },
  ]);
  const [sdAdFormat, setSdAdFormat] = useState('image'); // image | video
  // ── SD targeting drill-down UI state ──
  const [sdCtxTab, setSdCtxTab] = useState('categories'); // categories | individual
  const [sdCtxCatSubTab, setSdCtxCatSubTab] = useState('suggested'); // suggested | browse
  const [sdCtxIndivSubTab, setSdCtxIndivSubTab] = useState('suggested'); // suggested | search | enter-list
  const [sdIndivSearch, setSdIndivSearch] = useState('');
  const [sdIndivEnterList, setSdIndivEnterList] = useState('');
  const [sdAudSubTab, setSdAudSubTab] = useState('suggested'); // suggested | browse
  const [sdLookbackType, setSdLookbackType] = useState('views'); // views | purchases
  const [sdLookbackDays, setSdLookbackDays] = useState(30);
  const [sdLookbackTypeDropOpen, setSdLookbackTypeDropOpen] = useState(false);
  const [sdLookbackDaysDropOpen, setSdLookbackDaysDropOpen] = useState(false);
  const [sdItemLookbackOpen, setSdItemLookbackOpen] = useState(null);
  // Bid mode for the drill-down's "Bid" selector — governs what bid gets assigned to newly
  // added targets. Locked to 'suggested' (with an explanatory tooltip) whenever Cost control
  // is on, since Amazon manages bids automatically in that mode.
  const [sdBidMode, setSdBidMode] = useState('suggested'); // suggested | custom
  const [sdCustomBid, setSdCustomBid] = useState('3.00');
  const [sdBidModeDropOpen, setSdBidModeDropOpen] = useState(false);
  const [sdBidLockTooltipOpen, setSdBidLockTooltipOpen] = useState(false);
  // ── SD Creative state ──
  const [sdCrLogo, setSdCrLogo] = useState(true);
  const [sdCrHeadline, setSdCrHeadline] = useState(false);
  const [sdCrHeadlineText, setSdCrHeadlineText] = useState('');
  const [sdCrImage, setSdCrImage] = useState(false);
  const [sdCrVideoFile, setSdCrVideoFile] = useState(null);
  const [sdCrDrill, setSdCrDrill] = useState(null); // null | 'logo' | 'headline' | 'image' | 'video'
  const [sdCrPreviewIdx, setSdCrPreviewIdx] = useState(0);
  const [sdCrPreviewDropOpen, setSdCrPreviewDropOpen] = useState(false);

  // ── Launch ──
  const handleLaunch = () => {
    if (adGroupMode) {
      // Adding an ad group to an existing campaign
      if (addedProducts.length === 0) return alert('Please add at least one product.');
      const agId = `ag${Date.now()}`;
      addAdGroup({ id: agId, campaignId: paramCampaignId, name: adGroupName, status: 'Enabled', defaultBid: parseFloat(defaultBid), metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } });
      if (effectiveTargetingType === 'Manual' && addedKws.length > 0) {
        addKeywords(addedKws.filter(k => k.type !== 'group').map(k => ({
          adGroupId: agId, campaignId: paramCampaignId, keyword: k.keyword,
          matchType: k.matchType, bid: parseFloat(k.bid), status: 'Enabled',
          metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 },
        })));
      }
      if (addedNegKws.length > 0) {
        addNegativeKeywords(addedNegKws.map(nk => ({ ...nk, adGroupId: agId, campaignId: paramCampaignId })));
      }
      navigate(`/campaigns/${paramCampaignId}`);
      return;
    }

    if (!campaignName) return alert('Please enter a campaign name.');
    if (addedProducts.length === 0) return alert('Please add at least one product.');

    const campaignId = `c${Date.now()}`;
    addCampaign({
      id: campaignId,
      name: campaignName,
      type: campaignType,
      status: 'Enabled',
      targetingType,
      budget: parseFloat(budget),
      budgetType: 'Daily',
      biddingStrategy,
      portfolioId,
      startDate,
      endDate,
      createdAt: today,
      metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 },
    });

    const agId = `ag${Date.now()}`;
    addAdGroup({ id: agId, campaignId, name: adGroupName, status: 'Enabled', defaultBid: parseFloat(defaultBid), metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 } });

    if (effectiveTargetingType === 'Manual' && addedKws.length > 0) {
      addKeywords(addedKws.filter(k => k.type !== 'group').map(k => ({
        adGroupId: agId, campaignId, keyword: k.keyword,
        matchType: k.matchType, bid: parseFloat(k.bid), status: 'Enabled',
        metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 },
      })));
    }

    navigate(`/campaigns/${campaignId}`);
  };

  const handleLaunchSB = () => {
    if (!campaignName.trim()) return alert('Please enter a campaign name.');
    if (sbProducts.length === 0) return alert('Please select at least 1 product for your creative.');
    if (!sbHeadline.trim()) return alert('Please enter a headline for your ad.');
    const campaignId = `c${Date.now()}`;
    addCampaign({
      id: campaignId, name: campaignName, type: 'Sponsored Brands', status: 'Enabled',
      targetingType: 'Manual', budget: parseFloat(budget) || 500, budgetType: sbBudgetType,
      biddingStrategy: biddingStrategy || 'Fixed bid', portfolioId, startDate, endDate,
      adFormat: sbAdFormat,
      sbCreative: { brandName: 'SoundMax', headline: sbHeadline, landingPage: sbLandingPage, products: sbProducts.map(p => p.asin) },
      createdAt: today,
      metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 },
    });
    const kws = addedKws.filter(k => k.type !== 'group');
    if (kws.length > 0) {
      addKeywords(kws.map(k => ({
        adGroupId: null, campaignId, keyword: k.keyword, matchType: k.matchType,
        bid: parseFloat(k.bid) || 25, status: 'Enabled',
        metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 },
      })));
    }
    if (addedNegKws.length > 0) {
      addNegativeKeywords(addedNegKws.map(nk => ({ ...nk, campaignId, adGroupId: null, level: 'Campaign' })));
    }
    navigate(`/campaigns/${campaignId}`);
  };

  const handleLaunchSD = () => {
    if (!campaignName.trim()) return alert('Please enter a campaign name.');
    if (addedProducts.length === 0) return alert('Please add at least 1 product to advertise.');
    if (addedProdTargets.length === 0 && sdAddedAudiences.length === 0) return alert('Please choose at least one audience.');
    const hasContextual = addedProdTargets.length > 0;
    const hasAudiences = sdAddedAudiences.length > 0;
    const campaignId = `c${Date.now()}`;
    addCampaign({
      id: campaignId, name: campaignName, type: 'Sponsored Display', status: 'Enabled',
      targetingType: hasContextual && hasAudiences ? 'Contextual + Audiences' : hasContextual ? 'Contextual' : 'Audiences',
      budget: parseFloat(budget) || 20, budgetType: 'Daily',
      biddingStrategy: sdGoal === 'reach' ? 'Optimize for reach' : sdGoal === 'conversion' ? 'Optimize for conversions' : 'Optimize for page visits',
      costType: sdGoal === 'reach' ? 'VCPM' : 'CPC',
      goal: sdGoal, costControlEnabled: sdCostControlEnabled,
      bid: sdCostControlEnabled ? (parseFloat(sdCostControlValue) || 0) : null,
      portfolioId, startDate, endDate,
      sdCreative: { adFormat: sdAdFormat, products: addedProducts.map(p => p.asin) },
      sdTargets: [
        ...addedProdTargets.map(t => ({ type: 'Contextual', name: t.name, bid: t.bid })),
        ...sdAddedAudiences.map(a => ({ type: 'Audience', name: a.label, bid: a.bid })),
      ],
      createdAt: today,
      metrics: { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0, ctr: 0, cpc: 0, acos: 0, roas: 0, cvr: 0 },
    });
    navigate(`/campaigns/${campaignId}`);
  };

  // ── Product targeting data ──
  const SUGGESTED_CATS = [
    { id: 'over-ear', path: '/Electronics/Headphones, Earbuds & Accessories/Over-Ear Headphones', name: 'Over-Ear Headphones', sugg: null, prodMin: 284, prodMax: 412, brands: ['Sony','JBL','boAt','Sennheiser','Bose','SoundMax','Skullcandy','Jabra'] },
    { id: 'tws', path: '/Electronics/Headphones, Earbuds & Accessories/True Wireless Earbuds', name: 'True Wireless Earbuds', sugg: null, prodMin: 389, prodMax: 521, brands: ['Sony','JBL','boAt','Apple','Samsung','Noise','SoundMax','Skullcandy'] },
    { id: 'gaming-hs', path: '/Electronics/Headphones, Earbuds & Accessories/Gaming Headsets', name: 'Gaming Headsets', sugg: 6.87, suggMin: 5.23, suggMax: 8.44, prodMin: 198, prodMax: 325, brands: ['SoundMax','HyperX','Logitech','Corsair','Razer','boAt'] },
  ];

  const INDIV_SUGGESTED = [
    { id: 'sony-xm5', name: 'Sony WH-1000XM5 Industry Leading Noise Cancelling Wireless Headphones with Auto Noise Cancelling', format: 'Electronics', stars: 4.7, reviews: 12847, price: 24990, originalPrice: 29990, status: 'In stock', asin: 'B09XS7JWHH', sugg: 9.82, suggMin: 7.64, suggMax: 12.26, suggExpanded: 6.54, imgColor: '#111', imgAccent: '#d4002a' },
    { id: 'jbl-660nc', name: 'JBL Live 660NC – Wireless Over-Ear Noise Cancelling Headphones with Long Battery Life and Voice Assistant', format: 'Electronics', stars: 4.4, reviews: 7234, price: 8999, originalPrice: 14999, status: 'In stock', asin: 'B09B8FW7Y9', sugg: 7.43, suggMin: 5.81, suggMax: 9.32, suggExpanded: 4.97, imgColor: '#e05500', imgAccent: '#fff' },
    { id: 'boat-550', name: 'boAt Rockerz 550 Bluetooth On Ear Headphones with Mic, Upto 20 Hours Playback, 50MM Drivers, Padded Ear Cushions', format: 'Electronics', stars: 4.2, reviews: 45231, price: 1299, originalPrice: 3990, status: 'In stock', asin: 'B08QCY3MWF', sugg: null, suggExpanded: null, asinImg: null, imgColor: '#0057b8', imgAccent: '#00c9a7' },
    { id: 'senn-hd450', name: 'Sennheiser HD 450BT Bluetooth 5.0 Wireless Headphone with Active Noise Cancellation, 30-Hour Battery Life', format: 'Electronics', stars: 4.3, reviews: 3812, price: 7990, originalPrice: 11990, status: 'In stock', asin: 'B085RGRPMN', sugg: 8.14, suggMin: 6.23, suggMax: 10.05, suggExpanded: 5.43, imgColor: '#1a1a1a', imgAccent: '#c8c8c8' },
    { id: 'bose-qc45', name: 'Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones – Triple Black', format: 'Electronics', stars: 4.6, reviews: 9102, price: 22900, originalPrice: 26900, status: 'In stock', asin: 'B098FKXT8L', sugg: 10.54, suggMin: 8.32, suggMax: 13.21, suggExpanded: 7.12, imgColor: '#2c2c2c', imgAccent: '#b8963e' },
    { id: 'skull-evo', name: 'Skullcandy Crusher Evo Wireless Over-Ear Headphone with Sensory Bass, 40 Hr Battery, Microphone', format: 'Electronics', stars: 4.1, reviews: 2341, price: 9999, originalPrice: 14999, status: 'In stock', asin: 'B08N3L8YHR', sugg: 6.32, suggMin: 4.87, suggMax: 7.96, suggExpanded: 4.18, imgColor: '#6600cc', imgAccent: '#ff0080' },
    { id: 'jabra-ev85', name: 'Jabra Evolve2 85 Wireless PC Headset – Noise Cancelling Microphone, Stereo Headphones', format: 'Electronics', stars: 4.5, reviews: 1876, price: 39990, originalPrice: 45000, status: 'In stock', asin: 'B09V2XGXR2', sugg: 12.74, suggMin: 9.84, suggMax: 15.93, suggExpanded: 8.62, imgColor: '#003865', imgAccent: '#4db6e4' },
    { id: 'anker-q35', name: 'Soundcore by Anker Life Q35 Multi Mode Active Noise Cancelling Headphones, Bluetooth 5.0, Hi-Res Audio', format: 'Electronics', stars: 4.4, reviews: 6123, price: 5999, originalPrice: 8999, status: 'In stock', asin: 'B08HMWZBXN', sugg: 5.87, suggMin: 4.42, suggMax: 7.34, suggExpanded: 3.94, imgColor: '#00897b', imgAccent: '#fff' },
  ];

  const ALL_CATEGORIES = [
    { id: 'electronics', name: 'Electronics', sugg: null, children: [
      { id: 'headphones-all', name: 'Headphones, Earbuds & Accessories', sugg: 8.42, suggMin: 6.52, suggMax: 10.74, prodMin: 1284, prodMax: 1892, brands: ['Sony','JBL','boAt','Sennheiser','Bose','Samsung','SoundMax','Skullcandy','Jabra','Anker','Noise','OnePlus'], children: [
        { id: 'over-ear-s', name: 'Over-Ear Headphones', sugg: 9.15, suggMin: 7.24, suggMax: 11.44, prodMin: 284, prodMax: 412, brands: ['Sony','JBL','boAt','Sennheiser','Bose','SoundMax','Skullcandy'] },
        { id: 'in-ear-s', name: 'In-Ear Headphones', sugg: 7.23, suggMin: 5.89, suggMax: 8.91, prodMin: 412, prodMax: 634, brands: ['Sony','JBL','boAt','SoundMax','Skullcandy','Noise','Anker'] },
        { id: 'tws-s', name: 'True Wireless Earbuds', sugg: 9.18, suggMin: 7.24, suggMax: 11.52, prodMin: 389, prodMax: 521, brands: ['Sony','JBL','boAt','Apple','Samsung','Noise','SoundMax'] },
        { id: 'gaming-hs-s', name: 'Gaming Headsets', sugg: 6.87, suggMin: 5.23, suggMax: 8.44, prodMin: 198, prodMax: 325, brands: ['SoundMax','HyperX','Logitech','Corsair','Razer','boAt'] },
        { id: 'neckband-s', name: 'Neckband Earphones', sugg: 5.44, suggMin: 4.12, suggMax: 6.80, prodMin: 156, prodMax: 289, brands: ['boAt','Noise','Sony','SoundMax','Sennheiser','OnePlus'] },
      ]},
      { id: 'audio-home', name: 'Audio & Home Theatre', sugg: null, children: [
        { id: 'bt-speakers', name: 'Bluetooth Speakers', sugg: 7.82, suggMin: 5.91, suggMax: 9.78, prodMin: 892, prodMax: 1234, brands: ['Sony','JBL','boAt','Bose','Marshall','Anker'] },
        { id: 'smart-speakers', name: 'Smart Speakers', sugg: 6.23, suggMin: 4.87, suggMax: 7.79, prodMin: 234, prodMax: 389, brands: ['Amazon','Google','Apple','Sony'] },
      ]},
      { id: 'wearable', name: 'Wearable Technology', sugg: null, children: [
        { id: 'smartwatches', name: 'Smart Watches', sugg: 5.47, suggMin: 4.20, suggMax: 6.84, prodMin: 384, prodMax: 612, brands: ['Samsung','Apple','Noise','boAt','Amazfit','Garmin'] },
        { id: 'fitness', name: 'Fitness Trackers', sugg: 4.18, suggMin: 3.12, suggMax: 5.23, prodMin: 198, prodMax: 342, brands: ['Fitbit','Noise','boAt','Samsung','Mi','Amazfit'] },
      ]},
    ]},
    { id: 'computers', name: 'Computers & Accessories', sugg: null, children: [
      { id: 'gaming-acc', name: 'Gaming Accessories', sugg: null, children: [
        { id: 'pc-gaming-hs', name: 'PC Gaming Headsets', sugg: 6.12, suggMin: 4.78, suggMax: 7.65, prodMin: 87, prodMax: 143, brands: ['HyperX','Logitech','Corsair','Razer','SoundMax'] },
      ]},
      { id: 'audio-video-acc', name: 'Audio & Video Accessories', sugg: null, children: [] },
    ]},
    { id: 'music', name: 'Musical Instruments', sugg: null, children: [
      { id: 'studio-hp', name: 'Studio Headphones', sugg: 12.34, suggMin: 9.87, suggMax: 15.43, prodMin: 45, prodMax: 89, brands: ['Sennheiser','Sony','Audio-Technica','SoundMax','AKG'] },
    ]},
    { id: 'sports', name: 'Sports, Fitness & Outdoors', sugg: null, children: [
      { id: 'sports-hp', name: 'Sports & Fitness Headphones', sugg: 6.45, suggMin: 4.89, suggMax: 8.01, prodMin: 212, prodMax: 378, brands: ['Sony','JBL','boAt','SoundMax','Jabra','Plantronics'] },
    ]},
    { id: 'video-games', name: 'Video Games', sugg: null, children: [
      { id: 'vg-accessories', name: 'Gaming Accessories', sugg: null, children: [
        { id: 'vg-headsets', name: 'Console Gaming Headsets', sugg: 7.23, suggMin: 5.64, suggMax: 9.04, prodMin: 112, prodMax: 189, brands: ['SoundMax','Sony','Microsoft','Turtle Beach','HyperX'] },
      ]},
    ]},
  ];

  const addProdTarget = (cat) => {
    if (!addedProdTargets.find(t => t.id === cat.id)) {
      setAddedProdTargets(prev => [...prev, { ...cat, bid: cat.sugg ? cat.sugg.toFixed(2) : '3.00' }]);
    }
  };

  const ptEffBid = (target) =>
    ptBidMode === 'suggested'
      ? (target.sugg ? parseFloat(target.sugg).toFixed(2) : ptCustomBid)
      : ptCustomBid;

  const calcProductsTargeted = (cat) => {
    if (!cat) return '0';
    let min = cat.prodMin, max = cat.prodMax;
    if (refineBrand.length > 0 && cat.brands) {
      const factor = refineBrand.length / cat.brands.length;
      min = Math.round(min * factor * 0.7);
      max = Math.round(max * factor * 0.85);
    }
    if (refinePriceMin || refinePriceMax) { min = Math.round(min * 0.6); max = Math.round(max * 0.75); }
    if (refineStarsMin > 0 || refineStarsMax < 5) { const range = (refineStarsMax - refineStarsMin) / 5; min = Math.round(min * range * 0.9); max = Math.round(max * range); }
    if (refineShipping === 'prime') { min = Math.round(min * 0.55); max = Math.round(max * 0.65); }
    if (refineShipping === 'not-prime') { min = Math.round(min * 0.35); max = Math.round(max * 0.45); }
    return `${min.toLocaleString('en-IN')} – ${max.toLocaleString('en-IN')}`;
  };

  const getIndivImage = (p) => {
    const c = p.imgColor || '#333';
    const a = p.imgAccent || '#ccc';
    return (
      <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="56" height="56" rx="4" fill={c} />
        {/* Headphone arc */}
        <path d={`M14 28 Q14 14 28 14 Q42 14 42 28`} fill="none" stroke={a} strokeWidth="4" strokeLinecap="round" />
        {/* Left ear cup */}
        <rect x="10" y="26" width="8" height="12" rx="4" fill={a} />
        {/* Right ear cup */}
        <rect x="38" y="26" width="8" height="12" rx="4" fill={a} />
        {/* Brand initial */}
        <text x="28" y="50" textAnchor="middle" fontSize="8" fill={a} opacity="0.7" fontFamily="Arial">{p.id.split('-')[0].slice(0,3).toUpperCase()}</text>
      </svg>
    );
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <span style={{ color: '#e47911', fontSize: 13, letterSpacing: -1 }}>
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  };

  useEffect(() => {
    if (sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight') && sbTargetType === 'product') {
      setSbTargetType('keyword');
    }
  }, [sbGoal, sbAdFormat]);

  // Cost control has no effect when the card is hidden (impression-share goal)
  const costControlActive = false;

  // ─────────────────────────────────────────────────────────────────
  // SPONSORED BRANDS SCROLL FORM
  // ─────────────────────────────────────────────────────────────────
  if (campaignType === 'Sponsored Brands' && !adGroupMode) {
    const sbFiltered = allProducts.filter(p =>
      !sbProductSearch ||
      p.name.toLowerCase().includes(sbProductSearch.toLowerCase()) ||
      p.asin.toLowerCase().includes(sbProductSearch.toLowerCase())
    );

    // Ad format mockup SVGs matching real Amazon console illustrations
    const AdFormatMockup = ({ fmt }) => {
      // Reusable shoe silhouette (side view sneaker)
      const Shoe = ({ x, y, w = 52, flip = false, color = '#c8c8c8' }) => {
        const s = w / 52;
        const tx = flip ? x + w : x;
        const sc = flip ? `-${s},${s}` : `${s},${s}`;
        return (
          <g transform={`translate(${tx},${y}) scale(${sc})`}>
            {/* sole */}
            <path d="M2,32 Q0,36 4,38 L46,38 Q52,38 52,34 L52,30 Q48,28 40,29 L12,29 Q6,28 2,32Z" fill={color} opacity="0.7" />
            {/* upper body */}
            <path d="M8,28 Q6,18 14,12 Q20,8 28,10 Q38,10 44,16 Q50,22 48,28 L8,28Z" fill={color} />
            {/* tongue */}
            <path d="M18,28 L18,14 Q22,11 26,12 L26,28Z" fill={color} opacity="0.5" />
            {/* laces */}
            <line x1="20" y1="18" x2="30" y2="17" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <line x1="20" y1="22" x2="32" y2="21" stroke="white" strokeWidth="1.5" opacity="0.6" />
          </g>
        );
      };
      // T-shirt silhouette
      const Tshirt = ({ x, y, w = 44, color = '#c8c8c8' }) => {
        const s = w / 44;
        return (
          <g transform={`translate(${x},${y}) scale(${s},${s})`}>
            <path d="M14,0 Q16,6 22,8 Q28,6 30,0 L44,8 L38,16 L32,12 L32,40 L12,40 L12,12 L6,16 L0,8Z" fill={color} />
          </g>
        );
      };
      // Cap/hat silhouette
      const Cap = ({ x, y, w = 48, color = '#c8c8c8' }) => {
        const s = w / 48;
        return (
          <g transform={`translate(${x},${y}) scale(${s},${s})`}>
            {/* brim */}
            <path d="M0,30 Q6,36 48,30 L44,26 Q30,22 4,26Z" fill={color} opacity="0.7" />
            {/* crown */}
            <path d="M6,26 Q8,8 24,4 Q40,8 42,26Z" fill={color} />
            {/* button on top */}
            <circle cx="24" cy="5" r="3" fill={color} opacity="0.6" />
          </g>
        );
      };
      // Star row
      const Stars = ({ x, y, full = 4 }) => (
        <g>
          {[0,1,2,3,4].map(i => (
            <text key={i} x={x + i * 10} y={y} fontSize="9" fill={i < full ? '#e47911' : '#ddd'}>★</text>
          ))}
        </g>
      );
      // Prime badge
      const Prime = ({ x, y }) => (
        <g>
          <rect x={x} y={y} width="32" height="10" rx="2" fill="#00A8E0" />
          <text x={x + 5} y={y + 8} fontSize="7" fill="white" fontStyle="italic" fontWeight="bold">prime</text>
        </g>
      );

      if (fmt === 'product-collection') return (
        <svg viewBox="0 0 300 165" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect width="300" height="165" fill="white" />
          {/* top brand/headline bar */}
          <rect x="6" y="6" width="22" height="22" rx="2" fill="#d8d8d8" />
          <rect x="34" y="9" width="80" height="7" rx="2" fill="#d0d0d0" />
          <rect x="34" y="20" width="55" height="5" rx="2" fill="#e0e0e0" />
          {/* card 1 */}
          <rect x="6" y="34" width="88" height="124" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          <rect x="10" y="38" width="80" height="70" rx="2" fill="#f0f0f0" />
          <Shoe x={14} y={46} w={58} color="#b8b8b8" />
          <Stars x={10} y={120} full={5} />
          <rect x="10" y="124" width="42" height="5" rx="2" fill="#d8d8d8" />
          <Prime x={10} y={132} />
          <rect x="10" y="146" width="65" height="5" rx="2" fill="#ebebeb" />
          {/* card 2 */}
          <rect x="106" y="34" width="88" height="124" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          <rect x="110" y="38" width="80" height="70" rx="2" fill="#f0f0f0" />
          <Shoe x={116} y={46} w={58} color="#b8b8b8" flip />
          <Stars x={110} y={120} full={4} />
          <rect x="110" y="124" width="42" height="5" rx="2" fill="#d8d8d8" />
          <Prime x={110} y={132} />
          <rect x="110" y="146" width="65" height="5" rx="2" fill="#ebebeb" />
          {/* card 3 — partially visible */}
          <rect x="206" y="34" width="88" height="124" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          <rect x="210" y="38" width="80" height="70" rx="2" fill="#f0f0f0" />
          <Shoe x={214} y={46} w={58} color="#b8b8b8" />
          <Stars x={210} y={120} full={4} />
          <rect x="210" y="124" width="42" height="5" rx="2" fill="#d8d8d8" />
          <Prime x={210} y={132} />
          {/* scroll indicator */}
          <rect x="6" y="161" width="288" height="3" rx="1.5" fill="#eee" />
          <rect x="6" y="161" width="96" height="3" rx="1.5" fill="#bbb" />
        </svg>
      );

      if (fmt === 'store-spotlight') return (
        <svg viewBox="0 0 300 165" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect width="300" height="165" fill="white" />
          {/* top brand bar */}
          <rect x="6" y="6" width="22" height="22" rx="2" fill="#d8d8d8" />
          <rect x="34" y="9" width="70" height="7" rx="2" fill="#d0d0d0" />
          <rect x="34" y="20" width="45" height="5" rx="2" fill="#e0e0e0" />
          {/* 3 store-page cards */}
          {/* Card 1 — shoe */}
          <rect x="6" y="34" width="88" height="124" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          <rect x="10" y="38" width="80" height="84" rx="2" fill="#f0f0f0" />
          <Shoe x={16} y={52} w={60} color="#b8b8b8" />
          <rect x="10" y="128" width="60" height="6" rx="2" fill="#d0d0d0" />
          <rect x="10" y="138" width="44" height="5" rx="2" fill="#e0e0e0" />
          <rect x="10" y="147" width="52" height="5" rx="2" fill="#ebebeb" />
          {/* Card 2 — t-shirt */}
          <rect x="106" y="34" width="88" height="124" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          <rect x="110" y="38" width="80" height="84" rx="2" fill="#f0f0f0" />
          <Tshirt x={128} y={50} w={44} color="#b8b8b8" />
          <rect x="110" y="128" width="60" height="6" rx="2" fill="#d0d0d0" />
          <rect x="110" y="138" width="44" height="5" rx="2" fill="#e0e0e0" />
          <rect x="110" y="147" width="52" height="5" rx="2" fill="#ebebeb" />
          {/* Card 3 — cap */}
          <rect x="206" y="34" width="88" height="124" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          <rect x="210" y="38" width="80" height="84" rx="2" fill="#f0f0f0" />
          <Cap x={216} y={52} w={60} color="#b8b8b8" />
          <rect x="210" y="128" width="60" height="6" rx="2" fill="#d0d0d0" />
          <rect x="210" y="138" width="44" height="5" rx="2" fill="#e0e0e0" />
          <rect x="210" y="147" width="52" height="5" rx="2" fill="#ebebeb" />
        </svg>
      );

      // Video
      return (
        <svg viewBox="0 0 300 165" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <rect width="300" height="165" fill="white" />
          {/* main video player — left 2/3 */}
          <rect x="6" y="6" width="196" height="153" rx="3" fill="#d4d4d4" />
          {/* play button circle + triangle */}
          <circle cx="104" cy="83" r="22" fill="rgba(255,255,255,0.4)" />
          <polygon points="97,74 97,92 115,83" fill="rgba(255,255,255,0.92)" />
          {/* right sidebar product card */}
          <rect x="210" y="6" width="84" height="153" rx="3" fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
          {/* product image area */}
          <rect x="214" y="10" width="76" height="92" rx="2" fill="#ececec" />
          {/* shoe at bottom of image area (matches real console) */}
          <Shoe x={218} y={42} w={62} color="#b8b8b8" />
          {/* text + stars + prime below image */}
          <rect x="214" y="108" width="60" height="6" rx="2" fill="#d0d0d0" />
          <Stars x={214} y={124} full={4} />
          <rect x="214" y="128" width="44" height="5" rx="2" fill="#ddd" />
          <Prime x={214} y={138} />
          {/* second small shoe peeking at bottom right */}
          <rect x="248" y="148" width="44" height="14" rx="2" fill="#ececec" />
          <Shoe x={250} y={147} w={36} color="#c0c0c0" />
        </svg>
      );
    };

    return (
      <div className="ccs-root">
        {/* ── SB Topbar ── */}
        <div className="ccs-topbar">
          <div className="ccs-topbar-left">
            <button className="ccs-topbar-close" onClick={() => navigate('/')}><X size={16} /></button>
            <span className="ccs-topbar-title">New campaign</span>
          </div>
          <div className="ccs-topbar-right">
            <button className="link-btn ccs-back-link" onClick={() => navigate('/create-campaign')}>
              Go back to campaigns
            </button>
            <button className="btn btn-secondary">Save as draft</button>
            <button className="btn btn-dark" onClick={handleLaunchSB}>Submit for review</button>
          </div>
        </div>

        {/* ── SB Body (no sidebar — full-width scroll like real console) ── */}
        <div className="ccs-body" style={{ display: 'block', maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>

          {/* ═══ CAMPAIGN SECTION ═══ */}
          <div className="ccs-section-title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Campaign</div>

          {/* Goals */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Goals <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> Learn about goals</a>
            </div>
            <div className="ccs-card-body">
              <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                Choose a campaign outcome that aligns with your business goals. We will make bidding and targeting recommendations to help achieve this outcome.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { key: 'drive-visits', label: 'Drive page visits', desc: 'Drive traffic to your landing page and detail page.', metric: 'Success metric: Clicks', cost: 'Cost type: Cost per click (CPC)' },
                  { key: 'impression-share', label: 'Grow brand impression share', desc: 'Show your ads in the top-of-search placement to shoppers who search for your brand or within your brand categories.', metric: 'Success metric: Top-of-search impression share (IS)', cost: 'Cost type: Cost per 1,000 viewable impressions (VCPM)' },
                  { key: 'share-of-voice', label: 'Reserve share of voice', desc: 'Reach shoppers in the top-of-search placement to increase brand visibility and share of voice.', metric: 'Success metric: Top-of-search impression share', cost: 'Cost type: Fixed price', badge: 'New' },
                ].map(g => (
                  <label key={g.key} style={{
                    display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer',
                    padding: '14px 16px', borderRadius: 4,
                    border: sbGoal === g.key ? '2px solid #0073bb' : '1px solid var(--amazon-border)',
                    background: sbGoal === g.key ? '#f0f7ff' : 'white',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="radio" name="sbGoal" value={g.key} checked={sbGoal === g.key} onChange={() => { if (g.key !== sbGoal) { setSbGoalPending(g.key); setSbGoalModalOpen(true); } }} style={{ accentColor: '#0073bb', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</span>
                      {g.badge && <span style={{ fontSize: 10, padding: '1px 5px', background: '#007600', color: 'white', borderRadius: 3 }}>{g.badge}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4, paddingLeft: 22 }}>{g.desc}</div>
                    <div style={{ fontSize: 11, color: '#777', paddingLeft: 22 }}>{g.metric}</div>
                    <div style={{ fontSize: 11, color: '#777', paddingLeft: 22 }}>{g.cost}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Settings</span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> See campaign settings guidance</a>
            </div>
            {sbGoal !== 'share-of-voice' ? (
              <div className="ccs-card-body" style={{ maxWidth: 700 }}>
                <div className="ccs-field">
                  <label className="ccs-label">Campaign name <InfoIcon /></label>
                  <input className="ccs-input-full" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder={`Campaign - ${today}`} />
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Portfolio <InfoIcon /></label>
                  <div className="ccs-select-wrap" style={{ width: 220 }}>
                    <select className="ccs-input-full" value={portfolioId} onChange={e => setPortfolioId(e.target.value)}>
                      <option value="">No Portfolio</option>
                      <option value="p1">Main Products Portfolio</option>
                      <option value="p2">Competitor Targeting Portfolio</option>
                    </select>
                    <ChevronDown size={14} className="ccs-select-chevron" />
                  </div>
                </div>
                <div className="ccs-date-row" style={{ marginTop: 14 }}>
                  <div className="ccs-field">
                    <label className="ccs-label">Start <InfoIcon /></label>
                    <div className="ccs-date-input-wrap">
                      <span className="ccs-date-icon">📅</span>
                      <input type="date" className="ccs-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="ccs-field">
                    <label className="ccs-label">End <InfoIcon /></label>
                    <div className="ccs-date-input-wrap">
                      <span className="ccs-date-icon">📅</span>
                      <input type="date" className="ccs-date-input" value={endDate} onChange={e => { setEndDate(e.target.value); if (!e.target.value && sbBudgetType === 'Lifetime') setSbBudgetType('Daily'); }} />
                      {!endDate && <span className="ccs-no-end">No end date</span>}
                    </div>
                  </div>
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Country</label>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>India</div>
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Budget <InfoIcon /></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ccs-bid-input-wrap">
                      <span className="ccs-bid-prefix">₹</span>
                      <input type="number" className="ccs-bid-input" value={budget} onChange={e => { const v = parseFloat(e.target.value); setBudget(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 140 }} />
                    </div>
                    <div style={{ position: 'relative', userSelect: 'none' }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbBudgetDropOpen(false); }} tabIndex={-1}>
                      <div onClick={() => setSbBudgetDropOpen(o => !o)} style={{ width: 110, height: 32, border: '1px solid #adb5bd', borderRadius: 4, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', cursor: 'pointer', fontSize: 13, color: '#333' }}>
                        <span>{sbBudgetType}</span><ChevronDown size={13} color="#555" />
                      </div>
                      {sbBudgetDropOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 300, background: 'white', border: '1px solid #adb5bd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: 110, marginTop: 2 }}>
                          {['Daily', 'Lifetime'].map(bt => {
                            const isDisabled = bt === 'Lifetime' && !endDate;
                            return (
                              <div key={bt} style={{ position: 'relative' }} onMouseEnter={() => isDisabled && setSbLifetimeTooltip(true)} onMouseLeave={() => setSbLifetimeTooltip(false)}>
                                <div onClick={() => { if (isDisabled) return; setSbBudgetType(bt); setSbBudgetDropOpen(false); }} style={{ padding: '7px 12px', fontSize: 13, color: isDisabled ? '#aaa' : '#333', cursor: isDisabled ? 'not-allowed' : 'pointer', background: sbBudgetType === bt ? '#f0f7ff' : 'white' }} onMouseOver={e => { if (!isDisabled) e.currentTarget.style.background = '#f5f5f5'; }} onMouseOut={e => { e.currentTarget.style.background = sbBudgetType === bt ? '#f0f7ff' : 'white'; }}>{bt}</div>
                                {isDisabled && sbLifetimeTooltip && (
                                  <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: '#1e2b3c', color: 'white', padding: '10px 14px', borderRadius: 6, fontSize: 13, width: 290, zIndex: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'normal' }}>
                                    Lifetime budget is not available for a campaign without an end date.
                                    <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1e2b3c' }} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Minimum ₹100</small>
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Brand <InfoIcon /></label>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>SoundMax</div>
                </div>
              </div>
            ) : (() => {
              const SOV_KWS = ['soundmax headphones'];
              const handleSovAddKw = (addSovAddedKws) => {
                const lines = sovKwInput.split('\n').map(l => l.trim()).filter(Boolean);
                const passed = [], failed = [];
                lines.forEach(kw => {
                  if (kw.toLowerCase().includes('soundmax')) passed.push(kw);
                  else failed.push({ kw, reason: 'Not trademarked' });
                });
                if (passed.length) addSovAddedKws(prev => [...prev, ...passed.filter(k => !prev.some(a => a.kw === k)).map(k => ({ kw: k, matchType: 'Exact' }))]);
                if (failed.length) {
                  const BOM = '﻿';
                  setSovKwError({ added: passed.length, total: lines.length, failed, download: () => {
                    const rows = [['Keyword', 'Status', 'Reason'], ...failed.map(f => [f.kw, 'Failed', f.reason])];
                    const csv = BOM + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob); const a = document.createElement('a');
                    a.href = url; a.download = 'keyword_reservation_report.csv'; a.click(); URL.revokeObjectURL(url);
                  }});
                } else { setSovKwError(null); }
                setSovKwInput('');
              };
              return (
              <>
              <div className="ccs-card-body" style={{ maxWidth: 700 }}>
                <div className="ccs-field">
                  <label className="ccs-label">Campaign name <InfoIcon /></label>
                  <input className="ccs-input-full" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder={`Campaign - ${today}`} />
                </div>
                <div className="ccs-date-row" style={{ marginTop: 14 }}>
                  <div className="ccs-field">
                    <label className="ccs-label">Start <InfoIcon /></label>
                    <div className="ccs-date-input-wrap"><span className="ccs-date-icon">📅</span><input type="date" className="ccs-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                  </div>
                  <div className="ccs-field">
                    <label className="ccs-label">End <InfoIcon /></label>
                    <div className="ccs-date-input-wrap"><span className="ccs-date-icon">📅</span><input type="date" className="ccs-date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />{!endDate && <span className="ccs-no-end">No end date</span>}</div>
                  </div>
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Country</label>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>India</div>
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Brand <InfoIcon /></label>
                  <div className="ccs-select-wrap" style={{ width: 160 }}>
                    <select className="ccs-input-full" value={sovBrand} onChange={e => setSovBrand(e.target.value)}>
                      <option value="all">All</option>
                      <option value="SoundMax">SoundMax</option>
                    </select>
                    <ChevronDown size={14} className="ccs-select-chevron" />
                  </div>
                </div>
              </div>

              {/* Keyword reservation */}
              <div style={{ borderTop: '1px solid var(--amazon-border)', padding: '16px 20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Keyword reservation <InfoIcon /></span>
                  <a href="https://advertising.amazon.in/help/G86SD7HK6NHHRB9B" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#0066c0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #0066c0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>?</span>
                    Learn about reserving keywords
                  </a>
                </div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 16 }}>
                  You can reserve keywords related to any of your brands. Based on your brand selection, we have suggested some keywords that are eligible for reservation, listed in order of search volume. You will need a budget of at least ₹5,000 and at least 5 keywords.
                </p>
                {/* Two-panel table */}
                <div style={{ display: 'flex', border: '1px solid var(--amazon-border)', borderRadius: 4, overflow: 'hidden' }}>
                  {/* Left panel */}
                  <div style={{ flex: '0 0 50%', minWidth: 0, borderRight: '1px solid var(--amazon-border)' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--amazon-border)' }}>
                      {[['suggested','Suggested'],['enter-list','Enter list'],['upload-file','Upload file']].map(([k,l]) => (
                        <button key={k} onClick={() => { setSovKwTab(k); setSovKwError(null); }} style={{ padding: '10px 18px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', borderBottom: sovKwTab === k ? '2px solid #0073bb' : '2px solid transparent', color: sovKwTab === k ? '#0073bb' : '#666', fontWeight: sovKwTab === k ? 600 : 400 }}>{l}</button>
                      ))}
                    </div>
                    {sovKwTab === 'suggested' && (
                      <div style={{ minHeight: 240 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#555', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                          <span>Keyword</span><span>Match type <InfoIcon /></span>
                          <button className="link-btn" style={{ fontSize: 12, color: '#0073bb', textAlign: 'right' }} onClick={() => setSovAddedKws(SOV_KWS.map(k => ({ kw: k, matchType: 'Exact' })))}>Add All</button>
                        </div>
                        {SOV_KWS.map(kw => {
                          const isAdded = sovAddedKws.some(a => a.kw === kw);
                          return (
                            <div key={kw} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px', padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                              <span>{kw}</span><span style={{ color: '#666' }}>Exact</span>
                              {isAdded ? <span style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>Added</span>
                                : <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }} onClick={() => setSovAddedKws(p => [...p, { kw, matchType: 'Exact' }])}>Add</button>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {sovKwTab === 'enter-list' && (
                      <div style={{ padding: 16 }}>
                        <textarea value={sovKwInput} onChange={e => { setSovKwInput(e.target.value); setSovKwError(null); }} placeholder="Enter keywords, one per line" style={{ width: '100%', minHeight: 200, border: '1px solid #ccc', borderRadius: 4, padding: 10, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
                        {sovKwError && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 13 }}>
                            <span style={{ color: '#c40000', fontWeight: 700 }}>!</span>
                            <span style={{ color: '#c40000' }}>{sovKwError.added}/{sovKwError.total} keywords were added successfully.</span>
                            <button className="link-btn" style={{ color: '#0066c0', fontSize: 13 }} onClick={sovKwError.download}>Download report</button>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                          <button onClick={() => handleSovAddKw(setSovAddedKws)} style={{ padding: '7px 20px', borderRadius: 20, border: '1px solid #ccc', background: '#f5f5f5', fontSize: 13, cursor: sovKwInput.trim() ? 'pointer' : 'not-allowed', color: sovKwInput.trim() ? '#333' : '#aaa' }} disabled={!sovKwInput.trim()}>Add keywords</button>
                        </div>
                      </div>
                    )}
                    {sovKwTab === 'upload-file' && (
                      <div style={{ padding: 24, textAlign: 'center', color: '#666', fontSize: 13 }}>
                        <div style={{ marginBottom: 12 }}>Upload a .csv or .txt file with one keyword per line.</div>
                        <input type="file" accept=".csv,.txt" style={{ fontSize: 13 }} />
                      </div>
                    )}
                  </div>
                  {/* Right panel */}
                  <div style={{ flex: '0 0 50%', minWidth: 0 }}>
                    <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--amazon-border)' }}>
                      <strong style={{ fontSize: 13 }}>{sovAddedKws.length} added</strong>
                      {sovAddedKws.length > 0 && <button className="link-btn" style={{ fontSize: 12, color: '#0073bb' }} onClick={() => setSovAddedKws([])}>Remove all</button>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 24px', padding: '8px 16px', fontSize: 12, color: '#555', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>
                      <span>Keyword</span><span>Match type <InfoIcon /></span><span />
                    </div>
                    {sovAddedKws.map((a, i) => (
                      <div key={a.kw} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 24px', padding: '8px 16px', fontSize: 13, borderBottom: '1px solid #f8f8f8', alignItems: 'center' }}>
                        <span style={{ wordBreak: 'break-word' }}>{a.kw}</span>
                        <span style={{ fontSize: 12, color: '#555' }}>{a.matchType}</span>
                        <button onClick={() => setSovAddedKws(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Get price for campaign */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <button disabled style={{ padding: '8px 24px', borderRadius: 20, border: '1px solid #ccc', background: '#f5f5f5', fontSize: 13, cursor: 'not-allowed', color: '#aaa' }}>Get price for campaign</button>
                </div>
              </div>
              </>
              );
            })()}
          </div>

          {/* ═══ AD GROUP AND AD SECTION ═══ */}
          {sbGoal !== 'share-of-voice' && <>
          <div className="ccs-section-title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, marginTop: 32 }}>Ad group and ad</div>

          {/* Ad group */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Ad group <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to choose an ad format</a>
            </div>
            <div className="ccs-card-body">
              <div className="ccs-field" style={{ maxWidth: 460, marginBottom: 24 }}>
                <label className="ccs-label">Ad group name <InfoIcon /></label>
                <input className="ccs-input-full" value={sbAdGroupName}
                  onChange={e => setSbAdGroupName(e.target.value)}
                  placeholder={`Ad group - ${today}`} />
              </div>

              {/* Ad format cards */}
              <div className="ccs-field">
                <label className="ccs-label">Ad format <InfoIcon /></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
                  {[
                    { key: 'product-collection', label: 'Collections', badge: 'New', desc: 'Display a collection of products relevant to shopper interests.' },
                    { key: 'store-spotlight', label: 'Store spotlight', badge: null, desc: 'Promote your product categories or pages within your Brand Store on Amazon.' },
                    { key: 'video', label: 'Video', badge: null, desc: 'Use video to promote your brand and products.' },
                  ].map(fmt => (
                    <div key={fmt.key} onClick={() => setSbAdFormat(fmt.key)} style={{
                      cursor: 'pointer', borderRadius: 4, overflow: 'hidden',
                      border: sbAdFormat === fmt.key ? '2px solid #0073bb' : '1px solid var(--amazon-border)',
                      background: sbAdFormat === fmt.key ? '#f0f7ff' : 'white',
                    }}>
                      <div style={{ padding: '12px 14px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt.label}</span>
                        {fmt.badge && (
                          <span style={{ fontSize: 10, padding: '1px 6px', background: '#5c4ee5', color: 'white', borderRadius: 12, fontWeight: 600 }}>{fmt.badge}</span>
                        )}
                      </div>
                      <div style={{ height: 140, overflow: 'hidden', padding: '4px 8px' }}>
                        <AdFormatMockup fmt={fmt.key} />
                      </div>
                      <div style={{ padding: '8px 14px 14px', fontSize: 12, color: '#555', lineHeight: 1.4 }}>{fmt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection type — only for product-collection */}
              {sbAdFormat === 'product-collection' && (
                <div className="ccs-field" style={{ marginTop: 24 }}>
                  <label className="ccs-label">Collection type <InfoIcon /></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10, maxWidth: 600 }}>
                    {[
                      { key: 'automatic', label: 'Automatic', badge: 'Beta', desc: 'We will create the most relevant collection of products from your catalogue, based on your keyword targets and shopper queries.' },
                      { key: 'manual', label: 'Manual', badge: null, desc: 'Choose related products to feature in your collection.' },
                    ].map(ct => (
                      <label key={ct.key} onClick={() => setSbCollectionType(ct.key)} style={{
                        display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer',
                        padding: '14px 16px', borderRadius: 4,
                        border: sbCollectionType === ct.key ? '2px solid #0073bb' : '1px solid var(--amazon-border)',
                        background: sbCollectionType === ct.key ? '#f0f7ff' : 'white',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="radio" name="sbCollType" checked={sbCollectionType === ct.key} onChange={() => setSbCollectionType(ct.key)} style={{ accentColor: '#0073bb', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{ct.label}</span>
                          {ct.badge && <span style={{ fontSize: 10, padding: '1px 6px', background: '#888', color: 'white', borderRadius: 12 }}>{ct.badge}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4, paddingLeft: 22 }}>{ct.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Landing page — store spotlight */}
              {sbAdFormat === 'store-spotlight' && (
                <div className="ccs-field" style={{ marginTop: 24 }}>
                  <label className="ccs-label">Landing page</label>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>
                    Store on Amazon (must have four or more pages, each with one or more unique products)
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label className="ccs-label" style={{ marginBottom: 6 }}>Choose a Store</label>
                    <div className="ccs-select-wrap" style={{ width: 220 }}>
                      <select className="ccs-input-full" value={sbSSStore} onChange={e => { setSbSSStore(e.target.value); setSbSSSection(null); }}>
                        <option value="">-- Select a store --</option>
                        <option value="SoundMax">SoundMax</option>
                      </select>
                      <ChevronDown size={14} className="ccs-select-chevron" />
                    </div>
                  </div>
                </div>
              )}

              {/* Landing page — video */}
              {sbAdFormat === 'video' && (
                <div className="ccs-field" style={{ marginTop: 24 }}>
                  <label className="ccs-label">Landing page</label>
                  <div style={{ background: '#f0f7ff', border: '1px solid #c8e0f5', borderRadius: 4, padding: '10px 14px', marginTop: 8, fontSize: 12, color: '#0066a2', display: 'flex', gap: 8 }}>
                    <span>✦</span>
                    <span>Ads using Brand Stores as Sponsored Brands video landing pages see an average of 68% higher Branded Search Rates compared to those using a Product Detail Page.</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {[
                      { key: 'store', label: 'Store on Amazon', desc: 'Video and Store byline link to Brand Store. Product link to product detail pages.' },
                      { key: 'product-detail', label: 'Product detail page', desc: '' },
                    ].map(lp => {
                      const isDisabled = lp.key === 'product-detail' && sbGoal === 'impression-share';
                      return (
                      <div key={lp.key} style={{ position: 'relative', marginBottom: 12 }}>
                      <label className="ccs-radio-row" style={{ alignItems: 'flex-start', opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                        <input type="radio" name="sbVideoLanding" checked={sbLandingPage === lp.key} onChange={() => { if (!isDisabled) setSbLandingPage(lp.key); }} disabled={isDisabled} style={{ marginTop: 3 }} />
                        <div>
                          <div className="ccs-radio-label" style={{ color: isDisabled ? '#999' : undefined }}>{lp.label}</div>
                          {isDisabled && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Not available with Grow brand impression share outcome.</div>}
                          {lp.desc && !isDisabled && <div className="ccs-radio-desc">{lp.desc}</div>}
                          {lp.key === 'store' && sbLandingPage === 'store' && (
                            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                              <div>
                                <label className="ccs-label" style={{ marginBottom: 6 }}>Choose a Store</label>
                                <div className="ccs-select-wrap" style={{ width: 180 }}>
                                  <select className="ccs-input-full"><option>SoundMax</option></select>
                                  <ChevronDown size={14} className="ccs-select-chevron" />
                                </div>
                              </div>
                              <div>
                                <label className="ccs-label" style={{ marginBottom: 6 }}>Choose a page</label>
                                <div className="ccs-select-wrap" style={{ width: 160 }}>
                                  <select className="ccs-input-full">
                                    <option>Home</option>
                                    <option>Headphones</option>
                                    <option>Earbuds</option>
                                    <option>Gaming</option>
                                  </select>
                                  <ChevronDown size={14} className="ccs-select-chevron" />
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()} style={{ fontSize: 12 }}>See page ↗</a>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Video PDP Product picker ── */}
          {sbAdFormat === 'video' && sbLandingPage === 'product-detail' && (() => {
            const PDP_PER_PAGE = 10;
            const pdpFiltered = allProducts.filter(p =>
              !sbVidPDPSearch || p.name.toLowerCase().includes(sbVidPDPSearch.toLowerCase()) || p.asin.toLowerCase().includes(sbVidPDPSearch.toLowerCase())
            );
            const pdpTotalPages = Math.max(1, Math.ceil(pdpFiltered.length / PDP_PER_PAGE));
            const pdpPage = Math.min(sbVidPDPPage, pdpTotalPages);
            const pdpVisible = pdpFiltered.slice((pdpPage - 1) * PDP_PER_PAGE, pdpPage * PDP_PER_PAGE);
            return (
              <div className="ccs-card" style={{ marginBottom: 16, border: sbVidPDPProduct ? '1px solid var(--amazon-border)' : '1px solid #e07b7b' }}>
                <div className="ccs-card-header">
                  <span className="ccs-card-heading">Products <InfoIcon /></span>
                  <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to add products to your campaign</a>
                </div>
                <div style={{ fontSize: 13, color: '#555', padding: '0 20px 10px' }}>Choose related products to feature in your ad.</div>
                <div style={{ display: 'flex', borderTop: '1px solid #f0f0f0' }}>
                  {/* Left: search + list */}
                  <div style={{ flex: 1, borderRight: '1px solid #f0f0f0' }}>
                    {/* Search bar */}
                    <div style={{ padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden' }}>
                        <input type="text" value={sbVidPDPSearch} onChange={e => { setSbVidPDPSearch(e.target.value); setSbVidPDPPage(1); }}
                          placeholder="Search by product name or ASIN"
                          style={{ flex: 1, border: 'none', outline: 'none', padding: '7px 10px', fontSize: 13 }} />
                        <div style={{ padding: '7px 10px', background: '#f5f5f5', borderLeft: '1px solid #ccc', cursor: 'pointer' }}>
                          <Search size={14} color="#555" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', fontSize: 13, background: '#f5f5f5', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {allProducts[0]?.category || 'All'} <ChevronDown size={12} />
                      </div>
                    </div>
                    {/* Product list */}
                    <div>
                      {pdpVisible.map(p => {
                        const isAdded = sbVidPDPProduct?.asin === p.asin;
                        const isDisabled = sbVidPDPProduct && !isAdded;
                        return (
                          <div key={p.asin} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f5f5f5', opacity: isDisabled ? 0.45 : 1 }}>
                            <div style={{ width: 48, height: 48, flexShrink: 0, border: '1px solid #e8e8e8', borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                              {PRODUCT_IMAGES[p.imageType] || PRODUCT_IMAGES['over-ear-black']}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: '#0073bb', fontWeight: 500, lineHeight: 1.4, marginBottom: 3, cursor: 'pointer' }}
                                title={p.name}>{p.name.length > 90 ? p.name.slice(0, 90) + '…' : p.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
                                <span style={{ color: '#e47911' }}>{'★'.repeat(Math.round(p.rating))}</span>
                                <span style={{ color: '#0073bb' }}>({p.reviews?.toLocaleString('en-IN')})</span>
                                <span>· Price may vary by location ·</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: p.status === 'Active' || p.status === 'In stock' ? '#007600' : '#c40000' }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'Active' || p.status === 'In stock' ? '#007600' : '#c40000', display: 'inline-block' }} />
                                  {p.status === 'Active' ? 'In stock' : p.status}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>ASIN: {p.asin}</div>
                            </div>
                            <button
                              disabled={isDisabled}
                              onClick={() => !isAdded && !isDisabled && setSbVidPDPProduct(p)}
                              style={{ fontSize: 13, padding: '5px 14px', borderRadius: 3, border: '1px solid #ccc', background: isAdded ? '#f5f5f5' : 'white', color: isAdded ? '#888' : '#111', cursor: isDisabled ? 'not-allowed' : isAdded ? 'default' : 'pointer', whiteSpace: 'nowrap', minWidth: 54 }}>
                              {isAdded ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '10px 16px', fontSize: 13, color: '#555', borderTop: '1px solid #f0f0f0' }}>
                      <span>{(pdpPage - 1) * PDP_PER_PAGE + 1}-{Math.min(pdpPage * PDP_PER_PAGE, pdpFiltered.length)} of {pdpFiltered.length} results</span>
                      <button onClick={() => setSbVidPDPPage(p => Math.max(1, p - 1))} disabled={pdpPage <= 1}
                        style={{ width: 26, height: 26, border: '1px solid #ccc', borderRadius: 3, background: pdpPage <= 1 ? '#f5f5f5' : 'white', cursor: pdpPage <= 1 ? 'not-allowed' : 'pointer', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                      <button onClick={() => setSbVidPDPPage(p => Math.min(pdpTotalPages, p + 1))} disabled={pdpPage >= pdpTotalPages}
                        style={{ width: 26, height: 26, border: '1px solid #ccc', borderRadius: 3, background: pdpPage >= pdpTotalPages ? '#f5f5f5' : 'white', cursor: pdpPage >= pdpTotalPages ? 'not-allowed' : 'pointer', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                    </div>
                  </div>
                  {/* Right: added product */}
                  <div style={{ width: 280, padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{sbVidPDPProduct ? '1 product' : '0 products'}</div>
                    {sbVidPDPProduct ? (
                        <>
                          <div style={{ display: 'flex', gap: 10, padding: '10px', border: '1px solid #e8e8e8', borderRadius: 4, marginBottom: 10, position: 'relative' }}>
                            <div style={{ width: 48, height: 48, flexShrink: 0, border: '1px solid #e8e8e8', borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                              {PRODUCT_IMAGES[sbVidPDPProduct.imageType] || PRODUCT_IMAGES['over-ear-black']}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: '#0073bb', lineHeight: 1.4 }}>{sbVidPDPProduct.name.length > 60 ? sbVidPDPProduct.name.slice(0,60) + '…' : sbVidPDPProduct.name}</div>
                              <div style={{ fontSize: 11, color: '#e47911', marginTop: 2 }}>{'★'.repeat(Math.round(sbVidPDPProduct.rating))}</div>
                              <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>Price may vary by location</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 2, color: '#c40000' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c40000', display: 'inline-block' }} />
                                Out of stock
                              </div>
                              <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>ASIN: {sbVidPDPProduct.asin}</div>
                            </div>
                            <button onClick={() => setSbVidPDPProduct(null)} style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#555', lineHeight: 1 }}>×</button>
                          </div>
                          <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>You have added the maximum number of products</div>
                        </>
                    ) : (
                      <div style={{ fontSize: 13, color: '#888', textAlign: 'center', marginTop: 24 }}>Add products</div>
                    )}
                  </div>
                </div>
                {!sbVidPDPProduct && (
                  <div style={{ padding: '8px 16px', color: '#c40000', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #f0f0f0' }}>
                    <span style={{ fontWeight: 700 }}>!</span> Add a product to advertise
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Ad section (Ad name, Brand name, Logo) ── */}
          {sbCreativeAssetsOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setSbCreativeAssetsOpen(false)}>
              <div style={{ background: 'white', borderRadius: 8, padding: 24, width: 540, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>Creative assets</span>
                  <button onClick={() => setSbCreativeAssetsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555' }}>×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { bg: '#6c2eb9', label: 'SoundMax Logo', lines: [{ t: 'SOUND', c: 'white' }, { t: 'MAX', c: '#febd69' }] },
                    { bg: '#1a3a6b', label: 'Brand Blue', lines: [{ t: 'SOUND', c: 'white' }, { t: 'MAX', c: '#febd69' }] },
                    { bg: '#c8102e', label: 'Brand Red', lines: [{ t: 'SOUND', c: 'white' }, { t: 'MAX', c: 'white' }] },
                    { bg: '#2d6a4f', label: 'Brand Green', lines: [{ t: 'SM', c: 'white' }] },
                    { bg: '#e76f00', label: 'Brand Orange', lines: [{ t: 'SOUND', c: 'white' }, { t: 'MAX', c: '#222' }] },
                    { bg: '#111', label: 'Brand Dark', lines: [{ t: 'SOUND', c: '#febd69' }, { t: 'MAX', c: 'white' }] },
                  ].map((asset, idx) => (
                    <div key={idx} onClick={() => { setSbLogoUrl({ type: 'asset', bg: asset.bg, lines: asset.lines }); setSbCreativeAssetsOpen(false); }}
                      style={{ cursor: 'pointer', border: sbLogoUrl?.bg === asset.bg ? '2px solid #0073bb' : '2px solid #e8e8e8', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ height: 80, background: asset.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {asset.lines.map((l, i) => (
                          <span key={i} style={{ color: l.c, fontWeight: 800, fontSize: 13, letterSpacing: 2 }}>{l.t}</span>
                        ))}
                      </div>
                      <div style={{ padding: '6px 8px', fontSize: 11, color: '#555', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>{asset.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {sbAdFormat !== 'store-spotlight' && sbAdFormat !== 'video' && <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ccs-card-heading">Ad</span>
                <InfoIcon />
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> {sbCollectionType === 'manual' ? 'Learn about manual collection ads' : 'Learn about automatic collection ads'}
              </a>
            </div>
            <div className="ccs-card-body" style={{ maxWidth: 600 }}>
              {/* Ad name */}
              <div className="ccs-field">
                <label className="ccs-label">Ad name <InfoIcon /></label>
                <input className="ccs-input-full" value={sbAdName || `Collection ad - ${today}`}
                  onChange={e => setSbAdName(e.target.value)}
                  placeholder={`Collection ad - ${today}`} />
              </div>

              {/* Ad title — manual collection only */}
              {sbCollectionType === 'manual' && (
                <div className="ccs-field" style={{ marginTop: 20 }}>
                  <label className="ccs-label">Ad title <InfoIcon /></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    {/* Option 1: Auto generate */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name="sbAdTitle" checked={sbAdTitle === 'auto'} onChange={() => setSbAdTitle('auto')} style={{ accentColor: '#0073bb' }} />
                      <span>Let us generate the best title for each shopper</span>
                      <span style={{ fontSize: 10, padding: '1px 7px', background: '#5c4ee5', color: 'white', borderRadius: 12, fontWeight: 600 }}>New</span>
                      <InfoIcon />
                    </label>
                    {/* Option 2: Standard title */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name="sbAdTitle" checked={sbAdTitle === 'standard'} onChange={() => setSbAdTitle('standard')} style={{ accentColor: '#0073bb' }} />
                      <span>Choose a standard title</span>
                    </label>
                    {sbAdTitle === 'standard' && (
                      <div style={{ marginLeft: 22, position: 'relative', display: 'inline-block' }}
                        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbStandardTitleOpen(false); }}
                        tabIndex={-1}>
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
                          onClick={() => setSbStandardTitleOpen(o => !o)}>
                          {sbStandardTitle} <ChevronDown size={13} />
                        </button>
                        {sbStandardTitleOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 2, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 300, width: 220, overflow: 'hidden' }}>
                            {['Browse the collection', 'Explore the collection', 'Discover the collection'].map(opt => (
                              <div key={opt} onClick={() => { setSbStandardTitle(opt); setSbStandardTitleOpen(false); }}
                                style={{
                                  padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: '#333',
                                  fontWeight: sbStandardTitle === opt ? 700 : 400,
                                  borderLeft: sbStandardTitle === opt ? '3px solid #0073bb' : '3px solid transparent',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Option 3: Custom title */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name="sbAdTitle" checked={sbAdTitle === 'custom'} onChange={() => setSbAdTitle('custom')} style={{ accentColor: '#0073bb' }} />
                      <span>Write your own title</span>
                      <InfoIcon />
                    </label>
                    {sbAdTitle === 'custom' && (
                      <div style={{ marginLeft: 22 }}>
                        <input className="ccs-input-full" value={sbAdTitleText}
                          onChange={e => setSbAdTitleText(e.target.value)}
                          placeholder="Add a title"
                          style={{ border: sbAdTitleText === '' ? '1px solid #c40000' : '1px solid #ccc' }} />
                        {sbAdTitleText === '' && (
                          <div style={{ fontSize: 12, color: '#c40000', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>!</span> Review and correct issues
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brand name */}
              <div className="ccs-field" style={{ marginTop: 20 }}>
                <label className="ccs-label">Brand name <InfoIcon /></label>
                <div style={{ position: 'relative' }}>
                  <input className="ccs-input-full" value={sbBrandName} maxLength={30}
                    onChange={e => setSbBrandName(e.target.value.slice(0, 30))}
                    style={{ paddingRight: 52 }} />
                  <span style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 11, color: sbBrandName.length >= 28 ? '#c40000' : '#999',
                    pointerEvents: 'none', fontVariantNumeric: 'tabular-nums',
                  }}>{sbBrandName.length}/30</span>
                </div>
              </div>

              {/* Logo */}
              <div className="ccs-field" style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="ccs-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    Logo <InfoIcon /> <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
                  </label>
                  {/* Change button on the right of the label row */}
                  <div style={{ position: 'relative' }}
                    onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbLogoDropOpen(false); }}
                    tabIndex={-1}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                      onClick={() => setSbLogoDropOpen(o => !o)}>
                      Change <ChevronDown size={13} />
                    </button>
                    {sbLogoDropOpen && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 200, width: 210, overflow: 'hidden' }}>
                        <div onClick={() => { setSbLogoDropOpen(false); setSbCreativeAssetsOpen(true); }}
                          style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: '#333' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          Choose from creative assets
                        </div>
                        <label style={{ display: 'block', padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: '#333' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          Upload logo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                            const file = e.target.files[0]; if (!file) return;
                            const reader = new FileReader();
                            reader.onload = ev => { setSbLogoUrl({ type: 'upload', src: ev.target.result }); };
                            reader.readAsDataURL(file);
                            setSbLogoDropOpen(false); e.target.value = '';
                          }} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                {/* Logo preview below the label row */}
                {sbLogoUrl?.type === 'upload' ? (
                  <img src={sbLogoUrl.src} alt="Logo" style={{ width: 110, height: 80, objectFit: 'contain', border: '1px solid #e8e8e8', borderRadius: 4 }} />
                ) : (
                  <div style={{ width: 110, height: 80, background: sbLogoUrl?.bg || 'white', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e8e8e8' }}>
                    {(sbLogoUrl?.lines || [{ t: sbBrandName.toUpperCase(), c: '#222' }]).map((l, i) => (
                      <span key={i} style={{ color: l.c, fontWeight: 800, fontSize: 11, letterSpacing: 1, textAlign: 'center', padding: '0 6px' }}>{l.t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Landing page — manual collection only */}
              {sbCollectionType === 'manual' && (
                <div className="ccs-field" style={{ marginTop: 20 }}>
                  <label className="ccs-label">Landing page <InfoIcon /></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name="sbLandingPageType" checked={sbLandingPageType === 'new-landing-page'}
                        onChange={() => setSbLandingPageType('new-landing-page')} style={{ accentColor: '#0073bb' }} />
                      New landing page
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="radio" name="sbLandingPageType" checked={sbLandingPageType === 'brand-store'}
                        onChange={() => setSbLandingPageType('brand-store')} style={{ accentColor: '#0073bb' }} />
                      Brand Store on Amazon
                    </label>
                    {sbLandingPageType === 'brand-store' && (
                      <div style={{ marginLeft: 22, display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Choose a Brand Store</div>
                          <div className="ccs-select-wrap" style={{ width: 260 }}>
                            <select className="ccs-input-full" style={{ fontSize: 13 }}>
                              <option>SoundMax</option>
                            </select>
                            <ChevronDown size={13} className="ccs-select-chevron" />
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Choose a page</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="ccs-select-wrap" style={{ width: 260 }}>
                              <select className="ccs-input-full" style={{ fontSize: 13 }}>
                                <option>Home</option>
                                <option>Headphones</option>
                                <option>Earbuds</option>
                                <option>Gaming</option>
                              </select>
                              <ChevronDown size={13} className="ccs-select-chevron" />
                            </div>
                            <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: '#0073bb', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
                              See page <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M7 1h4m0 0v4m0-4L5 7" stroke="#0073bb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>}

          {/* ── Store Spotlight Ad settings ── */}
          {sbAdFormat === 'store-spotlight' && sbSSStore && (
            <>
              {/* Ad settings card */}
              <div className="ccs-card" style={{ marginBottom: 16 }}>
                <div className="ccs-card-header">
                  <span className="ccs-card-heading">Ad settings</span>
                </div>
                <div className="ccs-card-body">
                  <div className="ccs-field">
                    <label className="ccs-label">Ad name</label>
                    <input className="ccs-input-full" style={{ maxWidth: 420 }}
                      value={sbSSAdName || `Ad - ${todayDisplay}`}
                      onChange={e => setSbSSAdName(e.target.value)}
                      placeholder={`Ad - ${todayDisplay}`} />
                  </div>
                </div>
              </div>

              {/* Ad card with 2-column layout */}
              <div className="ccs-card" style={{ marginBottom: 16 }}>
                <div className="ccs-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="ccs-card-heading">Ad</span>
                    <InfoIcon />
                  </div>
                  <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                    <Info size={12} /> Learn about Store Spotlight ads
                  </a>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--amazon-border)' }}>

                  {/* Left panel */}
                  <div style={{ flex: '0 0 30%', padding: '16px 20px', borderRight: '1px solid var(--amazon-border)', minWidth: 0, overflowY: 'auto' }}>

                    {/* Logo Specs popup */}
                    {sbSSSpecsOpen && (
                      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setSbSSSpecsOpen(false)}>
                        <div style={{ background: 'white', borderRadius: 6, padding: 24, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
                          onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>Logo specifications</span>
                            <button onClick={() => setSbSSSpecsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555' }}>×</button>
                          </div>
                          {[
                            ['File type', 'PNG or JPG'],
                            ['Minimum dimensions', '400 × 400 pixels'],
                            ['Maximum file size', '10 MB'],
                            ['Aspect ratio', '1:1 (square)'],
                            ['Background', 'White or transparent recommended'],
                            ['Safe zone', 'Keep key elements within 80% of the image area'],
                          ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                              <span style={{ fontWeight: 600, width: 170, flexShrink: 0, color: '#333' }}>{k}</span>
                              <span style={{ color: '#555' }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sbSSSection === 'logo' ? (
                      <div>
                        <button onClick={() => setSbSSSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                          ← Back
                        </button>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#333' }}>Logo</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                          <button onClick={() => setSbSSSpecsOpen(true)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            Specs
                          </button>
                          <a href="#" onClick={e => e.preventDefault()} style={{ color: '#0073bb', fontSize: 13 }}>See logo guidelines</a>
                          <div style={{ marginLeft: 'auto', position: 'relative' }}
                            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbSSLogoChangeOpen(false); }}
                            tabIndex={-1}>
                            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                              onClick={() => setSbSSLogoChangeOpen(o => !o)}>
                              Change logo <ChevronDown size={13} />
                            </button>
                            {sbSSLogoChangeOpen && (
                              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 300, width: 220, overflow: 'hidden' }}>
                                <div onClick={() => { setSbSSLogoChangeOpen(false); setSbCreativeAssetsOpen(true); }}
                                  style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: '#333' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                  Choose from creative assets
                                </div>
                                <label style={{ display: 'block', padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: '#333' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                  Upload logo
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                                    const file = e.target.files[0]; if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = ev => {
                                      const img = new window.Image();
                                      img.onload = () => setSbLogoUrl({ type: 'upload', src: ev.target.result, fileName: file.name, dimensions: `${img.width} x ${img.height} px` });
                                      img.src = ev.target.result;
                                    };
                                    reader.readAsDataURL(file);
                                    setSbSSLogoChangeOpen(false); e.target.value = '';
                                  }} />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Logo tile preview */}
                        <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, overflow: 'hidden', width: 240 }}>
                          {sbLogoUrl?.type === 'upload' ? (
                            <>
                              <div style={{ height: 110, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                <img src={sbLogoUrl.src} alt="logo" style={{ maxWidth: '100%', maxHeight: 90, objectFit: 'contain' }} />
                              </div>
                              <div style={{ padding: '8px 12px', fontSize: 12 }}>
                                <div style={{ fontWeight: 600, color: '#333', marginBottom: 2 }}>{sbLogoUrl.fileName || 'Uploaded image'}</div>
                                {sbLogoUrl.dimensions && <div style={{ color: '#888' }}>{sbLogoUrl.dimensions}</div>}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ height: 110, background: sbLogoUrl?.bg || '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
                                {(sbLogoUrl?.lines || [{ t: sbBrandName?.toUpperCase() || 'LOGO', c: '#222' }]).map((l, i) => (
                                  <span key={i} style={{ color: l.c, fontWeight: 800, fontSize: 14, letterSpacing: 2 }}>{l.t}</span>
                                ))}
                              </div>
                              <div style={{ padding: '8px 12px', fontSize: 12, color: '#888' }}>
                                {sbLogoUrl ? 'Creative asset' : 'No logo selected'}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    ) : sbSSSection === 'brand-name' ? (
                      <div>
                        <button onClick={() => setSbSSSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
                          ← Back
                        </button>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#333' }}>Brand name</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Max 30 characters</div>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <input className="ccs-input-full" value={sbBrandName} maxLength={30}
                            onChange={e => setSbBrandName(e.target.value.slice(0, 30))}
                            style={{ paddingRight: 52, width: 300 }} />
                          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: sbBrandName.length >= 28 ? '#c40000' : '#999', pointerEvents: 'none' }}>
                            {sbBrandName.length}/30
                          </span>
                        </div>
                      </div>

                    ) : sbSSSection === 'headline' ? (
                      <div>
                        <button onClick={() => setSbSSSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
                          ← Back
                        </button>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#333' }}>Headline</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Max 50 characters. Appears next to your logo in the ad.</div>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <input className="ccs-input-full" value={sbSSHeadline} maxLength={50}
                            onChange={e => setSbSSHeadline(e.target.value.slice(0, 50))}
                            placeholder="e.g. Shop the latest collection"
                            style={{ paddingRight: 52, width: 340 }} />
                          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: sbSSHeadline.length >= 45 ? '#c40000' : '#999', pointerEvents: 'none' }}>
                            {sbSSHeadline.length}/50
                          </span>
                        </div>
                      </div>

                    ) : sbSSSection === 'store-pages' ? (
                      <div>
                        <button onClick={() => setSbSSSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
                          ← Back
                        </button>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#333' }}>Store pages</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>Configure the 3 store pages shown in your ad.</div>
                        {sbSSStorePages.map((pg, idx) => {
                          const PAGE_META = { earbuds: 'Earbuds', headphones: 'Headphones', gaming: 'Gaming', home: 'Home' };
                          const isPickerOpen = sbSSImgPickerIdx === idx;
                          const filteredProducts = allProducts.filter(p =>
                            !sbSSImgPickerQuery || p.name.toLowerCase().includes(sbSSImgPickerQuery.toLowerCase()) || p.asin.toLowerCase().includes(sbSSImgPickerQuery.toLowerCase())
                          );
                          return (
                            <div key={idx} style={{ border: '1px solid #ddd', borderRadius: 4, marginBottom: 10, overflow: 'hidden' }}>
                              {/* Page header row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ color: '#ccc', fontSize: 14, cursor: 'grab', userSelect: 'none' }}>⠿</span>
                                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: '#0073bb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {PAGE_META[pg.pageId] || pg.pageId}
                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M7 1h4m0 0v4m0-4L5 7" stroke="#0073bb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </a>
                              </div>

                              {isPickerOpen ? (
                                /* ── Image picker panel ── */
                                <div style={{ padding: '10px 12px' }}>
                                  <button onClick={() => { setSbSSImgPickerIdx(null); setSbSSImgPickerQuery(''); }}
                                    style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    ‹ Back
                                  </button>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>Choose an image</div>
                                  <div style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>
                                    Image will visually represent the following Store page: <strong>{pg.displayName}</strong>
                                  </div>
                                  {/* Search */}
                                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 20, overflow: 'hidden', marginBottom: 10, background: '#fff' }}>
                                    <span style={{ padding: '0 10px', color: '#777', fontSize: 14 }}>🔍</span>
                                    <input
                                      type="text"
                                      placeholder="Search by product name or ASIN"
                                      value={sbSSImgPickerQuery}
                                      onChange={e => setSbSSImgPickerQuery(e.target.value)}
                                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, padding: '7px 8px 7px 0', background: 'transparent' }}
                                    />
                                  </div>
                                  {/* Product list */}
                                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {filteredProducts.length === 0 && (
                                      <div style={{ color: '#888', fontSize: 13, padding: '12px 0' }}>No products found.</div>
                                    )}
                                    {filteredProducts.map((p, pi) => (
                                      <div key={p.asin} onClick={() => {
                                        const np = sbSSStorePages.map((sp, i) => i === idx ? { ...sp, imageType: p.imageType } : sp);
                                        setSbSSStorePages(np);
                                        setSbSSImgPickerIdx(null);
                                        setSbSSImgPickerQuery('');
                                      }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: pi < filteredProducts.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
                                        <div style={{ width: 52, height: 52, flexShrink: 0, border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden', background: '#f8f8f8' }}>
                                          {PRODUCT_IMAGES[p.imageType] || PRODUCT_IMAGES['over-ear-black']}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ fontSize: 12, color: '#111', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>ASIN: {p.asin}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>1–{filteredProducts.length} of {filteredProducts.length} results</div>
                                </div>
                              ) : (
                                <>
                                  {/* Image + display name */}
                                  <div style={{ padding: '10px 12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ width: 52, height: 52, background: '#f0f0f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #eee' }}>
                                      {pg.imageType
                                        ? (PRODUCT_IMAGES[pg.imageType] || <div style={{ width: 24, height: 24, background: '#ddd', borderRadius: 2 }} />)
                                        : <div style={{ width: 24, height: 24, background: '#ddd', borderRadius: 2 }} />
                                      }
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4 }}>Display name</div>
                                      <textarea
                                        value={pg.displayName}
                                        onChange={e => { const np = sbSSStorePages.map((p, i) => i === idx ? { ...p, displayName: e.target.value } : p); setSbSSStorePages(np); }}
                                        style={{ width: '100%', border: '1px solid #ccc', borderRadius: 3, padding: '5px 8px', fontSize: 12, resize: 'none', height: 50, outline: 'none', boxSizing: 'border-box' }}
                                      />
                                    </div>
                                  </div>
                                  {/* Change image | Change page */}
                                  <div style={{ padding: '2px 12px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => { setSbSSImgPickerIdx(idx); setSbSSImgPickerQuery(''); }}
                                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#0073bb', cursor: 'pointer' }}>
                                      Change image
                                    </button>
                                    <span style={{ color: '#ccc' }}>|</span>
                                    <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: '#0073bb', textDecoration: 'none' }}>Change page</a>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    ) : (
                      /* Default: rows list */
                      <div>
                        {[
                          {
                            key: 'logo',
                            label: 'Logo',
                            preview: (
                              <div style={{ width: 36, height: 28, background: sbLogoUrl?.bg || '#f0f0f0', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                {sbLogoUrl?.type === 'upload'
                                  ? <img src={sbLogoUrl.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : (sbLogoUrl?.lines || [{ t: 'SM', c: 'white' }]).map((l, i) => <span key={i} style={{ color: l.c, fontWeight: 800, fontSize: 7, letterSpacing: 1 }}>{l.t}</span>)
                                }
                              </div>
                            ),
                            sub: 'Logo selected',
                            subColor: '#007600',
                          },
                          { key: 'brand-name', label: 'Brand name', sub: sbBrandName || 'Required', subColor: sbBrandName ? '#333' : '#c40000' },
                          { key: 'headline', label: 'Headline', sub: sbSSHeadline || 'Optional', subColor: sbSSHeadline ? '#333' : '#888' },
                          {
                            key: 'store-pages', label: 'Store pages',
                            sub: sbSSStorePages.map(p => p.displayName).join(', '),
                            subColor: '#333',
                            error: false,
                          },
                        ].map((row, idx, arr) => (
                          <div key={row.key} onClick={() => setSbSSSection(row.key)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < arr.length - 1 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {row.preview && row.preview}
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  {row.label}
                                  {row.key === 'logo' && <span style={{ color: '#007600', fontSize: 14 }}>✓</span>}
                                </div>
                                <div style={{ fontSize: 12, color: row.subColor }}>{row.sub}</div>
                              </div>
                            </div>
                            <ChevronRight size={14} style={{ color: '#888', flexShrink: 0 }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right panel — dark grid preview with phone mockup */}
                  {(() => {
                    const PAGE_FORMATS = ['mobile-top', 'mobile-inline', 'desktop-top', 'desktop-footer'];
                    const goToPage = (p) => {
                      const c = Math.max(1, Math.min(4, p));
                      setSbSSPreviewPage(c);
                      setSbSSPreviewFormat(PAGE_FORMATS[c - 1]);
                    };
                    const PREVIEW_OPTIONS = [
                      { group: 'Mobile', icon: '📱', items: [{ key: 'mobile-top', label: 'Top of search' }, { key: 'mobile-inline', label: 'Inline search and detail page' }] },
                      { group: 'Desktop', icon: '🖥', items: [{ key: 'desktop-top', label: 'Top of search' }, { key: 'desktop-footer', label: 'Search footer and detail page' }] },
                    ];
                    const currentLabel = PREVIEW_OPTIONS.flatMap(g => g.items).find(o => o.key === sbSSPreviewFormat)?.label || 'Top of search';
                    const isMobile = sbSSPreviewFormat.startsWith('mobile');

                    const LogoPanel = ({ w, h, fs, bg }) => (
                      <div style={{ width: w, height: h, background: bg || sbLogoUrl?.bg || '#e8e8e8', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {sbLogoUrl?.type === 'upload'
                          ? <img src={sbLogoUrl.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (sbLogoUrl?.lines || []).map((l, i) => <span key={i} style={{ color: l.c, fontWeight: 900, fontSize: fs, letterSpacing: 1, textAlign: 'center', lineHeight: 1.1 }}>{l.t}</span>)
                        }
                      </div>
                    );
                    const LogoText = ({ fs, color }) => sbLogoUrl?.type === 'upload'
                      ? <img src={sbLogoUrl.src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      : (sbLogoUrl?.lines || [{ t: sbBrandName?.toUpperCase() || 'BRAND', c: color || '#1b4332' }]).map((l, i) => (
                          <span key={i} style={{ color: color || l.c, fontWeight: 900, fontSize: fs, letterSpacing: 1, textAlign: 'center', lineHeight: 1.15, display: 'block' }}>{l.t}</span>
                        ));
                    const ProductTiles = ({ h, fs }) => sbSSStorePages.map((pg, i) => (
                      <div key={i} style={{ background: '#f8f8f8', borderRadius: 3, overflow: 'hidden', border: '1px solid #eee' }}>
                        <div style={{ height: h, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {pg.imageType
                            ? <div style={{ width: h, height: h }}>{PRODUCT_IMAGES[pg.imageType]}</div>
                            : <div style={{ width: h * 0.4, height: h * 0.4, background: '#ddd', borderRadius: 3 }} />
                          }
                        </div>
                        <div style={{ padding: '3px 5px', fontSize: fs, color: '#333', lineHeight: 1.3 }}>{pg.displayName || `Page ${i + 1}`}</div>
                      </div>
                    ));

                    const gridBg = { backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' };

                    return (
                      <div style={{ flex: '0 0 70%', background: '#2d2d2d', display: 'flex', flexDirection: 'column' }}>
                        {/* ── Top bar ── */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #444', background: '#383838' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: '#ddd', fontWeight: 600 }}>Preview:</span>
                            <div style={{ position: 'relative' }}
                              onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbSSPreviewFormatOpen(false); }}
                              tabIndex={-1}>
                              <div onClick={() => setSbSSPreviewFormatOpen(o => !o)}
                                style={{ background: 'white', border: '1px solid #999', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, minWidth: 240 }}>
                                <span style={{ fontSize: 14 }}>{isMobile ? '📱' : '🖥'}</span>
                                <span style={{ flex: 1 }}>{currentLabel}</span>
                                <ChevronDown size={12} style={{ flexShrink: 0, color: '#555' }} />
                              </div>
                              {sbSSPreviewFormatOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 3, background: 'white', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 20, minWidth: 280, overflow: 'hidden' }}>
                                  {PREVIEW_OPTIONS.map((grp, gi) => (
                                    <div key={grp.group}>
                                      {gi > 0 && <div style={{ height: 1, background: '#eee', margin: '4px 0' }} />}
                                      <div style={{ padding: '8px 14px 4px', fontSize: 12, fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}><span>{grp.icon}</span>{grp.group}</div>
                                      {grp.items.map(opt => (
                                        <div key={opt.key}
                                          onClick={() => { setSbSSPreviewFormat(opt.key); setSbSSPreviewPage(PAGE_FORMATS.indexOf(opt.key) + 1); setSbSSPreviewFormatOpen(false); }}
                                          style={{ padding: '8px 14px 8px 30px', fontSize: 13, cursor: 'pointer', color: '#333', fontWeight: sbSSPreviewFormat === opt.key ? 700 : 400, borderLeft: sbSSPreviewFormat === opt.key ? '3px solid #0073bb' : '3px solid transparent', background: sbSSPreviewFormat === opt.key ? '#f5f9ff' : 'white' }}
                                          onMouseEnter={e => { if (sbSSPreviewFormat !== opt.key) e.currentTarget.style.background = '#f8f8f8'; }}
                                          onMouseLeave={e => { e.currentTarget.style.background = sbSSPreviewFormat === opt.key ? '#f5f9ff' : 'white'; }}>
                                          {opt.label}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: '#aaa' }}>{sbSSPreviewPage} of 4</span>
                            <button onClick={() => goToPage(sbSSPreviewPage - 1)} style={{ width: 28, height: 28, background: '#4a4a4a', border: '1px solid #666', borderRadius: 3, color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>‹</button>
                            <button onClick={() => goToPage(sbSSPreviewPage + 1)} style={{ width: 28, height: 28, background: '#4a4a4a', border: '1px solid #666', borderRadius: 3, color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>›</button>
                          </div>
                        </div>

                        {/* ── Preview grid area ── */}
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: sbSSPreviewFormat === 'mobile-top' ? 'flex-start' : 'center', justifyContent: 'center', paddingTop: sbSSPreviewFormat === 'mobile-top' ? 28 : 32, paddingBottom: 32, paddingLeft: 20, paddingRight: 20, minHeight: 480, overflow: sbSSPreviewFormat === 'mobile-top' ? 'hidden' : 'visible', ...gridBg }}>
                          <a href="#" onClick={e => e.preventDefault()} style={{ position: 'absolute', top: 12, right: 16, fontSize: 11, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', zIndex: 2 }}>Where will my ad show?</a>

                          {/* ════ 1 of 4: Mobile — Top of search ════ */}
                          {sbSSPreviewFormat === 'mobile-top' && (
                            <div style={{ width: 300, background: '#2a2a2a', borderRadius: '24px 24px 0 0', padding: '0 6px', boxShadow: '0 0 0 1.5px #666, 0 0 0 3px #1a1a1a, 0 12px 40px rgba(0,0,0,0.8)', position: 'relative', zIndex: 1 }}>
                              <div style={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <div style={{ width: 30, height: 4, background: '#444', borderRadius: 2 }} />
                                <div style={{ width: 5, height: 5, background: '#444', borderRadius: '50%' }} />
                              </div>
                              <div style={{ background: 'white', overflow: 'hidden' }}>
                                <div style={{ background: '#37475a', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ color: 'white', fontWeight: 900, fontSize: 18, fontStyle: 'italic', letterSpacing: -0.5, lineHeight: 1 }}>amazon</div>
                                    <div style={{ color: '#febd69', fontSize: 8, marginTop: 1 }}>──────</div>
                                  </div>
                                  <svg width="22" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2h13a2 2 0 012 2v13a2 2 0 01-2 2H6l-3 4V4a2 2 0 012-2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                                </div>
                                <div style={{ background: '#eef0f3', padding: '7px 10px' }}>
                                  <div style={{ background: 'white', border: '1px solid #ccc', borderRadius: 20, padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ width: 100, height: 7, background: '#e0e0e0', borderRadius: 4 }} />
                                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#888" strokeWidth="2"/><path d="M13 13l4 4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                                  </div>
                                </div>
                                <div style={{ padding: '12px 12px 10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <LogoPanel w={72} h={56} fs={9} />
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111', lineHeight: 1.25 }}>{sbSSHeadline || 'Your headline here'}</div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 8 }}><ProductTiles h={66} fs={9} /></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 10, color: '#0073bb', textDecoration: 'none', lineHeight: 1.4 }}>Shop the {sbBrandName || 'Brand'} Store on Amazon &gt;</a>
                                    <span style={{ fontSize: 9, color: '#888', flexShrink: 0, marginLeft: 6 }}>Sponsored</span>
                                  </div>
                                  <div style={{ height: 70 }} />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ════ 2 of 4: Mobile — Inline search and detail page ════ */}
                          {sbSSPreviewFormat === 'mobile-inline' && (
                            <div style={{ width: 300, background: '#2a2a2a', borderRadius: 22, padding: '0 6px', boxShadow: '0 0 0 1.5px #666, 0 0 0 3px #1a1a1a, 0 12px 40px rgba(0,0,0,0.8)', position: 'relative', zIndex: 1 }}>
                              <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 5, height: 5, background: '#444', borderRadius: '50%' }} />
                              </div>
                              <div style={{ background: 'white', overflow: 'hidden', borderRadius: '3px 3px 0 0' }}>
                                {/* Search bar (inline view — no amazon header, user has scrolled) */}
                                <div style={{ background: '#eef0f3', padding: '6px 10px' }}>
                                  <div style={{ background: 'white', border: '1px solid #ccc', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ width: 80, height: 7, background: '#e0e0e0', borderRadius: 4 }} />
                                    <svg width="11" height="11" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#888" strokeWidth="2"/><path d="M13 13l4 4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                                  </div>
                                </div>
                                {/* Search results context — 2 placeholder products above ad */}
                                <div style={{ padding: '8px 8px 0' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
                                    <div style={{ background: '#f0f0f0', borderRadius: 3, height: 82 }} />
                                    <div style={{ background: '#f0f0f0', borderRadius: 3, height: 82 }} />
                                  </div>
                                </div>
                                {/* The inline ad card */}
                                <div style={{ margin: '0 8px 10px', border: '1px solid #ddd', borderRadius: 3, overflow: 'hidden', display: 'flex', minHeight: 120 }}>
                                  {/* Left: logo */}
                                  <div style={{ width: '42%', background: '#f2f2f2', padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <LogoText fs={11} />
                                  </div>
                                  {/* Right: text */}
                                  <div style={{ flex: 1, padding: '10px 10px', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                      <div style={{ fontSize: 9, color: '#888', marginBottom: 4 }}>{sbBrandName || 'Brand'}</div>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1.3, marginBottom: 8 }}>{sbSSHeadline || 'Your headline here'}</div>
                                    </div>
                                    <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 10, color: '#0073bb', textDecoration: 'none', fontWeight: 600, borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>Shop now</a>
                                  </div>
                                </div>
                              </div>
                              {/* Bottom bezel with home button */}
                              <div style={{ height: 36, background: '#2a2a2a', borderRadius: '0 0 22px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ width: 11, height: 11, borderRadius: 2.5, border: '1.5px solid #555' }} />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ════ 3 of 4: Desktop — Top of search ════ */}
                          {sbSSPreviewFormat === 'desktop-top' && (
                            <div style={{ width: '92%', maxWidth: 720, position: 'relative', zIndex: 1 }}>
                              <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                  <LogoPanel w={90} h={64} fs={12} />
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>{sbSSHeadline || 'Your headline here'}</div>
                                    <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12, color: '#0073bb', textDecoration: 'none' }}>Shop the {sbBrandName || 'Brand'} Store on Amazon &gt;</a>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '12px 16px 8px' }}><ProductTiles h={90} fs={11} /></div>
                                <div style={{ textAlign: 'right', padding: '4px 16px 8px', fontSize: 11, color: '#999' }}>Sponsored</div>
                              </div>
                              <a href="#" onClick={e => e.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>🔍 View full size</a>
                            </div>
                          )}

                          {/* ════ 4 of 4: Desktop — Search footer and detail page ════ */}
                          {sbSSPreviewFormat === 'desktop-footer' && (
                            <div style={{ width: '70%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
                              <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 3, overflow: 'hidden', display: 'flex', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', minHeight: 150 }}>
                                {/* Left: logo on grey bg */}
                                <div style={{ width: '45%', background: '#f0f0f0', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                  <LogoText fs={18} />
                                </div>
                                {/* Right: headline + shop link */}
                                <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'white' }}>
                                  <div style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 12, lineHeight: 1.3 }}>{sbSSHeadline || 'Your headline here'}</div>
                                  <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: '#0073bb', textDecoration: 'none' }}>Shop {sbBrandName || 'Brand'} &gt;</a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}

          {/* ── Video Ad settings + Ad card ── */}
          {sbAdFormat === 'video' && (sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && (
            <>
              {/* Ad settings */}
              <div className="ccs-card" style={{ marginBottom: 16 }}>
                <div className="ccs-card-header"><span className="ccs-card-heading">Ad settings</span></div>
                <div className="ccs-card-body">
                  <div className="ccs-field">
                    <label className="ccs-label">Ad name <InfoIcon /></label>
                    <input className="ccs-input-full" style={{ maxWidth: 420 }}
                      value={sbVidAdName || `Ad - ${todayDisplay}`}
                      onChange={e => setSbVidAdName(e.target.value)}
                      placeholder={`Ad - ${todayDisplay}`} />
                  </div>
                </div>
              </div>

              {/* Ad card */}
              <div className="ccs-card" style={{ marginBottom: 16 }}>
                <div className="ccs-card-header"><span className="ccs-card-heading">Ad</span></div>
                <div style={{ display: 'flex', minHeight: 480 }}>
                  {/* ── Left 30% ── */}
                  <div style={{ flex: '0 0 30%', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                    {sbVidSection === null ? (
                      /* Default rows list */
                      <div>
                        {(sbLandingPage === 'product-detail' ? [
                          { key: 'video', label: 'Video', check: !!sbVidFile },
                          { key: 'products', label: `Products${sbVidPDPProduct ? ' 1' : ''}`, check: !!sbVidPDPProduct },
                        ] : [
                          { key: 'logo', label: 'Logo', check: true },
                          { key: 'brand-name', label: 'Brand name', check: true },
                          { key: 'headline', label: 'Headline', check: !!sbVidHeadline },
                          { key: 'video', label: 'Video', check: !!sbVidFile },
                          { key: 'products', label: `Products${sbVidProducts.length > 0 ? ' ' + sbVidProducts.length : ''}`, check: sbVidProducts.length > 0 },
                        ]).map(row => (
                          <div key={row.key} onClick={() => setSbVidSection(row.key)}
                            style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', gap: 10 }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111' }}>{row.label}</span>
                            {row.check && <span style={{ color: '#2e7d32', fontSize: 16, lineHeight: 1 }}>✓</span>}
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        ))}
                      </div>
                    ) : sbVidSection === 'logo' ? (
                      /* Logo edit */
                      <div style={{ padding: 16 }}>
                        <button onClick={() => setSbVidSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 }}>‹ Back</button>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Logo</div>
                        <div style={{ width: 90, height: 64, background: sbLogoUrl?.bg || '#e8e8e8', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 }}>
                          {sbLogoUrl?.type === 'upload' ? <img src={sbLogoUrl.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : (sbLogoUrl?.lines || []).map((l, i) => <span key={i} style={{ color: l.c, fontWeight: 900, fontSize: 11, letterSpacing: 1 }}>{l.t}</span>)}
                        </div>
                        <div style={{ position: 'relative' }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbVidLogoChangeOpen(false); }} tabIndex={-1}>
                          <button className="btn btn-secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setSbVidLogoChangeOpen(o => !o)}>Change <ChevronDown size={12} /></button>
                          {sbVidLogoChangeOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 2, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 200, width: 200, overflow: 'hidden' }}>
                              <div onClick={() => { setSbVidLogoChangeOpen(false); setSbCreativeAssetsOpen(true); }} style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'} onMouseLeave={e => e.currentTarget.style.background='white'}>Choose from creative assets</div>
                              <label style={{ display: 'block', padding: '9px 14px', fontSize: 13, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'} onMouseLeave={e => e.currentTarget.style.background='white'}>
                                Upload logo
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setSbLogoUrl({ type: 'upload', src: ev.target.result }); r.readAsDataURL(f); setSbVidLogoChangeOpen(false); e.target.value = ''; }} />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : sbVidSection === 'brand-name' ? (
                      /* Brand name edit */
                      <div style={{ padding: 16 }}>
                        <button onClick={() => setSbVidSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 }}>‹ Back</button>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Brand name</div>
                        <div style={{ position: 'relative' }}>
                          <input className="ccs-input-full" value={sbBrandName} maxLength={30} onChange={e => setSbBrandName(e.target.value.slice(0, 30))} style={{ paddingRight: 46 }} />
                          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: sbBrandName.length >= 28 ? '#c40000' : '#999' }}>{sbBrandName.length}/30</span>
                        </div>
                      </div>
                    ) : sbVidSection === 'headline' ? (
                      /* Headline edit */
                      <div style={{ padding: 16 }}>
                        <button onClick={() => setSbVidSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 }}>‹ Back</button>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Headline</div>
                        <div style={{ position: 'relative' }}>
                          <input className="ccs-input-full" value={sbVidHeadline} maxLength={50} placeholder="Enter headline" onChange={e => setSbVidHeadline(e.target.value.slice(0, 50))} style={{ paddingRight: 46 }} />
                          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: sbVidHeadline.length >= 48 ? '#c40000' : '#999' }}>{sbVidHeadline.length}/50</span>
                        </div>
                      </div>
                    ) : sbVidSection === 'video' ? (
                      /* Video upload — matches real Amazon console */
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Sub-nav bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderBottom: '1px solid #eee', flexWrap: 'wrap', background: '#fafafa' }}>
                          <button onClick={() => { setSbVidSection(null); setSbVidSpecsOpen(false); setSbVidAddVideoOpen(false); }}
                            style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                            ‹ Back
                          </button>
                          <span style={{ color: '#ddd', margin: '0 2px' }}>|</span>
                          {/* Specs dropdown */}
                          <div style={{ position: 'relative' }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbVidSpecsOpen(false); }} tabIndex={-1}>
                            <button onClick={() => setSbVidSpecsOpen(o => !o)}
                              style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                              Specs <ChevronDown size={12} color="#0073bb" />
                            </button>
                          </div>
                          <span style={{ color: '#ddd', margin: '0 2px' }}>|</span>
                          <a href="#" onClick={e => e.preventDefault()} style={{ color: '#0073bb', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                            <Info size={12} /> See video guidelines
                          </a>
                        </div>
                        {/* Content */}
                        <div style={{ padding: '14px 16px', flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>Video</div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
                            <span style={{ background: '#5c4ee5', color: 'white', fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>New</span>
                            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>Pick an engaging horizontal or vertical video to showcase your product in action. Video will auto-play on mute.</div>
                          </div>
                          {/* Add video dropdown */}
                          <div style={{ position: 'relative', display: 'inline-block' }}
                            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbVidAddVideoOpen(false); }} tabIndex={-1}>
                            <button onClick={() => setSbVidAddVideoOpen(o => !o)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #aaa', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                              Add video <ChevronDown size={13} />
                            </button>
                            {sbVidAddVideoOpen && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 2, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: 260, zIndex: 300, overflow: 'hidden' }}>
                                <div onClick={() => { setSbVidAddVideoOpen(false); setSbCreativeAssetsOpen(true); }}
                                  style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: '#333' }}
                                  onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'}
                                  onMouseLeave={e => e.currentTarget.style.background='white'}>
                                  Choose from creative assets
                                </div>
                                <label style={{ display: 'block', padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: '#333' }}
                                  onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'}
                                  onMouseLeave={e => e.currentTarget.style.background='white'}>
                                  Upload video (horizontal or vertical)
                                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) setSbVidFile({ name: f.name, url: URL.createObjectURL(f) }); setSbVidAddVideoOpen(false); e.target.value = ''; }} />
                                </label>
                              </div>
                            )}
                          </div>
                          {/* Uploaded file indicator */}
                          {sbVidFile && (
                            <div style={{ marginTop: 14, border: '1px solid #ddd', borderRadius: 6, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa' }}>
                              <span style={{ fontSize: 20 }}>🎬</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sbVidFile.name}</div>
                                <div style={{ fontSize: 11, color: '#2e7d32' }}>Ready</div>
                              </div>
                              <button onClick={() => setSbVidFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18, lineHeight: 1 }}>×</button>
                            </div>
                          )}
                        </div>
                        {/* Specs popup — fixed overlay */}
                        {sbVidSpecsOpen && (
                          <div style={{ position: 'fixed', inset: 0, zIndex: 900 }} onClick={() => setSbVidSpecsOpen(false)}>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 24, display: 'flex', gap: 28, maxWidth: 820, width: '90vw', maxHeight: '85vh', overflowY: 'auto' }}
                              onClick={e => e.stopPropagation()}>
                              {/* Video specs */}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Video specs</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '30%', padding: '8px 10px', background: '#f5f5f5', borderBottom: '2px solid #eee', fontWeight: 600, textAlign: 'left' }}></th>
                                      {[['🟧', 'Horizontal'], ['🟧', 'Vertical']].map(([icon, label]) => (
                                        <th key={label} style={{ padding: '8px 10px', background: '#f5f5f5', borderBottom: '2px solid #eee', fontWeight: 600, textAlign: 'left' }}>
                                          <span style={{ marginRight: 6 }}>{icon}</span>{label}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      ['Placements', 'Mobile & Desktop', ''],
                                      ['Aspect ratio', '16:9', '9:16'],
                                      ['Dimensions', '1280 x 720px, 1920 x 1080px or 3840 x 2160px', '720 x 1280px, 1080 x 1920px or 2160 x 3840px'],
                                      ['File size', '500 MB or smaller', ''],
                                      ['File format', 'MP4 or MOV', ''],
                                      ['Length', '6-45 sec', ''],
                                      ['Frame rate', '23.976, 23.98, 24, 25, 29.97 or 29.98 fps', ''],
                                      ['Bit rate', '1 Mbps or higher', ''],
                                      ['Codec', 'H.264 or H.265', ''],
                                      ['Profile', 'Main or baseline', ''],
                                      ['Video stream', '1 only', ''],
                                    ].map(([label, h, v], idx) => (
                                      <tr key={label} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <td style={{ padding: '8px 10px', fontWeight: 600, borderBottom: '1px solid #f0f0f0', color: '#111' }}>{label}</td>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', color: '#444' }}>{h}</td>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', color: '#444' }}>{v || h}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {/* Audio specs */}
                              <div style={{ width: 240, flexShrink: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                  <div style={{ fontSize: 15, fontWeight: 700 }}>Audio specs</div>
                                  <button onClick={() => setSbVidSpecsOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#666', lineHeight: 1, padding: '0 2px' }}>×</button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                  <tbody>
                                    {[
                                      ['Language', 'Must match ad locale'],
                                      ['Sample rate', '44.1 kHz or higher'],
                                      ['Codec', 'PCM, AAC or MP3'],
                                      ['Audio bit rate', '96 kbps or higher'],
                                      ['Format', 'Stereo or mono'],
                                      ['Audio stream', '1 only'],
                                    ].map(([label, val], idx) => (
                                      <tr key={label} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <td style={{ padding: '8px 10px', fontWeight: 600, borderBottom: '1px solid #f0f0f0', color: '#111', width: '45%' }}>{label}</td>
                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', color: '#444' }}>{val}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : sbVidSection === 'products' ? (
                      /* Products edit / picker */
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        {sbVidProductPicker !== null ? (
                          /* ── Picker view ── */
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>
                              <button onClick={() => { setSbVidProductPicker(null); setSbVidProductPickerQuery(''); setSbVidProductPickerPage(1); }}
                                style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                                ‹ Back
                              </button>
                            </div>
                            <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto' }}>
                              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Choose a product</div>
                              {/* Search bar */}
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #aaa', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                                <Search size={14} color="#888" style={{ margin: '0 8px', flexShrink: 0 }} />
                                <input value={sbVidProductPickerQuery} onChange={e => { setSbVidProductPickerQuery(e.target.value); setSbVidProductPickerPage(1); }}
                                  placeholder="Search by product name or ASIN"
                                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, padding: '8px 0', background: 'transparent' }} />
                                <button style={{ background: '#f0f0f0', border: 'none', borderLeft: '1px solid #aaa', padding: '8px 12px', cursor: 'pointer' }}>
                                  <Search size={14} color="#555" />
                                </button>
                              </div>
                              {/* Product list */}
                              {(() => {
                                const PER_PAGE = 4;
                                const q = sbVidProductPickerQuery.toLowerCase();
                                const filtered = allProducts.filter(p =>
                                  !sbVidProducts.find((vp, vi) => vp.asin === p.asin && vi !== sbVidProductPicker) &&
                                  (!q || p.name.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q))
                                );
                                const total = filtered.length;
                                const pages = Math.max(1, Math.ceil(total / PER_PAGE));
                                const page = Math.min(sbVidProductPickerPage, pages);
                                const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
                                return (
                                  <>
                                    {items.map((p, i) => (
                                      <div key={p.asin} onClick={() => {
                                        setSbVidProducts(prev => {
                                          const next = [...prev];
                                          if (sbVidProductPicker === 'add') next.push(p);
                                          else next[sbVidProductPicker] = p;
                                          return next;
                                        });
                                        setSbVidProductPicker(null); setSbVidProductPickerQuery(''); setSbVidProductPickerPage(1);
                                      }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                                        <input type="radio" readOnly checked={sbVidProductPicker !== 'add' && sbVidProducts[sbVidProductPicker]?.asin === p.asin} style={{ marginTop: 4, flexShrink: 0 }} />
                                        <div style={{ width: 52, height: 52, flexShrink: 0, border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>{PRODUCT_IMAGES[p.imageType]}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ fontSize: 13, color: '#0073bb', lineHeight: 1.4, marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontSize: 12, color: '#555' }}>
                                            <div style={{ display: 'flex', gap: 1 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(p.rating) ? '#e47911' : '#ccc', fontSize: 12 }}>★</span>)}</div>
                                            <span style={{ color: '#555' }}>({p.reviews})</span>
                                            <span style={{ color: '#aaa' }}>|</span>
                                            <span>Price may vary by location</span>
                                            <span style={{ color: '#aaa' }}>|</span>
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#c7511f', marginTop: 2 }}>
                                            <Info size={12} color="#c7511f" /><span>{p.status === 'In stock' ? 'In stock' : 'Out of stock'}</span>
                                          </div>
                                          <div style={{ fontSize: 12, color: '#555', marginTop: 1 }}>ASIN: {p.asin}</div>
                                        </div>
                                      </div>
                                    ))}
                                    {/* Pagination */}
                                    {total > 0 && (
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 14, fontSize: 13, color: '#555' }}>
                                        <span>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total} results</span>
                                        <button onClick={e => { e.stopPropagation(); setSbVidProductPickerPage(p => Math.max(1, p - 1)); }} disabled={page <= 1}
                                          style={{ width: 28, height: 28, border: '1px solid #ddd', borderRadius: 4, background: page <= 1 ? '#f5f5f5' : 'white', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <ChevronDown size={13} style={{ transform: 'rotate(90deg)' }} color={page <= 1 ? '#ccc' : '#555'} />
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); setSbVidProductPickerPage(p => Math.min(pages, p + 1)); }} disabled={page >= pages}
                                          style={{ width: 28, height: 28, border: '1px solid #ddd', borderRadius: 4, background: page >= pages ? '#f5f5f5' : 'white', cursor: page >= pages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <ChevronDown size={13} style={{ transform: 'rotate(-90deg)' }} color={page >= pages ? '#ccc' : '#555'} />
                                        </button>
                                      </div>
                                    )}
                                    {total === 0 && <div style={{ fontSize: 12, color: '#888', padding: '12px 0' }}>No products found.</div>}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ) : (
                          /* ── Edit products list ── */
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>
                              <button onClick={() => setSbVidSection(null)} style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 13, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                                ‹ Back
                              </button>
                            </div>
                            <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                                Edit products <Info size={14} color="#888" />
                              </div>
                              <div style={{ fontSize: 12, color: '#555', marginBottom: 16, lineHeight: 1.5 }}>
                                Drag numbered tabs to reorder products. Products can be changed to any product on your landing page.
                              </div>
                              {/* Product rows */}
                              {sbVidProducts.map((p, idx) => (
                                <div key={p.asin} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, border: '1px solid #ddd', borderRadius: 4, padding: '12px 12px', marginBottom: 8, background: 'white' }}>
                                  <div style={{ color: '#aaa', fontSize: 16, cursor: 'grab', flexShrink: 0, paddingTop: 2 }}>⠿</div>
                                  <div style={{ width: 54, height: 54, flexShrink: 0, border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>{PRODUCT_IMAGES[p.imageType]}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                      {p.brand || 'SoundMax'}<br />{p.name.length > 30 ? p.name.slice(0, 30) + '...' : p.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(p.rating) ? '#e47911' : '#ccc', fontSize: 13 }}>★</span>)}
                                      <span style={{ fontSize: 12, color: '#555', marginLeft: 2 }}>{p.reviews}</span>
                                    </div>
                                    <button onClick={() => { setSbVidProductPicker(idx); setSbVidProductPickerQuery(''); setSbVidProductPickerPage(1); }}
                                      style={{ background: 'none', border: 'none', color: '#0073bb', fontSize: 12, cursor: 'pointer', padding: 0, marginTop: 4 }}>
                                      Change product
                                    </button>
                                  </div>
                                  <button onClick={() => setSbVidProducts(prev => prev.filter((_, i) => i !== idx))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18, lineHeight: 1, flexShrink: 0, paddingTop: 0 }}>×</button>
                                </div>
                              ))}
                              {/* Add products button */}
                              <div style={{ display: 'inline-block', marginTop: 4 }}>
                                <button
                                  onClick={e => {
                                    if (sbVidProducts.length >= 3) {
                                      const r = e.currentTarget.getBoundingClientRect();
                                      setSbVidAddTooltipPos({ top: r.top - 46, left: r.left });
                                      setSbVidAddTooltip(true);
                                      setTimeout(() => setSbVidAddTooltip(false), 2500);
                                    } else { setSbVidProductPicker('add'); setSbVidProductPickerQuery(''); setSbVidProductPickerPage(1); }
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', border: '1px solid #aaa', borderRadius: 4, background: '#f8f8f8', cursor: 'pointer', fontSize: 13 }}>
                                  <span style={{ fontSize: 18, color: '#555', lineHeight: 1 }}>+</span>
                                  <span>Add products</span>
                                </button>
                                {sbVidAddTooltip && sbVidAddTooltipPos && (
                                  <div style={{ position: 'fixed', top: sbVidAddTooltipPos.top, left: sbVidAddTooltipPos.left, background: '#222', color: 'white', fontSize: 12, padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 9999, pointerEvents: 'none' }}>
                                    To add another product, first remove a product.
                                    <div style={{ position: 'absolute', top: '100%', left: 20, borderWidth: '6px 6px 0', borderStyle: 'solid', borderColor: '#222 transparent transparent' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* ── Right 70% — preview ── */}
                  {(() => {
                    const VID_FORMATS = ['mobile-search', 'mobile-detail'];
                    const VID_LABELS = { 'mobile-search': 'Top and inline search', 'mobile-detail': 'Top and inline search' };
                    const goVidPage = p => { const c = Math.max(1, Math.min(2, p)); setSbVidPreviewPage(c); setSbVidPreviewFormat(VID_FORMATS[c - 1]); };
                    const VidLogoBox = () => (
                      <div style={{ width: 52, height: 28, background: sbLogoUrl?.bg || '#e8e8e8', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {sbLogoUrl?.type === 'upload' ? <img src={sbLogoUrl.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (sbLogoUrl?.lines || []).map((l, i) => <span key={i} style={{ color: l.c, fontWeight: 900, fontSize: 7, letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.1 }}>{l.t}</span>)}
                      </div>
                    );
                    const VideoPlayerBox = ({ h }) => (
                      <div style={{ background: '#d5d5d5', height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '0 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="#555"><path d="M2 1l11 7-11 7V1z"/></svg>
                        </div>
                        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#666' }}>↺</div>
                        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><rect x="1" y="1" width="3" height="8" rx="1"/><rect x="6" y="1" width="3" height="8" rx="1"/></svg>
                        </div>
                      </div>
                    );
                    const defaultProd = { imageType: 'over-ear-black', name: 'SoundMax Pro Wireless Headphones', rating: 4.5, reviews: 2847 };
                    const prods = sbLandingPage === 'product-detail'
                      ? (sbVidPDPProduct ? [sbVidPDPProduct] : [defaultProd])
                      : (sbVidProducts.length > 0 ? sbVidProducts : [defaultProd]);
                    const carouselIdx = Math.min(sbVidProductCarouselIdx, prods.length - 1);
                    const carouselP = prods[carouselIdx];
                    const prevP = carouselIdx > 0 ? prods[carouselIdx - 1] : null;
                    const nextP = carouselIdx < prods.length - 1 ? prods[carouselIdx + 1] : null;
                    /* Mobile carousel — 1 product with peek of prev/next */
                    const ProductRow = () => (
                      <div style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', padding: '6px 0', gap: 4 }}>
                          {/* Prev card peek */}
                          {prevP ? (
                            <div style={{ flex: '0 0 50px', overflow: 'hidden', background: '#f8f8f8', border: '1px solid #eee', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 38, height: 38, overflow: 'hidden' }}>{PRODUCT_IMAGES[prevP.imageType] || PRODUCT_IMAGES['over-ear-black']}</div>
                            </div>
                          ) : (
                            <div style={{ flex: '0 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 9, color: '#bbb', letterSpacing: -1 }}>..</span>
                            </div>
                          )}
                          {/* Current card */}
                          <div style={{ flex: 1, background: 'white', borderRadius: 3, padding: '6px 8px', border: '1px solid #ddd', display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
                            <div style={{ width: 48, height: 48, flexShrink: 0, border: '1px solid #f0f0f0', borderRadius: 2, overflow: 'hidden' }}>{PRODUCT_IMAGES[carouselP.imageType] || PRODUCT_IMAGES['over-ear-black']}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 9.5, color: '#111', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{carouselP.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 3 }}>
                                <div style={{ display: 'flex', gap: 0.5 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(carouselP.rating||4.5) ? '#e47911' : '#ccc', fontSize: 10 }}>★</span>)}</div>
                                <span style={{ fontSize: 8.5, color: '#555' }}>{carouselP.reviews || 2847}</span>
                              </div>
                            </div>
                          </div>
                          {/* Next card peek */}
                          {nextP && (
                            <div style={{ flex: '0 0 50px', overflow: 'hidden', background: '#f8f8f8', border: '1px solid #eee', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 38, height: 38, overflow: 'hidden' }}>{PRODUCT_IMAGES[nextP.imageType] || PRODUCT_IMAGES['over-ear-black']}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    const gridBg = { backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' };
                    return (
                      <div style={{ flex: '0 0 70%', background: '#2d2d2d', display: 'flex', flexDirection: 'column' }}>
                        {/* Top bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #444', background: '#383838' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, color: '#ddd', fontWeight: 600 }}>Preview:</span>
                            <div style={{ position: 'relative' }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbVidPreviewFormatOpen(false); }} tabIndex={-1}>
                              <div onClick={() => setSbVidPreviewFormatOpen(o => !o)}
                                style={{ background: 'white', border: '1px solid #999', borderRadius: 4, padding: '5px 12px', fontSize: 13, color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                                <span style={{ fontSize: 14 }}>📱</span>
                                <span style={{ flex: 1 }}>{VID_LABELS[sbVidPreviewFormat]}</span>
                                <ChevronDown size={13} color="#666" />
                              </div>
                              {sbVidPreviewFormatOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 2, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 400, width: 220, overflow: 'hidden' }}>
                                  {[['mobile-search', '📱 Top and inline search (mobile)'], ['mobile-detail', '🖥️ Top and inline search (desktop)']].map(([k, label]) => (
                                    <div key={k} onClick={() => { setSbVidPreviewFormat(k); setSbVidPreviewPage(VID_FORMATS.indexOf(k) + 1); setSbVidPreviewFormatOpen(false); }}
                                      style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: '#222', fontWeight: sbVidPreviewFormat === k ? 700 : 400, borderLeft: sbVidPreviewFormat === k ? '3px solid #0073bb' : '3px solid transparent', background: sbVidPreviewFormat === k ? '#f5f9ff' : 'white' }}
                                      onMouseEnter={e => { if (sbVidPreviewFormat !== k) e.currentTarget.style.background = '#f5f5f5'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = sbVidPreviewFormat === k ? '#f5f9ff' : 'white'; }}>
                                      {label}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: '#bbb' }}>{sbVidPreviewPage} of 2</span>
                            {[[-1,'‹'],[1,'›']].map(([d,sym]) => (
                              <button key={d} onClick={() => goVidPage(sbVidPreviewPage + d)}
                                style={{ width: 26, height: 26, background: '#555', border: '1px solid #666', borderRadius: 3, color: '#eee', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {sym}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview area with side nav arrows */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', ...gridBg, overflow: 'hidden', position: 'relative' }}>
                          {/* Side nav arrows — cycle products on mobile, cycle pages on desktop */}
                          {sbVidPreviewFormat === 'mobile-search' ? (<>
                            <button onClick={() => setSbVidProductCarouselIdx(Math.max(0, carouselIdx - 1))} disabled={carouselIdx <= 0}
                              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: carouselIdx <= 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)', border: 'none', cursor: carouselIdx <= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: carouselIdx <= 0 ? '#888' : '#222', fontSize: 18, fontWeight: 700 }}>‹</button>
                            <button onClick={() => setSbVidProductCarouselIdx(Math.min(prods.length - 1, carouselIdx + 1))} disabled={carouselIdx >= prods.length - 1}
                              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: carouselIdx >= prods.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.85)', border: 'none', cursor: carouselIdx >= prods.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: carouselIdx >= prods.length - 1 ? '#888' : '#222', fontSize: 18, fontWeight: 700 }}>›</button>
                          </>) : (<>
                            <button onClick={() => goVidPage(sbVidPreviewPage - 1)} disabled={sbVidPreviewPage <= 1}
                              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: sbVidPreviewPage <= 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', border: 'none', cursor: sbVidPreviewPage <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: sbVidPreviewPage <= 1 ? '#666' : '#222', fontSize: 18, fontWeight: 700 }}>‹</button>
                            <button onClick={() => goVidPage(sbVidPreviewPage + 1)} disabled={sbVidPreviewPage >= 2}
                              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: sbVidPreviewPage >= 2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', border: 'none', cursor: sbVidPreviewPage >= 2 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: sbVidPreviewPage >= 2 ? '#666' : '#222', fontSize: 18, fontWeight: 700 }}>›</button>
                          </>)}
                          {/* "Where will my ad show?" */}
                          <div style={{ position: 'absolute', top: 10, right: 48, fontSize: 11, color: '#ddd', cursor: 'pointer', textDecoration: 'underline' }}>Where will my ad show?</div>

                          {sbVidPreviewFormat === 'mobile-search' && (
                            <div style={{ width: 280, background: '#1a1a1a', borderRadius: '22px 22px 0 0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', marginTop: 20 }}>
                              {/* Phone notch */}
                              <div style={{ background: '#111', padding: '10px 0 6px', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: 60, height: 6, background: '#333', borderRadius: 3 }} />
                              </div>
                              {/* Amazon header */}
                              <div style={{ background: '#37475a', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: 'white', fontWeight: 900, fontSize: 14, fontStyle: 'italic' }}>amazon</span>
                                <div style={{ flex: 1, background: '#f2f2f2', borderRadius: 3, height: 22, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                                  <span style={{ fontSize: 9, color: '#999' }}>Search Amazon</span>
                                </div>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                              </div>
                              {/* Ad content */}
                              <div style={{ background: 'white', flex: 1 }}>
                                {/* Logo + headline row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 6px' }}>
                                  <VidLogoBox />
                                  <span style={{ fontSize: 11, fontWeight: 600, color: '#111', flex: 1 }}>{sbVidHeadline || 'Your headline here'}</span>
                                </div>
                                {/* Video player */}
                                <VideoPlayerBox h={140} />
                                {/* Products */}
                                <ProductRow />
                                {/* Footer */}
                                <div style={{ padding: '4px 10px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 10, color: '#0073bb', fontWeight: 600 }}>Shop {sbBrandName} &gt;</span>
                                  <span style={{ fontSize: 9, color: '#888' }}>Sponsored</span>
                                </div>
                                {/* extra space so phone bleeds off */}
                                <div style={{ height: 40 }} />
                              </div>
                            </div>
                          )}
                          {sbVidPreviewFormat === 'mobile-detail' && (
                            /* Desktop horizontal banner — "2 of 2" */
                            <div style={{ width: '88%', maxWidth: 700, background: 'white', borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
                              {/* Banner body */}
                              <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                                {/* Left: logo + headline + shop link */}
                                <div style={{ width: 160, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '14px 14px' }}>
                                  <VidLogoBox />
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111', lineHeight: 1.35 }}>{sbVidHeadline || 'Your headline here'}</div>
                                  <div style={{ fontSize: 10, color: '#0073bb', fontWeight: 600 }}>Shop {sbBrandName} &gt;</div>
                                </div>
                                {/* Center: video */}
                                <div style={{ flex: '0 0 220px' }}>
                                  <VideoPlayerBox h={140} />
                                </div>
                                {/* Right: product cards */}
                                <div style={{ flex: 1, display: 'flex', gap: 0, padding: '10px 10px', alignItems: 'flex-start', overflowX: 'hidden' }}>
                                  {prods.slice(0, 3).map((p, i) => (
                                    <div key={i} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 5px' }}>
                                      <div style={{ width: '100%', aspectRatio: '1', background: '#f5f5f5', borderRadius: 2, overflow: 'hidden', border: '1px solid #eee', marginBottom: 4 }}>
                                        {PRODUCT_IMAGES[p.imageType] || PRODUCT_IMAGES['over-ear-black']}
                                      </div>
                                      <div style={{ fontSize: 8.5, color: '#111', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%' }}>{p.name}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 2 }}>
                                        <div style={{ display: 'flex', gap: 0.5 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(p.rating||4.5) ? '#e47911' : '#ccc', fontSize: 9 }}>★</span>)}</div>
                                        <span style={{ fontSize: 8, color: '#888' }}>{p.reviews || 2847}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Footer */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 10px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                                <span style={{ fontSize: 9, color: '#888' }}>Sponsored ℹ</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}

          {/* Product exclusions — automatic collection only */}
          {sbAdFormat === 'product-collection' && sbCollectionType === 'automatic' && (
            <div className="ccs-card ccs-collapsible" style={{ marginBottom: 16 }}>
              <button className="ccs-collapsible-header" onClick={() => setSbExclOpen(o => !o)}>
                <div className="ccs-collapsible-left">
                  {sbExclOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="ccs-card-heading">Product exclusions <InfoIcon /></span>
                  <span className="ccs-optional-tag">optional</span>
                </div>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How product exclusion works</a>
              </button>
              {sbExclOpen && (
                <div style={{ borderTop: '1px solid var(--amazon-border)', display: 'flex' }}>
                  {/* Left */}
                  <div style={{ flex: 1, borderRight: '1px solid var(--amazon-border)' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--amazon-border)' }}>
                      {[['enter-list', 'Enter list'], ['upload', 'Upload']].map(([k, l]) => (
                        <button key={k} onClick={() => setSbExclTab(k)} style={{
                          padding: '10px 18px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
                          borderBottom: sbExclTab === k ? '2px solid #0073bb' : '2px solid transparent',
                          color: sbExclTab === k ? '#0073bb' : '#555', fontWeight: sbExclTab === k ? 600 : 400,
                        }}>{l}</button>
                      ))}
                    </div>
                    {sbExclTab === 'enter-list' ? (
                      <div style={{ padding: '14px 16px' }}>
                        <textarea className="ccs-textarea" rows={8} value={sbExclText}
                          onChange={e => setSbExclText(e.target.value)}
                          placeholder="Enter ASINs separated by a comma, space, or new line."
                          style={{ width: '100%' }} />
                        <div style={{ textAlign: 'right', marginTop: 8 }}>
                          <button className="btn btn-secondary" disabled={!sbExclText.trim()} onClick={() => {
                            const asins = sbExclText.split(/[\s,\n]+/).map(a => a.trim().toUpperCase()).filter(a => /^[A-Z0-9]{10}$/.test(a));
                            setSbExcludedAsins(prev => [...new Set([...prev, ...asins])]);
                            setSbExclText('');
                          }}>Exclude</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ border: '2px dashed #ccc', borderRadius: 4, padding: '32px 40px', textAlign: 'center', color: '#888', fontSize: 13, width: '100%' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                          <div>Drag and drop a CSV file here, or</div>
                          <label style={{ color: '#0073bb', cursor: 'pointer', fontWeight: 600 }}>
                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const lines = ev.target.result.split('\n').slice(1);
                                const asins = lines.map(l => l.trim().toUpperCase()).filter(a => /^[A-Z0-9]{10}$/.test(a));
                                setSbExcludedAsins(prev => [...new Set([...prev, ...asins])]);
                              };
                              reader.readAsText(file);
                              e.target.value = '';
                            }} />
                            browse files
                          </label>
                          <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Accepted format: CSV</div>
                        </div>
                        <a href="data:text/csv;charset=utf-8,ASIN%0AASIN1%20(one%20ASIN%20per%20row)" download="template.csv"
                          style={{ fontSize: 13, color: '#0073bb' }}>Download CSV template</a>
                      </div>
                    )}
                  </div>
                  {/* Right */}
                  <div style={{ width: 340, flexShrink: 0 }}>
                    <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--amazon-border)' }}>
                      <strong style={{ fontSize: 13 }}>{sbExcludedAsins.length} excluded</strong>
                      {sbExcludedAsins.length > 0 && <button className="link-btn" style={{ fontSize: 12, color: '#555' }} onClick={() => setSbExcludedAsins([])}>Remove all</button>}
                    </div>
                    <div style={{ padding: '10px 16px', fontSize: 13, color: '#888', fontWeight: 500, borderBottom: '1px solid #f0f0f0' }}>Products</div>
                    {sbExcludedAsins.length === 0 ? (
                      <div style={{ padding: '20px 16px', fontSize: 13, color: '#aaa' }}>No products excluded</div>
                    ) : (
                      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sbExcludedAsins.map(asin => (
                          <div key={asin} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                            <span style={{ color: '#0073bb' }}>{asin}</span>
                            <button className="ccs-remove-btn" onClick={() => setSbExcludedAsins(p => p.filter(a => a !== asin))}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products — only for manual collection */}
          {sbAdFormat === 'product-collection' && sbCollectionType === 'manual' && (
            <div className="ccs-card" style={{ marginBottom: 16 }}>
              <div className="ccs-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ccs-card-heading">Products</span>
                  <span style={{ fontSize: 11, padding: '1px 7px', background: '#5c4ee5', color: 'white', borderRadius: 12, fontWeight: 600 }}>New</span>
                  <InfoIcon />
                </div>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to add products to your campaign</a>
              </div>
              <div style={{ fontSize: 13, color: '#555', padding: '8px 20px 4px' }}>Choose related products to feature in your ad.</div>
              <div style={{ display: 'flex' }}>
                {/* Left panel */}
                <div style={{ flex: 1, borderRight: '1px solid var(--amazon-border)' }}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--amazon-border)', paddingLeft: 4 }}>
                    {[['search','Search'],['enter-list','Enter list'],['upload','Upload']].map(([k,l]) => (
                      <button key={k} onClick={() => setSbProductTab(k)} style={{
                        padding: '10px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: sbProductTab === k ? '2px solid #0073bb' : '2px solid transparent',
                        color: sbProductTab === k ? '#0073bb' : '#555', fontWeight: sbProductTab === k ? 700 : 400,
                      }}>{l}</button>
                    ))}
                  </div>

                  {sbProductTab === 'search' && (
                    <div>
                      <div style={{ padding: '12px 16px', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <div className="ccs-search-wrap">
                              <Search size={14} className="ccs-search-icon" />
                              <input className="ccs-search-input" value={sbProductSearch}
                                onChange={e => { setSbProductSearch(e.target.value); setSbProductAutoComplete(e.target.value.length > 1); }}
                                onBlur={() => setTimeout(() => setSbProductAutoComplete(false), 150)}
                                placeholder="Search by product name" />
                            </div>
                            {sbProductAutoComplete && sbFiltered.length > 0 && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 300, maxHeight: 200, overflowY: 'auto' }}>
                                {sbFiltered.slice(0, 5).map(p => (
                                  <div key={p.asin} onMouseDown={() => { setSbProductSearch(p.name); setSbProductAutoComplete(false); }}
                                    style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#333', lineHeight: 1.4 }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                    {p.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Brand filter pill */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #ccc', borderRadius: 4, padding: '0 10px', fontSize: 13, cursor: 'pointer', background: 'white', whiteSpace: 'nowrap' }}>
                            SoundMax <ChevronDown size={13} style={{ marginLeft: 4 }} />
                          </div>
                        </div>
                      </div>
                      {/* Product list */}
                      <div>
                        {sbFiltered.map(p => {
                          const added = !!sbProducts.find(x => x.asin === p.asin);
                          const atLimit = sbProducts.length >= 10 && !added;
                          return (
                            <div key={p.asin} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                              <ProductImage imageType={p.imageType} size={52} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: '#0066c0', cursor: 'pointer', lineHeight: 1.4, marginBottom: 4 }}>{p.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555', marginBottom: 3 }}>
                                  <Stars rating={p.rating} />
                                  <span>({p.reviews})</span>
                                  <span>Price may vary by location</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'In stock' ? '#007600' : '#888', display: 'inline-block' }} />
                                    {p.status || 'In stock'}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: '#555' }}>ASIN: {p.asin}</div>
                              </div>
                              <button
                                onClick={() => {
                                  if (added) setSbProducts(prev => prev.filter(x => x.asin !== p.asin));
                                  else if (!atLimit) setSbProducts(prev => [...prev, p]);
                                }}
                                disabled={atLimit && !added}
                                style={{
                                  padding: '5px 16px', fontSize: 13, borderRadius: 16,
                                  border: '1px solid #ccc', background: added ? '#e8f4e8' : atLimit ? '#f5f5f5' : 'white',
                                  color: added ? '#2d6a2d' : atLimit ? '#aaa' : '#333',
                                  cursor: atLimit && !added ? 'not-allowed' : 'pointer', flexShrink: 0,
                                }}>
                                {added ? 'Added' : 'Add'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      {/* Pagination */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid #f0f0f0', fontSize: 13, color: '#555' }}>
                        <span>1-{Math.min(sbFiltered.length, 10)} of {sbFiltered.length} results</span>
                        <button style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer' }} disabled>‹</button>
                        <button style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer' }} disabled>›</button>
                      </div>
                    </div>
                  )}

                  {sbProductTab === 'enter-list' && (
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>Enter one ASIN per line.</div>
                      <textarea className="ccs-textarea" rows={8} placeholder="B0XXXXXXXXX"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: 13 }} />
                      <div style={{ textAlign: 'right', marginTop: 8 }}>
                        <button className="btn btn-secondary">Add products</button>
                      </div>
                    </div>
                  )}

                  {sbProductTab === 'upload' && (
                    <div style={{ padding: '20px 20px' }}>
                      <p style={{ fontSize: 13, color: '#333', marginBottom: 14 }}>Use the template to make sure your information uploads accurately.</p>
                      <a href="data:text/csv;charset=utf-8,ASIN%0AB0XXXXXXXXX" download="product-template.csv"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', border: '1px solid #ccc', borderRadius: 20, fontSize: 13, color: '#333', textDecoration: 'none', background: '#f5f5f5', marginBottom: 16 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 1v8M7 9l-3-3M7 9l3-3M2 12h10" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Download the CSV template
                      </a>
                      <label style={{ display: 'block', cursor: 'pointer' }}>
                        <input type="file" accept=".csv,.tsv,.xlsx" style={{ display: 'none' }} onChange={e => {
                          const file = e.target.files[0]; if (!file) return;
                          e.target.value = '';
                        }} />
                        <div style={{ border: '1.5px dashed #b0b8c9', borderRadius: 8, padding: '48px 20px', textAlign: 'center', background: '#f8f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 26V10M18 10l-7 7M18 10l7 7" stroke="#3d4966" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="4" y="28" width="28" height="3" rx="1.5" fill="#3d4966"/>
                          </svg>
                          <div style={{ fontSize: 13, color: '#3d4966' }}>Drag and drop file to add</div>
                          <div style={{ fontSize: 13, color: '#3d4966' }}>or click to select from your computer</div>
                          <div style={{ fontSize: 12, color: '#7a8299', marginTop: 4 }}>Accepted formats: CSV, TSV, XLSX</div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Right panel */}
                <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--amazon-border)', fontWeight: 700, fontSize: 14 }}>
                    {sbProducts.length} products
                  </div>
                  {sbProducts.length < 3 && (
                    <div style={{ margin: 12, padding: '12px 14px', background: '#fff5f5', border: '1px solid #e8a0a0', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c40000' }}>
                      <span style={{ fontSize: 16 }}>!</span>
                      <span>Add at least three products to advertise</span>
                    </div>
                  )}
                  <div style={{ padding: '8px 16px', fontSize: 13, color: '#555' }}>
                    Add 3-10 products to feature in your ad.<br />Drag cards to change the display order.
                  </div>
                  {sbProducts.length > 0 && (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                      {sbProducts.map((p, idx) => (
                        <div key={p.asin} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid #f0f0f0' }}>
                          <span style={{ color: '#aaa', fontSize: 14, cursor: 'grab' }}>⠿</span>
                          <ProductImage imageType={p.imageType} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>ASIN: {p.asin}</div>
                          </div>
                          <button className="ccs-remove-btn" onClick={() => setSbProducts(prev => prev.filter(x => x.asin !== p.asin))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Bottom validation */}
              {sbProducts.length < 3 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#c40000' }}>
                  <span>!</span> Add at least three products to advertise
                </div>
              )}
            </div>
          )}

          {/* ═══ TARGETING TYPE SELECTOR — manual collection only ═══ */}
          {((sbCollectionType === 'manual' && sbProducts.length >= 3) || (sbAdFormat === 'store-spotlight' && sbSSStore) || sbAdFormat === 'video') && (sbAdFormat !== 'store-spotlight' || sbSSStore) && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && !(sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight')) && <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span style={{ fontSize: 20, fontWeight: 700 }}>Targeting <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> Select your targeting strategy</a>
            </div>
            <div className="ccs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'keyword', label: 'Keyword targeting', info: true, desc: 'Choose keywords to help your products appear in shopper searches.' },
                { key: 'product', label: 'Product targeting', info: true, desc: 'Choose specific products, categories, brands, or other product features to target your ads.' },
              ].map(opt => {
                const isProductDisabled = opt.key === 'product' && sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight');
                return (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: isProductDisabled ? 'not-allowed' : 'pointer', opacity: isProductDisabled ? 0.5 : 1 }}>
                  <input type="radio" name="sbTargetType" checked={sbTargetType === opt.key} onChange={() => { if (!isProductDisabled) setSbTargetType(opt.key); }} disabled={isProductDisabled} style={{ accentColor: '#0073bb', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{opt.label} {opt.info && <InfoIcon />}</div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{opt.desc}</div>
                    {isProductDisabled && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Not available with Grow brand impression share outcome.</div>}
                  </div>
                </label>
                );
              })}
            </div>
          </div>}

          {/* ─── KEYWORD TARGETING CARD ─── */}
          {/* automatic: always show; manual: only when 3+ products and keyword targeting selected */}
          {((sbCollectionType === 'automatic' && sbAdFormat !== 'video' && sbAdFormat !== 'store-spotlight') || (sbCollectionType === 'manual' && sbProducts.length >= 3 && sbTargetType === 'keyword') || (sbAdFormat === 'store-spotlight' && sbSSStore && sbTargetType === 'keyword') || (sbAdFormat === 'video' && sbTargetType === 'keyword')) && (sbAdFormat !== 'store-spotlight' || sbSSStore) && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && (
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Keyword targeting <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> Select keywords to target</a>
            </div>
            <div style={{ display: 'flex' }}>
              {/* Left */}
              <div style={{ flex: '0 0 50%', minWidth: 0, borderRight: '1px solid var(--amazon-border)' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--amazon-border)' }}>
                  {(sbCollectionType === 'manual' || sbAdFormat === 'store-spotlight' || sbAdFormat === 'video'
                    ? [['suggested','Suggested'],['enter-list','Enter list'],['upload-file','Upload file']]
                    : [['enter-list','Enter list'],['upload-file','Upload file']]
                  ).map(([k, l]) => (
                    <button key={k} onClick={() => setSbKwTab(k)} style={{
                      padding: '10px 18px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
                      borderBottom: (sbCollectionType === 'automatic' && sbAdFormat !== 'store-spotlight' && sbAdFormat !== 'video' && sbKwTab === 'suggested' ? 'enter-list' : sbKwTab) === k ? '2px solid #0073bb' : '2px solid transparent',
                      color: (sbCollectionType === 'automatic' && sbAdFormat !== 'store-spotlight' && sbAdFormat !== 'video' && sbKwTab === 'suggested' ? 'enter-list' : sbKwTab) === k ? '#0073bb' : '#666',
                      fontWeight: (sbCollectionType === 'automatic' && sbAdFormat !== 'store-spotlight' && sbAdFormat !== 'video' && sbKwTab === 'suggested' ? 'enter-list' : sbKwTab) === k ? 700 : 400,
                    }}>{l}</button>
                  ))}
                </div>

                {/* ── Suggested tab — manual collection / store-spotlight / video ── */}
                {(sbCollectionType === 'manual' || sbAdFormat === 'store-spotlight' || sbAdFormat === 'video') && sbKwTab === 'suggested' && (
                  <div>
                    {/* Fixed: Bid + Filter by */}
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: '1px solid #f0f0f0' }}>
                      {/* Bid row */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 60 }}>Bid <InfoIcon /></span>
                          <div style={{ position: 'relative' }}
                            onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbKwBidDropOpen(false); }}
                            tabIndex={-1}>
                            <div onClick={() => setSbKwBidDropOpen(o => !o)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #ccc', borderRadius: 20, padding: '4px 12px 4px 14px', fontSize: 13, cursor: 'pointer', background: '#f5f5f5', userSelect: 'none' }}>
                              {sbKwBidMode === 'suggested' ? 'Suggested bid' : sbKwBidMode === 'default' ? 'Default bid' : 'Custom bid'}
                              <ChevronDown size={12} />
                            </div>
                            {sbKwBidDropOpen && (
                              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 300, width: 240, overflow: 'hidden' }}>
                                {[
                                  { key: 'suggested', label: 'Suggested bid', desc: 'Based on past bidding activity to predict bids likely to win.' },
                                  { key: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added keywords.' },
                                  ...(sbGoal !== 'impression-share' ? [{ key: 'default', label: 'Default bid', desc: 'Use the ad group default bid for all newly added keywords.' }] : []),
                                ].map(opt => (
                                  <div key={opt.key} onClick={() => { setSbKwBidMode(opt.key); setSbKwBidDropOpen(false); }}
                                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{opt.label}</div>
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{opt.desc}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {(sbKwBidMode === 'custom' || sbKwBidMode === 'default') && (
                            <div>
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={sbKwBid} min="0"
                                  onChange={e => { const v = parseFloat(e.target.value); setSbKwBid(v < 0 ? '0' : e.target.value); setSbKwBidWarn(false); }}
                                  onBlur={e => setSbKwBidWarn(e.target.value !== '' && parseFloat(e.target.value) < 0.01)}
                                  style={{ width: 70 }} />
                              </div>
                              {sbKwBidWarn && <div style={{ fontSize: 11, color: '#c40000', marginTop: 3 }}>Minimum bid is ₹0.01</div>}
                            </div>
                          )}
                          <span style={{ fontSize: 13, color: '#666' }}>
                            {sbGoal === 'impression-share' ? 'per 1,000 viewable impressions (VCPM)' : 'per click (CPC)'}
                          </span>
                        </div>
                        {sbGoal === 'impression-share' && sbKwBidMode === 'suggested' && (
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>Suggested VCPM bid is the total amount you would pay, on average, if your ad were viewed at top of search 1,000 times.</div>
                            <a href="https://advertising.amazon.in/help/GDS2E64R9GQ35768" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#0066c0', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 15, height: 15, borderRadius: '50%', border: '1.5px solid #0066c0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>?</span>
                              Learn more about vCPM bids
                            </a>
                          </div>
                        )}
                        {sbGoal === 'impression-share' && sbKwBidMode === 'custom' && (
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>A VCPM bid of at least ₹200.00 can increase your chances of winning views in the top-of-search placement.</div>
                            <a href="https://advertising.amazon.in/help/GDS2E64R9GQ35768" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#0066c0', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 15, height: 15, borderRadius: '50%', border: '1.5px solid #0066c0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>?</span>
                              Learn more about vCPM bids
                            </a>
                          </div>
                        )}
                      </div>
                      {/* Filter by */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 60 }}>Filter by <InfoIcon /></span>
                        {['broad', 'phrase', 'exact'].map(m => (
                          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox" checked={kwFilters[m]} onChange={e => setKwFilters(f => ({ ...f, [m]: e.target.checked }))}
                              style={{ accentColor: '#0073bb', width: 14, height: 14 }} />
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable: Targeting groups + keywords */}
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {/* Targeting groups */}
                      <div>
                        {(() => {
                          const vcpm = sbGoal === 'impression-share';
                          const M = 29.43;
                          const tgs = [
                            { key: 'brand', label: 'Keywords related to your brand', suggBid: 29.75, min: 21.89, max: 45.64 },
                            { key: 'landing', label: 'Keywords related to your landing pages', suggBid: 29.75, min: 21.89, max: 45.64 },
                          ].map(g => ({
                            ...g,
                            dispSugg: vcpm ? g.suggBid * M : g.suggBid,
                            dispMin: vcpm ? g.min * M : g.min,
                            dispMax: vcpm ? g.max * M : g.max,
                          }));
                          return (<>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', padding: '8px 16px', fontSize: 12, color: '#555', borderBottom: '1px solid #f0f0f0', fontWeight: 600, background: '#fafafa' }}>
                          <span>Targeting groups <InfoIcon /></span>
                          <span>Match type <InfoIcon /></span>
                          <span>Sugg. bid <InfoIcon /></span>
                          <button className="link-btn" style={{ fontSize: 12, color: '#0073bb', textAlign: 'right' }}
                            onClick={() => setSbAddedTargetGroups(tgs.map(g => ({ key: g.key, label: g.label, matchType: 'Theme', bid: g.dispSugg.toFixed(2), suggBid: g.dispSugg, min: g.dispMin, max: g.dispMax })))}>Add All</button>
                        </div>
                        {tgs.map(g => {
                          const isAdded = !!sbAddedTargetGroups.find(x => x.key === g.key);
                          return (
                            <div key={g.key} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{g.label} <InfoIcon /></span>
                              <span style={{ color: '#666' }}>Theme</span>
                              <span>₹{g.dispSugg.toFixed(2)}</span>
                              {isAdded
                                ? <span style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>Added</span>
                                : <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }}
                                    onClick={() => setSbAddedTargetGroups(p => [...p, { key: g.key, label: g.label, matchType: 'Theme', bid: g.dispSugg.toFixed(2), suggBid: g.dispSugg, min: g.dispMin, max: g.dispMax }])}>
                                    Add
                                  </button>}
                            </div>
                          );
                        })}
                          </>);
                        })()}
                      </div>

                      {/* Individual keywords */}
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', padding: '8px 16px', fontSize: 12, color: '#555', borderBottom: '1px solid #f0f0f0', fontWeight: 600, background: '#fafafa' }}>
                          <span>Keyword</span>
                          <span>Match type <InfoIcon /></span>
                          <span>Sugg. bid <InfoIcon /></span>
                          <button className="link-btn" style={{ fontSize: 12, color: '#0073bb', textAlign: 'right' }} onClick={sbAddAllSuggKws}>Add All</button>
                        </div>
                        {SUGGESTED_KWS.map(s => {
                          const matches = ['broad', 'phrase', 'exact'].filter(m => kwFilters[m]);
                          return (
                            <div key={s.kw} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <div style={{ padding: '8px 16px 0', fontSize: 13, fontWeight: 500 }}>{s.kw}</div>
                              {matches.map(m => {
                                const mt = m.charAt(0).toUpperCase() + m.slice(1);
                                const kd = s[m];
                                const isAdded = !!addedKws.find(k => k.type !== 'group' && k.keyword === s.kw && k.matchType === mt);
                                return (
                                  <div key={m} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', padding: '4px 16px', fontSize: 13, alignItems: 'center' }}>
                                    <span />
                                    <span className={`match-badge match-${m}`}>{mt}</span>
                                    <span style={{ fontSize: 13, color: '#333' }}>
                                      {(() => {
                                        const M = sbGoal === 'impression-share' ? 29.43 : 1;
                                        return sbKwBidMode === 'suggested'
                                          ? `₹${(kd.sugg * M).toFixed(2)}`
                                          : `₹${(kd.min * M).toFixed(2)} – ₹${(kd.max * M).toFixed(2)}`;
                                      })()}
                                    </span>
                                    {isAdded
                                      ? <span style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>Added</span>
                                      : <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }} onClick={() => sbAddKwFromSugg(s.kw, mt, kd)}>Add</button>}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Enter list tab ── */}
                {/* automatic falls back to enter-list if sbKwTab is somehow 'suggested' (not for video/store-spotlight) */}
                {(sbKwTab === 'enter-list' || (sbCollectionType === 'automatic' && sbAdFormat !== 'store-spotlight' && sbAdFormat !== 'video' && sbKwTab === 'suggested')) && (
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Bid <InfoIcon /></span>
                      <div style={{ position: 'relative' }}
                        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSbKwBidDropOpen(false); }}
                        tabIndex={-1}>
                        <div onClick={() => setSbKwBidDropOpen(o => !o)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #ccc', borderRadius: 20, padding: '4px 12px 4px 14px', fontSize: 13, cursor: 'pointer', background: '#f5f5f5', userSelect: 'none' }}>
                          {sbKwBidMode === 'custom' ? 'Custom bid' : 'Suggested bid'}
                          <ChevronDown size={12} />
                        </div>
                        {sbKwBidDropOpen && (
                          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'white', border: '1px solid #ddd', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 300, width: 260, overflow: 'hidden' }}>
                            {[
                              { key: 'suggested', label: 'Suggested bid', desc: 'Automatically applies a suggested bid based on keyword competitiveness.' },
                              { key: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added keywords.' },
                            ].map(opt => (
                              <div key={opt.key} onClick={() => { setSbKwBidMode(opt.key); setSbKwBidDropOpen(false); }}
                                style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: sbKwBidMode === opt.key ? '#f0f7ff' : 'white' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.background = sbKwBidMode === opt.key ? '#f0f7ff' : 'white'}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{opt.label}</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{opt.desc}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {sbKwBidMode === 'custom' && (
                        <div>
                          <div className="ccs-bid-input-wrap">
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={sbKwBid}
                              onChange={e => { const v = parseFloat(e.target.value); setSbKwBid(v < 0 ? '0' : e.target.value); setSbKwBidWarn(false); }}
                              onBlur={e => setSbKwBidWarn(e.target.value !== '' && parseFloat(e.target.value) < 0.01)}
                              min="0" style={{ width: 70 }} />
                          </div>
                          {sbKwBidWarn && <div style={{ fontSize: 11, color: '#c40000', marginTop: 3 }}>Minimum bid is ₹0.01</div>}
                        </div>
                      )}
                      <span style={{ fontSize: 13, color: '#555' }}>
                        {sbGoal === 'impression-share' ? 'per 1,000 viewable impressions (VCPM)' : 'per click (CPC)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Match type <InfoIcon /></span>
                      {['broad', 'phrase', 'exact'].map(m => (
                        <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                          <input type="checkbox" checked={kwFilters[m]} onChange={e => setKwFilters(f => ({ ...f, [m]: e.target.checked }))}
                            style={{ accentColor: '#0073bb', width: 14, height: 14 }} />
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </label>
                      ))}
                    </div>
                    <textarea className="ccs-textarea" rows={10} value={kwText}
                      onChange={e => setKwText(e.target.value)}
                      placeholder="Enter keywords separated by new line." style={{ width: '100%' }} />
                    <div style={{ textAlign: 'right', marginTop: 10 }}>
                      <button className="btn btn-secondary" disabled={!kwText.trim()}
                        onClick={() => { setKwEnterListErrors([]); sbAddKwsFromText(); }}>Add keywords</button>
                    </div>
                  </div>
                )}

                {/* ── Upload file tab ── */}
                {sbKwTab === 'upload-file' && (
                  <div style={{ padding: '20px 16px' }}>
                    <p style={{ fontSize: 13, color: '#333', marginBottom: 14 }}>Use the template to make sure your information uploads accurately.</p>
                    <a href="data:text/csv;charset=utf-8,Keyword%2CMatch%20Type%0Abluetooth%20headphones%2CBroad"
                      download="keyword-template.csv"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', border: '1px solid #ccc', borderRadius: 20, fontSize: 13, color: '#333', textDecoration: 'none', background: '#f5f5f5', marginBottom: 16 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M7 9l-3-3M7 9l3-3M2 12h10" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Download the CSV template
                    </a>
                    <label style={{ display: 'block', cursor: 'pointer' }}>
                      <input type="file" accept=".csv,.tsv,.xlsx" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files[0]; if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => { const lines = ev.target.result.split('\n').slice(1).map(l => l.trim()).filter(Boolean); setKwText(lines.join('\n')); setSbKwTab('enter-list'); };
                        reader.readAsText(file); e.target.value = '';
                      }} />
                      <div style={{ border: '1.5px dashed #b0b8c9', borderRadius: 8, padding: '48px 20px', textAlign: 'center', background: '#f8f9fb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M18 26V10M18 10l-7 7M18 10l7 7" stroke="#3d4966" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="28" width="28" height="3" rx="1.5" fill="#3d4966"/></svg>
                        <div style={{ fontSize: 13, color: '#3d4966' }}>Drag and drop file to add</div>
                        <div style={{ fontSize: 13, color: '#3d4966' }}>or click to select from your computer</div>
                        <div style={{ fontSize: 12, color: '#7a8299', marginTop: 4 }}>Accepted formats: CSV, TSV, XLSX</div>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Right panel */}
              <div style={{ flex: '0 0 50%', minWidth: 0, display: 'flex', flexDirection: 'column', maxHeight: 520 }}>
                <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--amazon-border)', flexShrink: 0 }}>
                  <strong style={{ fontSize: 13 }}>{sbAddedTargetGroups.length + addedKws.length} added</strong>
                  {(sbAddedTargetGroups.length + addedKws.length) > 0 && (
                    <button className="link-btn" style={{ fontSize: 12, color: '#0073bb' }} onClick={() => { setAddedKws([]); setSbAddedTargetGroups([]); }}>Remove all</button>
                  )}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 58px 80px 115px 20px', padding: '8px 12px', fontSize: 12, color: '#555', borderBottom: '1px solid #f0f0f0', fontWeight: 600, gap: 4, position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                  <span>Keyword</span><span>Match type <InfoIcon /></span><span>Sugg. bid <InfoIcon /></span><span>Bid <InfoIcon /></span><span />
                </div>
                {/* Targeting group rows */}
                {sbAddedTargetGroups.map(g => {
                  const vcpmM = sbGoal === 'impression-share' ? 29.43 : 1;
                  return (
                  <div key={g.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 58px 80px 115px 20px', padding: '8px 12px', fontSize: 13, borderBottom: '1px solid #f8f8f8', alignItems: 'center', gap: 4 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, wordBreak: 'break-word' }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>Targeting group</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#555' }}>{g.matchType}</span>
                    <div style={{ fontSize: 12 }}>
                      <div>₹{(g.suggBid * vcpmM).toFixed(2)}</div>
                      <div style={{ color: '#888', fontSize: 11 }}>₹{(g.min * vcpmM).toFixed(2)}–₹{(g.max * vcpmM).toFixed(2)}</div>
                    </div>
                    <div className="ccs-bid-input-wrap" style={{ width: 112, opacity: costControlActive ? 0.5 : 1 }}>
                      <span className="ccs-bid-prefix">₹</span>
                      <input type="number" className="ccs-bid-input" value={costControlActive ? '' : g.bid}
                        placeholder="-"
                        disabled={costControlActive}
                        onChange={e => { const v = parseFloat(e.target.value); setSbAddedTargetGroups(p => p.map(x => x.key === g.key ? { ...x, bid: v < 0 ? '0' : e.target.value } : x)); }}
                        style={{ width: 86, background: costControlActive ? '#f0f0f0' : '', color: costControlActive ? '#999' : '' }} />
                    </div>
                    <button className="ccs-remove-btn" onClick={() => setSbAddedTargetGroups(p => p.filter(x => x.key !== g.key))}>×</button>
                  </div>
                );})}
                {/* Regular keyword rows */}
                {addedKws.length === 0 && sbAddedTargetGroups.length === 0 && (
                  <div style={{ padding: '20px 16px', fontSize: 13, color: '#aaa' }}>No keywords added yet</div>
                )}
                {addedKws.map((k, i) => {
                  const vcpmM = sbGoal === 'impression-share' ? 29.43 : 1;
                  return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 58px 80px 115px 20px', padding: '8px 12px', fontSize: 13, borderBottom: '1px solid #f8f8f8', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, wordBreak: 'break-word', minWidth: 0 }}>{k.keyword}</span>
                    <span>{k.matchType ? <span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span> : '–'}</span>
                    <div style={{ fontSize: 12 }}>
                      {k.suggBid != null ? <div>₹{(k.suggBid * vcpmM).toFixed(2)}{k.min != null && k.max != null && <><br /><span style={{ color: '#888', fontSize: 11 }}>₹{(k.min * vcpmM).toFixed(2)}–₹{(k.max * vcpmM).toFixed(2)}</span></>}</div> : <span style={{ color: '#aaa' }}>–</span>}
                    </div>
                    <div className="ccs-bid-input-wrap" style={{ width: 112, opacity: costControlActive ? 0.5 : 1 }}>
                      <span className="ccs-bid-prefix">₹</span>
                      <input type="number" className="ccs-bid-input" value={costControlActive ? '' : k.bid}
                        placeholder="-"
                        disabled={costControlActive}
                        onChange={e => { const v = parseFloat(e.target.value); setAddedKws(p => p.map((x, j) => j === i ? { ...x, bid: v < 0 ? '0' : e.target.value } : x)); }}
                        style={{ width: 86, background: costControlActive ? '#f0f0f0' : '', color: costControlActive ? '#999' : '' }} />
                    </div>
                    <button className="ccs-remove-btn" onClick={() => setAddedKws(p => p.filter((_, j) => j !== i))}>×</button>
                  </div>
                );})}
                </div>{/* end scroll wrapper */}
              </div>
            </div>
          </div>
          )} {/* end sbTargetType === 'keyword' */}

          {/* ─── PRODUCT TARGETING CARD — manual collection + product targeting selected ─── */}
          {((sbCollectionType === 'manual' && sbProducts.length >= 3) || (sbAdFormat === 'store-spotlight' && sbSSStore) || sbAdFormat === 'video') && (sbAdFormat !== 'store-spotlight' || sbSSStore) && sbTargetType === 'product' && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && !(sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight')) && (
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Product Targeting <InfoIcon /></span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                  <Info size={12} /> How to use product targeting
                </a>
              </div>
              <div className="ccs-kw-layout">
                {/* ── Left panel ── */}
                <div className="ccs-kw-left" style={{ position: 'relative' }}>
                  {/* Main tabs */}
                  <div className="ccs-pt-main-tabs">
                    {[['categories','Categories'],['individual','Individual Products']].map(([k, l]) => (
                      <button key={k} className={`ccs-pt-main-tab ${ptMainTab === k ? 'active' : ''}`}
                        onClick={() => setPtMainTab(k)}>
                        {l} <InfoIcon />
                      </button>
                    ))}
                  </div>

                  {ptMainTab === 'categories' && (
                    <>
                      <div className="ccs-tab-row" style={{ padding: '0 0', borderBottom: 'none' }}>
                        {[['suggested','Suggested'],['search','Search']].map(([k, l]) => (
                          <button key={k} className={`ccs-tab ${ptCatTab === k ? 'active' : ''}`} onClick={() => setPtCatTab(k)}>
                            {l}{k === 'suggested' && <> <InfoIcon /></>}
                          </button>
                        ))}
                      </div>

                      <div className="ccs-kw-filters">
                        <div className="ccs-kw-filter-row" style={{ flexWrap: 'wrap', gap: 8 }}>
                          <span className="ccs-kw-filter-label">Bid <InfoIcon /></span>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="ccs-filter-btn-sm"
                              onClick={() => setPtBidDropOpen(o => !o)}>
                              {ptBidMode === 'suggested' ? 'Suggested bid' : ptBidMode === 'custom' ? 'Custom bid' : 'Default bid'} <ChevronDown size={11} />
                            </button>
                            {ptBidDropOpen && (
                              <div className="ccs-bid-mode-dropdown">
                                {[
                                  { k: 'suggested', label: 'Suggested bid', desc: 'Amazon sets the bid based on the likelihood to win the auction.' },
                                  { k: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added targets.' },
                                  { k: 'default', label: 'Default bid', desc: 'Use the campaign default bid for all targets.' },
                                ].map(opt => (
                                  <button key={opt.k}
                                    className={`ccs-bid-mode-option ${ptBidMode === opt.k ? 'selected' : ''}`}
                                    onClick={() => { setPtBidMode(opt.k); setPtBidDropOpen(false); }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</span>
                                    <span style={{ fontSize: 12, color: '#666' }}>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {(ptBidMode === 'custom' || ptBidMode === 'default') && (
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={ptCustomBid}
                                  onChange={e => { const v = parseFloat(e.target.value); setPtCustomBid(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 70 }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {ptCatTab === 'suggested' && (
                        (sbAdFormat !== 'video' && sbAdFormat !== 'store-spotlight' && sbProducts.length === 0) ? (
                          <div style={{ padding: '24px 16px', color: '#888', fontSize: 13, textAlign: 'center' }}>
                            Add at least one product above to see suggested categories.
                          </div>
                        ) : (
                          <div>
                            <div className="ccs-pt-sugg-hdr">
                              <span>{SUGGESTED_CATS.length} suggestions</span>
                              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Sugg. bid <InfoIcon /></span>
                              <button className="link-btn ccs-kw-add-all" onClick={() => SUGGESTED_CATS.forEach(c => addProdTarget(c))}>Add all</button>
                            </div>
                            {SUGGESTED_CATS.map(cat => {
                              const isAdded = !!addedProdTargets.find(t => t.id === cat.id);
                              return (
                                <div key={cat.id} className="ccs-pt-sugg-row">
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, color: '#555', marginBottom: 2, wordBreak: 'break-word' }}>{cat.path}</div>
                                    <div style={{ fontSize: 13 }}><strong>Category:</strong> {cat.name}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Products: {cat.prodMin}-{cat.prodMax}</div>
                                  </div>
                                  <span style={{ color: '#888', fontSize: 13, minWidth: 30 }}>-</span>
                                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    {isAdded
                                      ? <span className="ccs-kw-added-text">Added</span>
                                      : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget(cat)}>Add</button>
                                    }
                                    <button className="link-btn ccs-kw-add-link" onClick={() => { setRefineTarget(cat); setRefineBrand([]); setRefinePriceMin(''); setRefinePriceMax(''); setRefineStarsMin(0); setRefineStarsMax(5); setRefineShipping('all'); }}>Refine</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}

                      {ptCatTab === 'search' && (
                        <div>
                          <div style={{ padding: '10px 14px' }}>
                            <div className="ccs-pt-cat-search-wrap">
                              <Search size={13} color="#888" />
                              <input type="text" className="ccs-pt-cat-search-inp" placeholder="Search by category name"
                                value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                            </div>
                          </div>
                          <div className="ccs-cat-table-hdr">
                            <span>All categories</span>
                            <span>Sugg. bid <InfoIcon /></span>
                          </div>
                          <div className="ccs-cat-list">
                            {ALL_CATEGORIES.map(cat => (
                              <CatRow key={cat.id} cat={cat} depth={0}
                                expandedCats={expandedCats} setExpandedCats={setExpandedCats}
                                addedProdTargets={addedProdTargets} addProdTarget={addProdTarget}
                                setRefineTarget={(cat) => { setRefineTarget(cat); setRefineBrand([]); setRefinePriceMin(''); setRefinePriceMax(''); setRefineStarsMin(0); setRefineStarsMax(5); setRefineShipping('all'); }}
                                catSearch={catSearch} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {ptMainTab === 'individual' && (
                    <>
                      {/* Sub-tabs: Suggested | Search | Enter list | Upload */}
                      <div className="ccs-tab-row" style={{ padding: '0', borderBottom: 'none' }}>
                        {[['suggested','Suggested'],['search','Search'],['enter-list','Enter list'],['upload','Upload']].map(([k, l]) => (
                          <button key={k} className={`ccs-tab ${ptIndivSubTab === k ? 'active' : ''}`} onClick={() => setPtIndivSubTab(k)}>
                            {l}{(k === 'suggested' || k === 'search') && <> <InfoIcon /></>}
                          </button>
                        ))}
                      </div>

                      {/* Bid dropdown — shown on all tabs */}
                      <div className="ccs-kw-filters" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div className="ccs-kw-filter-row" style={{ flexWrap: 'wrap', gap: 8 }}>
                          <span className="ccs-kw-filter-label">Bid <InfoIcon /></span>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="ccs-filter-btn-sm"
                              onClick={() => setPtBidDropOpen(o => !o)}>
                              {ptBidMode === 'suggested' ? 'Suggested bid' : ptBidMode === 'custom' ? 'Custom bid' : 'Default bid'} <ChevronDown size={11} />
                            </button>
                            {ptBidDropOpen && (
                              <div className="ccs-bid-mode-dropdown">
                                {[
                                  { k: 'suggested', label: 'Suggested bid', desc: 'Amazon sets the bid based on the likelihood to win the auction.' },
                                  { k: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added targets.' },
                                  { k: 'default', label: 'Default bid', desc: 'Use the campaign default bid for all targets.' },
                                ].map(opt => (
                                  <button key={opt.k}
                                    className={`ccs-bid-mode-option ${ptBidMode === opt.k ? 'selected' : ''}`}
                                    onClick={() => { setPtBidMode(opt.k); setPtBidDropOpen(false); }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</span>
                                    <span style={{ fontSize: 12, color: '#666' }}>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {(ptBidMode === 'custom' || ptBidMode === 'default') && (
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={ptCustomBid}
                                  onChange={e => { const v = parseFloat(e.target.value); setPtCustomBid(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 70 }} />
                              </div>
                            )}
                          </div>
                        </div>
                        {ptIndivSubTab !== 'upload' && (
                          <div className="ccs-kw-filter-row">
                            <span className="ccs-kw-filter-label" style={{ fontWeight: 700 }}>Filter by <InfoIcon /></span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                              <input type="checkbox" checked={ptIndivFilterExact} onChange={e => setPtIndivFilterExact(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#0073bb' }} />
                              Exact
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer', marginLeft: 8 }}>
                              <input type="checkbox" checked={ptIndivFilterExpanded} onChange={e => setPtIndivFilterExpanded(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#0073bb' }} />
                              Expanded
                            </label>
                          </div>
                        )}
                      </div>

                      {/* SUGGESTED */}
                      {ptIndivSubTab === 'suggested' && (
                        (sbAdFormat !== 'video' && sbAdFormat !== 'store-spotlight' && sbProducts.length === 0) ? (
                          <div style={{ padding: '24px 16px', color: '#888', fontSize: 13, textAlign: 'center' }}>Add at least one product above to see suggestions.</div>
                        ) : (
                          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                            <div className="ccs-indiv-list-hdr">
                              <span>{INDIV_SUGGESTED.length} products</span>
                              <span>Sugg. bid <InfoIcon /></span>
                              <span>Type <InfoIcon /></span>
                              <button className="link-btn" style={{ fontSize: 12 }} onClick={() => {
                                INDIV_SUGGESTED.forEach(p => {
                                  if (ptIndivFilterExact) addProdTarget({ id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, prodMin: 1, prodMax: 1, brands: [], bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact' });
                                  if (ptIndivFilterExpanded) addProdTarget({ id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: null, prodMin: 1, prodMax: 1, brands: [], bid: '3.00', type: 'Expanded' });
                                });
                              }}>Add all</button>
                            </div>
                            <div className="ccs-indiv-list">
                              {INDIV_SUGGESTED.map(p => (
                                <div key={p.id} className="ccs-indiv-product-block">
                                  {/* Product info row */}
                                  <div className="ccs-indiv-product-info">
                                    <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8' }}>
                                      {getIndivImage(p)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, color: '#0073bb', fontWeight: 500, marginBottom: 2, cursor: 'pointer', lineHeight: 1.4 }}>{p.name.length > 80 ? p.name.slice(0, 80) + '…' : p.name}</div>
                                      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{p.format}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        {renderStars(p.stars)}
                                        <span style={{ fontSize: 12, color: '#0073bb' }}>({p.reviews.toLocaleString('en-IN')})</span>
                                      </div>
                                      {p.originalPrice && <div style={{ fontSize: 12 }}><s style={{ color: '#888' }}>₹{p.originalPrice.toLocaleString('en-IN')}</s> <span style={{ color: '#b12704', fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</span></div>}
                                      <div style={{ fontSize: 12, color: p.status === 'In stock' ? '#007600' : '#c40000', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'In stock' ? '#007600' : '#c40000', flexShrink: 0, display: 'inline-block' }} />
                                        {p.status}
                                      </div>
                                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>ASIN: {p.asin}</div>
                                    </div>
                                  </div>
                                  {/* Type rows */}
                                  {ptIndivFilterExact && (
                                    <div className="ccs-indiv-type-row">
                                      <span />
                                      <span style={{ fontSize: 13, color: '#555' }}>{p.sugg ? `₹${p.sugg.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Exact</span>
                                      <div>
                                        {addedProdTargets.find(t => t.id === `indiv-${p.id}-exact`)
                                          ? <span className="ccs-kw-added-text">Added</span>
                                          : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, prodMin: 1, prodMax: 1, brands: [], bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact' })}>Add</button>
                                        }
                                      </div>
                                    </div>
                                  )}
                                  {ptIndivFilterExpanded && (
                                    <div className="ccs-indiv-type-row">
                                      <span />
                                      <span style={{ fontSize: 13, color: '#555' }}>{p.suggExpanded ? `₹${p.suggExpanded.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Expanded</span>
                                      <div>
                                        {addedProdTargets.find(t => t.id === `indiv-${p.id}-expanded`)
                                          ? <span className="ccs-kw-added-text">Added</span>
                                          : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, prodMin: 1, prodMax: 1, brands: [], bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded' })}>Add</button>
                                        }
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}

                      {/* SEARCH */}
                      {ptIndivSubTab === 'search' && (
                        <div style={{ padding: '14px 14px' }}>
                          <div className="ccs-pt-cat-search-wrap" style={{ marginBottom: 12, maxWidth: 420 }}>
                            <Search size={13} color="#888" />
                            <input type="text" className="ccs-pt-cat-search-inp" placeholder="Search by product name or ASIN"
                              value={ptIndivSearch} onChange={e => setPtIndivSearch(e.target.value)} />
                          </div>
                          {!ptIndivSearch && <div style={{ padding: '20px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>Search for products you want to target.</div>}
                          {ptIndivSearch && (
                            <div className="ccs-indiv-list">
                              {INDIV_SUGGESTED.filter(p => p.name.toLowerCase().includes(ptIndivSearch.toLowerCase()) || p.asin.toLowerCase().includes(ptIndivSearch.toLowerCase())).map(p => (
                                <div key={p.id} className="ccs-indiv-product-block">
                                  <div className="ccs-indiv-product-info">
                                    <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8' }}>{getIndivImage(p)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, color: '#0073bb', fontWeight: 500, marginBottom: 2, lineHeight: 1.4 }}>{p.name.length > 80 ? p.name.slice(0, 80) + '…' : p.name}</div>
                                      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{p.format}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>{renderStars(p.stars)}<span style={{ fontSize: 12, color: '#0073bb' }}>({p.reviews.toLocaleString('en-IN')})</span></div>
                                      <div style={{ fontSize: 12 }}><s style={{ color: '#888' }}>₹{p.originalPrice?.toLocaleString('en-IN')}</s> <span style={{ color: '#b12704', fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</span></div>
                                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>ASIN: {p.asin}</div>
                                    </div>
                                  </div>
                                  {ptIndivFilterExact && (
                                    <div className="ccs-indiv-type-row">
                                      <span /><span style={{ fontSize: 13, color: '#555' }}>{p.sugg ? `₹${p.sugg.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Exact</span>
                                      <div>{addedProdTargets.find(t => t.id === `indiv-${p.id}-exact`) ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] })}>Add</button>}</div>
                                    </div>
                                  )}
                                  {ptIndivFilterExpanded && (
                                    <div className="ccs-indiv-type-row">
                                      <span /><span style={{ fontSize: 13, color: '#555' }}>{p.suggExpanded ? `₹${p.suggExpanded.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Expanded</span>
                                      <div>{addedProdTargets.find(t => t.id === `indiv-${p.id}-expanded`) ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded', brands: [] })}>Add</button>}</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {INDIV_SUGGESTED.filter(p => p.name.toLowerCase().includes(ptIndivSearch.toLowerCase()) || p.asin.toLowerCase().includes(ptIndivSearch.toLowerCase())).length === 0 && (
                                <div style={{ padding: '20px 0', color: '#888', fontSize: 13, textAlign: 'center' }}>No products found for "{ptIndivSearch}".</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ENTER LIST */}
                      {ptIndivSubTab === 'enter-list' && (
                        <div style={{ padding: '14px 14px' }}>
                          <textarea
                            className="ccs-kw-textarea"
                            placeholder="Enter ASINs separated by a comma, space or new line."
                            value={ptIndivEnterList}
                            onChange={e => { setPtIndivEnterList(e.target.value); setPtEnterListErrors([]); }}
                            rows={8}
                            style={{ width: '100%', maxWidth: 520 }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 520, marginTop: 8 }}>
                            {ptEnterListSummary ? (
                              <div style={{ fontSize: 13, color: '#c40000' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>⚠ {ptEnterListSummary.added}/{ptEnterListSummary.total} ASINs added successfully.</span>
                                  <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }}
                                    onClick={() => downloadErrorReport(ptEnterListErrors, 'product-targeting-errors.csv')}>Download report</button>
                                </div>
                                {ptEnterListSummary.invalidAsins.length > 0 && (
                                  <div style={{ marginTop: 4, fontSize: 12, color: '#c40000' }}>
                                    Invalid format: {ptEnterListSummary.invalidAsins.join(', ')}
                                    <span style={{ color: '#888', marginLeft: 4 }}>(ASINs must start with B and be 10 characters)</span>
                                  </div>
                                )}
                              </div>
                            ) : <span />}
                            <button
                              className={`ccs-target-btn ${ptIndivEnterList.trim() ? 'active' : ''}`}
                              disabled={!ptIndivEnterList.trim()}
                              onClick={() => {
                                const ASIN_RE = /^B[A-Z0-9]{9}$/;
                                const inputs = [...new Set(ptIndivEnterList.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean))];
                                const errors = [];
                                const invalidAsins = [];
                                let addedCount = 0;
                                inputs.forEach(input => {
                                  if (!ASIN_RE.test(input)) {
                                    invalidAsins.push(input);
                                    if (ptIndivFilterExact) errors.push({ input, type: 'Exact', error: `"${input}" is not a valid ASIN` });
                                    if (ptIndivFilterExpanded) errors.push({ input, type: 'Expanded', error: `"${input}" is not a valid ASIN` });
                                    return;
                                  }
                                  const found = INDIV_SUGGESTED.find(p => p.asin === input);
                                  const name = found ? found.name.slice(0, 50) : input;
                                  const sugg = found ? found.sugg : null;
                                  let thisAdded = false;
                                  if (ptIndivFilterExact) {
                                    const id = `indiv-${input}-exact`;
                                    if (addedProdTargets.find(t => t.id === id)) {
                                      errors.push({ input, type: 'Exact', error: `"${input}" is already targeted (Exact)` });
                                    } else {
                                      addProdTarget({ id, name, sugg, bid: sugg ? parseFloat(sugg).toFixed(2) : ptCustomBid, type: 'Exact', brands: [] });
                                      thisAdded = true;
                                    }
                                  }
                                  if (ptIndivFilterExpanded) {
                                    const id = `indiv-${input}-expanded`;
                                    if (addedProdTargets.find(t => t.id === id)) {
                                      errors.push({ input, type: 'Expanded', error: `"${input}" is already targeted (Expanded)` });
                                    } else {
                                      addProdTarget({ id, name, sugg: null, bid: ptCustomBid, type: 'Expanded', brands: [] });
                                      thisAdded = true;
                                    }
                                  }
                                  if (thisAdded) addedCount++;
                                });
                                setPtEnterListErrors(errors);
                                setPtEnterListSummary(errors.length > 0 ? { added: addedCount, total: inputs.length, invalidAsins } : null);
                                setPtIndivEnterList('');
                              }}
                            >
                              Target
                            </button>
                          </div>
                        </div>
                      )}

                      {/* UPLOAD */}
                      {ptIndivSubTab === 'upload' && (
                        <div style={{ padding: '16px 14px' }}>
                          <p style={{ fontSize: 13, color: '#333', marginBottom: 10 }}>Use the template to make sure your information uploads accurately.</p>
                          <button className="ccs-download-btn" onClick={() => {
                            const csv = `ASIN bulk import template\nList ASINs you would like to add to your campaign.,Use Exact or Expanded for the Type field\n\n"ASINs (list below, one ASIN per row)","Type (Exact/Expanded)"`;
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = 'asin-template.csv'; a.click();
                            URL.revokeObjectURL(url);
                          }}>
                            ↓ &nbsp;Download the CSV template
                          </button>
                          <div
                            className={`ccs-kw-drop-area ${ptIndivDragOver ? 'drag-over' : ''}`}
                            style={{ marginTop: 12 }}
                            onDragOver={e => { e.preventDefault(); setPtIndivDragOver(true); }}
                            onDragLeave={() => setPtIndivDragOver(false)}
                            onDrop={e => {
                              e.preventDefault(); setPtIndivDragOver(false);
                              const file = e.dataTransfer.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const lines = (ev.target.result || '').split('\n').map(l => l.trim()).filter(Boolean);
                                lines.forEach(line => {
                                  const [asin, type] = line.split(',').map(s => s.replace(/"/g,'').trim());
                                  if (!asin || asin.toLowerCase().includes('asin')) return;
                                  const found = INDIV_SUGGESTED.find(p => p.asin === asin);
                                  const name = found ? found.name.slice(0, 50) : asin;
                                  const sugg = found ? found.sugg : null;
                                  const t = (type || '').toLowerCase();
                                  if (!t || t === 'exact') addProdTarget({ id: `indiv-${asin}-exact`, name, sugg, bid: sugg ? sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] });
                                  if (!t || t === 'expanded') addProdTarget({ id: `indiv-${asin}-expanded`, name, sugg: null, bid: '3.00', type: 'Expanded', brands: [] });
                                });
                              };
                              reader.readAsText(file);
                            }}
                            onClick={() => { const inp = document.createElement('input'); inp.type='file'; inp.accept='.csv,.tsv,.xlsx'; inp.onchange = e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => { const lines = (ev.target.result || '').split('\n').map(l => l.trim()).filter(Boolean); lines.forEach(line => { const [asin, type] = line.split(',').map(s => s.replace(/"/g,'').trim()); if (!asin || asin.toLowerCase().includes('asin')) return; const found = INDIV_SUGGESTED.find(p => p.asin === asin); const name = found ? found.name.slice(0, 50) : asin; const sugg = found ? found.sugg : null; const t = (type || '').toLowerCase(); if (!t || t === 'exact') addProdTarget({ id: `indiv-${asin}-exact`, name, sugg, bid: sugg ? sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] }); if (!t || t === 'expanded') addProdTarget({ id: `indiv-${asin}-expanded`, name, sugg: null, bid: '3.00', type: 'Expanded', brands: [] }); }); }; reader.readAsText(file); }; inp.click(); }}
                          >
                            <div style={{ fontSize: 28, marginBottom: 6 }}>↑</div>
                            <div style={{ fontSize: 13, color: '#333' }}>Drag and drop file to add</div>
                            <div style={{ fontSize: 13, color: '#333' }}>or click to select from your computer</div>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Accepted formats: CSV, TSV, XLSX</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Refine drawer (inside left column) ── */}
                  {refineTarget && (
                    <div className="ccs-refine-overlay">
                      <div className="ccs-refine-panel">
                        <div className="ccs-refine-header">
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Refine category: {refineTarget.name}</h3>
                            <p style={{ fontSize: 13, color: '#555' }}>Refine category by specific brands, price range, star ratings and Prime shipping eligibility.</p>
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label">Brand</div>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button className="ccs-filter-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                              onClick={() => setRefineBrandDropOpen(o => !o)}>
                              {refineBrand.length === 0 ? 'Select' : `${refineBrand.length} selected`}
                              <span style={{ fontSize: 14 }}>⇅</span>
                            </button>
                            {refineBrandDropOpen && (
                              <div className="ccs-brand-dropdown" onClick={e => e.stopPropagation()}>
                                <div className="ccs-brand-search-wrap">
                                  <Search size={12} color="#888" />
                                  <input type="text" className="ccs-brand-search-inp" placeholder="Search"
                                    value={refineBrandSearch} onChange={e => setRefineBrandSearch(e.target.value)} autoFocus />
                                </div>
                                <div className="ccs-brand-list">
                                  {(refineTarget.brands || []).filter(b => !refineBrandSearch || b.toLowerCase().includes(refineBrandSearch.toLowerCase())).map(brand => (
                                    <label key={brand} className="ccs-brand-option">
                                      <input type="checkbox" checked={refineBrand.includes(brand)}
                                        onChange={() => setRefineBrand(p => p.includes(brand) ? p.filter(x => x !== brand) : [...p, brand])} />
                                      {brand}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label">Price range</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="ccs-bid-input-wrap" style={{ width: 110 }}>
                              <span className="ccs-bid-prefix">₹</span>
                              <input type="number" className="ccs-bid-input" placeholder="No min" value={refinePriceMin} onChange={e => { const v = parseFloat(e.target.value); setRefinePriceMin(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 80 }} />
                            </div>
                            <span>-</span>
                            <div className="ccs-bid-input-wrap" style={{ width: 110 }}>
                              <span className="ccs-bid-prefix">₹</span>
                              <input type="number" className="ccs-bid-input" placeholder="No max" value={refinePriceMax} onChange={e => { const v = parseFloat(e.target.value); setRefinePriceMax(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 80 }} />
                            </div>
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Review stars rating</span>
                            <span style={{ color: '#111', fontWeight: 700, fontSize: 15 }}>
                              {refineStarsMin === 0 && refineStarsMax === 5 ? 'All stars' : `${refineStarsMin} – ${refineStarsMax} stars`}
                            </span>
                          </div>
                          <div className="ccs-dual-range-wrap">
                            <div className="ccs-dual-range-track">
                              <div className="ccs-dual-range-fill" style={{ left: `${(refineStarsMin / 5) * 100}%`, width: `${((refineStarsMax - refineStarsMin) / 5) * 100}%` }} />
                            </div>
                            <input type="range" className="ccs-range-input" min={0} max={5} step={1} value={refineStarsMin}
                              onChange={e => setRefineStarsMin(Math.min(parseInt(e.target.value), refineStarsMax))} />
                            <input type="range" className="ccs-range-input" min={0} max={5} step={1} value={refineStarsMax}
                              onChange={e => setRefineStarsMax(Math.max(parseInt(e.target.value), refineStarsMin))} />
                          </div>
                          <div className="ccs-stars-labels">
                            {[0,1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label">Shipping</div>
                          <div style={{ display: 'flex', gap: 20 }}>
                            {[['all','All'],['prime','Prime eligible'],['not-prime','Not Prime eligible']].map(([k, l]) => (
                              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                <input type="radio" name="refineShipping" checked={refineShipping === k} onChange={() => setRefineShipping(k)} style={{ accentColor: '#0073bb' }} />
                                {l}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="ccs-refine-footer">
                          <strong style={{ fontSize: 15 }}>Products targeted: {calcProductsTargeted(refineTarget)}</strong>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary" style={{ color: '#0073bb', background: 'none', border: 'none', fontWeight: 600 }} onClick={() => setRefineTarget(null)}>Cancel</button>
                            <button className="btn btn-secondary"
                              style={{ opacity: refineBrand.length > 0 || refinePriceMin || refinePriceMax || refineStarsMin > 0 || refineStarsMax < 5 || refineShipping !== 'all' ? 1 : 0.5,
                                       cursor: refineBrand.length > 0 || refinePriceMin || refinePriceMax || refineStarsMin > 0 || refineStarsMax < 5 || refineShipping !== 'all' ? 'pointer' : 'default' }}
                              onClick={() => { addProdTarget({ ...refineTarget, name: `${refineTarget.name} (refined)` }); setRefineTarget(null); }}>
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Right panel ── */}
                <div className="ccs-kw-right">
                  <div className="ccs-added-header">
                    <strong>{addedProdTargets.length} added</strong>
                    {addedProdTargets.length > 0 && <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedProdTargets([])}>Remove all</button>}
                  </div>
                  <div className="ccs-pt-right-head">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Categories and products</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Sugg. bid <InfoIcon /><br/><button className="link-btn" style={{ fontSize: 11, fontWeight: 500 }} onClick={() => setAddedProdTargets(p => p.map(t => ({ ...t, bid: t.sugg ? t.sugg.toFixed(2) : t.bid })))}>Apply all</button></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Bid</span>
                  </div>
                  {addedProdTargets.length === 0 ? (
                    <div className="ccs-kw-right-empty">No targets added yet</div>
                  ) : (
                    addedProdTargets.map((t, i) => (
                      <div key={i} className="ccs-pt-right-row">
                        <div style={{ fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{t.sugg ? `₹${t.sugg.toFixed(2)}` : '-'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div className="ccs-bid-input-wrap" style={{ opacity: costControlActive ? 0.5 : 1 }}>
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={costControlActive ? '' : ptEffBid(t)}
                              placeholder="-"
                              disabled={costControlActive}
                              onChange={e => { const v = parseFloat(e.target.value); setAddedProdTargets(p => p.map((x, j) => j === i ? { ...x, sugg: null, bid: v < 0 ? '0' : e.target.value } : x)); }}
                              style={{ width: 65, background: costControlActive ? '#f0f0f0' : '', color: costControlActive ? '#999' : '' }} />
                          </div>
                          <button className="ccs-remove-btn" onClick={() => setAddedProdTargets(p => p.filter((_, j) => j !== i))}>×</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ─── NEGATIVE KEYWORD TARGETING — automatic always, manual when 3+ products + keyword ─── */}
          {((sbCollectionType === 'automatic' && sbAdFormat !== 'video' && sbAdFormat !== 'store-spotlight') || (sbCollectionType === 'manual' && sbProducts.length >= 3 && sbTargetType === 'keyword') || (sbAdFormat === 'store-spotlight' && sbSSStore && sbTargetType === 'keyword') || (sbAdFormat === 'video' && sbTargetType === 'keyword')) && (sbAdFormat !== 'store-spotlight' || sbSSStore) && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && (
          <div className="ccs-card ccs-collapsible" style={{ marginBottom: 16 }}>
            <button className="ccs-collapsible-header" onClick={() => setNegKwOpen(o => !o)}>
              <div className="ccs-collapsible-left">
                {negKwOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="ccs-card-heading">Negative keyword targeting <InfoIcon /></span>
                <span className="ccs-optional-tag">optional</span>
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to use negative keywords</a>
            </button>
            {negKwOpen && (
              <div style={{ borderTop: '1px solid var(--amazon-border)', display: 'flex' }}>
                <div style={{ flex: 1, borderRight: '1px solid var(--amazon-border)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Match type <InfoIcon /></span>
                    {['Negative exact', 'Negative phrase'].map(m => (
                      <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                        <input type="radio" name="sbNegMatch" checked={negKwMatchType === m} onChange={() => setNegKwMatchType(m)} style={{ accentColor: '#0073bb' }} />
                        {m}
                      </label>
                    ))}
                  </div>
                  <textarea className="ccs-textarea" rows={7} value={negKwText}
                    onChange={e => setNegKwText(e.target.value)}
                    placeholder="Enter keywords separated by new line." style={{ width: '100%' }} />
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <button className="btn btn-secondary" onClick={addNegKws} disabled={!negKwText.trim()}>Add keywords</button>
                  </div>
                </div>
                <div style={{ width: 380, flexShrink: 0 }}>
                  <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--amazon-border)' }}>
                    <strong style={{ fontSize: 13 }}>{addedNegKws.length} added</strong>
                    {addedNegKws.length > 0 && <button className="link-btn" style={{ fontSize: 12, color: '#0073bb' }} onClick={() => setAddedNegKws([])}>Remove all</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '8px 16px', fontSize: 12, color: '#555', borderBottom: '1px solid #f0f0f0', fontWeight: 500, gap: 8 }}>
                    <span>Keyword</span><span>Match type</span>
                  </div>
                  {addedNegKws.length === 0
                    ? <div style={{ padding: '20px 16px', fontSize: 13, color: '#aaa' }}>No keywords added yet</div>
                    : addedNegKws.map((k, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '8px 16px', fontSize: 13, borderBottom: '1px solid #f8f8f8', alignItems: 'center', gap: 8 }}>
                          <span>{k.keyword}</span>
                          <span style={{ color: '#555' }}>{k.matchType}</span>
                          <button className="ccs-remove-btn" onClick={() => setAddedNegKws(p => p.filter((_, j) => j !== i))}>×</button>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
          )} {/* end keyword neg */}

          {/* ─── NEGATIVE PRODUCT TARGETING — manual collection + product targeting only ─── */}
          {((sbCollectionType === 'manual' && sbProducts.length >= 3) || (sbAdFormat === 'store-spotlight' && sbSSStore) || sbAdFormat === 'video') && (sbAdFormat !== 'store-spotlight' || sbSSStore) && sbTargetType === 'product' && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && !(sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight')) && (
          <div className="ccs-card ccs-collapsible">
            <button className="ccs-collapsible-header" onClick={() => setNegProdOpen(o => !o)}>
              <div className="ccs-collapsible-left">
                {negProdOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="ccs-card-heading">Negative product targeting <InfoIcon /></span>
                <span className="ccs-optional-tag">optional</span>
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to choose negative products for targeting
              </a>
            </button>
            {negProdOpen && (
              <div className="ccs-products-layout" style={{ borderTop: '1px solid var(--amazon-border)' }}>
                <div className="ccs-products-left">
                  <div className="ccs-tab-row">
                    <button className={`ccs-tab ${negProdTab==='brands'?'active':''}`} onClick={() => setNegProdTab('brands')}>
                      <strong>Exclude brands</strong> <InfoIcon />
                    </button>
                    <button className={`ccs-tab ${negProdTab==='products'?'active':''}`} onClick={() => setNegProdTab('products')}>
                      Exclude products <InfoIcon />
                    </button>
                  </div>
                  <div className="ccs-card-body">
                    {negProdTab === 'brands' ? (
                      <>
                        <div className="ccs-search-wrap" style={{ marginBottom: 12 }}>
                          <Search size={13} className="ccs-search-icon" />
                          <input className="ccs-search-input" placeholder="Search by brand name" />
                        </div>
                        <div className="ccs-brand-section">
                          <div className="ccs-brand-section-header">
                            <strong>YOUR BRANDS</strong>
                            <button className="link-btn ccs-exclude-all">Exclude all</button>
                          </div>
                          <div className="ccs-brand-row">
                            <span>SoundMax</span>
                            <button className="link-btn ccs-exclude-btn"
                              onClick={() => !addedNegProds.find(x => x.name==='SoundMax') && setAddedNegProds(p => [...p, { type: 'brand', name: 'SoundMax' }])}>
                              Exclude
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="ccs-search-wrap" style={{ marginBottom: 12 }}>
                        <Search size={13} className="ccs-search-icon" />
                        <input className="ccs-search-input" placeholder="Search by product name or ASIN" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="ccs-products-right">
                  <div className="ccs-added-header">
                    <strong>{addedNegProds.length} added</strong>
                    {addedNegProds.length > 0 && <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedNegProds([])}>Remove all</button>}
                  </div>
                  {addedNegProds.length === 0 ? (
                    <div className="ccs-added-empty">Brands and products</div>
                  ) : (
                    <div className="ccs-added-list">
                      {addedNegProds.map((p, i) => (
                        <div key={i} className="ccs-added-item">
                          <span>{p.name}</span>
                          <button className="ccs-remove-btn" onClick={() => setAddedNegProds(x => x.filter((_,j)=>j!==i))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )} {/* end product neg */}

          {/* ═══ CAMPAIGN BID ADJUSTMENTS ═══ */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Campaign Bid Adjustments</span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> Learn about bid adjustments</a>
              </div>
              <p style={{ fontSize: 13, color: '#555', margin: 0 }}>By raising your bids, you will be more likely to appear in specific placements and in front of specific audiences.</p>
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--amazon-border)' }}>
              {/* Left */}
              <div style={{ flex: 1, borderRight: '1px solid var(--amazon-border)' }}>
                {sbAdFormat !== 'video' && (
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--amazon-border)' }}>
                    {[['placements', 'Placements'], ['audiences', 'Audiences']].map(([k, l]) => (
                      <button key={k} onClick={() => setSbBidAdjTab(k)} style={{
                        padding: '10px 20px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: sbBidAdjTab === k ? '2px solid #0073bb' : '2px solid transparent',
                        color: sbBidAdjTab === k ? '#333' : '#666', fontWeight: sbBidAdjTab === k ? 700 : 400,
                      }}>{l}</button>
                    ))}
                  </div>
                )}
                {sbBidAdjTab === 'placements' && sbAdFormat !== 'video' && (
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                      Increase your bid for specific Amazon placements. <InfoIcon />
                    </p>
                    {[
                      { label: 'Top of search', val: sbTopOfSearch, set: setSbTopOfSearch },
                      { label: 'Rest of search', val: sbRestOfSearch, set: setSbRestOfSearch },
                    ].map(({ label, val, set }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <span style={{ fontSize: 13, width: 130 }}>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden', width: 100 }}>
                          <input type="number" value={val} onChange={e => { const n = parseInt(e.target.value, 10); set(isNaN(n) ? '' : String(Math.min(900, Math.max(0, n)))); }} min="0" max="900"
                            style={{ border: 'none', padding: '5px 8px', fontSize: 13, width: 70, outline: 'none' }} />
                          <span style={{ padding: '5px 8px', background: '#f5f5f5', borderLeft: '1px solid #ccc', fontSize: 13, color: '#555' }}>%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {(sbBidAdjTab === 'audiences' || sbAdFormat === 'video') && (
                  <div style={{ padding: '16px 20px' }}>
                    {[
                      { key: true, label: 'Increase bids for audiences built by Amazon' },
                      { key: false, label: 'Do not increase bids for an audience' },
                    ].map(opt => (
                      <label key={String(opt.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', fontSize: 13 }}>
                        <input type="radio" name="sbAudienceMode" checked={sbAudienceIncrease === opt.key}
                          onChange={() => setSbAudienceIncrease(opt.key)} style={{ accentColor: '#0073bb' }} />
                        {opt.label}
                      </label>
                    ))}
                    {sbAudienceIncrease && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Audience</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="ccs-select-wrap" style={{ width: 320 }}>
                            <select className="ccs-input-full" style={{ fontSize: 13 }}>
                              <option>Clicked or Added brand's product to cart - 416393...</option>
                              <option>Viewed brand's product detail pages - 416394...</option>
                              <option>Purchased brand's products - 416395...</option>
                            </select>
                            <ChevronDown size={13} className="ccs-select-chevron" />
                          </div>
                          <InfoIcon />
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden', width: 80 }}>
                            <input type="number" value={sbAudienceAdj} onChange={e => { const n = parseInt(e.target.value, 10); setSbAudienceAdj(isNaN(n) ? '' : String(Math.min(900, Math.max(0, n)))); }} min="0" max="900"
                              style={{ border: 'none', padding: '5px 8px', fontSize: 13, width: 50, outline: 'none' }} />
                            <span style={{ padding: '5px 8px', background: '#f5f5f5', borderLeft: '1px solid #ccc', fontSize: 13, color: '#555' }}>%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Right summary */}
              <div style={{ width: 320, flexShrink: 0, padding: 16 }}>
                <div style={{ fontSize: 13, color: '#333', marginBottom: 10 }}>
                  Potential bid: ₹0.01 - ₹10.00 <InfoIcon />
                </div>
                {(() => {
                  const adjs = [
                    ...(parseInt(sbTopOfSearch) > 0 ? [{ label: 'Top of search', val: sbTopOfSearch }] : []),
                    ...(parseInt(sbRestOfSearch) > 0 ? [{ label: 'Rest of search', val: sbRestOfSearch }] : []),
                    ...(sbAudienceIncrease && parseInt(sbAudienceAdj) > 0 ? [{ label: 'Audience', val: sbAudienceAdj }] : []),
                  ];
                  return (
                    <div style={{ border: '1px solid var(--amazon-border)', borderRadius: 4 }}>
                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0073bb', fontWeight: 600 }}>
                        <ChevronUp size={14} /> {adjs.length} adjustment{adjs.length !== 1 ? 's' : ''} applied
                      </div>
                      {adjs.length === 0 ? (
                        <div style={{ padding: '12px 14px', fontSize: 13, color: '#888', borderTop: '1px solid var(--amazon-border)', textAlign: 'center' }}>No adjustments added</div>
                      ) : (
                        <div style={{ borderTop: '1px solid var(--amazon-border)' }}>
                          {adjs.map(adj => (
                            <div key={adj.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                              <span style={{ color: '#333' }}>{adj.label}</span>
                              <span style={{ fontWeight: 700, color: '#0073bb' }}>+{adj.val}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>


          </>}{/* end non-SOV ad group section */}

          {/* SOV-specific: Budget, legal text, bottom buttons */}
          {sbGoal === 'share-of-voice' && (
            <>
              {/* Budget card (fixed price) */}
              <div className="ccs-card" style={{ marginBottom: 16, marginTop: 16 }}>
                <div className="ccs-card-header">
                  <span className="ccs-card-heading">Budget</span>
                </div>
                <div className="ccs-card-body" style={{ maxWidth: 700 }}>
                  <div className="ccs-field">
                    <label className="ccs-label">Budget <InfoIcon /></label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ccs-bid-input-wrap">
                        <span className="ccs-bid-prefix">₹</span>
                        <input type="number" className="ccs-bid-input" value={sovBudget} onChange={e => { const v = parseFloat(e.target.value); setSovBudget(v < 0 ? '0' : e.target.value); }} placeholder="-" min="0" style={{ width: 140 }} />
                      </div>
                      <div style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, color: '#555', background: '#fafafa' }}>Lifetime</div>
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Minimum ₹5,000</small>
                  </div>
                </div>
              </div>

              {/* Legal text */}
              <div style={{ background: '#f7f7f7', border: '1px solid #e0e0e0', borderRadius: 4, padding: '14px 18px', fontSize: 13, color: '#333', lineHeight: 1.7, marginBottom: 16 }}>
                Once you submit your campaign, you can no longer change your campaign duration or reserved keywords. You have until 72 hours before your starting date to cancel your campaign by archiving it. <strong>Beginning 12 hours before your starting date, your price will be final and you will be billed in full.</strong>
              </div>
              <div style={{ fontSize: 13, color: '#333', marginBottom: 20 }}>
                By submitting your campaign for review, you agree to the{' '}
                <a href="#" onClick={e => e.preventDefault()} style={{ color: '#0066c0' }}>Additional Terms &amp; Conditions ↗</a>
              </div>

              {/* SOV bottom buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '8px 0' }}>
                <button className="btn btn-secondary">Save as draft</button>
                <button className="btn btn-dark" onClick={handleLaunchSB}>Submit for review</button>
              </div>
            </>
          )}

          {/* Bottom action row (non-SOV) */}
          {sbGoal !== 'share-of-voice' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 0 8px' }}>
            <button className="btn btn-secondary">Save as draft</button>
            <button className="btn btn-dark" onClick={handleLaunchSB}>Submit for review</button>
          </div>
          )}

          <div className="ccs-footer">
            © 2026 Amazon.com, Inc. or its affiliates.&nbsp;
            <a href="#" onClick={e => e.preventDefault()}>Conditions of use</a>&nbsp;·&nbsp;
            <a href="#" onClick={e => e.preventDefault()}>Privacy notice</a>&nbsp;·&nbsp;
            <a href="#" onClick={e => e.preventDefault()}>Amazon Advertising Agreement</a>&nbsp;·&nbsp;
            <a href="#" onClick={e => e.preventDefault()}>Status</a>
          </div>
        </div>{/* end ccs-body */}

      {/* ── Changing goal confirmation modal ── */}
      {sbGoalModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, width: 480, padding: '24px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Changing goal</span>
              <button onClick={() => setSbGoalModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555', lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: 14, color: '#333', marginBottom: 24 }}>
              If you change your goal, this will clear some of your settings for this campaign.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setSbGoalModalOpen(false)} style={{ padding: '7px 16px', borderRadius: 4, border: '1px solid #aaa', background: 'white', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={() => {
                const newGoal = sbGoalPending;
                setSbGoal(newGoal);
                if (newGoal === 'impression-share') {
                  if (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight') {
                    if (sbLandingPage === 'product-detail') { setSbLandingPage('store'); setSbVidPDPProduct(null); }
                    if (sbTargetType === 'product') setSbTargetType('keyword');
                  }
                  if (sbKwBidMode === 'default') setSbKwBidMode('suggested');
                }
                setSbGoalPending(null);
                setSbGoalModalOpen(false);
              }} style={{ padding: '7px 16px', borderRadius: 4, border: 'none', background: '#0073bb', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Change goal</button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // SPONSORED DISPLAY SCROLL FORM
  // ─────────────────────────────────────────────────────────────────
  if (campaignType === 'Sponsored Display' && !adGroupMode) {
    const SD_TARGET_CATEGORIES = [
      { key: 'contextual', label: 'Contextual', desc: 'Reach audiences who are browsing products and content matching criteria you choose.' },
      { key: 'remarketing', label: 'Remarketing audiences', desc: 'Reach relevant audiences who have viewed, purchased, or are browsing products and content matching criteria you choose.' },
      { key: 'in-market', label: 'In-market audiences', desc: 'Reach audiences whose recent activity suggests they are likely to buy products in a certain category.' },
      { key: 'interest-lifestyle', label: 'Interest and lifestyle audiences', desc: 'Reach audiences whose shopping and entertainment activity suggests certain interest or lifestyle preferences.' },
    ];

    const SD_AUDIENCES = [
      { key: 'views-remarketing', group: 'remarketing', label: 'Views remarketing', desc: 'Reach shoppers who viewed your product or similar products in the last 30 days.' },
      { key: 'purchases-remarketing', group: 'remarketing', label: 'Purchases remarketing', desc: 'Reach shoppers who purchased your product or complementary products.' },
    ];

    // Short type label shown in the right-hand "added" panel for tree-based audiences.
    const SD_GROUP_SHORT_LABEL = { 'in-market': 'In-market', 'interest-lifestyle': 'Interest & lifestyle' };

    // Real console audience taxonomy for In-market / Interest & lifestyle "Browse" — a
    // collapsible category tree. Most categories are just names to browse (matches the real
    // console, which lists dozens of categories most advertisers never expand); a handful
    // relevant to our headphones/electronics catalog carry real addable leaf segments, and
    // those same leaves double as the product-gated "Suggested" list once a product is added.
    const SD_AUDIENCE_TREE = {
      'in-market': [
        { id: 'im-arts-crafts', name: 'Arts & Crafts', items: [] },
        { id: 'im-baby-products', name: 'Baby Products', items: [] },
        { id: 'im-beauty-personal-care', name: 'Beauty & Personal Care', items: [] },
        { id: 'im-books-magazines', name: 'Books & Magazines', items: [] },
        { id: 'im-business-industrial', name: 'Business & Industrial', items: [] },
        { id: 'im-electronics', name: 'Electronics', items: [
          { id: 'im-headphones-earbuds', name: 'IM - Headphones & Earbuds', desc: 'Shoppers whose recent browsing and search activity suggests they are actively in-market for headphones or earbuds.' },
          { id: 'im-bluetooth-speakers', name: 'IM - Bluetooth Speakers', desc: 'Shoppers actively researching or comparing Bluetooth speakers.' },
          { id: 'im-tw-earbuds', name: 'IM - True Wireless Earbuds', desc: 'Shoppers actively researching true wireless earbuds specifically.' },
          { id: 'im-smart-watches', name: 'IM - Smart Watches', desc: 'Shoppers actively researching smart watches or fitness wearables.' },
          { id: 'im-home-audio', name: 'IM - Home Audio Systems', desc: 'Shoppers actively researching home audio or theatre systems.' },
        ] },
        { id: 'im-entertainment', name: 'Entertainment', items: [] },
        { id: 'im-fashion', name: 'Fashion', items: [] },
        { id: 'im-gift-cards', name: 'Gift Cards', items: [] },
        { id: 'im-home-garden', name: 'Home & Garden', items: [] },
        { id: 'im-kitchen-dining', name: 'Kitchen & Dining', items: [] },
        { id: 'im-luggage-bags', name: 'Luggage & Travel Gear', items: [] },
        { id: 'im-office-products', name: 'Office Products', items: [] },
        { id: 'im-outdoor-recreation', name: 'Outdoor Recreation', items: [] },
        { id: 'im-pet-supplies', name: 'Pet Supplies', items: [] },
        { id: 'im-sports-fitness', name: 'Sports & Fitness', items: [] },
        { id: 'im-toys-games', name: 'Toys & Games', items: [] },
      ],
      'interest-lifestyle': [
        { id: 'ls-games', name: 'Games', items: [] },
        { id: 'ls-movies-tv', name: 'Movies & TV', items: [] },
        { id: 'ls-music-radio', name: 'Music & Radio', items: [
          { id: 'ls-audiophiles', name: 'LS - Audiophiles & Music Enthusiasts', desc: 'Shoppers with an established, ongoing interest in music gear and high-fidelity audio.' },
          { id: 'ls-music-streaming', name: 'LS - Music Streaming Subscribers', desc: 'Shoppers who actively use music streaming services.' },
          { id: 'ls-podcast-listeners', name: 'LS - Podcast Listeners', desc: 'Shoppers with an established interest in podcasts and spoken-word audio.' },
        ] },
        { id: 'ls-automotive-ownership', name: 'Automotive Ownership', items: [] },
        { id: 'ls-beauty-grooming', name: 'Beauty & Grooming', items: [] },
        { id: 'ls-business-careers', name: 'Business & Careers', items: [] },
        { id: 'ls-business-industry', name: 'Business & Industry', items: [] },
        { id: 'ls-conscious-consumption', name: 'Conscious Consumption', items: [] },
        { id: 'ls-entertainment', name: 'Entertainment', items: [
          { id: 'ls-tech-enthusiasts', name: 'LS - Tech Enthusiasts', desc: 'Shoppers with an established, ongoing interest in technology and consumer electronics.' },
          { id: 'ls-gadget-lovers', name: 'LS - Gadget Early Adopters', desc: 'Shoppers who tend to purchase and try new gadgets soon after launch.' },
        ] },
        { id: 'ls-family', name: 'Family', items: [] },
        { id: 'ls-health-wellness', name: 'Health & Wellness', items: [] },
        { id: 'ls-home-garden', name: 'Home & Garden', items: [] },
        { id: 'ls-new-to-category', name: 'New to Category', items: [] },
        { id: 'ls-pet-ownership', name: 'Pet Ownership', items: [] },
        { id: 'ls-pets-animals', name: 'Pets & Animals', items: [] },
        { id: 'ls-shoppers', name: 'Shoppers', items: [] },
      ],
    };

    // Once a product is added, "Suggested" surfaces the leaves from whichever categories are
    // relevant to what's being advertised (here: our headphones/electronics catalog).
    const getSdProductAudiences = (group) => {
      const tree = SD_AUDIENCE_TREE[group] || [];
      return tree.flatMap(cat => cat.items);
    };

    // Recommended "dynamic segment" suggestions per targeting group — these are behavior-based
    // signals (not tied to a real product category), so Amazon surfaces them as suggestions
    // even before any product has been added. Real, browsable category/audience lists (below)
    // require at least one product before they return results.
    const SD_DYNAMIC_SEGMENTS = {
      contextual: [
        { key: 'ctx-similar', type: 'Contextual', label: 'Similar to advertised products', desc: 'Shows your ad on pages and products that are contextually similar to the products you are advertising, without relying on shopper browsing or purchase history.' },
      ],
      remarketing: [
        { key: 'views-similar', type: 'Views remarketing', label: 'Similar to advertised products', lookbackType: 'views', desc: 'Reach shoppers who viewed products similar to the ones you are advertising within the lookback window.' },
        { key: 'views-advertised', type: 'Views remarketing', label: 'Advertised products', lookbackType: 'views', desc: 'Reach shoppers who viewed the exact products you are advertising within the lookback window.' },
        { key: 'purchases-related', type: 'Purchases remarketing', label: 'Related to advertised products', lookbackType: 'purchases', desc: 'Reach shoppers who purchased products related or complementary to the ones you are advertising within the lookback window.' },
        { key: 'purchases-advertised', type: 'Purchases remarketing', label: 'Advertised products', lookbackType: 'purchases', desc: 'Reach shoppers who already purchased the exact products you are advertising within the lookback window — useful for replenishment or cross-sell.' },
      ],
      'in-market': [],
      'interest-lifestyle': [],
    };

    // Bid actually assigned to a newly-added target, given the current Bid-mode selector:
    // Cost control on → no manual bid (Amazon optimises it); Suggested → the target's own
    // suggested bid; Custom → whatever the advertiser typed into the Custom bid box.
    const sdEffBidFor = (suggValue) => {
      if (sdCostControlEnabled) return '';
      if (sdBidMode === 'custom') return sdCustomBid;
      return suggValue ? suggValue.toFixed(2) : sdCustomBid;
    };

    const addSdAudience = (aud, lookbackDaysOverride) => {
      if (sdAddedAudiences.find(a => a.key === aud.key)) return;
      const lookbackDays = aud.lookbackType ? (lookbackDaysOverride || sdLookbackDays) : undefined;
      const { sugg, suggMin, suggMax } = sdPseudoSugg(aud.key);
      setSdAddedAudiences(prev => [...prev, {
        key: aud.key,
        type: aud.type || SD_TARGET_CATEGORIES.find(c => c.key === aud.group)?.label,
        label: aud.label,
        desc: aud.desc,
        bid: sdEffBidFor(sugg),
        sugg, suggMin, suggMax,
        lookbackType: aud.lookbackType,
        lookbackDays,
      }]);
    };
    const removeSdAudience = (key) => setSdAddedAudiences(prev => prev.filter(a => a.key !== key));
    const sdTargetTotal = addedProdTargets.length + sdAddedAudiences.length;

    // Individual-product targets added from SD's own Search / Enter list sub-tabs. Uses the
    // same Bid-mode logic as addSdAudience rather than the shared addProdTarget helper, whose
    // bid fallback is specific to the SP product-targeting flow.
    const addSdProdTarget = (item) => {
      if (addedProdTargets.find(t => t.id === item.id)) return;
      setAddedProdTargets(prev => [...prev, { ...item, bid: sdEffBidFor(item.sugg) }]);
    };

    const SD_GOALS = [
      { key: 'reach', label: 'Reach', desc: 'We will optimise your bids for higher viewable impressions. Drive brand or product awareness by showing your ad to relevant audiences to maximise reach.', costLine: 'Cost type: Cost per 1,000 viewable impressions (VCPM) | Conversion attributed to viewable impressions and clicks', ccLabel: 'Cost per 1,000 viewable impressions', ccDefault: '20.00', ccDuration: '72 hours', ccHelper: v => `A value of ₹${v} or higher may lead to more viewable impressions.`, forecastMetrics: ['Impressions', 'Viewable impressions'], costType: 'VCPM' },
      { key: 'consideration', label: 'Page visits', desc: 'We will optimize your bids for higher page visits. Drive brand or product consideration by showing your ads to customers more likely to click.', costLine: 'Cost type: Cost per click (CPC) | Conversion attributed to clicks', ccLabel: 'Cost per click', ccDefault: '4.00', ccDuration: '72 hours', ccHelper: v => `A value of ₹${v} or higher may lead to more page visits.`, forecastMetrics: ['Impressions', 'Clicks'], costType: 'CPC' },
      { key: 'conversion', label: 'Conversions', desc: 'We will optimise your bids for higher conversion rates. Drive sales by showing your ad to shoppers more likely to purchase your product.', costLine: 'Cost type: Cost per click (CPC) | Conversion attributed to clicks', ccLabel: 'Cost per order', ccDefault: '130.00', ccDuration: '14 days', ccHelper: () => 'A higher value may lead to more conversions. But we recommend not entering a value higher than the price of the products you want to advertise. Minimum cost per order is ₹50.00.', forecastMetrics: ['Clicks', 'Orders'], costType: 'CPC' },
    ];
    const sdGoalCfg = SD_GOALS.find(g => g.key === sdGoal);

    const todayDisplayMs = `${todayDisplay}.${String(new Date().getMilliseconds()).padStart(3, '0')}`;
    const formatBudget = (val) => Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const sdMissing = [];
    if (!budget || parseFloat(budget) <= 0) sdMissing.push('Enter a budget');
    if (addedProducts.length === 0) sdMissing.push('Choose products');
    if (sdTargetTotal === 0) sdMissing.push('Add targets');
    if (sdCostControlEnabled && (!sdCostControlValue || parseFloat(sdCostControlValue) <= 0)) sdMissing.push('Enter a bid');

    return (
      <div className="ccs-root">
        {/* ── SD Topbar ── */}
        <div className="ccs-topbar">
          <div className="ccs-topbar-left">
            <button className="ccs-topbar-close" onClick={() => navigate('/')}><X size={16} /></button>
            <span className="ccs-topbar-title">New campaign</span>
          </div>
          <div className="ccs-topbar-right">
            <button className="link-btn ccs-back-link" onClick={() => navigate('/create-campaign')}>
              Go back to campaigns
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/create-campaign')}>Save as draft</button>
            <button className="btn btn-dark" onClick={handleLaunchSD}>Launch campaign</button>
          </div>
        </div>

        {/* ── SD Body (two-column, ad-group model, matches SP shell) ── */}
        <div className="ccs-body">
          <div className="ccs-main">

            <div className="ccs-section-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Create campaign</div>

            {/* Settings */}
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Settings</span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to set up your campaign</a>
              </div>
              <div className="ccs-card-body">
                <div className="ccs-field" style={{ maxWidth: 460 }}>
                  <label className="ccs-label">Campaign name <InfoIcon /></label>
                  <input className="ccs-input-full" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder={`Campaign - ${todayDisplayMs}`} />
                </div>
                <div className="ccs-field" style={{ maxWidth: 460, marginTop: 14 }}>
                  <label className="ccs-label">Portfolio <InfoIcon /></label>
                  <div className="ccs-select-wrap">
                    <select className="ccs-input-full" value={portfolioId} onChange={e => setPortfolioId(e.target.value)}>
                      <option value="">No Portfolio</option>
                      <option value="p1">Main Products Portfolio</option>
                      <option value="p2">Competitor Targeting Portfolio</option>
                    </select>
                    <ChevronDown size={14} className="ccs-select-chevron" />
                  </div>
                </div>
                <div className="ccs-date-row" style={{ marginTop: 14 }}>
                  <div className="ccs-field">
                    <label className="ccs-label">Start <InfoIcon /></label>
                    <div className="ccs-date-input-wrap">
                      <span className="ccs-date-icon">📅</span>
                      <input type="date" className="ccs-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="ccs-field">
                    <label className="ccs-label">End <InfoIcon /></label>
                    <div className="ccs-date-input-wrap">
                      <span className="ccs-date-icon">📅</span>
                      <input type="date" className="ccs-date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      {!endDate && <span className="ccs-no-end">No end date</span>}
                    </div>
                  </div>
                </div>
                <div className="ccs-field" style={{ marginTop: 14 }}>
                  <label className="ccs-label">Country</label>
                  <div className="ccs-country-static">India</div>
                </div>
                <div className="ccs-field" style={{ marginTop: 14, maxWidth: 200 }}>
                  <label className="ccs-label">Daily budget <InfoIcon /></label>
                  <div className="ccs-bid-input-wrap">
                    <span className="ccs-bid-prefix">₹</span>
                    <input type="number" className="ccs-bid-input" value={budget} onChange={e => { const v = parseFloat(e.target.value); setBudget(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 140 }} />
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Most campaigns with a budget over ₹{formatBudget(budget || 1000)} run throughout the day.</small>
                </div>
              </div>
            </div>

            <div className="ccs-section-title" style={{ fontSize: 24, fontWeight: 700, marginTop: 32, marginBottom: 20 }}>Create an ad group</div>

            <div className="ccs-field" style={{ marginBottom: 16 }}>
              <label className="ccs-label">Ad group name <InfoIcon /></label>
              <input className="ccs-input-full" style={{ maxWidth: 460 }} value={sdAdGroupName} onChange={e => setSdAdGroupName(e.target.value)} placeholder={`Ad group - ${todayDisplay}`} />
            </div>

            {/* Optimisation strategy */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Optimisation strategy <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to choose an optimization strategy</a>
            </div>
            <div className="ccs-card-body">
              {SD_GOALS.map(g => (
                <label key={g.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', padding: '10px 0' }}>
                  <input type="radio" name="sdGoal" value={g.key} checked={sdGoal === g.key}
                    onChange={() => { setSdGoal(g.key); setSdCostControlValue(g.ccDefault); }}
                    style={{ accentColor: '#0073bb', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>{g.label} <InfoIcon /></div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4, marginTop: 2 }}>{g.desc}</div>
                    <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>{g.costLine}</div>
                  </div>
                </label>
              ))}

              <div style={{ borderTop: '1px solid var(--amazon-border)', marginTop: 8, paddingTop: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Cost control</div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={sdCostControlEnabled} onChange={e => setSdCostControlEnabled(e.target.checked)} style={{ marginTop: 3 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Keep success metric at or below a desired value <InfoIcon /> <span className="ccs-beta-badge">Beta</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.4, marginTop: 2 }}>
                      We will set your bids and add targets while your campaign is running to try to stay at or below a metric value you specify. It can take {sdGoalCfg.ccDuration} to achieve the desired result.
                    </div>
                  </div>
                </label>
                {sdCostControlEnabled && (
                  <div style={{ marginTop: 12, paddingLeft: 26 }}>
                    <label className="ccs-label" style={{ fontWeight: 700 }}>{sdGoalCfg.ccLabel}</label>
                    <div className="ccs-bid-input-wrap" style={{ marginTop: 4, width: 'fit-content' }}>
                      <span className="ccs-bid-prefix">₹</span>
                      <input type="number" className="ccs-bid-input" value={sdCostControlValue}
                        onChange={e => { const v = parseFloat(e.target.value); setSdCostControlValue(v < 0 ? '0' : e.target.value); }}
                        min="0" style={{ width: 140 }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 4, maxWidth: 500 }}>{sdGoalCfg.ccHelper(sdCostControlValue)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ad format */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Ad format <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to choose your ad format</a>
            </div>
            <div className="ccs-card-body">
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  {
                    key: 'image', label: 'Image', caption: 'Promote your product with an optional image',
                    mockup: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ width: 46, height: 46, borderRadius: 4, background: 'var(--amazon-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shirt size={22} color="white" /></div>
                          <div style={{ width: 46, height: 46, borderRadius: 4, background: 'var(--amazon-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={22} color="white" /></div>
                        </div>
                        <div style={{ color: 'var(--amazon-orange)', fontSize: 13, letterSpacing: 1 }}>★★★★★</div>
                        <div style={{ height: 8, width: '70%', borderRadius: 4, background: 'var(--amazon-orange)', opacity: 0.85 }} />
                      </div>
                    ),
                  },
                  {
                    key: 'video', label: 'Video', caption: 'Feature products or brands in an autoplaying video.',
                    mockup: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14 }}>
                        <div style={{ height: 60, borderRadius: 4, background: 'var(--amazon-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={26} color="white" fill="white" /></div>
                        <div style={{ height: 8, width: '45%', borderRadius: 4, background: 'var(--amazon-orange)', opacity: 0.85 }} />
                        <div style={{ height: 8, width: '75%', borderRadius: 4, background: 'var(--amazon-orange)', opacity: 0.85 }} />
                      </div>
                    ),
                  },
                ].map(fmt => (
                  <label key={fmt.key} style={{
                    display: 'block', cursor: 'pointer', width: 300, borderRadius: 4,
                    border: sdAdFormat === fmt.key ? '2px solid #0073bb' : '1px solid var(--amazon-border)',
                    background: sdAdFormat === fmt.key ? '#f0f7ff' : 'white',
                  }}>
                    <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="radio" name="sdAdFormat" checked={sdAdFormat === fmt.key} onChange={() => setSdAdFormat(fmt.key)} style={{ accentColor: '#0073bb' }} />
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt.label}</span>
                    </div>
                    <div style={{ margin: '8px 14px 0', background: '#f7f8fa', border: '1px solid #e5e5e5', borderRadius: 4 }}>{fmt.mockup}</div>
                    <div style={{ fontSize: 12, color: '#555', padding: '8px 14px 14px', lineHeight: 1.4 }}>{fmt.caption}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products to advertise */}
          <div className="ccs-card" style={{ marginBottom: 16, borderColor: addedProducts.length === 0 ? '#c40000' : undefined }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Products to advertise <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to add products to your campaign</a>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--amazon-border)', fontSize: 12.5, color: '#333' }}>
              ✨ On average, advertisers who promoted 10 or more products saw a 106% increase in impressions over a 30-day period compared to advertisers who did not. (Amazon internal data, 2022)
            </div>
            <div className="ccs-products-layout">
              {/* Left: search/list/upload */}
              <div className="ccs-products-left">
                <div className="ccs-tab-row">
                  {[['search', 'Search'], ['list', 'Enter list'], ['upload', 'Upload']].map(([k, l]) => (
                    <button key={k} className={`ccs-tab ${productTab === k ? 'active' : ''}`} onClick={() => setProductTab(k)}>{l}</button>
                  ))}
                </div>

                {productTab === 'search' && (
                  <>
                    <div className="ccs-search-row">
                      <div className="ccs-search-wrap">
                        <Search size={14} className="ccs-search-icon" />
                        <input
                          className="ccs-search-input"
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          placeholder="Search by product name, ASIN or SKU"
                        />
                      </div>
                    </div>
                    <div className="ccs-products-meta">
                      <div className="ccs-show-row">
                        <span>Sort by date added</span>
                        <div style={{ position: 'relative' }}>
                          <button className="ccs-filter-btn-sm" onClick={() => setProductSortOpen(o => !o)}>
                            {productSort === 'newest' ? 'Descending' : 'Ascending'} <ChevronDown size={11} />
                          </button>
                          {productSortOpen && (
                            <div className="ccs-sort-dropdown">
                              {[['newest', 'Descending'], ['oldest', 'Ascending']].map(([k, l]) => (
                                <button key={k} className={`ccs-sort-option ${productSort === k ? 'selected' : ''}`}
                                  onClick={() => { setProductSort(k); setProductSortOpen(false); }}>{l}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="link-btn ccs-add-all" onClick={() => filteredProducts.forEach(addProduct)}>
                        Add all on this page
                      </button>
                    </div>
                    <div className="ccs-product-list">
                      {filteredProducts.map(p => {
                        const added = !!addedProducts.find(x => x.asin === p.asin);
                        return (
                          <div key={p.asin} className="ccs-product-row">
                            <ProductImage imageType={p.imageType} />
                            <div className="ccs-product-details">
                              <div className="ccs-product-name-link">{p.name}</div>
                              <div className="ccs-product-sub">
                                <Stars rating={p.rating} />
                                <span className="ccs-product-count">({p.reviews})</span>
                                <span className="ccs-product-price-tag">₹{p.price.toLocaleString('en-IN')}</span>
                                <span className={`ccs-stock-badge ${p.status === 'In stock' ? 'in' : 'out'}`}>
                                  {p.status === 'In stock' ? '●' : '○'} {p.status}
                                </span>
                              </div>
                              <div className="ccs-product-asin-row">
                                <span>ASIN: {p.asin}</span>
                                <span style={{ marginLeft: 16 }}>SKU: {p.sku}</span>
                              </div>
                            </div>
                            <button
                              className={`ccs-add-btn ${added ? 'added' : ''}`}
                              onClick={() => !added && addProduct(p)}
                              disabled={added}
                            >
                              {added ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                      <div className="ccs-pagination">
                        <span>1-{filteredProducts.length} of {filteredProducts.length} results</span>
                        <div className="ccs-page-btns">
                          <button className="ccs-page-btn" disabled>‹</button>
                          <button className="ccs-page-btn" disabled>›</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {productTab === 'list' && (
                  <div className="ccs-list-tab">
                    <p className="ccs-list-desc">Enter a list of ASINs or SKUs, one per line or separated by commas.</p>
                    <textarea
                      className="ccs-textarea"
                      rows={8}
                      value={asinListText}
                      onChange={e => setAsinListText(e.target.value)}
                      placeholder={"B0CF244HDV\nB0CF24MSGB\nB0CF277SZN"}
                    />
                    <div className="ccs-list-actions">
                      <button className="btn btn-secondary" onClick={handleAddFromList}>Add to list</button>
                      <span className="ccs-list-hint">
                        {asinListText ? `${asinListText.split(/[\n,\s]+/).filter(Boolean).length} ASIN(s) entered` : ''}
                      </span>
                    </div>
                    {asinListText && (
                      <div className="ccs-asin-chips">
                        {asinListText.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean).map(asin => {
                          const validFmt = PROD_ASIN_RE.test(asin);
                          const found = validFmt && allProducts.find(p => p.asin === asin);
                          const chipClass = !validFmt ? 'invalid' : found ? 'valid' : 'invalid';
                          return (
                            <div key={asin} className={`ccs-asin-chip ${chipClass}`}>
                              {asin}
                              {!validFmt && <span className="ccs-chip-err"> — invalid ASIN format</span>}
                              {validFmt && found && <span className="ccs-chip-name"> — {found.name.slice(0, 28)}…</span>}
                              {validFmt && !found && <span className="ccs-chip-err"> — not in your listings</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {productTab === 'upload' && (
                  <div className="ccs-upload-tab">
                    <p className="ccs-list-desc">Use the template to make sure your information uploads accurately.</p>
                    <button className="ccs-csv-template-btn" onClick={downloadTemplate}>
                      <span className="ccs-csv-icon">⬇</span> Download the CSV template
                    </button>
                    <label
                      className={`ccs-drop-zone ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFileInput(e.dataTransfer.files[0]); }}
                    >
                      <input
                        type="file"
                        accept=".csv,.tsv,.xlsx,.txt"
                        style={{ display: 'none' }}
                        onChange={e => handleFileInput(e.target.files[0])}
                      />
                      <div className="ccs-drop-icon">⬆</div>
                      <div className="ccs-drop-text">Drag and drop file to add</div>
                      <div className="ccs-drop-sub">or click to select from your computer</div>
                      <div className="ccs-drop-formats">Accepted formats: CSV, TSV, XLSX</div>
                    </label>
                    {uploadState && (
                      <div className="ccs-upload-results">
                        <div className="ccs-upload-results-header">
                          <span className="ccs-upload-filename">📄 {uploadState.fileName}</span>
                          <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setUploadState(null)}>Clear</button>
                        </div>
                        <div className="ccs-upload-summary">
                          <span className="ccs-upload-stat found">✓ {uploadState.results.filter(r => r.found).length} products added</span>
                          {uploadState.results.filter(r => !r.found).length > 0 && (
                            <span className="ccs-upload-stat notfound">✗ {uploadState.results.filter(r => !r.found).length} not in your listings (skipped)</span>
                          )}
                        </div>
                        <div className="ccs-upload-rows">
                          {uploadState.results.map(r => (
                            <div key={r.asin} className={`ccs-upload-row ${r.found ? 'valid' : 'invalid'}`}>
                              <span className="ccs-upload-check">{r.found ? '✓' : '✗'}</span>
                              <span className="ccs-upload-asin">{r.asin}</span>
                              {r.found && <span className="ccs-upload-pname">{r.product.name.slice(0, 45)}…</span>}
                              {!r.found && <span className="ccs-upload-err">{!r.validFormat ? 'Invalid ASIN format' : 'Not in your listings'} — skipped</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: added products panel */}
              <div className="ccs-products-right">
                <div className="ccs-added-header">
                  <strong>{addedProducts.length} products</strong>
                  {addedProducts.length > 0 && (
                    <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedProducts([])}>Remove all</button>
                  )}
                </div>
                {addedProducts.length === 0 ? (
                  <div className="ccs-added-empty">Add products</div>
                ) : (
                  <div className="ccs-added-list">
                    {addedProducts.map(p => (
                      <div key={p.asin} className="ccs-added-item">
                        <ProductImage imageType={p.imageType} size={36} />
                        <div className="ccs-added-info">
                          <div className="ccs-added-name">{p.name.slice(0, 50)}…</div>
                          <div className="ccs-added-asin">ASIN: {p.asin}</div>
                        </div>
                        <button className="ccs-remove-btn" onClick={() => removeProduct(p.asin)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {addedProducts.length === 0 && (
            <div style={{ color: '#c40000', fontSize: 13, marginTop: -10, marginBottom: 16 }}>❗ Add at least one product to advertise</div>
          )}

          {/* Targeting */}
          <div className="ccs-card" style={{ marginBottom: 16, borderColor: sdTargetTotal === 0 ? '#c40000' : undefined }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Targeting <InfoIcon /></span>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--amazon-border)', fontSize: 12.5, color: '#333' }}>
              ✨ On average, advertisers who use Sponsored Display audiences see up to 74% of their sales driven by new-to-brand customers. (Amazon internal data, 2022)
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--amazon-border)' }}>
              <div style={{ position: 'relative' }}>
                <button className="ccs-filter-btn-sm" onClick={() => setSdTargetFilterOpen(o => !o)}>
                  {sdTargetView ? SD_TARGET_CATEGORIES.find(c => c.key === sdTargetView)?.label : 'All'} <ChevronDown size={11} />
                </button>
                {sdTargetFilterOpen && (
                  <div className="ccs-sort-dropdown">
                    <button className={`ccs-sort-option ${!sdTargetView ? 'selected' : ''}`} onClick={() => { setSdTargetView(null); setSdTargetFilterOpen(false); }}>All</button>
                    {SD_TARGET_CATEGORIES.map(c => (
                      <button key={c.key} className={`ccs-sort-option ${sdTargetView === c.key ? 'selected' : ''}`} onClick={() => { setSdTargetView(c.key); setSdTargetFilterOpen(false); }}>{c.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="ccs-search-wrap" style={{ flex: 1 }}>
                <Search size={14} className="ccs-search-icon" />
                <input className="ccs-search-input" placeholder="Search targeting" value={sdTargetSearch} onChange={e => setSdTargetSearch(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* LEFT */}
              <div style={{ borderRight: '1px solid var(--amazon-border)' }}>
                {sdTargetView === null && SD_TARGET_CATEGORIES
                  .filter(c => !sdTargetSearch || c.label.toLowerCase().includes(sdTargetSearch.toLowerCase()))
                  .map(c => (
                    <button key={c.key} onClick={() => setSdTargetView(c.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', padding: 16, border: 'none', borderBottom: '1px solid var(--amazon-border)', background: 'white', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 12, color: '#555', maxWidth: 480 }}>{c.desc}</div>
                      </div>
                      <ChevronRight size={16} color="#888" />
                    </button>
                  ))}

                {sdTargetView !== null && (() => {
                  const catCfg = SD_TARGET_CATEGORIES.find(c => c.key === sdTargetView);
                  const isContextual = sdTargetView === 'contextual';
                  const dynSegs = SD_DYNAMIC_SEGMENTS[sdTargetView] || [];
                  const filteredDynSegs = sdTargetView === 'remarketing' ? dynSegs.filter(s => s.lookbackType === sdLookbackType) : dynSegs;
                  const namedAudiences = SD_AUDIENCES.filter(a => a.group === sdTargetView && (!sdTargetSearch || a.label.toLowerCase().includes(sdTargetSearch.toLowerCase())));
                  const BidRow = (
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Bid <InfoIcon /></span>
                        <div style={{ position: 'relative' }}>
                          <button className="ccs-filter-btn-sm" onClick={() => {
                            if (sdCostControlEnabled) { setSdBidLockTooltipOpen(o => !o); return; }
                            setSdBidModeDropOpen(o => !o);
                          }}>
                            {!sdCostControlEnabled && sdBidMode === 'custom' ? 'Custom bid' : 'Suggested bid'} <ChevronDown size={11} />
                          </button>
                          {sdBidLockTooltipOpen && sdCostControlEnabled && (
                            <div className="ccs-bid-lock-tooltip">
                              <button className="ccs-bid-lock-tooltip-close" onClick={() => setSdBidLockTooltipOpen(false)}>×</button>
                              <p>Bid controls are not available when you set a desired outcome for a primary metric. We will optimise bids to meet the desired outcome.</p>
                            </div>
                          )}
                          {sdBidModeDropOpen && !sdCostControlEnabled && (
                            <div className="ccs-bid-mode-dropdown">
                              {[
                                { k: 'suggested', label: 'Suggested bid', desc: 'Based on past bidding activity to predict bids that are more likely to win' },
                                { k: 'custom', label: 'Custom bid', desc: 'Can customise bids for each target without overriding your set bid amount' },
                              ].map(opt => (
                                <button key={opt.k} className={`ccs-bid-mode-option ${sdBidMode === opt.k ? 'selected' : ''}`}
                                  onClick={() => { setSdBidMode(opt.k); setSdBidModeDropOpen(false); }}>
                                  <strong>{opt.label}</strong>
                                  <span>{opt.desc}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {!sdCostControlEnabled && sdBidMode === 'custom' && (
                          <div className="ccs-bid-input-wrap">
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={sdCustomBid} style={{ width: 70 }}
                              onChange={e => { const v = parseFloat(e.target.value); setSdCustomBid(v < 0 ? '0' : e.target.value); }} min="0" />
                          </div>
                        )}
                        <span style={{ fontSize: 12, color: '#555' }}>per click (CPC)</span>
                      </div>
                      {!sdCostControlEnabled && sdBidMode === 'custom' && (
                        <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>✨ On average, suggested bids drive 1.8x higher clicks than custom bids. (Amazon internal data, 2022)</div>
                      )}
                    </div>
                  );
                  // Amazon always shows the suggestion count / "Add all" bar for a targeting
                  // group — even when there are zero dynamic-segment suggestions (e.g.
                  // In-market / Interest & lifestyle, which have no behavior-based segments).
                  // The "Dynamic segments" sub-heading + rows only render when there's
                  // actually something to list under it.
                  const DynamicSegmentsBlock = (segs) => (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', background: '#f7f7f7', borderTop: '1px solid var(--amazon-border)', borderBottom: '1px solid var(--amazon-border)' }}>
                        <span style={{ fontSize: 13 }}>{segs.length} suggestion{segs.length !== 1 ? 's' : ''}</span>
                        {segs.length > 0
                          ? <button className="link-btn ccs-kw-add-all" onClick={() => segs.forEach(s => addSdAudience(s, sdLookbackDays))}>Add all</button>
                          : <span style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Add all</span>
                        }
                      </div>
                      {segs.length > 0 && (
                        <>
                          <div style={{ padding: '10px 16px 4px', fontSize: 13, fontWeight: 700, color: '#333' }}>Dynamic segments <InfoIcon /></div>
                          {segs.map(s => {
                            const isAdded = !!sdAddedAudiences.find(a => a.key === s.key);
                            return (
                              <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                <div>
                                  <div style={{ fontSize: 12, color: '#555' }}>{s.type}</div>
                                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label} <InfoIcon tip={s.desc} /></div>
                                  {s.lookbackType && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Lookback: {sdLookbackDays} days</div>}
                                </div>
                                {isAdded
                                  ? <span className="ccs-kw-added-text" style={{ fontStyle: 'italic' }}>Added</span>
                                  : <button className="link-btn ccs-kw-add-link" onClick={() => addSdAudience(s, sdLookbackDays)}>Add</button>
                                }
                              </div>
                            );
                          })}
                        </>
                      )}
                    </>
                  );
                  // Section label for the real, browsable (non-dynamic) list differs by group:
                  // Contextual → "Product categories", Remarketing → "Audience categories",
                  // In-market / Interest & lifestyle → just "Audiences".
                  const catsHeadingLabel = isContextual ? 'Product categories' : (sdTargetView === 'remarketing' ? 'Audience categories' : 'Audiences');
                  const CategoriesFallback = ({ heading }) => (
                    <>
                      <div style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#333', background: '#f7f7f7', borderBottom: '1px solid var(--amazon-border)' }}>{heading}</div>
                      {addedProducts.length === 0 ? (
                        <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                          We could not find any related categories. Try searching for categories.
                        </div>
                      ) : isContextual ? (
                        <div className="ccs-cat-list" style={{ maxHeight: 400, overflowY: 'auto' }}>
                          {ALL_CATEGORIES.map(cat => (
                            <CatRow key={cat.id} cat={cat} depth={0}
                              expandedCats={expandedCats} setExpandedCats={setExpandedCats}
                              addedProdTargets={addedProdTargets} addProdTarget={addProdTarget}
                              setRefineTarget={() => {}} catSearch={sdTargetSearch} />
                          ))}
                        </div>
                      ) : (
                        namedAudiences.map(aud => {
                          const isAdded = !!sdAddedAudiences.find(a => a.key === aud.key);
                          return (
                            <div key={aud.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                              <div style={{ maxWidth: 480 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{aud.label}</div>
                                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{aud.desc}</div>
                              </div>
                              {isAdded ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addSdAudience({ ...aud, type: catCfg.label })}>Add</button>}
                            </div>
                          );
                        })
                      )}
                    </>
                  );
                  // Remarketing browses its 2 fixed audience types; In-market / Interest &
                  // lifestyle browse the full real taxonomy tree (always available, regardless
                  // of whether a product has been added — Browse is manual, not suggestion-driven).
                  const BrowseAudiences = () => (
                    sdTargetView === 'remarketing' ? (
                      <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                        {namedAudiences.map(aud => {
                          const isAdded = !!sdAddedAudiences.find(a => a.key === aud.key);
                          return (
                            <div key={aud.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                              <div style={{ maxWidth: 480 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{aud.label}</div>
                                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{aud.desc}</div>
                              </div>
                              {isAdded ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addSdAudience({ ...aud, type: catCfg.label })}>Add</button>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                        <div style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#333', background: '#f7f7f7', borderBottom: '1px solid var(--amazon-border)' }}>All audiences</div>
                        {(SD_AUDIENCE_TREE[sdTargetView] || []).map(cat => (
                          <AudCatRow key={cat.id} cat={cat}
                            expandedAudCats={expandedAudCats} setExpandedAudCats={setExpandedAudCats}
                            addedKeys={new Set(sdAddedAudiences.map(a => a.key))}
                            onAdd={item => addSdAudience({ key: item.id, label: item.name, type: SD_GROUP_SHORT_LABEL[sdTargetView] })}
                            audSearch={sdTargetSearch} />
                        ))}
                      </div>
                    )
                  );
                  // In-market / Interest & lifestyle have no context-free dynamic segments, so
                  // their entire "Suggested" tab — count bar, heading, and list — is driven by
                  // the added product(s): 0 until a product exists, then the relevant taxonomy
                  // leaves (see getSdProductAudiences above).
                  const ProductAudienceSuggestBlock = () => {
                    const items = addedProducts.length > 0 ? getSdProductAudiences(sdTargetView) : [];
                    const shortLabel = SD_GROUP_SHORT_LABEL[sdTargetView];
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', background: '#f7f7f7', borderTop: '1px solid var(--amazon-border)', borderBottom: '1px solid var(--amazon-border)' }}>
                          <span style={{ fontSize: 13 }}>{items.length} suggestion{items.length !== 1 ? 's' : ''}</span>
                          {items.length > 0
                            ? <button className="link-btn ccs-kw-add-all" onClick={() => items.forEach(it => addSdAudience({ key: it.id, label: it.name, type: shortLabel }))}>Add all</button>
                            : <span style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Add all</span>
                          }
                        </div>
                        <div style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#333', background: '#f7f7f7', borderBottom: '1px solid var(--amazon-border)' }}>{catsHeadingLabel}</div>
                        {addedProducts.length === 0 ? (
                          <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                            We could not find any related categories. Try searching for categories.
                          </div>
                        ) : (
                          items.map(it => {
                            const isAdded = !!sdAddedAudiences.find(a => a.key === it.id);
                            return (
                              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                <div>
                                  <div style={{ fontSize: 12, color: '#555' }}>{shortLabel}</div>
                                  <div style={{ fontSize: 13, fontWeight: 700 }}>{it.name} <InfoIcon tip={it.desc} /></div>
                                </div>
                                {isAdded
                                  ? <span className="ccs-kw-added-text">Added</span>
                                  : <button className="link-btn ccs-kw-add-link" onClick={() => addSdAudience({ key: it.id, label: it.name, type: shortLabel })}>Add</button>
                                }
                              </div>
                            );
                          })
                        )}
                      </>
                    );
                  };

                  return (
                    <div style={{ maxHeight: 700, overflowY: 'auto' }}>
                      <button className="link-btn" style={{ fontSize: 12, padding: '10px 14px', display: 'block' }} onClick={() => setSdTargetView(null)}>‹ Back</button>
                      <div style={{ padding: '0 16px 10px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>{catCfg.label} <InfoIcon tip={catCfg.desc} /></div>

                      {isContextual && (
                        <div className="ccs-tab-row" style={{ padding: '0 16px' }}>
                          {[['categories', 'Categories'], ['individual', 'Individual products']].map(([k, l]) => (
                            <button key={k} className={`ccs-tab ${sdCtxTab === k ? 'active' : ''}`} onClick={() => setSdCtxTab(k)}>{l} <InfoIcon /></button>
                          ))}
                        </div>
                      )}

                      {/* CONTEXTUAL > CATEGORIES */}
                      {isContextual && sdCtxTab === 'categories' && (
                        <>
                          <div className="ccs-tab-row" style={{ padding: '0 16px' }}>
                            {[['suggested', 'Suggested'], ['browse', 'Browse']].map(([k, l]) => (
                              <button key={k} className={`ccs-tab ${sdCtxCatSubTab === k ? 'active' : ''}`} onClick={() => setSdCtxCatSubTab(k)}>{l}{k === 'suggested' && <> <InfoIcon /></>}</button>
                            ))}
                          </div>
                          {BidRow}
                          {sdCtxCatSubTab === 'suggested' && (
                            <>
                              {DynamicSegmentsBlock(dynSegs)}
                              <CategoriesFallback heading={catsHeadingLabel} />
                            </>
                          )}
                          {sdCtxCatSubTab === 'browse' && (
                            <div className="ccs-cat-list" style={{ maxHeight: 560, overflowY: 'auto' }}>
                              {ALL_CATEGORIES.map(cat => (
                                <CatRow key={cat.id} cat={cat} depth={0}
                                  expandedCats={expandedCats} setExpandedCats={setExpandedCats}
                                  addedProdTargets={addedProdTargets} addProdTarget={addProdTarget}
                                  setRefineTarget={() => {}} catSearch={sdTargetSearch} />
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* CONTEXTUAL > INDIVIDUAL PRODUCTS */}
                      {isContextual && sdCtxTab === 'individual' && (
                        <>
                          <div className="ccs-tab-row" style={{ padding: '0 16px' }}>
                            {[['suggested', 'Suggested'], ['search', 'Search'], ['enter-list', 'Enter list']].map(([k, l]) => (
                              <button key={k} className={`ccs-tab ${sdCtxIndivSubTab === k ? 'active' : ''}`} onClick={() => setSdCtxIndivSubTab(k)}>{l}{k !== 'enter-list' && <> <InfoIcon /></>}</button>
                            ))}
                          </div>
                          {BidRow}
                          {sdCtxIndivSubTab === 'suggested' && (
                            addedProducts.length === 0 ? (
                              <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                                No suggestions available. Try searching for products.
                              </div>
                            ) : (
                              <div style={{ padding: '16px', fontSize: 13, color: '#555' }}>No individual product suggestions available yet.</div>
                            )
                          )}
                          {sdCtxIndivSubTab === 'search' && (
                            <div style={{ padding: '12px 16px' }}>
                              <div className="ccs-search-wrap" style={{ marginBottom: 10 }}>
                                <Search size={14} className="ccs-search-icon" />
                                <input className="ccs-search-input" placeholder="Search by product name or ASIN" value={sdIndivSearch} onChange={e => setSdIndivSearch(e.target.value)} />
                              </div>
                              {!sdIndivSearch ? (
                                <div style={{ padding: '20px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>Search for products you want to target.</div>
                              ) : (
                                allProducts.filter(p => p.name.toLowerCase().includes(sdIndivSearch.toLowerCase()) || p.asin.toLowerCase().includes(sdIndivSearch.toLowerCase())).map(p => {
                                  const id = `sd-indiv-${p.asin}`;
                                  const isAdded = !!addedProdTargets.find(t => t.id === id);
                                  return (
                                    <div key={p.asin} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                      <div style={{ maxWidth: 400 }}>
                                        <div style={{ fontSize: 13 }}>{p.name.slice(0, 60)}…</div>
                                        <div style={{ fontSize: 11, color: '#888' }}>ASIN: {p.asin}</div>
                                      </div>
                                      {isAdded ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addSdProdTarget({ id, name: p.name.slice(0, 50), sugg: p.sugg, suggMin: p.suggMin, suggMax: p.suggMax })}>Add</button>}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                          {sdCtxIndivSubTab === 'enter-list' && (
                            <div style={{ padding: '12px 16px' }}>
                              <p style={{ fontSize: 12.5, color: '#555', marginBottom: 8 }}>Enter a list of ASINs, one per line or separated by commas.</p>
                              <textarea className="ccs-textarea" rows={6} value={sdIndivEnterList} onChange={e => setSdIndivEnterList(e.target.value)} placeholder={'B0CF244HDV\nB0CF24MSGB'} />
                              <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => {
                                const ASIN_RE = /^B[A-Z0-9]{9}$/;
                                [...new Set(sdIndivEnterList.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean))].forEach(asin => {
                                  if (!ASIN_RE.test(asin)) return;
                                  const found = allProducts.find(p => p.asin === asin);
                                  addSdProdTarget({ id: `sd-indiv-${asin}`, name: found ? found.name.slice(0, 50) : asin, sugg: found?.sugg, suggMin: found?.suggMin, suggMax: found?.suggMax });
                                });
                                setSdIndivEnterList('');
                              }}>Add to list</button>
                            </div>
                          )}
                        </>
                      )}

                      {/* REMARKETING / IN-MARKET / INTEREST-LIFESTYLE */}
                      {!isContextual && (
                        <>
                          <div className="ccs-tab-row" style={{ padding: '0 16px' }}>
                            {[['suggested', 'Suggested'], ['browse', 'Browse']].map(([k, l]) => (
                              <button key={k} className={`ccs-tab ${sdAudSubTab === k ? 'active' : ''}`} onClick={() => setSdAudSubTab(k)}>{l}{k === 'suggested' && <> <InfoIcon /></>}</button>
                            ))}
                          </div>
                          {BidRow}
                          {sdTargetView === 'remarketing' && sdAudSubTab === 'suggested' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 12px' }}>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>Lookback</span>
                              <div style={{ position: 'relative' }}>
                                <button className="ccs-filter-btn-sm" onClick={() => setSdLookbackTypeDropOpen(o => !o)}>
                                  {sdLookbackType === 'views' ? 'Views' : 'Purchases'} <ChevronDown size={11} />
                                </button>
                                {sdLookbackTypeDropOpen && (
                                  <div className="ccs-sort-dropdown">
                                    {[['views', 'Views'], ['purchases', 'Purchases']].map(([k, l]) => (
                                      <button key={k} className={`ccs-sort-option ${sdLookbackType === k ? 'selected' : ''}`} onClick={() => { setSdLookbackType(k); setSdLookbackTypeDropOpen(false); }}>{l}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div style={{ position: 'relative' }}>
                                <button className="ccs-filter-btn-sm" onClick={() => setSdLookbackDaysDropOpen(o => !o)}>
                                  {sdLookbackDays} days <ChevronDown size={11} />
                                </button>
                                {sdLookbackDaysDropOpen && (
                                  <div className="ccs-sort-dropdown">
                                    {[7, 14, 30, 60, 90].map(d => (
                                      <button key={d} className={`ccs-sort-option ${sdLookbackDays === d ? 'selected' : ''}`} onClick={() => { setSdLookbackDays(d); setSdLookbackDaysDropOpen(false); }}>{d} days</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {sdAudSubTab === 'suggested' && (
                            sdTargetView === 'remarketing' ? (
                              <>
                                {DynamicSegmentsBlock(filteredDynSegs)}
                                <CategoriesFallback heading={catsHeadingLabel} />
                              </>
                            ) : (
                              <ProductAudienceSuggestBlock />
                            )
                          )}
                          {sdAudSubTab === 'browse' && <BrowseAudiences />}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* RIGHT */}
              <div>
                <div className="ccs-added-header">
                  <strong>{sdTargetTotal} added</strong>
                  {sdTargetTotal > 0 && (
                    <button className="link-btn" style={{ fontSize: 12 }} onClick={() => { setAddedProdTargets([]); setSdAddedAudiences([]); }}>Remove all</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 128px 20px', alignItems: 'center', padding: '7px 16px', fontSize: 12, fontWeight: 600, color: '#555', background: '#f7f7f7', borderTop: '1px solid var(--amazon-border)', borderBottom: '1px solid var(--amazon-border)' }}>
                  <span>Audiences, categories, products</span>
                  <span>Sugg. bid <InfoIcon /><br/>
                    {!sdCostControlEnabled && (
                      <button className="link-btn" style={{ fontSize: 11, fontWeight: 500 }} onClick={() => {
                        setAddedProdTargets(prev => prev.map(x => x.sugg ? { ...x, bid: x.sugg.toFixed(2) } : x));
                        setSdAddedAudiences(prev => prev.map(x => x.sugg ? { ...x, bid: x.sugg.toFixed(2) } : x));
                      }}>Apply all</button>
                    )}
                  </span>
                  <span>Bid <InfoIcon /></span>
                  <span />
                </div>
                {sdTargetTotal === 0 ? (
                  <div className="ccs-added-empty" style={{ height: 560 }}>Add targets</div>
                ) : (
                  <div className="ccs-added-list" style={{ maxHeight: 610 }}>
                    {addedProdTargets.map((t, i) => (
                      <div key={`ct-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 128px 20px', alignItems: 'flex-start', gap: 6, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#555' }}>Contextual</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                        </div>
                        {t.sugg ? (
                          <div style={{ fontSize: 12, color: '#555' }}>
                            <div>₹{t.sugg.toFixed(2)}</div>
                            {t.suggMin != null && <div style={{ fontSize: 11 }}>₹{t.suggMin.toFixed(2)} - ₹{t.suggMax.toFixed(2)}</div>}
                          </div>
                        ) : <span style={{ color: '#999', fontSize: 13 }}>-</span>}
                        {sdCostControlEnabled ? (
                          <div className="ccs-bid-input-wrap" style={{ width: 118, opacity: 0.5 }}>
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value="" placeholder="-" style={{ width: 80, padding: '8px 4px', textAlign: 'right' }} disabled />
                          </div>
                        ) : (
                          <div className="ccs-bid-input-wrap" style={{ width: 118 }}>
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={t.bid || ''} placeholder="-" style={{ width: 80, padding: '8px 4px', textAlign: 'right' }}
                              onChange={e => setAddedProdTargets(prev => prev.map((x, idx) => idx === i ? { ...x, bid: e.target.value } : x))} />
                          </div>
                        )}
                        <button className="ccs-remove-btn" onClick={() => setAddedProdTargets(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                      </div>
                    ))}
                    {sdAddedAudiences.map(a => (
                      <div key={a.key} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 128px 20px', alignItems: 'flex-start', gap: 6, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#555' }}>{a.type}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{a.label} {a.desc && <InfoIcon tip={a.desc} />}</div>
                          {a.lookbackDays && (
                            <>
                              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Lookback: {a.lookbackDays} days</div>
                              <div style={{ position: 'relative', marginTop: 2 }}>
                                <button className="ccs-filter-btn-sm" style={{ fontSize: 11 }} onClick={() => setSdItemLookbackOpen(o => o === a.key ? null : a.key)}>
                                  {a.lookbackType === 'views' ? 'Views' : 'Purchases'} {a.lookbackDays} days <ChevronDown size={10} />
                                </button>
                                {sdItemLookbackOpen === a.key && (
                                  <div className="ccs-sort-dropdown">
                                    {[7, 14, 30, 60, 90].map(d => (
                                      <button key={d} className={`ccs-sort-option ${a.lookbackDays === d ? 'selected' : ''}`}
                                        onClick={() => { setSdAddedAudiences(prev => prev.map(x => x.key === a.key ? { ...x, lookbackDays: d } : x)); setSdItemLookbackOpen(null); }}>{d} days</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        {a.sugg ? (
                          <div style={{ fontSize: 12, color: '#555' }}>
                            <div>₹{a.sugg.toFixed(2)}</div>
                            <div style={{ fontSize: 11 }}>₹{a.suggMin.toFixed(2)} - ₹{a.suggMax.toFixed(2)}</div>
                          </div>
                        ) : <span style={{ color: '#999', fontSize: 13 }}>-</span>}
                        {sdCostControlEnabled ? (
                          <div className="ccs-bid-input-wrap" style={{ width: 118, opacity: 0.5 }}>
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value="" placeholder="-" style={{ width: 80, padding: '8px 4px', textAlign: 'right' }} disabled />
                          </div>
                        ) : (
                          <div className="ccs-bid-input-wrap" style={{ width: 118 }}>
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={a.bid || ''} placeholder="-" style={{ width: 80, padding: '8px 4px', textAlign: 'right' }}
                              onChange={e => setSdAddedAudiences(prev => prev.map(x => x.key === a.key ? { ...x, bid: e.target.value } : x))} />
                          </div>
                        )}
                        <button className="ccs-remove-btn" onClick={() => removeSdAudience(a.key)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {sdTargetTotal === 0 && (
              <div style={{ color: '#c40000', fontSize: 13, padding: '10px 16px', borderTop: '1px solid var(--amazon-border)' }}>❗ Please choose at least one audience.</div>
            )}
          </div>

          {/* Creative */}
          {addedProducts.length > 0 && (() => {
            const SD_CREATIVE_IMAGE_SIZES = [
              { key: 'product-page-right', label: 'Amazon product page right', w: 118, h: 160, layout: 'tall', hasButton: false },
              { key: 'medium-rectangle', label: 'Medium rectangle', w: 150, h: 122, layout: 'tall', hasButton: true },
              { key: 'mobile-pages', label: 'Amazon mobile pages', w: 210, h: 84, layout: 'wide', hasButton: true },
              { key: 'product-detail-middle', label: 'Amazon product detail page middle', w: 210, h: 64, layout: 'wide', hasButton: true },
              { key: 'leaderboard', label: 'Leaderboard', w: 230, h: 56, layout: 'wide', hasButton: false },
              { key: 'billboard', label: 'Billboard', w: 250, h: 84, layout: 'wide', hasButton: true },
              { key: 'amazon-apps', label: 'Amazon apps', w: 140, h: 140, layout: 'tall', hasButton: true },
              { key: 'square', label: 'Square', w: 130, h: 130, layout: 'tall', hasButton: false },
            ];
            const SD_CREATIVE_VIDEO_SIZES = [
              { key: 'mobile-rectangle', label: 'Amazon mobile rectangle' },
              { key: 'medium-rectangle-v', label: 'Medium rectangle' },
              { key: 'amazon-apps-v', label: 'Amazon apps' },
            ];
            const brandName = (campaignName || sdAdGroupName || 'Your Brand').replace(/^Campaign - .*/, 'Your Brand').replace(/^Ad group - .*/, 'Your Brand');
            const pageSize = 4;
            const isVideo = sdAdFormat === 'video';
            const totalPages = isVideo ? SD_CREATIVE_VIDEO_SIZES.length : Math.ceil(SD_CREATIVE_IMAGE_SIZES.length / pageSize);
            const previewIdx = Math.min(sdCrPreviewIdx, totalPages - 1);
            const pageImageSizes = isVideo ? [] : SD_CREATIVE_IMAGE_SIZES.slice(previewIdx * pageSize, previewIdx * pageSize + pageSize);
            const currentVideoSize = isVideo ? SD_CREATIVE_VIDEO_SIZES[previewIdx] : null;

            return (
              <div className="ccs-card" style={{ marginBottom: 16 }}>
                <div className="ccs-card-header">
                  <span className="ccs-card-heading">Creative</span>
                  <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> How to customize your creative</a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr' }}>
                  {/* LEFT: customize panel */}
                  <div style={{ borderRight: '1px solid var(--amazon-border)' }}>
                    {sdCrDrill === null && (
                      <>
                        <div style={{ padding: '16px 16px 10px', fontSize: 13, color: '#333', display: 'flex', alignItems: 'center', gap: 4 }}>
                          Choose how you would like to customise your ad. <InfoIcon tip="Turn these on to let Amazon assemble your ad using your logo, a headline, and/or an image alongside your product images." />
                        </div>

                        {isVideo && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--amazon-border)', cursor: 'pointer' }}
                            onClick={() => setSdCrDrill('video')}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Video</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {sdCrVideoFile ? <span className="ccs-kw-added-text">Added</span> : <span style={{ color: '#0073bb', fontSize: 13 }}>Add</span>}
                              <ChevronRight size={16} color="#888" />
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--amazon-border)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Toggle on={sdCrLogo} onChange={setSdCrLogo} />
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Logo</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {sdCrLogo && (
                              <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#067d62', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                            )}
                            <button onClick={() => setSdCrDrill('logo')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronRight size={16} color="#888" /></button>
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--amazon-border)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Toggle on={sdCrHeadline} onChange={setSdCrHeadline} />
                            <span style={{ fontSize: 14, fontWeight: 700 }}>Headline</span>
                          </span>
                          <button onClick={() => setSdCrDrill('headline')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronRight size={16} color="#888" /></button>
                        </div>

                        {!isVideo && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--amazon-border)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Toggle on={sdCrImage} onChange={setSdCrImage} />
                              <span style={{ fontSize: 14, fontWeight: 700 }}>Image</span>
                            </span>
                            <button onClick={() => setSdCrDrill('image')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronRight size={16} color="#888" /></button>
                          </div>
                        )}

                        {!isVideo && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '16px', color: '#333', fontSize: 12.5, borderTop: '1px solid var(--amazon-border)' }}>
                            <Info size={13} style={{ marginTop: 1, flexShrink: 0, color: '#0073bb' }} />
                            <span>AI-generated images are available.</span>
                          </div>
                        )}
                      </>
                    )}

                    {sdCrDrill === 'video' && (
                      <div style={{ padding: 16 }}>
                        <button className="link-btn" style={{ fontSize: 13, marginBottom: 14, display: 'block' }} onClick={() => setSdCrDrill(null)}>‹ Back</button>
                        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5, marginBottom: 14 }}>Pick a brief, engaging video that showcases your products in action with sound. Video will auto-play on mute.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                          <label className="ccs-csv-template-btn" style={{ cursor: 'pointer' }}>
                            <span className="ccs-csv-icon">⬆</span> Upload video
                            <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && setSdCrVideoFile(e.target.files[0].name)} />
                          </label>
                          <a href="#" onClick={e => e.preventDefault()} className="ccs-help-link">Choose from creative assets</a>
                        </div>
                        {sdCrVideoFile && <div style={{ fontSize: 12.5, color: '#007600', marginBottom: 14 }}>✓ {sdCrVideoFile} selected</div>}
                        <div style={{ border: '1px solid var(--amazon-border)', borderRadius: 6, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <strong style={{ fontSize: 14 }}>Video specs</strong>
                            <a href="#" onClick={e => e.preventDefault()} className="ccs-help-link" style={{ fontSize: 12 }}>See video guidelines</a>
                          </div>
                          <ul style={{ fontSize: 12.5, color: '#333', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                            <li><strong>Aspect ratio:</strong> 16:9</li>
                            <li><strong>Dimensions:</strong> 1920 x 1080 (min)</li>
                            <li><strong>Max file size:</strong> 500 MB</li>
                            <li><strong>File format:</strong> H.264, MPEG-2, MPEG-4</li>
                            <li><strong>Length:</strong> 6–45 sec</li>
                            <li><strong>Frame rate:</strong> 23.976, 24, 25, 29.97, 29.98 or 30 fps</li>
                            <li><strong>Bitrate:</strong> 1 Mbps or higher</li>
                            <li><strong>Video stream:</strong> 1 only</li>
                          </ul>
                          <strong style={{ fontSize: 14, display: 'block', marginTop: 14, marginBottom: 6 }}>Audio specs</strong>
                          <ul style={{ fontSize: 12.5, color: '#333', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                            <li><strong>Language:</strong> Must match ad locale</li>
                            <li><strong>Sample rate:</strong> 44.1 kHz or 48 kHz</li>
                            <li><strong>Codec:</strong> PCM or AAC</li>
                            <li><strong>Bit rate:</strong> 96 kbps or higher</li>
                            <li><strong>Format:</strong> Stereo or mono</li>
                            <li><strong>Audio stream:</strong> 1 only</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {sdCrDrill === 'logo' && (
                      <div style={{ padding: 16 }}>
                        <button className="link-btn" style={{ fontSize: 13, marginBottom: 14, display: 'block' }} onClick={() => setSdCrDrill(null)}>‹ Back</button>
                        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5, marginBottom: 14 }}>Your logo helps shoppers recognise your brand. We use the logo from your brand registration by default.</p>
                        <label className="ccs-csv-template-btn" style={{ cursor: 'pointer' }}>
                          <span className="ccs-csv-icon">⬆</span> Change logo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => setSdCrLogo(true)} />
                        </label>
                      </div>
                    )}

                    {sdCrDrill === 'headline' && (
                      <div style={{ padding: 16 }}>
                        <button className="link-btn" style={{ fontSize: 13, marginBottom: 14, display: 'block' }} onClick={() => setSdCrDrill(null)}>‹ Back</button>
                        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5, marginBottom: 10 }}>Add a short, compelling headline to appear alongside your product.</p>
                        <input className="ccs-input-full" maxLength={50} placeholder="Enter a headline" value={sdCrHeadlineText}
                          onChange={e => { setSdCrHeadlineText(e.target.value); setSdCrHeadline(!!e.target.value); }} />
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{sdCrHeadlineText.length}/50 characters</div>
                      </div>
                    )}

                    {sdCrDrill === 'image' && (
                      <div style={{ padding: 16 }}>
                        <button className="link-btn" style={{ fontSize: 13, marginBottom: 14, display: 'block' }} onClick={() => setSdCrDrill(null)}>‹ Back</button>
                        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.5, marginBottom: 14 }}>Add a custom image to feature alongside your product, or generate one with AI.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <label className="ccs-csv-template-btn" style={{ cursor: 'pointer' }}>
                            <span className="ccs-csv-icon">⬆</span> Upload image
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => setSdCrImage(true)} />
                          </label>
                          <button className="btn btn-secondary" onClick={() => setSdCrImage(true)}>✨ Generate with AI</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: preview panel */}
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <strong style={{ fontSize: 13 }}>Preview:</strong>
                      <div style={{ position: 'relative' }}>
                        <button className="ccs-filter-btn-sm" onClick={() => setSdCrPreviewDropOpen(o => !o)}>
                          {isVideo ? currentVideoSize.label : 'Key ad sizes'} <ChevronDown size={11} />
                        </button>
                        {sdCrPreviewDropOpen && (
                          <div className="ccs-sort-dropdown">
                            {(isVideo ? SD_CREATIVE_VIDEO_SIZES : [{ key: 'key-ad-sizes', label: 'Key ad sizes' }]).map(opt => (
                              <button key={opt.key} className="ccs-sort-option selected"
                                onClick={() => { if (isVideo) setSdCrPreviewIdx(SD_CREATIVE_VIDEO_SIZES.findIndex(s => s.key === opt.key)); setSdCrPreviewDropOpen(false); }}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 13, color: '#333' }}>{previewIdx + 1} of {totalPages}</span>
                      <button className="ccs-page-btn" disabled={previewIdx === 0} onClick={() => setSdCrPreviewIdx(i => Math.max(0, i - 1))}>‹</button>
                      <button className="ccs-page-btn" disabled={previewIdx === totalPages - 1} onClick={() => setSdCrPreviewIdx(i => Math.min(totalPages - 1, i + 1))}>›</button>
                    </div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>These previews are examples only and may not show all possible versions of your ad.</div>

                    {!isVideo ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                        {pageImageSizes.map(size => (
                          <div key={size.key} style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minHeight: 190 }}>
                            <div style={{ width: size.w, height: size.h, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                              <SdAdMockup layout={size.layout} hasButton={size.hasButton} brandName={brandName}
                                products={sdCrImage || addedProducts.length > 0 ? addedProducts : []}
                                headlineOn={sdCrHeadline} headlineText={sdCrHeadlineText} />
                            </div>
                            <div style={{ color: 'white', fontSize: 13, fontWeight: 700, marginTop: 12, textAlign: 'center' }}>{size.label}</div>
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, pageSize - pageImageSizes.length) }).map((_, i) => (
                          <div key={`empty-${i}`} style={{ minHeight: 190 }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: '#1a1a1a', borderRadius: 4, padding: '16px 16px 30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: 13, marginBottom: 14 }}>
                          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}><Search size={13} /> View full size</a>
                          <a href="#" onClick={e => e.preventDefault()} style={{ color: 'white' }}>Where will my ad show?</a>
                        </div>
                        <div style={{ width: 320, height: 250, margin: '0 auto', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                          <SdVideoMockup brandName={brandName} headlineOn={sdCrHeadline} headlineText={sdCrHeadlineText} logoOn={sdCrLogo} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bottom launch */}
          <div className="ccs-bottom-bar">
            <div />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => navigate('/create-campaign')}>Save as draft</button>
              <button className="btn btn-dark" onClick={handleLaunchSD}>Launch campaign</button>
            </div>
          </div>

          </div>{/* end ccs-main */}

          {/* ── FORECAST SIDEBAR ── */}
          <div className="ccs-sidebar">
            <div className="ccs-forecast-card">
              <div className="ccs-forecast-title">
                Forecast <InfoIcon />
                <span className="ccs-beta-badge">Beta</span>
              </div>
              <p className="ccs-forecast-desc">Estimates of performance are based on historical campaigns with similar products, optimisation strategy, bids, targets, and budget.</p>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><Info size={12} /> Learn about forecasts</a>
              <div style={{ marginTop: 14 }}>
                <button className="ccs-filter-btn-sm">Weekly <ChevronDown size={11} /></button>
              </div>
              <div className="ccs-forecast-row"><span>Cost type: {sdGoalCfg.costType}</span></div>
              {sdGoalCfg.forecastMetrics.map(m => (
                <div className="ccs-forecast-metric" key={m}>
                  <span>{m} <InfoIcon /></span>
                  <span>–</span>
                </div>
              ))}
              {sdMissing.length > 0 && (
                <div className="ccs-forecast-hint">
                  <p>To see a forecast:</p>
                  <ul>
                    {sdMissing.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>{/* end ccs-body */}
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="ccs-root">
      {/* ── Top header bar ── */}
      <div className="ccs-topbar">
        <div className="ccs-topbar-left">
          <button className="ccs-topbar-close" onClick={() => navigate(adGroupMode ? `/campaigns/${paramCampaignId}` : '/')}>
            <X size={16} />
          </button>
          <span className="ccs-topbar-title">{adGroupMode ? 'New Ad group' : 'New campaign'}</span>
        </div>
        <div className="ccs-topbar-right">
          <button className="link-btn ccs-back-link" onClick={() => navigate(adGroupMode ? `/campaigns/${paramCampaignId}` : '/create-campaign')}>
            Go back to campaigns
          </button>
          {!adGroupMode && <button className="btn btn-secondary">Save as draft</button>}
          <button className="btn btn-dark" onClick={handleLaunch}>{adGroupMode ? 'Create ad group' : 'Launch campaign'}</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ccs-body">
        {/* ── Main content ── */}
        <div className="ccs-main">

          {/* ══ AD GROUPS ══ */}
          <div className="ccs-section-title">Ad Groups</div>

          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Ad group settings</span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to create an ad group
              </a>
            </div>
            <div className="ccs-card-body">
              <div className="ccs-field">
                <label className="ccs-label">Ad group name <InfoIcon /></label>
                <input className="ccs-input-full" value={adGroupName} onChange={e => setAdGroupName(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ══ PRODUCTS ══ */}
          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Products <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to add products to your campaign
              </a>
            </div>
            <div className="ccs-products-layout">
              {/* Left: search/list */}
              <div className="ccs-products-left">
                <div className="ccs-tab-row">
                  {[['search','Search'],['list','Enter list'],['upload','Upload']].map(([k,l]) => (
                    <button key={k} className={`ccs-tab ${productTab===k?'active':''}`} onClick={() => setProductTab(k)}>{l}</button>
                  ))}
                </div>

                {productTab === 'search' && (
                  <>
                    <div className="ccs-search-row">
                      <div className="ccs-search-wrap">
                        <Search size={14} className="ccs-search-icon" />
                        <input
                          className="ccs-search-input"
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          placeholder="Search by product name, ASIN or SKU"
                        />
                      </div>
                      <button className="ccs-filter-btn">
                        Your Listings <ChevronDown size={13} />
                      </button>
                    </div>
                    <div className="ccs-products-meta">
                      <div className="ccs-show-row">
                        <span>Show:</span>
                        <div style={{ position: 'relative' }}>
                          <button className="ccs-filter-btn-sm" onClick={() => setProductSortOpen(o => !o)}>
                            {productSort === 'newest' ? 'Newest first' : 'Oldest first'} <ChevronDown size={11} />
                          </button>
                          {productSortOpen && (
                            <div className="ccs-sort-dropdown">
                              {[['newest','Newest first'],['oldest','Oldest first']].map(([k,l]) => (
                                <button key={k} className={`ccs-sort-option ${productSort===k?'selected':''}`}
                                  onClick={() => { setProductSort(k); setProductSortOpen(false); }}>{l}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="link-btn ccs-add-all" onClick={() => filteredProducts.forEach(addProduct)}>
                        Add all on this page
                      </button>
                    </div>
                    <div className="ccs-product-list">
                      {filteredProducts.map(p => {
                        const added = !!addedProducts.find(x => x.asin === p.asin);
                        return (
                          <div key={p.asin} className="ccs-product-row">
                            <ProductImage imageType={p.imageType} />
                            <div className="ccs-product-details">
                              <div className="ccs-product-name-link">{p.name}</div>
                              <div className="ccs-product-sub">
                                <Stars rating={p.rating} />
                                <span className="ccs-product-count">({p.reviews})</span>
                                <span className="ccs-product-price-tag">₹{p.price.toLocaleString('en-IN')}</span>
                                <span className={`ccs-stock-badge ${p.status === 'In stock' ? 'in' : 'out'}`}>
                                  {p.status === 'In stock' ? '●' : '○'} {p.status}
                                </span>
                              </div>
                              <div className="ccs-product-asin-row">
                                <span>ASIN: {p.asin}</span>
                                <span style={{ marginLeft: 16 }}>SKU: {p.sku}</span>
                              </div>
                            </div>
                            <button
                              className={`ccs-add-btn ${added ? 'added' : ''}`}
                              onClick={() => !added && addProduct(p)}
                              disabled={added}
                            >
                              {added ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                      <div className="ccs-pagination">
                        <span>1-{filteredProducts.length} of {filteredProducts.length} results</span>
                        <div className="ccs-page-btns">
                          <button className="ccs-page-btn" disabled>‹</button>
                          <button className="ccs-page-btn" disabled>›</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {productTab === 'list' && (
                  <div className="ccs-list-tab">
                    <p className="ccs-list-desc">Enter a list of ASINs or SKUs, one per line or separated by commas.</p>
                    <textarea
                      className="ccs-textarea"
                      rows={8}
                      value={asinListText}
                      onChange={e => setAsinListText(e.target.value)}
                      placeholder={"B0CF244HDV\nB0CF24MSGB\nB0CF277SZN"}
                    />
                    <div className="ccs-list-actions">
                      <button className="btn btn-secondary" onClick={handleAddFromList}>Add to list</button>
                      <span className="ccs-list-hint">
                        {asinListText ? `${asinListText.split(/[\n,\s]+/).filter(Boolean).length} ASIN(s) entered` : ''}
                      </span>
                    </div>
                    {asinListText && (
                      <div className="ccs-asin-chips">
                        {asinListText.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean).map(asin => {
                          const validFmt = PROD_ASIN_RE.test(asin);
                          const found = validFmt && allProducts.find(p => p.asin === asin);
                          const chipClass = !validFmt ? 'invalid' : found ? 'valid' : 'invalid';
                          return (
                            <div key={asin} className={`ccs-asin-chip ${chipClass}`}>
                              {asin}
                              {!validFmt && <span className="ccs-chip-err"> — invalid ASIN format</span>}
                              {validFmt && found && <span className="ccs-chip-name"> — {found.name.slice(0,28)}…</span>}
                              {validFmt && !found && <span className="ccs-chip-err"> — not in your listings</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {productTab === 'upload' && (
                  <div className="ccs-upload-tab">
                    <p className="ccs-list-desc">Use the template to make sure your information uploads accurately.</p>
                    <button className="ccs-csv-template-btn" onClick={downloadTemplate}>
                      <span className="ccs-csv-icon">⬇</span> Download the CSV template
                    </button>

                    {/* Drag-and-drop zone */}
                    <label
                      className={`ccs-drop-zone ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFileInput(e.dataTransfer.files[0]); }}
                    >
                      <input
                        type="file"
                        accept=".csv,.tsv,.xlsx,.txt"
                        style={{ display: 'none' }}
                        onChange={e => handleFileInput(e.target.files[0])}
                      />
                      <div className="ccs-drop-icon">⬆</div>
                      <div className="ccs-drop-text">Drag and drop file to add</div>
                      <div className="ccs-drop-sub">or click to select from your computer</div>
                      <div className="ccs-drop-formats">Accepted formats: CSV, TSV, XLSX</div>
                    </label>

                    {/* Validation results after upload */}
                    {uploadState && (
                      <div className="ccs-upload-results">
                        <div className="ccs-upload-results-header">
                          <span className="ccs-upload-filename">📄 {uploadState.fileName}</span>
                          <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setUploadState(null)}>Clear</button>
                        </div>
                        <div className="ccs-upload-summary">
                          <span className="ccs-upload-stat found">✓ {uploadState.results.filter(r => r.found).length} products added</span>
                          {uploadState.results.filter(r => !r.found).length > 0 && (
                            <span className="ccs-upload-stat notfound">✗ {uploadState.results.filter(r => !r.found).length} not in your listings (skipped)</span>
                          )}
                        </div>
                        <div className="ccs-upload-rows">
                          {uploadState.results.map(r => (
                            <div key={r.asin} className={`ccs-upload-row ${r.found ? 'valid' : 'invalid'}`}>
                              <span className="ccs-upload-check">{r.found ? '✓' : '✗'}</span>
                              <span className="ccs-upload-asin">{r.asin}</span>
                              {r.found && <span className="ccs-upload-pname">{r.product.name.slice(0, 45)}…</span>}
                              {!r.found && <span className="ccs-upload-err">{!r.validFormat ? 'Invalid ASIN format' : 'Not in your listings'} — skipped</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: added products panel */}
              <div className="ccs-products-right">
                <div className="ccs-added-header">
                  <strong>{addedProducts.length} products</strong>
                  {addedProducts.length > 0 && (
                    <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedProducts([])}>Remove all</button>
                  )}
                </div>
                {addedProducts.length === 0 ? (
                  <div className="ccs-added-empty">Add products</div>
                ) : (
                  <div className="ccs-added-list">
                    {addedProducts.map(p => (
                      <div key={p.asin} className="ccs-added-item">
                        <ProductImage imageType={p.imageType} size={36} />
                        <div className="ccs-added-info">
                          <div className="ccs-added-name">{p.name.slice(0,50)}…</div>
                          <div className="ccs-added-asin">ASIN: {p.asin}</div>
                        </div>
                        <button className="ccs-remove-btn" onClick={() => removeProduct(p.asin)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ TARGETING ══ */}
          {!adGroupMode && (
          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Targeting <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> Choose automatic or manual targeting
              </a>
            </div>
            <div className="ccs-card-body">
              {[
                { key: 'Auto', label: 'Automatic targeting', desc: 'Amazon will target keywords and products that are similar to the product in your ad.' },
                { key: 'Manual', label: 'Manual targeting', desc: 'Choose keywords or products to target shopper searches and set custom bids.' },
              ].map(opt => (
                <label key={opt.key} className="ccs-radio-row">
                  <input type="radio" name="targeting" checked={targetingType === opt.key} onChange={() => setTargetingType(opt.key)} />
                  <div>
                    <div className="ccs-radio-label">{opt.label}</div>
                    <div className="ccs-radio-desc">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          )}

          {/* ══ AUTO TARGETING ══ */}
          {effectiveTargetingType === 'Auto' && (
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Automatic Targeting <InfoIcon /></span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                  <Info size={12} /> How to set bid pricing
                </a>
              </div>
              <div className="ccs-card-body">
                <label className="ccs-radio-row">
                  <input type="radio" name="autoBid" checked={autoBidMode === 'default'} onChange={() => setAutoBidMode('default')} />
                  <div>
                    <div className="ccs-radio-label">Set default bid <InfoIcon /></div>
                    {autoBidMode === 'default' && (
                      <div className="ccs-auto-default-bid">
                        <div className="ccs-sugg-bid-row">
                          <button className="ccs-filter-btn-sm">Suggested bid for regular days <ChevronDown size={11} /></button>
                          <span className="ccs-sugg-val">-</span>
                        </div>
                        <div className="ccs-bid-field-row">
                          <span className="ccs-bid-label">Default bid</span>
                          <div className="ccs-bid-input-wrap">
                            <span className="ccs-bid-prefix">₹</span>
                            <input
                              type="number"
                              className="ccs-bid-input"
                              value={defaultBid}
                              onChange={e => { const v = parseFloat(e.target.value); setDefaultBid(v < 0 ? '0' : e.target.value); }}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <label className="ccs-radio-row" style={{ marginTop: 10 }}>
                  <input type="radio" name="autoBid" checked={autoBidMode === 'groups'} onChange={() => setAutoBidMode('groups')} />
                  <div style={{ width: '100%' }}>
                    <div className="ccs-radio-label">Set bids by targeting group <InfoIcon /></div>
                    {autoBidMode === 'groups' && (
                      <div className="ccs-targeting-groups-table">
                        <div className="ccs-tg-header">
                          <span className="ccs-tg-col-group">TARGETING GROUPS <InfoIcon /></span>
                          <span className="ccs-tg-col-sugg">
                            <button className="ccs-filter-btn-sm">Suggested bid for regular days <ChevronDown size={11} /></button>
                          </span>
                          <span className="ccs-tg-col-bid">BID <InfoIcon /></span>
                        </div>
                        {autoGroups.map(g => (
                          <div key={g.key} className="ccs-tg-row">
                            <div className="ccs-tg-col-group">
                              <Toggle on={g.on} onChange={v => updateGroup(g.key, 'on', v)} />
                              <span>{g.label}</span>
                              <InfoIcon />
                            </div>
                            <div className="ccs-tg-col-sugg">
                              {g.on && addedProducts.length > 0 ? (
                                <div className="ccs-tg-sugg-block">
                                  <button
                                    className="ccs-tg-sugg-price"
                                    onClick={() => updateGroup(g.key, 'bid', g.sugg.toFixed(2))}
                                    title="Click to apply this bid"
                                  >
                                    ₹{g.sugg.toFixed(2)}
                                  </button>
                                  <span className="ccs-tg-sugg-range">(₹{g.suggMin.toFixed(2)}-₹{g.suggMax.toFixed(2)})</span>
                                </div>
                              ) : (
                                <span className="ccs-tg-sugg-blank">–</span>
                              )}
                            </div>
                            <div className="ccs-tg-col-bid">
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input
                                  type="number"
                                  className="ccs-bid-input"
                                  value={g.bid}
                                  onChange={e => { const v = parseFloat(e.target.value); updateGroup(g.key, 'bid', v < 0 ? '0' : e.target.value); }}
                                  min="0"
                                  step="0.01"
                                  disabled={!g.on}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ══ MANUAL TARGETING SUBTYPE ══ */}
          {effectiveTargetingType === 'Manual' && (
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Manual Targeting <InfoIcon /></span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                  <Info size={12} /> Choose keyword or product targeting
                </a>
              </div>
              <div className="ccs-card-body">
                <label className="ccs-radio-row">
                  <input type="radio" name="manualTarget" checked={manualTargetType === 'keyword'} onChange={() => setManualTargetType('keyword')} />
                  <div>
                    <div className="ccs-radio-label">Keyword targeting <InfoIcon /></div>
                    <div className="ccs-radio-desc">Choose keywords to help your products appear in shopper searches.</div>
                  </div>
                </label>
                <label className="ccs-radio-row" style={{ marginTop: 10 }}>
                  <input type="radio" name="manualTarget" checked={manualTargetType === 'product'} onChange={() => setManualTargetType('product')} />
                  <div>
                    <div className="ccs-radio-label">Product targeting <InfoIcon /></div>
                    <div className="ccs-radio-desc">Choose specific products, categories, brands or other product features to target your ads.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ══ KEYWORD TARGETING ══ */}
          {effectiveTargetingType === 'Manual' && manualTargetType === 'keyword' && (
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Keyword targeting <InfoIcon /></span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                  <Info size={12} /> How to add keywords
                </a>
              </div>
              <div className="ccs-kw-layout">
                {/* ── Left panel ── */}
                <div className="ccs-kw-left">
                  <div className="ccs-tab-row">
                    {[['suggested','Suggested'],['enter-list','Enter list'],['upload','Upload file']].map(([k, l]) => (
                      <button key={k} className={`ccs-tab ${kwSugTab === k ? 'active' : ''}`} onClick={() => setKwSugTab(k)}>{l}</button>
                    ))}
                  </div>

                  {/* SUGGESTED TAB */}
                  {kwSugTab === 'suggested' && (
                    <div className="ccs-kw-suggested-wrap">
                      <div className="ccs-kw-filters">
                        <div className="ccs-kw-filter-row">
                          <span className="ccs-kw-filter-label">Bid <InfoIcon /></span>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="ccs-filter-btn-sm" onClick={() => setKwBidDropOpen(o => !o)}>
                              {kwBidMode === 'suggested' ? 'Suggested bid' : kwBidMode === 'custom' ? 'Custom bid' : 'Default bid'} <ChevronDown size={11} />
                            </button>
                            {kwBidDropOpen && (
                              <div className="ccs-bid-mode-dropdown">
                                {[
                                  { key: 'suggested', title: 'Suggested bid', desc: 'Based on past bidding activity to predict bids that are more likely to win' },
                                  { key: 'custom',    title: 'Custom bid',    desc: 'Can custom bids for each keyword without overriding your set bid amount' },
                                  { key: 'default',   title: 'Default bid',   desc: 'Can raise or lower all your set amounts in bulk' },
                                ].map(opt => (
                                  <button key={opt.key} className={`ccs-bid-mode-option ${kwBidMode === opt.key ? 'selected' : ''}`}
                                    onClick={() => { setKwBidMode(opt.key); setKwBidDropOpen(false); }}>
                                    <strong>{opt.title}</strong>
                                    <span>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {(kwBidMode === 'custom' || kwBidMode === 'default') && (
                              <div>
                                <div className="ccs-bid-input-wrap">
                                  <span className="ccs-bid-prefix">₹</span>
                                  <input type="number" className="ccs-bid-input" value={kwCustomBid}
                                    onChange={e => { const v = parseFloat(e.target.value); setKwCustomBid(v < 0 ? '0' : e.target.value); setKwBidWarn(false); }}
                                    onBlur={e => setKwBidWarn(e.target.value !== '' && parseFloat(e.target.value) < 0.01)}
                                    min="0" style={{ width: 80 }} />
                                </div>
                                {kwBidWarn && <div style={{ fontSize: 11, color: '#c40000', marginTop: 3 }}>Minimum bid is ₹0.01</div>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ccs-kw-filter-row">
                          <span className="ccs-kw-filter-label">Filter by <InfoIcon /></span>
                          <div className="ccs-kw-filter-checks">
                            {['broad', 'phrase', 'exact'].map(m => (
                              <label key={m} className="ccs-kw-check">
                                <input type="checkbox" checked={kwFilters[m]} onChange={e => setKwFilters(f => ({ ...f, [m]: e.target.checked }))} />
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="ccs-kw-filter-row">
                          <span className="ccs-kw-filter-label">Sort By <InfoIcon /></span>
                          <div style={{ position: 'relative' }}>
                            <button className="ccs-filter-btn-sm" onClick={() => setKwSortOpen(o => !o)}>
                              {kwSortBy === 'orders' ? 'Orders' : 'Clicks'} <ChevronDown size={11} />
                            </button>
                            {kwSortOpen && (
                              <div className="ccs-sort-dropdown">
                                {[['orders','Orders'],['clicks','Clicks']].map(([k,l]) => (
                                  <button key={k} className={`ccs-sort-option ${kwSortBy===k?'selected':''}`}
                                    onClick={() => { setKwSortBy(k); setKwSortOpen(false); }}>{l}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Keyword groups */}
                      <div className="ccs-kw-group-section">
                        <div className="ccs-kw-group-header">
                          <span>Keyword groups <InfoIcon /> <span className="ccs-beta-badge">Beta</span></span>
                          <span className="ccs-kw-col-sugg-hd">Sugg. bid <InfoIcon /><br/><span style={{ fontSize: 11, color: '#888' }}>Regular days</span></span>
                          <button className="link-btn ccs-kw-add-all" onClick={addKwGroup}>Add All</button>
                        </div>
                        <div className="ccs-kw-group-row">
                          <span>Keywords related to your product category <InfoIcon /></span>
                          <span className="ccs-kw-group-sugg">
                            {kwBidMode === 'suggested'
                              ? `₹${KW_GROUP.suggBid.toFixed(2)}`
                              : `₹${KW_GROUP.suggMin.toFixed(2)} - ₹${KW_GROUP.suggMax.toFixed(2)}`}
                          </span>
                          {kwGroupAdded
                            ? <span className="ccs-kw-added-text">Added</span>
                            : <button className="link-btn ccs-kw-add-link" onClick={addKwGroup}>Add</button>
                          }
                        </div>
                      </div>

                      {/* Individual keyword rows */}
                      <div className="ccs-kw-sugg-table">
                        <div className="ccs-kw-sugg-hdr">
                          <span>Keyword<br/><span className="ccs-kw-is-ir">IS | IR <TipIcon tip={TIP_IS_IR} /></span></span>
                          <span>Match type <TipIcon tip={TIP_MATCH_TYPE} /></span>
                          <span>Sugg. bid <TipIcon tip={TIP_SUGG_BID} /><br/><span style={{ fontSize: 11, color: '#888' }}>Regular days</span></span>
                          <button className="link-btn ccs-kw-add-all" onClick={addAllSuggKws}>Add All</button>
                        </div>
                        {SUGGESTED_KWS.map(s => {
                          const matches = ['broad', 'phrase', 'exact'].filter(m => kwFilters[m]);
                          return (
                            <div key={s.kw} className="ccs-kw-sugg-kw-block">
                              <div className="ccs-kw-sugg-kw-name">
                                {s.kw}
                                <span className="ccs-kw-is-ir-sub">IS: {s.is || 0}{s.ir ? ` | IR: ${s.ir}` : ''}</span>
                              </div>
                              {matches.map(m => {
                                const mt = m.charAt(0).toUpperCase() + m.slice(1);
                                const kd = s[m];
                                const isAdded = !!addedKws.find(k => k.type !== 'group' && k.keyword === s.kw && k.matchType === mt);
                                return (
                                  <div key={m} className="ccs-kw-sugg-match-row">
                                    <span />
                                    <span className={`match-badge match-${m}`}>{mt}</span>
                                    <span className="ccs-kw-sugg-bid">
                                      {kwBidMode === 'suggested'
                                        ? `₹${kd.sugg.toFixed(2)}`
                                        : `₹${kd.min.toFixed(2)} - ₹${kd.max.toFixed(2)}`}
                                    </span>
                                    {isAdded
                                      ? <span className="ccs-kw-added-text">Added</span>
                                      : <button className="link-btn ccs-kw-add-link" onClick={() => addKwFromSugg(s.kw, mt, kd)}>Add</button>
                                    }
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ENTER LIST TAB */}
                  {kwSugTab === 'enter-list' && (
                    <div className="ccs-kw-enter-wrap">
                      <div className="ccs-kw-filters">
                        <div className="ccs-kw-filter-row">
                          <span className="ccs-kw-filter-label">Bid <InfoIcon /></span>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="ccs-filter-btn-sm" onClick={() => setKwBidDropOpen(o => !o)}>
                              {kwBidMode === 'suggested' ? 'Suggested bid' : kwBidMode === 'custom' ? 'Custom bid' : 'Default bid'} <ChevronDown size={11} />
                            </button>
                            {kwBidDropOpen && (
                              <div className="ccs-bid-mode-dropdown">
                                {[
                                  { key: 'suggested', title: 'Suggested bid', desc: 'Based on past bidding activity to predict bids that are more likely to win' },
                                  { key: 'custom',    title: 'Custom bid',    desc: 'Can custom bids for each keyword without overriding your set bid amount' },
                                  { key: 'default',   title: 'Default bid',   desc: 'Can raise or lower all your set amounts in bulk' },
                                ].map(opt => (
                                  <button key={opt.key} className={`ccs-bid-mode-option ${kwBidMode === opt.key ? 'selected' : ''}`}
                                    onClick={() => { setKwBidMode(opt.key); setKwBidDropOpen(false); }}>
                                    <strong>{opt.title}</strong>
                                    <span>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {(kwBidMode === 'custom' || kwBidMode === 'default') && (
                              <div>
                                <div className="ccs-bid-input-wrap">
                                  <span className="ccs-bid-prefix">₹</span>
                                  <input type="number" className="ccs-bid-input" value={kwCustomBid}
                                    onChange={e => { const v = parseFloat(e.target.value); setKwCustomBid(v < 0 ? '0' : e.target.value); setKwBidWarn(false); }}
                                    onBlur={e => setKwBidWarn(e.target.value !== '' && parseFloat(e.target.value) < 0.01)}
                                    min="0" style={{ width: 80 }} />
                                </div>
                                {kwBidWarn && <div style={{ fontSize: 11, color: '#c40000', marginTop: 3 }}>Minimum bid is ₹0.01</div>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ccs-kw-filter-row">
                          <span className="ccs-kw-filter-label">Match type <InfoIcon /></span>
                          <div className="ccs-kw-filter-checks">
                            {['broad', 'phrase', 'exact'].map(m => (
                              <label key={m} className="ccs-kw-check">
                                <input type="checkbox" checked={kwFilters[m]} onChange={e => setKwFilters(f => ({ ...f, [m]: e.target.checked }))} />
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <textarea
                        className="ccs-textarea ccs-kw-textarea"
                        rows={11}
                        value={kwText}
                        onChange={e => setKwText(e.target.value)}
                        placeholder="Enter keywords separated by new line."
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                        {kwEnterListErrors.length > 0 ? (
                          <span style={{ fontSize: 13, color: '#c40000' }}>
                            ❗ {kwEnterListErrors.length}/{kwEnterListErrors.length} keyword{kwEnterListErrors.length > 1 ? 's' : ''} weren't added.{' '}
                            <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }} onClick={() => downloadErrorReport(kwEnterListErrors, 'keyword-errors.csv')}>Download report</button>
                          </span>
                        ) : <span />}
                        <button className="btn btn-secondary" disabled={!kwText.trim()} onClick={() => { setKwEnterListErrors([]); addKwsFromText(); }}>
                          Add keywords
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UPLOAD FILE TAB */}
                  {kwSugTab === 'upload' && (
                    <div className="ccs-kw-upload-wrap">
                      <p style={{ fontSize: 13, color: '#333', margin: '12px 14px 8px' }}>
                        Use the CSV template to make sure your information uploads accurately.
                      </p>
                      <div style={{ margin: '0 14px 12px' }}>
                        <button className="ccs-dl-template-btn" onClick={() => {
                          const csv = 'Keyword,Match type,Bid\n,,\n';
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = 'keyword_template.csv';
                          a.click();
                        }}>
                          ⬇ Download the XLSX template
                        </button>
                      </div>
                      <div
                        className={`ccs-upload-zone ${kwDragOver ? 'drag-over' : ''}`}
                        style={{ margin: '0 14px 14px' }}
                        onDragOver={e => { e.preventDefault(); setKwDragOver(true); }}
                        onDragLeave={() => setKwDragOver(false)}
                        onDrop={e => { e.preventDefault(); setKwDragOver(false); }}
                        onClick={() => {
                          const inp = document.createElement('input');
                          inp.type = 'file';
                          inp.accept = '.csv,.tsv,.xlsx';
                          inp.onchange = () => {};
                          inp.click();
                        }}
                      >
                        <div className="ccs-upload-arrow">↑</div>
                        <div style={{ fontWeight: 500 }}>Drag and drop the file to add</div>
                        <div style={{ color: '#555', fontSize: 13 }}>or choose a file from your computer.</div>
                        <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>Accepted formats: CSV, TSV, XLSX</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right panel ── */}
                <div className="ccs-kw-right">
                  <div className="ccs-added-header">
                    <strong>{addedKws.length} added</strong>
                    {addedKws.length > 0 && <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedKws([])}>Remove all</button>}
                  </div>
                  <div className="ccs-kw-right-head">
                    <span>Keyword<br/><span className="ccs-kw-is-ir">IS | IR <TipIcon tip={TIP_IS_IR} /></span></span>
                    <span>Match type <TipIcon tip={TIP_MATCH_TYPE} /></span>
                    <span>Sugg. bid <TipIcon tip={TIP_SUGG_BID} /><br/>
                      <button className="link-btn" style={{ fontSize: 11 }}
                        onClick={() => setAddedKws(p => p.map(k => ({ ...k, bid: k.suggBid ? k.suggBid.toFixed(2) : k.bid })))}>
                        Apply all
                      </button>
                    </span>
                    <span>Bid <TipIcon tip={TIP_BID} /></span>
                  </div>
                  {addedKws.length === 0 ? (
                    <div className="ccs-kw-right-empty">No keywords added yet</div>
                  ) : (
                    addedKws.map((k, i) => (
                      <div key={i} className="ccs-kw-right-row">
                        <div>
                          <div style={{ fontSize: 13 }}>{k.type === 'group' ? k.name : k.keyword}</div>
                          {k.type === 'group' && <div style={{ fontSize: 11, color: '#888' }}>Keyword group</div>}
                        </div>
                        <div>
                          {k.matchType
                            ? <span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span>
                            : <span style={{ color: '#888' }}>-</span>
                          }
                        </div>
                        <div style={{ fontSize: 12 }}>
                          {k.suggBid != null ? (
                            <>
                              <button className="link-btn" style={{ color: '#0066c0', fontWeight: 500, fontSize: 13 }}
                                onClick={() => setAddedKws(p => p.map((x, j) => j === i ? { ...x, bid: x.suggBid.toFixed(2) } : x))}>
                                ₹{k.suggBid.toFixed(2)}
                              </button>
                              {k.suggMin != null && <><br/><span style={{ color: '#888' }}>₹{k.suggMin.toFixed(2)} - ₹{k.suggMax.toFixed(2)}</span></>}
                            </>
                          ) : <span style={{ color: '#aaa' }}>–</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div className="ccs-bid-input-wrap">
                              <span className="ccs-bid-prefix">₹</span>
                              <input type="number" className="ccs-bid-input" value={k.bid}
                                onChange={e => { const v = parseFloat(e.target.value); setAddedKws(p => p.map((x, j) => j === i ? { ...x, bid: v < 0 ? '0' : e.target.value } : x)); }}
                                min="0" style={{ width: 65 }} />
                            </div>
                            <button className="ccs-remove-btn" onClick={() => setAddedKws(p => p.filter((_, j) => j !== i))}>×</button>
                          </div>
                          {k.isDefaultBid && <span style={{ fontSize: 11, color: '#888' }}>Default bid</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ PRODUCT TARGETING ══ */}
          {effectiveTargetingType === 'Manual' && manualTargetType === 'product' && (
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Product Targeting <InfoIcon /></span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                  <Info size={12} /> How to use product targeting
                </a>
              </div>
              <div className="ccs-kw-layout">
                {/* ── Left panel ── */}
                <div className="ccs-kw-left" style={{ position: 'relative' }}>
                  {/* Main tabs */}
                  <div className="ccs-pt-main-tabs">
                    {[['categories','Categories'],['individual','Individual Products']].map(([k, l]) => (
                      <button key={k} className={`ccs-pt-main-tab ${ptMainTab === k ? 'active' : ''}`}
                        onClick={() => setPtMainTab(k)}>
                        {l} <InfoIcon />
                      </button>
                    ))}
                  </div>

                  {ptMainTab === 'categories' && (
                    <>
                      <div className="ccs-tab-row" style={{ padding: '0 0', borderBottom: 'none' }}>
                        {[['suggested','Suggested'],['search','Search']].map(([k, l]) => (
                          <button key={k} className={`ccs-tab ${ptCatTab === k ? 'active' : ''}`} onClick={() => setPtCatTab(k)}>
                            {l}{k === 'suggested' && <> <InfoIcon /></>}
                          </button>
                        ))}
                      </div>

                      <div className="ccs-kw-filters">
                        <div className="ccs-kw-filter-row" style={{ flexWrap: 'wrap', gap: 8 }}>
                          <span className="ccs-kw-filter-label">Bid <InfoIcon /></span>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="ccs-filter-btn-sm"
                              onClick={() => setPtBidDropOpen(o => !o)}>
                              {ptBidMode === 'suggested' ? 'Suggested bid' : ptBidMode === 'custom' ? 'Custom bid' : 'Default bid'} <ChevronDown size={11} />
                            </button>
                            {ptBidDropOpen && (
                              <div className="ccs-bid-mode-dropdown">
                                {[
                                  { k: 'suggested', label: 'Suggested bid', desc: 'Amazon sets the bid based on the likelihood to win the auction.' },
                                  { k: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added targets.' },
                                  { k: 'default', label: 'Default bid', desc: 'Use the campaign default bid for all targets.' },
                                ].map(opt => (
                                  <button key={opt.k}
                                    className={`ccs-bid-mode-option ${ptBidMode === opt.k ? 'selected' : ''}`}
                                    onClick={() => { setPtBidMode(opt.k); setPtBidDropOpen(false); }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</span>
                                    <span style={{ fontSize: 12, color: '#666' }}>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {(ptBidMode === 'custom' || ptBidMode === 'default') && (
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={ptCustomBid}
                                  onChange={e => { const v = parseFloat(e.target.value); setPtCustomBid(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 70 }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {ptCatTab === 'suggested' && (
                        addedProducts.length === 0 ? (
                          <div style={{ padding: '24px 16px', color: '#888', fontSize: 13, textAlign: 'center' }}>
                            Add at least one product above to see suggested categories.
                          </div>
                        ) : (
                          <div>
                            <div className="ccs-pt-sugg-hdr">
                              <span>{SUGGESTED_CATS.length} suggestions</span>
                              <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Sugg. bid <InfoIcon /></span>
                              <button className="link-btn ccs-kw-add-all" onClick={() => SUGGESTED_CATS.forEach(c => addProdTarget(c))}>Add all</button>
                            </div>
                            {SUGGESTED_CATS.map(cat => {
                              const isAdded = !!addedProdTargets.find(t => t.id === cat.id);
                              return (
                                <div key={cat.id} className="ccs-pt-sugg-row">
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, color: '#555', marginBottom: 2, wordBreak: 'break-word' }}>{cat.path}</div>
                                    <div style={{ fontSize: 13 }}><strong>Category:</strong> {cat.name}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Products: {cat.prodMin}-{cat.prodMax}</div>
                                  </div>
                                  <span style={{ color: '#888', fontSize: 13, minWidth: 30 }}>-</span>
                                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    {isAdded
                                      ? <span className="ccs-kw-added-text">Added</span>
                                      : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget(cat)}>Add</button>
                                    }
                                    <button className="link-btn ccs-kw-add-link" onClick={() => { setRefineTarget(cat); setRefineBrand([]); setRefinePriceMin(''); setRefinePriceMax(''); setRefineStarsMin(0); setRefineStarsMax(5); setRefineShipping('all'); }}>Refine</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}

                      {ptCatTab === 'search' && (
                        <div>
                          <div style={{ padding: '10px 14px' }}>
                            <div className="ccs-pt-cat-search-wrap">
                              <Search size={13} color="#888" />
                              <input type="text" className="ccs-pt-cat-search-inp" placeholder="Search by category name"
                                value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                            </div>
                          </div>
                          <div className="ccs-cat-table-hdr">
                            <span>All categories</span>
                            <span>Sugg. bid <InfoIcon /></span>
                          </div>
                          <div className="ccs-cat-list">
                            {ALL_CATEGORIES.map(cat => (
                              <CatRow key={cat.id} cat={cat} depth={0}
                                expandedCats={expandedCats} setExpandedCats={setExpandedCats}
                                addedProdTargets={addedProdTargets} addProdTarget={addProdTarget}
                                setRefineTarget={(cat) => { setRefineTarget(cat); setRefineBrand([]); setRefinePriceMin(''); setRefinePriceMax(''); setRefineStarsMin(0); setRefineStarsMax(5); setRefineShipping('all'); }}
                                catSearch={catSearch} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {ptMainTab === 'individual' && (
                    <>
                      {/* Sub-tabs: Suggested | Search | Enter list | Upload */}
                      <div className="ccs-tab-row" style={{ padding: '0', borderBottom: 'none' }}>
                        {[['suggested','Suggested'],['search','Search'],['enter-list','Enter list'],['upload','Upload']].map(([k, l]) => (
                          <button key={k} className={`ccs-tab ${ptIndivSubTab === k ? 'active' : ''}`} onClick={() => setPtIndivSubTab(k)}>
                            {l}{(k === 'suggested' || k === 'search') && <> <InfoIcon /></>}
                          </button>
                        ))}
                      </div>

                      {/* Bid dropdown — shown on all tabs */}
                      <div className="ccs-kw-filters" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div className="ccs-kw-filter-row" style={{ flexWrap: 'wrap', gap: 8 }}>
                          <span className="ccs-kw-filter-label">Bid <InfoIcon /></span>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="ccs-filter-btn-sm"
                              onClick={() => setPtBidDropOpen(o => !o)}>
                              {ptBidMode === 'suggested' ? 'Suggested bid' : ptBidMode === 'custom' ? 'Custom bid' : 'Default bid'} <ChevronDown size={11} />
                            </button>
                            {ptBidDropOpen && (
                              <div className="ccs-bid-mode-dropdown">
                                {[
                                  { k: 'suggested', label: 'Suggested bid', desc: 'Amazon sets the bid based on the likelihood to win the auction.' },
                                  { k: 'custom', label: 'Custom bid', desc: 'Set a custom bid for all newly added targets.' },
                                  { k: 'default', label: 'Default bid', desc: 'Use the campaign default bid for all targets.' },
                                ].map(opt => (
                                  <button key={opt.k}
                                    className={`ccs-bid-mode-option ${ptBidMode === opt.k ? 'selected' : ''}`}
                                    onClick={() => { setPtBidMode(opt.k); setPtBidDropOpen(false); }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{opt.label}</span>
                                    <span style={{ fontSize: 12, color: '#666' }}>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {(ptBidMode === 'custom' || ptBidMode === 'default') && (
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={ptCustomBid}
                                  onChange={e => { const v = parseFloat(e.target.value); setPtCustomBid(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 70 }} />
                              </div>
                            )}
                          </div>
                        </div>
                        {ptIndivSubTab !== 'upload' && (
                          <div className="ccs-kw-filter-row">
                            <span className="ccs-kw-filter-label" style={{ fontWeight: 700 }}>Filter by <InfoIcon /></span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer' }}>
                              <input type="checkbox" checked={ptIndivFilterExact} onChange={e => setPtIndivFilterExact(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#0073bb' }} />
                              Exact
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer', marginLeft: 8 }}>
                              <input type="checkbox" checked={ptIndivFilterExpanded} onChange={e => setPtIndivFilterExpanded(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#0073bb' }} />
                              Expanded
                            </label>
                          </div>
                        )}
                      </div>

                      {/* SUGGESTED */}
                      {ptIndivSubTab === 'suggested' && (
                        addedProducts.length === 0 ? (
                          <div style={{ padding: '24px 16px', color: '#888', fontSize: 13, textAlign: 'center' }}>Add at least one product above to see suggestions.</div>
                        ) : (
                          <div>
                            <div className="ccs-indiv-list-hdr">
                              <span>{INDIV_SUGGESTED.length} products</span>
                              <span>Sugg. bid <InfoIcon /></span>
                              <span>Type <InfoIcon /></span>
                              <button className="link-btn" style={{ fontSize: 12 }} onClick={() => {
                                INDIV_SUGGESTED.forEach(p => {
                                  if (ptIndivFilterExact) addProdTarget({ id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, prodMin: 1, prodMax: 1, brands: [], bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact' });
                                  if (ptIndivFilterExpanded) addProdTarget({ id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: null, prodMin: 1, prodMax: 1, brands: [], bid: '3.00', type: 'Expanded' });
                                });
                              }}>Add all</button>
                            </div>
                            <div className="ccs-indiv-list">
                              {INDIV_SUGGESTED.map(p => (
                                <div key={p.id} className="ccs-indiv-product-block">
                                  {/* Product info row */}
                                  <div className="ccs-indiv-product-info">
                                    <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8' }}>
                                      {getIndivImage(p)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, color: '#0073bb', fontWeight: 500, marginBottom: 2, cursor: 'pointer', lineHeight: 1.4 }}>{p.name.length > 80 ? p.name.slice(0, 80) + '…' : p.name}</div>
                                      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{p.format}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                        {renderStars(p.stars)}
                                        <span style={{ fontSize: 12, color: '#0073bb' }}>({p.reviews.toLocaleString('en-IN')})</span>
                                      </div>
                                      {p.originalPrice && <div style={{ fontSize: 12 }}><s style={{ color: '#888' }}>₹{p.originalPrice.toLocaleString('en-IN')}</s> <span style={{ color: '#b12704', fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</span></div>}
                                      <div style={{ fontSize: 12, color: p.status === 'In stock' ? '#007600' : '#c40000', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'In stock' ? '#007600' : '#c40000', flexShrink: 0, display: 'inline-block' }} />
                                        {p.status}
                                      </div>
                                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>ASIN: {p.asin}</div>
                                    </div>
                                  </div>
                                  {/* Type rows */}
                                  {ptIndivFilterExact && (
                                    <div className="ccs-indiv-type-row">
                                      <span />
                                      <span style={{ fontSize: 13, color: '#555' }}>{p.sugg ? `₹${p.sugg.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Exact</span>
                                      <div>
                                        {addedProdTargets.find(t => t.id === `indiv-${p.id}-exact`)
                                          ? <span className="ccs-kw-added-text">Added</span>
                                          : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, prodMin: 1, prodMax: 1, brands: [], bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact' })}>Add</button>
                                        }
                                      </div>
                                    </div>
                                  )}
                                  {ptIndivFilterExpanded && (
                                    <div className="ccs-indiv-type-row">
                                      <span />
                                      <span style={{ fontSize: 13, color: '#555' }}>{p.suggExpanded ? `₹${p.suggExpanded.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Expanded</span>
                                      <div>
                                        {addedProdTargets.find(t => t.id === `indiv-${p.id}-expanded`)
                                          ? <span className="ccs-kw-added-text">Added</span>
                                          : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, prodMin: 1, prodMax: 1, brands: [], bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded' })}>Add</button>
                                        }
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}

                      {/* SEARCH */}
                      {ptIndivSubTab === 'search' && (
                        <div style={{ padding: '14px 14px' }}>
                          <div className="ccs-pt-cat-search-wrap" style={{ marginBottom: 12, maxWidth: 420 }}>
                            <Search size={13} color="#888" />
                            <input type="text" className="ccs-pt-cat-search-inp" placeholder="Search by product name or ASIN"
                              value={ptIndivSearch} onChange={e => setPtIndivSearch(e.target.value)} />
                          </div>
                          {!ptIndivSearch && <div style={{ padding: '20px 0', color: '#666', fontSize: 13, textAlign: 'center' }}>Search for products you want to target.</div>}
                          {ptIndivSearch && (
                            <div className="ccs-indiv-list">
                              {INDIV_SUGGESTED.filter(p => p.name.toLowerCase().includes(ptIndivSearch.toLowerCase()) || p.asin.toLowerCase().includes(ptIndivSearch.toLowerCase())).map(p => (
                                <div key={p.id} className="ccs-indiv-product-block">
                                  <div className="ccs-indiv-product-info">
                                    <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '1px solid #e8e8e8' }}>{getIndivImage(p)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, color: '#0073bb', fontWeight: 500, marginBottom: 2, lineHeight: 1.4 }}>{p.name.length > 80 ? p.name.slice(0, 80) + '…' : p.name}</div>
                                      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{p.format}</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>{renderStars(p.stars)}<span style={{ fontSize: 12, color: '#0073bb' }}>({p.reviews.toLocaleString('en-IN')})</span></div>
                                      <div style={{ fontSize: 12 }}><s style={{ color: '#888' }}>₹{p.originalPrice?.toLocaleString('en-IN')}</s> <span style={{ color: '#b12704', fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</span></div>
                                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>ASIN: {p.asin}</div>
                                    </div>
                                  </div>
                                  {ptIndivFilterExact && (
                                    <div className="ccs-indiv-type-row">
                                      <span /><span style={{ fontSize: 13, color: '#555' }}>{p.sugg ? `₹${p.sugg.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Exact</span>
                                      <div>{addedProdTargets.find(t => t.id === `indiv-${p.id}-exact`) ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] })}>Add</button>}</div>
                                    </div>
                                  )}
                                  {ptIndivFilterExpanded && (
                                    <div className="ccs-indiv-type-row">
                                      <span /><span style={{ fontSize: 13, color: '#555' }}>{p.suggExpanded ? `₹${p.suggExpanded.toFixed(2)}` : '-'}</span>
                                      <span style={{ fontSize: 13 }}>Expanded</span>
                                      <div>{addedProdTargets.find(t => t.id === `indiv-${p.id}-expanded`) ? <span className="ccs-kw-added-text">Added</span> : <button className="link-btn ccs-kw-add-link" onClick={() => addProdTarget({ id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded', brands: [] })}>Add</button>}</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {INDIV_SUGGESTED.filter(p => p.name.toLowerCase().includes(ptIndivSearch.toLowerCase()) || p.asin.toLowerCase().includes(ptIndivSearch.toLowerCase())).length === 0 && (
                                <div style={{ padding: '20px 0', color: '#888', fontSize: 13, textAlign: 'center' }}>No products found for "{ptIndivSearch}".</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ENTER LIST */}
                      {ptIndivSubTab === 'enter-list' && (
                        <div style={{ padding: '14px 14px' }}>
                          <textarea
                            className="ccs-kw-textarea"
                            placeholder="Enter ASINs separated by a comma, space or new line."
                            value={ptIndivEnterList}
                            onChange={e => { setPtIndivEnterList(e.target.value); setPtEnterListErrors([]); }}
                            rows={8}
                            style={{ width: '100%', maxWidth: 520 }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 520, marginTop: 8 }}>
                            {ptEnterListSummary ? (
                              <div style={{ fontSize: 13, color: '#c40000' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>⚠ {ptEnterListSummary.added}/{ptEnterListSummary.total} ASINs added successfully.</span>
                                  <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }}
                                    onClick={() => downloadErrorReport(ptEnterListErrors, 'product-targeting-errors.csv')}>Download report</button>
                                </div>
                                {ptEnterListSummary.invalidAsins.length > 0 && (
                                  <div style={{ marginTop: 4, fontSize: 12, color: '#c40000' }}>
                                    Invalid format: {ptEnterListSummary.invalidAsins.join(', ')}
                                    <span style={{ color: '#888', marginLeft: 4 }}>(ASINs must start with B and be 10 characters)</span>
                                  </div>
                                )}
                              </div>
                            ) : <span />}
                            <button
                              className={`ccs-target-btn ${ptIndivEnterList.trim() ? 'active' : ''}`}
                              disabled={!ptIndivEnterList.trim()}
                              onClick={() => {
                                const ASIN_RE = /^B[A-Z0-9]{9}$/;
                                const inputs = [...new Set(ptIndivEnterList.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean))];
                                const errors = [];
                                const invalidAsins = [];
                                let addedCount = 0;
                                inputs.forEach(input => {
                                  if (!ASIN_RE.test(input)) {
                                    invalidAsins.push(input);
                                    if (ptIndivFilterExact) errors.push({ input, type: 'Exact', error: `"${input}" is not a valid ASIN` });
                                    if (ptIndivFilterExpanded) errors.push({ input, type: 'Expanded', error: `"${input}" is not a valid ASIN` });
                                    return;
                                  }
                                  const found = INDIV_SUGGESTED.find(p => p.asin === input);
                                  const name = found ? found.name.slice(0, 50) : input;
                                  const sugg = found ? found.sugg : null;
                                  let thisAdded = false;
                                  if (ptIndivFilterExact) {
                                    const id = `indiv-${input}-exact`;
                                    if (addedProdTargets.find(t => t.id === id)) {
                                      errors.push({ input, type: 'Exact', error: `"${input}" is already targeted (Exact)` });
                                    } else {
                                      addProdTarget({ id, name, sugg, bid: sugg ? parseFloat(sugg).toFixed(2) : ptCustomBid, type: 'Exact', brands: [] });
                                      thisAdded = true;
                                    }
                                  }
                                  if (ptIndivFilterExpanded) {
                                    const id = `indiv-${input}-expanded`;
                                    if (addedProdTargets.find(t => t.id === id)) {
                                      errors.push({ input, type: 'Expanded', error: `"${input}" is already targeted (Expanded)` });
                                    } else {
                                      addProdTarget({ id, name, sugg: null, bid: ptCustomBid, type: 'Expanded', brands: [] });
                                      thisAdded = true;
                                    }
                                  }
                                  if (thisAdded) addedCount++;
                                });
                                setPtEnterListErrors(errors);
                                setPtEnterListSummary(errors.length > 0 ? { added: addedCount, total: inputs.length, invalidAsins } : null);
                                setPtIndivEnterList('');
                              }}
                            >
                              Target
                            </button>
                          </div>
                        </div>
                      )}

                      {/* UPLOAD */}
                      {ptIndivSubTab === 'upload' && (
                        <div style={{ padding: '16px 14px' }}>
                          <p style={{ fontSize: 13, color: '#333', marginBottom: 10 }}>Use the template to make sure your information uploads accurately.</p>
                          <button className="ccs-download-btn" onClick={() => {
                            const csv = `ASIN bulk import template\nList ASINs you would like to add to your campaign.,Use Exact or Expanded for the Type field\n\n"ASINs (list below, one ASIN per row)","Type (Exact/Expanded)"`;
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = 'asin-template.csv'; a.click();
                            URL.revokeObjectURL(url);
                          }}>
                            ↓ &nbsp;Download the CSV template
                          </button>
                          <div
                            className={`ccs-kw-drop-area ${ptIndivDragOver ? 'drag-over' : ''}`}
                            style={{ marginTop: 12 }}
                            onDragOver={e => { e.preventDefault(); setPtIndivDragOver(true); }}
                            onDragLeave={() => setPtIndivDragOver(false)}
                            onDrop={e => {
                              e.preventDefault(); setPtIndivDragOver(false);
                              const file = e.dataTransfer.files[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const lines = (ev.target.result || '').split('\n').map(l => l.trim()).filter(Boolean);
                                lines.forEach(line => {
                                  const [asin, type] = line.split(',').map(s => s.replace(/"/g,'').trim());
                                  if (!asin || asin.toLowerCase().includes('asin')) return;
                                  const found = INDIV_SUGGESTED.find(p => p.asin === asin);
                                  const name = found ? found.name.slice(0, 50) : asin;
                                  const sugg = found ? found.sugg : null;
                                  const t = (type || '').toLowerCase();
                                  if (!t || t === 'exact') addProdTarget({ id: `indiv-${asin}-exact`, name, sugg, bid: sugg ? sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] });
                                  if (!t || t === 'expanded') addProdTarget({ id: `indiv-${asin}-expanded`, name, sugg: null, bid: '3.00', type: 'Expanded', brands: [] });
                                });
                              };
                              reader.readAsText(file);
                            }}
                            onClick={() => { const inp = document.createElement('input'); inp.type='file'; inp.accept='.csv,.tsv,.xlsx'; inp.onchange = e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => { const lines = (ev.target.result || '').split('\n').map(l => l.trim()).filter(Boolean); lines.forEach(line => { const [asin, type] = line.split(',').map(s => s.replace(/"/g,'').trim()); if (!asin || asin.toLowerCase().includes('asin')) return; const found = INDIV_SUGGESTED.find(p => p.asin === asin); const name = found ? found.name.slice(0, 50) : asin; const sugg = found ? found.sugg : null; const t = (type || '').toLowerCase(); if (!t || t === 'exact') addProdTarget({ id: `indiv-${asin}-exact`, name, sugg, bid: sugg ? sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] }); if (!t || t === 'expanded') addProdTarget({ id: `indiv-${asin}-expanded`, name, sugg: null, bid: '3.00', type: 'Expanded', brands: [] }); }); }; reader.readAsText(file); }; inp.click(); }}
                          >
                            <div style={{ fontSize: 28, marginBottom: 6 }}>↑</div>
                            <div style={{ fontSize: 13, color: '#333' }}>Drag and drop file to add</div>
                            <div style={{ fontSize: 13, color: '#333' }}>or click to select from your computer</div>
                            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Accepted formats: CSV, TSV, XLSX</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Refine drawer (inside left column) ── */}
                  {refineTarget && (
                    <div className="ccs-refine-overlay">
                      <div className="ccs-refine-panel">
                        <div className="ccs-refine-header">
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Refine category: {refineTarget.name}</h3>
                            <p style={{ fontSize: 13, color: '#555' }}>Refine category by specific brands, price range, star ratings and Prime shipping eligibility.</p>
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label">Brand</div>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button className="ccs-filter-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                              onClick={() => setRefineBrandDropOpen(o => !o)}>
                              {refineBrand.length === 0 ? 'Select' : `${refineBrand.length} selected`}
                              <span style={{ fontSize: 14 }}>⇅</span>
                            </button>
                            {refineBrandDropOpen && (
                              <div className="ccs-brand-dropdown" onClick={e => e.stopPropagation()}>
                                <div className="ccs-brand-search-wrap">
                                  <Search size={12} color="#888" />
                                  <input type="text" className="ccs-brand-search-inp" placeholder="Search"
                                    value={refineBrandSearch} onChange={e => setRefineBrandSearch(e.target.value)} autoFocus />
                                </div>
                                <div className="ccs-brand-list">
                                  {(refineTarget.brands || []).filter(b => !refineBrandSearch || b.toLowerCase().includes(refineBrandSearch.toLowerCase())).map(brand => (
                                    <label key={brand} className="ccs-brand-option">
                                      <input type="checkbox" checked={refineBrand.includes(brand)}
                                        onChange={() => setRefineBrand(p => p.includes(brand) ? p.filter(x => x !== brand) : [...p, brand])} />
                                      {brand}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label">Price range</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="ccs-bid-input-wrap" style={{ width: 110 }}>
                              <span className="ccs-bid-prefix">₹</span>
                              <input type="number" className="ccs-bid-input" placeholder="No min" value={refinePriceMin} onChange={e => { const v = parseFloat(e.target.value); setRefinePriceMin(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 80 }} />
                            </div>
                            <span>-</span>
                            <div className="ccs-bid-input-wrap" style={{ width: 110 }}>
                              <span className="ccs-bid-prefix">₹</span>
                              <input type="number" className="ccs-bid-input" placeholder="No max" value={refinePriceMax} onChange={e => { const v = parseFloat(e.target.value); setRefinePriceMax(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 80 }} />
                            </div>
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Review stars rating</span>
                            <span style={{ color: '#111', fontWeight: 700, fontSize: 15 }}>
                              {refineStarsMin === 0 && refineStarsMax === 5 ? 'All stars' : `${refineStarsMin} – ${refineStarsMax} stars`}
                            </span>
                          </div>
                          <div className="ccs-dual-range-wrap">
                            <div className="ccs-dual-range-track">
                              <div className="ccs-dual-range-fill" style={{ left: `${(refineStarsMin / 5) * 100}%`, width: `${((refineStarsMax - refineStarsMin) / 5) * 100}%` }} />
                            </div>
                            <input type="range" className="ccs-range-input" min={0} max={5} step={1} value={refineStarsMin}
                              onChange={e => setRefineStarsMin(Math.min(parseInt(e.target.value), refineStarsMax))} />
                            <input type="range" className="ccs-range-input" min={0} max={5} step={1} value={refineStarsMax}
                              onChange={e => setRefineStarsMax(Math.max(parseInt(e.target.value), refineStarsMin))} />
                          </div>
                          <div className="ccs-stars-labels">
                            {[0,1,2,3,4,5].map(n => <span key={n}>{n}</span>)}
                          </div>
                        </div>

                        <div className="ccs-refine-section">
                          <div className="ccs-refine-label">Shipping</div>
                          <div style={{ display: 'flex', gap: 20 }}>
                            {[['all','All'],['prime','Prime eligible'],['not-prime','Not Prime eligible']].map(([k, l]) => (
                              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                <input type="radio" name="refineShipping" checked={refineShipping === k} onChange={() => setRefineShipping(k)} style={{ accentColor: '#0073bb' }} />
                                {l}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="ccs-refine-footer">
                          <strong style={{ fontSize: 15 }}>Products targeted: {calcProductsTargeted(refineTarget)}</strong>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary" style={{ color: '#0073bb', background: 'none', border: 'none', fontWeight: 600 }} onClick={() => setRefineTarget(null)}>Cancel</button>
                            <button className="btn btn-secondary"
                              style={{ opacity: refineBrand.length > 0 || refinePriceMin || refinePriceMax || refineStarsMin > 0 || refineStarsMax < 5 || refineShipping !== 'all' ? 1 : 0.5,
                                       cursor: refineBrand.length > 0 || refinePriceMin || refinePriceMax || refineStarsMin > 0 || refineStarsMax < 5 || refineShipping !== 'all' ? 'pointer' : 'default' }}
                              onClick={() => { addProdTarget({ ...refineTarget, name: `${refineTarget.name} (refined)` }); setRefineTarget(null); }}>
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── Right panel ── */}
                <div className="ccs-kw-right">
                  <div className="ccs-added-header">
                    <strong>{addedProdTargets.length} added</strong>
                    {addedProdTargets.length > 0 && <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedProdTargets([])}>Remove all</button>}
                  </div>
                  <div className="ccs-pt-right-head">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Categories and products</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Sugg. bid <InfoIcon /><br/><button className="link-btn" style={{ fontSize: 11, fontWeight: 500 }} onClick={() => setAddedProdTargets(p => p.map(t => ({ ...t, bid: t.sugg ? t.sugg.toFixed(2) : t.bid })))}>Apply all</button></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Bid</span>
                  </div>
                  {addedProdTargets.length === 0 ? (
                    <div className="ccs-kw-right-empty">No targets added yet</div>
                  ) : (
                    addedProdTargets.map((t, i) => (
                      <div key={i} className="ccs-pt-right-row">
                        <div style={{ fontSize: 13 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{t.sugg ? `₹${t.sugg.toFixed(2)}` : '-'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div className="ccs-bid-input-wrap" style={{ opacity: costControlActive ? 0.5 : 1 }}>
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={costControlActive ? '' : ptEffBid(t)}
                              placeholder="-"
                              disabled={costControlActive}
                              onChange={e => { const v = parseFloat(e.target.value); setAddedProdTargets(p => p.map((x, j) => j === i ? { ...x, sugg: null, bid: v < 0 ? '0' : e.target.value } : x)); }}
                              style={{ width: 65, background: costControlActive ? '#f0f0f0' : '', color: costControlActive ? '#999' : '' }} />
                          </div>
                          <button className="ccs-remove-btn" onClick={() => setAddedProdTargets(p => p.filter((_, j) => j !== i))}>×</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ══ NEGATIVE KEYWORD TARGETING ══ */}
          <div className="ccs-card ccs-collapsible">
            <button className="ccs-collapsible-header" onClick={() => setNegKwOpen(o => !o)}>
              <div className="ccs-collapsible-left">
                {negKwOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="ccs-card-heading">Negative keyword targeting <InfoIcon /></span>
                <span className="ccs-optional-tag">optional</span>
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to use negative keywords
              </a>
            </button>
            {negKwOpen && (
              <div className="ccs-products-layout" style={{ borderTop: '1px solid var(--amazon-border)' }}>
                <div className="ccs-products-left">
                  <div className="ccs-card-body">
                    <div className="ccs-match-label" style={{ marginBottom: 8 }}>Match type <InfoIcon /></div>
                    <div className="ccs-neg-match-row">
                      {['Negative exact','Negative phrase'].map(m => (
                        <label key={m} className="ccs-radio-inline">
                          <input type="radio" name="negMatch" checked={negKwMatchType===m} onChange={() => setNegKwMatchType(m)} />
                          {m}
                        </label>
                      ))}
                    </div>
                    <textarea className="ccs-textarea" rows={6} value={negKwText}
                      onChange={e => setNegKwText(e.target.value)}
                      placeholder="Enter keywords separated by new line." />
                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                      <button className="btn btn-secondary" onClick={addNegKws} disabled={!negKwText.trim()}>Add keywords</button>
                    </div>
                  </div>
                </div>
                <div className="ccs-products-right">
                  <div className="ccs-added-header">
                    <strong>{addedNegKws.length} added</strong>
                    {addedNegKws.length > 0 && <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedNegKws([])}>Remove all</button>}
                  </div>
                  {addedNegKws.length === 0 ? (
                    <div className="ccs-added-empty" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 14px' }}>
                      <span>Keyword</span>
                      <span style={{ color: '#aaa' }}>Match type</span>
                    </div>
                  ) : (
                    <table className="ccs-kw-table">
                      <thead><tr><th>Keyword</th><th>Match type</th><th></th></tr></thead>
                      <tbody>
                        {addedNegKws.map((k, i) => (
                          <tr key={i}>
                            <td>{k.keyword}</td>
                            <td>{k.matchType}</td>
                            <td><button className="ccs-remove-btn" onClick={() => setAddedNegKws(p => p.filter((_,j)=>j!==i))}>×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══ NEGATIVE PRODUCT TARGETING ══ */}
          <div className="ccs-card ccs-collapsible">
            <button className="ccs-collapsible-header" onClick={() => setNegProdOpen(o => !o)}>
              <div className="ccs-collapsible-left">
                {negProdOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="ccs-card-heading">Negative product targeting <InfoIcon /></span>
                <span className="ccs-optional-tag">optional</span>
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to choose negative products for targeting
              </a>
            </button>
            {negProdOpen && (
              <div className="ccs-products-layout" style={{ borderTop: '1px solid var(--amazon-border)' }}>
                <div className="ccs-products-left">
                  <div className="ccs-tab-row">
                    <button className={`ccs-tab ${negProdTab==='brands'?'active':''}`} onClick={() => setNegProdTab('brands')}>
                      <strong>Exclude brands</strong> <InfoIcon />
                    </button>
                    <button className={`ccs-tab ${negProdTab==='products'?'active':''}`} onClick={() => setNegProdTab('products')}>
                      Exclude products <InfoIcon />
                    </button>
                  </div>
                  <div className="ccs-card-body">
                    {negProdTab === 'brands' ? (
                      <>
                        <div className="ccs-search-wrap" style={{ marginBottom: 12 }}>
                          <Search size={13} className="ccs-search-icon" />
                          <input className="ccs-search-input" placeholder="Search by brand name" />
                        </div>
                        <div className="ccs-brand-section">
                          <div className="ccs-brand-section-header">
                            <strong>YOUR BRANDS</strong>
                            <button className="link-btn ccs-exclude-all">Exclude all</button>
                          </div>
                          <div className="ccs-brand-row">
                            <span>SoundMax</span>
                            <button className="link-btn ccs-exclude-btn"
                              onClick={() => !addedNegProds.find(x => x.name==='SoundMax') && setAddedNegProds(p => [...p, { type: 'brand', name: 'SoundMax' }])}>
                              Exclude
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="ccs-search-wrap" style={{ marginBottom: 12 }}>
                        <Search size={13} className="ccs-search-icon" />
                        <input className="ccs-search-input" placeholder="Search by product name or ASIN" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="ccs-products-right">
                  <div className="ccs-added-header">
                    <strong>{addedNegProds.length} added</strong>
                    {addedNegProds.length > 0 && <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedNegProds([])}>Remove all</button>}
                  </div>
                  {addedNegProds.length === 0 ? (
                    <div className="ccs-added-empty">Brands and products</div>
                  ) : (
                    <div className="ccs-added-list">
                      {addedNegProds.map((p, i) => (
                        <div key={i} className="ccs-added-item">
                          <span>{p.name}</span>
                          <button className="ccs-remove-btn" onClick={() => setAddedNegProds(x => x.filter((_,j)=>j!==i))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══ CAMPAIGN ══ */}
          <div className="ccs-section-title">Campaign</div>

          {/* Bidding strategy */}
          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Campaign bidding strategy <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to set your bid strategy
              </a>
            </div>
            {adGroupMode ? (
              <div className="ccs-card-body">
                <p style={{ fontSize: 14, color: '#333', margin: 0 }}>
                  {effectiveBiddingStrategy === 'Dynamic bids - up and down' ? 'Dynamic bids – up and down'
                    : effectiveBiddingStrategy === 'Dynamic bids - down only' ? 'Dynamic bids – down only'
                    : 'Fixed bids'}
                </p>
              </div>
            ) : (
            <div className="ccs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { key: 'Dynamic bids - up and down', label: 'Dynamic bids – up and down', desc: 'We will raise your bids (by a maximum of 100% on all placements) in real time when your ad may be more likely to convert to a sale, and lower your bids when less likely to convert to a sale.' },
                { key: 'Dynamic bids - down only',   label: 'Dynamic bids – down only',   desc: 'We will lower your bids in real time when your ad may be less likely to convert to a sale.' },
                { key: 'Fixed bid',                  label: 'Fixed bids',                 desc: 'We will use your exact bid and any manual adjustments you set and will not change your bids based on likelihood of a sale.' },
              ].map(opt => (
                <label key={opt.key} className="ccs-bs-radio-row" onClick={() => setBiddingStrategy(opt.key)}>
                  <input type="radio" name="bs" checked={biddingStrategy === opt.key} onChange={() => setBiddingStrategy(opt.key)} style={{ accentColor: '#0073bb', width: 16, height: 16, flexShrink: 0 }} />
                  <div>
                    <div className="ccs-radio-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {opt.label} <InfoIcon />
                    </div>
                    <div className="ccs-radio-desc" style={{ marginTop: 4, maxWidth: 560 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            )}
          </div>

          {/* Bid adjustments */}
          <div className="ccs-card">
            <div className="ccs-card-body" style={{ paddingBottom: 0 }}>
              <div className="ccs-bid-adj-heading">Bid adjustments</div>
              <p className="ccs-radio-desc" style={{ margin: '4px 0 12px' }}>By raising your bids, you will be more likely to appear in specific placements and in front of specific audiences.</p>
              <div className="ccs-tab-row">
                <button className={`ccs-tab ${placementTab==='placements'?'active':''}`} onClick={() => setPlacementTab('placements')}>Placements</button>
                <button className={`ccs-tab ${placementTab==='audiences'?'active':''}`} onClick={() => setPlacementTab('audiences')}>
                  Audiences <span className="ccs-new-badge">New</span>
                </button>
              </div>
            </div>
            {placementTab === 'placements' && (
              <div className="ccs-bid-adj-body">
                <div className="ccs-bid-adj-left">
                  <p className="ccs-radio-desc" style={{ marginBottom: 14 }}>Increase your bid for specific Amazon placements. <InfoIcon /></p>
                  {[
                    { label: 'Top of search (first page)', val: placementTop,  set: setPlacementTop },
                    { label: 'Rest of search',             val: placementRest, set: setPlacementRest },
                    { label: 'Product pages',              val: placementPages,set: setPlacementPages },
                  ].map(pl => (
                    <div key={pl.label} className="ccs-placement-inline-row">
                      <span className="ccs-placement-label">{pl.label}</span>
                      <div className="ccs-pct-input-wrap">
                        <input type="number" className="ccs-pct-input" value={pl.val}
                          min="0" max="900"
                          onChange={e => {
                            const v = Math.min(900, Math.max(0, parseInt(e.target.value) || 0));
                            pl.set(v.toString());
                          }} />
                        <span className="ccs-pct-sign">%</span>
                      </div>
                      {parseInt(pl.val) > 0 && <span style={{ fontSize: 12, color: '#888', marginLeft: 6 }}>max 900%</span>}
                    </div>
                  ))}
                  <p className="ccs-placement-summary">
                    A ₹{parseFloat(defaultBid||0).toFixed(2)} bid will start at ₹{(parseFloat(defaultBid||0)*(1+parseFloat(placementTop||0)/100)).toFixed(2)} for top of search,{' '}
                    ₹{(parseFloat(defaultBid||0)*(1+parseFloat(placementRest||0)/100)).toFixed(2)} for rest of search, and{' '}
                    ₹{(parseFloat(defaultBid||0)*(1+parseFloat(placementPages||0)/100)).toFixed(2)} for product pages.{' '}
                    {biddingStrategy === 'Dynamic bids - up and down' && 'Dynamic bidding may increase your bids by up to 100% on all placements.'}
                  </p>
                  <label className="ccs-biz-check-row">
                    <input type="checkbox" checked={bizCheck} onChange={e => setBizCheck(e.target.checked)} />
                    <span>Further increase bids across placements on Amazon Business <InfoIcon /></span>
                  </label>
                  {bizCheck && (
                    <div className="ccs-biz-tip">
                      <span className="ccs-biz-tip-icon">💡</span>
                      <span>On average, advertisers see a 2x to 3x higher return on ad spending on Amazon Business relative to the overall campaign performance (Amazon internal data, 2024).</span>
                    </div>
                  )}
                </div>
                <div className="ccs-bid-adj-right">
                  {effectiveBiddingStrategy !== '' && (
                    <div className="ccs-adj-summary-card">
                      <div className="ccs-adj-summary-header">
                        <ChevronDown size={14} />
                        <span className="ccs-adj-count">1 adjustment applied</span>
                      </div>
                      <div className="ccs-adj-row-label">BIDDING STRATEGY</div>
                      <div className="ccs-adj-row-val">{effectiveBiddingStrategy}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {placementTab === 'audiences' && (
              <div className="ccs-bid-adj-body">
                <div className="ccs-bid-adj-left">
                  {[
                    { key: 'increase', label: 'Increase bids for audiences built by Amazon' },
                    { key: 'none',     label: 'Do not increase bids for an audience' },
                  ].map(opt => (
                    <label key={opt.key} className="ccs-radio-row" style={{ marginBottom: 10 }}>
                      <input type="radio" name="audienceBid" defaultChecked={opt.key === 'none'} />
                      <span className="ccs-radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="ccs-bid-adj-right">
                  {effectiveBiddingStrategy !== '' && (
                    <div className="ccs-adj-summary-card">
                      <div className="ccs-adj-summary-header">
                        <ChevronDown size={14} />
                        <span className="ccs-adj-count">1 adjustment applied</span>
                      </div>
                      <div className="ccs-adj-row-label">BIDDING STRATEGY</div>
                      <div className="ccs-adj-row-val">{effectiveBiddingStrategy}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings — hidden in ad group mode */}
          {!adGroupMode && <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Settings</span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> How to set up your campaign
              </a>
            </div>
            <div className="ccs-card-body">
              <div className="ccs-field" style={{ maxWidth: 460 }}>
                <label className="ccs-label">Campaign name <InfoIcon /></label>
                <input className="ccs-input-full" value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  placeholder={`Campaign - ${today}`} />
              </div>
              <div className="ccs-field" style={{ maxWidth: 460, marginTop: 14 }}>
                <label className="ccs-label">Portfolio <InfoIcon /></label>
                <div className="ccs-select-wrap">
                  <select className="ccs-input-full" value={portfolioId} onChange={e => setPortfolioId(e.target.value)}>
                    <option value="">Choose a portfolio</option>
                    <option value="p1">Main Products Portfolio</option>
                    <option value="p2">Competitor Targeting Portfolio</option>
                  </select>
                  <ChevronDown size={14} className="ccs-select-chevron" />
                </div>
              </div>
              <div className="ccs-date-row" style={{ marginTop: 14 }}>
                <div className="ccs-field">
                  <label className="ccs-label">Start <InfoIcon /></label>
                  <div className="ccs-date-input-wrap">
                    <span className="ccs-date-icon">📅</span>
                    <input type="date" className="ccs-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                </div>
                <div className="ccs-field">
                  <label className="ccs-label">End <InfoIcon /></label>
                  <div className="ccs-date-input-wrap">
                    <span className="ccs-date-icon">📅</span>
                    <input type="date" className="ccs-date-input" value={endDate} onChange={e => setEndDate(e.target.value)}
                      placeholder="No end date" />
                    {!endDate && <span className="ccs-no-end">No end date</span>}
                  </div>
                </div>
              </div>
              <div className="ccs-field" style={{ marginTop: 14 }}>
                <label className="ccs-label">Country</label>
                <div className="ccs-country-static">India</div>
              </div>
              <div className="ccs-field" style={{ marginTop: 14, maxWidth: 200 }}>
                <label className="ccs-label">Daily budget <InfoIcon /></label>
                <div className="ccs-bid-input-wrap">
                  <span className="ccs-bid-prefix">₹</span>
                  <input type="number" className="ccs-bid-input" value={budget}
                    onChange={e => { const v = parseFloat(e.target.value); setBudget(v < 0 ? '0' : e.target.value); }} min="0" style={{ width: 140 }} />
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Minimum ₹50 per day</small>
              </div>
            </div>
          </div>}

          {/* ══ ADDITIONAL CHANGES ══ — hidden in ad group mode */}
          {!adGroupMode && <div className="ccs-section-title">Additional changes</div>}
          {!adGroupMode && <>

          <div className="ccs-card ccs-collapsible">
            <button className="ccs-collapsible-header" onClick={() => setRulesOpen(o => !o)}>
              <div className="ccs-collapsible-left">
                {rulesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="ccs-card-heading">Automated tasks using rules <InfoIcon /></span>
                <span className="ccs-beta-badge" style={{ fontSize: 11 }}>Beta</span>
                <span className="ccs-optional-tag">optional</span>
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <Info size={12} /> Learn about automatic rules
              </a>
            </button>
            {rulesOpen && (
              <div className="ccs-card-body" style={{ paddingTop: 0 }}>
                {!rulesBannerDismissed && (
                  <div className="ccs-rules-banner">
                    <div className="ccs-rules-banner-text">
                      <strong>Create a rule to automate manual tasks and optimise performance</strong>
                      <p>We will help you set up a rule to increase bids during high traffic time periods. <a href="#" onClick={e=>e.preventDefault()} className="ccs-help-link" style={{ display:'inline', fontSize:13 }}>Learn More</a></p>
                    </div>
                    <button className="ccs-remove-btn" style={{ fontSize: 18, marginTop: -4 }} onClick={() => setRulesBannerDismissed(true)}>×</button>
                  </div>
                )}
                <div className="ccs-rules-section">
                  <div className="ccs-rules-heading">Change your bid on a schedule</div>
                  <label className="ccs-biz-check-row" style={{ marginBottom: 8 }}>
                    <input type="checkbox" checked={bidScheduleChecked} onChange={e => setBidScheduleChecked(e.target.checked)} />
                    <span>Increase bids for high-traffic days</span>
                  </label>
                  {bidScheduleChecked && (
                    <>
                      <button className="link-btn ccs-see-details" onClick={() => setRuleDetailsOpen(o => !o)}>
                        {ruleDetailsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} See details
                      </button>
                      {ruleDetailsOpen && (
                        <div className="ccs-rule-card">
                          <div className="ccs-rule-card-header">
                            <strong>New rule</strong>
                            <button className="ccs-add-btn" onClick={() => setRuleModalOpen(true)}>Edit</button>
                          </div>
                          <div className="ccs-rule-card-body">
                            <div className="ccs-rule-row"><span>Rule name</span><span>Prime Day - Scheduled bid rule - {todayDisplay}</span></div>
                            <div className="ccs-rule-row"><span>Description</span><span>Increase bids by 50%<br />Schedule: Prime Day (4 Jul - 7 Jul 2026)</span></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          </>}

          {/* Bottom launch */}
          <div className="ccs-bottom-bar">
            <div />
            <div style={{ display: 'flex', gap: 10 }}>
              {!adGroupMode && <button className="btn btn-secondary" onClick={() => navigate('/create-campaign')}>Save as draft</button>}
              <button className="btn btn-dark" onClick={handleLaunch}>{adGroupMode ? 'Create ad group' : 'Launch campaign'}</button>
            </div>
          </div>

          {/* Footer */}
          <div className="ccs-footer">
            © 2026 Amazon.com, Inc. or its affiliates.&nbsp;
            <a href="#" onClick={e=>e.preventDefault()}>Conditions of use</a>&nbsp;·&nbsp;
            <a href="#" onClick={e=>e.preventDefault()}>Privacy notice</a>&nbsp;·&nbsp;
            <a href="#" onClick={e=>e.preventDefault()}>Amazon Advertising Agreement</a>&nbsp;·&nbsp;
            <a href="#" onClick={e=>e.preventDefault()}>Status</a>
          </div>

        </div>{/* end ccs-main */}

        {/* ── FORECAST SIDEBAR ── */}
        <div className="ccs-sidebar">
          <div className="ccs-forecast-card">
            <div className="ccs-forecast-title">
              Forecast <InfoIcon />
              <span className="ccs-beta-badge">Beta</span>
            </div>
            <p className="ccs-forecast-desc">Estimates of performance are based on historical campaigns with similar targeting and bids.</p>
            <a href="#" className="ccs-help-link" onClick={e=>e.preventDefault()}><Info size={12} /> Learn about forecasts</a>
            <div style={{ marginTop: 14 }}>
              <button className="ccs-filter-btn-sm">Weekly <ChevronDown size={11} /></button>
            </div>
            <div className="ccs-forecast-row"><span>Cost type: CPC</span></div>
            <div className="ccs-forecast-metric">
              <span>Clicks <InfoIcon /></span>
              <span>–</span>
            </div>
            <div className="ccs-forecast-metric">
              <span>Orders <InfoIcon /></span>
              <span>–</span>
            </div>
            {addedProducts.length > 0 && addedKws.length === 0 && targetingType === 'Auto' ? (
              <div className="ccs-forecast-hint">
                <p>To see a forecast:</p>
                <ul>
                  <li>Add targets</li>
                  <li>Enter a bid</li>
                </ul>
              </div>
            ) : addedProducts.length === 0 ? (
              <div className="ccs-forecast-hint">
                <p>To see a forecast:</p>
                <ul>
                  <li>Choose products</li>
                  <li>Add targets</li>
                  <li>Enter a bid</li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>

      </div>{/* end ccs-body */}

      {/* ══ ADD A RULE MODAL ══ */}
      {ruleModalOpen && (
        <div className="ccs-modal-overlay" onClick={() => setRuleModalOpen(false)}>
          <div className="ccs-modal" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="ccs-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="ccs-topbar-close" onClick={() => setRuleModalOpen(false)}><X size={16} /></button>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Add a Rule</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setRuleModalOpen(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={() => setRuleModalOpen(false)}>Save</button>
              </div>
            </div>

            {/* Modal body */}
            <div className="ccs-modal-body">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Setting</h2>

              <div className="ccs-modal-section">
                <div className="ccs-modal-row">
                  <span className="ccs-modal-label">Type</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Bids</div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                      Change your bids based on a schedule.{' '}
                      <button className="link-btn" onClick={e => e.preventDefault()}>Learn More</button>
                    </div>
                  </div>
                </div>

                <div className="ccs-modal-row" style={{ borderTop: '1px solid #e8e8e8', paddingTop: 16 }}>
                  <span className="ccs-modal-label">Applies to</span>
                  <div>
                    <div style={{ fontSize: 13, color: '#2a7d2a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✓</span> 1 added
                    </div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Campaign - {todayDisplay}</div>
                  </div>
                </div>
              </div>

              <div className="ccs-modal-section" style={{ borderTop: '1px solid #e8e8e8', paddingTop: 20, marginTop: 8 }}>
                <div className="ccs-modal-row">
                  <span className="ccs-modal-label">Date range</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label className="ccs-radio-row" style={{ alignItems: 'flex-start' }}>
                      <input type="radio" name="ruleDate" checked={ruleDateMode === 'recommended'} onChange={() => setRuleDateMode('recommended')} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>Recommended events</div>
                        {ruleDateMode === 'recommended' && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Increase your budget during upcoming special events</div>
                            <select
                              className="ccs-filter-btn-sm"
                              value={ruleEvent}
                              onChange={e => {
                                setRuleEvent(e.target.value);
                                const ev = RULE_EVENTS.find(x => x.value === e.target.value);
                                if (ev) setRuleName(`${ev.label.split(' (')[0]} - Scheduled bid rule - ${todayDisplay}`);
                              }}
                              style={{ fontSize: 13, padding: '5px 10px', border: '1px solid #a0a0a0', borderRadius: 3, background: 'white', cursor: 'pointer', minWidth: 260 }}
                            >
                              {RULE_EVENTS.map(ev => (
                                <option key={ev.value} value={ev.value}>{ev.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </label>
                    <label className="ccs-radio-row">
                      <input type="radio" name="ruleDate" checked={ruleDateMode === 'custom'} onChange={() => setRuleDateMode('custom')} />
                      <div style={{ fontWeight: 500, fontSize: 14 }}>Custom</div>
                    </label>
                  </div>
                </div>

                <div className="ccs-modal-row" style={{ borderTop: '1px solid #e8e8e8', paddingTop: 16, marginTop: 8 }}>
                  <span className="ccs-modal-label">Recurrence</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['daily', 'weekly'].map(r => (
                      <label key={r} className="ccs-radio-row">
                        <input type="radio" name="ruleRecurrence" checked={ruleRecurrence === r} onChange={() => setRuleRecurrence(r)} />
                        <span style={{ fontSize: 14 }}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="ccs-modal-row" style={{ borderTop: '1px solid #e8e8e8', paddingTop: 16, marginTop: 8 }}>
                  <span className="ccs-modal-label">Hours of day</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label className="ccs-radio-row">
                      <input type="radio" name="ruleHours" checked={ruleHours === 'all-day'} onChange={() => setRuleHours('all-day')} />
                      <span style={{ fontSize: 14 }}>Run All Day</span>
                    </label>
                    <label className="ccs-radio-row">
                      <input type="radio" name="ruleHours" checked={ruleHours === 'custom'} onChange={() => setRuleHours('custom')} />
                      <span style={{ fontSize: 14 }}>Choose a start time and an end time</span>
                    </label>
                  </div>
                </div>

                <div className="ccs-modal-row" style={{ borderTop: '1px solid #e8e8e8', paddingTop: 16, marginTop: 8 }}>
                  <span className="ccs-modal-label">Bid adjustment</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      value={ruleBidAdj}
                      onChange={e => { const v = parseFloat(e.target.value); setRuleBidAdj(v < 0 ? '0' : e.target.value); }} min="0"
                      style={{ border: '1px solid #a0a0a0', borderRadius: 3, padding: '6px 10px', fontSize: 14, width: 80, textAlign: 'right' }}
                    />
                    <span style={{ fontSize: 14 }}>%</span>
                  </div>
                </div>

                <div className="ccs-modal-row" style={{ borderTop: '1px solid #e8e8e8', paddingTop: 16, marginTop: 8 }}>
                  <span className="ccs-modal-label">Rule Name</span>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={e => setRuleName(e.target.value)}
                    style={{ border: '1px solid #a0a0a0', borderRadius: 3, padding: '6px 10px', fontSize: 13, width: 320 }}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="ccs-modal-footer">
              <button className="btn btn-secondary" onClick={() => setRuleModalOpen(false)}>Cancel</button>
              <button className="btn btn-dark" onClick={() => setRuleModalOpen(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
