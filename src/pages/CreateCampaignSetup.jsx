import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Info, ChevronDown, ChevronRight, Search, X, ToggleLeft, ToggleRight } from 'lucide-react';

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

function Stars({ rating }) {
  return (
    <span className="ccs-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#e47911' : '#ccc', fontSize: 12 }}>★</span>
      ))}
    </span>
  );
}

function InfoIcon() {
  return <span className="ccs-info-icon"><Info size={12} /></span>;
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
  const [kwEnterListErrors, setKwEnterListErrors] = useState([]);
  const [ptBidMode, setPtBidMode] = useState('suggested');
  const [ptCustomBid, setPtCustomBid] = useState('3.00');
  const [ptBidDropOpen, setPtBidDropOpen] = useState(false);

  // ── Campaign settings (declared here so effectiveBiddingStrategy can reference biddingStrategy) ──
  const [campaignName, setCampaignName] = useState('');
  const [portfolioId, setPortfolioId] = useState('');
  const [budget, setBudget] = useState('500');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [biddingStrategy, setBiddingStrategy] = useState('Dynamic bids - up and down');

  // In adGroupMode, targeting type and bidding strategy come from the parent campaign
  const effectiveTargetingType = adGroupMode ? (parentCampaign?.targetingType || 'Auto') : targetingType;
  const effectiveBiddingStrategy = adGroupMode ? (parentCampaign?.biddingStrategy || 'Dynamic bids - up and down') : biddingStrategy;

  // Close refine panel when clicking outside it
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

  // ── Product targeting data ──
  const SUGGESTED_CATS = [
    { id: 'over-ear', path: '/Electronics/Headphones, Earbuds & Accessories/Over-Ear Headphones', name: 'Over-Ear Headphones', sugg: null, prodMin: 284, prodMax: 412, brands: ['Sony','JBL','boAt','Sennheiser','Bose','SoundMax','Skullcandy','Jabra'] },
    { id: 'tws', path: '/Electronics/Headphones, Earbuds & Accessories/True Wireless Earbuds', name: 'True Wireless Earbuds', sugg: null, prodMin: 389, prodMax: 521, brands: ['Sony','JBL','boAt','Apple','Samsung','Noise','SoundMax','Skullcandy'] },
    { id: 'gaming-hs', path: '/Electronics/Headphones, Earbuds & Accessories/Gaming Headsets', name: 'Gaming Headsets', sugg: 6.87, suggMin: 5.23, suggMax: 8.44, prodMin: 198, prodMax: 325, brands: ['SoundMax','HyperX','Logitech','Corsair','Razer','boAt'] },
  ];

  const INDIV_SUGGESTED = [
    { id: 'sony-xm5', name: 'Sony WH-1000XM5 Industry Leading Noise Cancelling Wireless Headphones with Auto Noise Cancelling', format: 'Electronics', stars: 4.7, reviews: 12847, price: 24990, originalPrice: 29990, status: 'In stock', asin: 'B09XS7JWHH', sugg: 9.82, suggMin: 7.64, suggMax: 12.26, suggExpanded: 6.54, imgColor: '#111', imgAccent: '#d4002a' },
    { id: 'jbl-660nc', name: 'JBL Live 660NC – Wireless Over-Ear Noise Cancelling Headphones with Long Battery Life and Voice Assistant', format: 'Electronics', stars: 4.4, reviews: 7234, price: 8999, originalPrice: 14999, status: 'In stock', asin: 'B09B8FW7Y9', sugg: 7.43, suggMin: 5.81, suggMax: 9.32, suggExpanded: 4.97, imgColor: '#e05500', imgAccent: '#fff' },
    { id: 'boat-550', name: 'boAt Rockerz 550 Bluetooth On Ear Headphones with Mic, Upto 20 Hours Playback, 50MM Drivers, Padded Ear Cushions', format: 'Electronics', stars: 4.2, reviews: 45231, price: 1299, originalPrice: 3990, status: 'Out of stock', asin: 'B08QCY3MWF', sugg: null, suggExpanded: null, asinImg: null, imgColor: '#0057b8', imgAccent: '#00c9a7' },
    { id: 'senn-hd450', name: 'Sennheiser HD 450BT Bluetooth 5.0 Wireless Headphone with Active Noise Cancellation, 30-Hour Battery Life', format: 'Electronics', stars: 4.3, reviews: 3812, price: 7990, originalPrice: 11990, status: 'In stock', asin: 'B085RGRPMN', sugg: 8.14, suggMin: 6.23, suggMax: 10.05, suggExpanded: 5.43, imgColor: '#1a1a1a', imgAccent: '#c8c8c8' },
    { id: 'bose-qc45', name: 'Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones – Triple Black', format: 'Electronics', stars: 4.6, reviews: 9102, price: 22900, originalPrice: 26900, status: 'Out of stock', asin: 'B098FKXT8L', sugg: 10.54, suggMin: 8.32, suggMax: 13.21, suggExpanded: 7.12, imgColor: '#2c2c2c', imgAccent: '#b8963e' },
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
                              onChange={e => setDefaultBid(e.target.value)}
                              min="1"
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
                                  onChange={e => updateGroup(g.key, 'bid', e.target.value)}
                                  min="1"
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
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={kwCustomBid}
                                  onChange={e => setKwCustomBid(e.target.value)} style={{ width: 80 }} />
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
                              <div className="ccs-bid-input-wrap">
                                <span className="ccs-bid-prefix">₹</span>
                                <input type="number" className="ccs-bid-input" value={kwCustomBid}
                                  onChange={e => setKwCustomBid(e.target.value)} style={{ width: 80 }} />
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
                                onChange={e => setAddedKws(p => p.map((x, j) => j === i ? { ...x, bid: e.target.value } : x))}
                                style={{ width: 65 }} />
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
                                  onChange={e => setPtCustomBid(e.target.value)} style={{ width: 70 }} />
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
                                  onChange={e => setPtCustomBid(e.target.value)} style={{ width: 70 }} />
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
                            {ptEnterListErrors.length > 0 ? (
                              <span style={{ fontSize: 13, color: '#c40000' }}>
                                ❗ {ptEnterListErrors.length}/{ptEnterListErrors.length} product{ptEnterListErrors.length > 1 ? 's' : ''} weren't added.{' '}
                                <button className="link-btn" style={{ color: '#0073bb', fontSize: 13 }}
                                  onClick={() => downloadErrorReport(ptEnterListErrors, 'product-targeting-errors.csv')}>Download report</button>
                              </span>
                            ) : <span />}
                            <button
                              className={`ccs-target-btn ${ptIndivEnterList.trim() ? 'active' : ''}`}
                              disabled={!ptIndivEnterList.trim()}
                              onClick={() => {
                                const ASIN_RE = /^B[A-Z0-9]{9}$/;
                                const inputs = ptIndivEnterList.split(/[\n,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
                                const errors = [];
                                inputs.forEach(input => {
                                  if (!ASIN_RE.test(input)) {
                                    if (ptIndivFilterExact) errors.push({ input, type: 'Exact', error: `"${input}" is not a valid ASIN` });
                                    if (ptIndivFilterExpanded) errors.push({ input, type: 'Expanded', error: `"${input}" is not a valid ASIN` });
                                    return;
                                  }
                                  const found = INDIV_SUGGESTED.find(p => p.asin === input);
                                  const name = found ? found.name.slice(0, 50) : input;
                                  const sugg = found ? found.sugg : null;
                                  if (ptIndivFilterExact) {
                                    const id = `indiv-${input}-exact`;
                                    if (addedProdTargets.find(t => t.id === id)) {
                                      errors.push({ input, type: 'Exact', error: `"${input}" is already targeted (Exact)` });
                                    } else {
                                      addProdTarget({ id, name, sugg, bid: sugg ? parseFloat(sugg).toFixed(2) : ptCustomBid, type: 'Exact', brands: [] });
                                    }
                                  }
                                  if (ptIndivFilterExpanded) {
                                    const id = `indiv-${input}-expanded`;
                                    if (addedProdTargets.find(t => t.id === id)) {
                                      errors.push({ input, type: 'Expanded', error: `"${input}" is already targeted (Expanded)` });
                                    } else {
                                      addProdTarget({ id, name, sugg: null, bid: ptCustomBid, type: 'Expanded', brands: [] });
                                    }
                                  }
                                });
                                setPtEnterListErrors(errors);
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
                              <input type="number" className="ccs-bid-input" placeholder="No min" value={refinePriceMin} onChange={e => setRefinePriceMin(e.target.value)} style={{ width: 80 }} />
                            </div>
                            <span>-</span>
                            <div className="ccs-bid-input-wrap" style={{ width: 110 }}>
                              <span className="ccs-bid-prefix">₹</span>
                              <input type="number" className="ccs-bid-input" placeholder="No max" value={refinePriceMax} onChange={e => setRefinePriceMax(e.target.value)} style={{ width: 80 }} />
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
                          <div className="ccs-bid-input-wrap">
                            <span className="ccs-bid-prefix">₹</span>
                            <input type="number" className="ccs-bid-input" value={ptEffBid(t)}
                              onChange={e => setAddedProdTargets(p => p.map((x, j) => j === i ? { ...x, sugg: null, bid: e.target.value } : x))}
                              style={{ width: 65 }} />
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
                    onChange={e => setBudget(e.target.value)} min="50" style={{ width: 140 }} />
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
                      onChange={e => setRuleBidAdj(e.target.value)}
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
