import { Fragment, useState, useMemo, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { SUGGESTED_KWS } from '../data/keywordSuggestions';
import ProductImage from '../components/console/ProductImage';
import { PRODUCT_IMAGES } from '../data/productImages';
import { localISODate, consoleTimestamp } from '../utils/dateRanges';
import { spForecast } from '../utils/spForecast';
import { CampaignSetupCard, SitesCard, PresetSettingsCard } from './builder/sp/SetupCards';
import { AudienceAdjustments, AdjustmentSummary, ForecastPanel } from './builder/sp/BidPanels';
import { SITE_AMAZON_BUSINESS } from './builder/sp/constants';
import IndivProductRow from './builder/sp/IndivProductRow';
import NegativeCards from './builder/sp/NegativeCards';
import DateField from './builder/sp/DateField';
import SbProductsCard from './builder/sb/SbProductsCard';
import SbSitesCard from './builder/sb/SbSitesCard';
import SbKeywordTargeting from './builder/sb/SbKeywordTargeting';
import SdBuilder from './builder/sd/SdBuilder';
import { SB_MIN_PRODUCTS } from './builder/sb/limits';
import { validateSbDraft, buildSbLaunch } from './builder/sb/launch';
import { validateSpDraft, buildSpLaunch, validBid } from './builder/sp/launch';
import { campaignPath, ROUTES } from '../routes';

import { ChevronDown, ChevronUp, ChevronRight, Search, X, CircleHelp } from 'lucide-react';
import Info from '../components/console/InfoGlyph';

const TYPE_MAP = {
  sp: 'Sponsored Products',
  sb: 'Sponsored Brands',
  sd: 'Sponsored Display',
};




const STAR_PATH = 'M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7z';

/** Console rating stars: 16px orange, outlined when empty, half-filled for .5 ratings. */
const SB_THEME_GROUPS = [
  { key: 'brand', label: 'Keywords related to your brand', matchType: 'Theme', bid: '29.75', suggBid: 29.75, min: 21.89, max: 45.64 },
  { key: 'landing', label: 'Keywords related to your landing pages', matchType: 'Theme', bid: '29.75', suggBid: 29.75, min: 21.89, max: 45.64 },
];

function Stars({ rating }) {
  return (
    <span className="ccs-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => {
        const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
        const id = `half-${i}`;
        return (
          <svg key={i} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            {fill === 0.5 && <defs><linearGradient id={id}><stop offset="50%" stopColor="#de7921" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs>}
            <path d={STAR_PATH} fill={fill === 1 ? '#de7921' : fill === 0.5 ? `url(#${id})` : 'none'} stroke="#de7921" strokeWidth="1" />
          </svg>
        );
      })}
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
  const addNegativeProducts = useStore(s => s.addNegativeProducts);
  const allProducts = useStore(s => s.products);
  const campaigns = useStore(s => s.campaigns);

  const adGroupMode = !!paramCampaignId;
  const parentCampaign = adGroupMode ? campaigns.find(c => c.id === paramCampaignId) : null;
  const campaignType = adGroupMode ? (parentCampaign?.type || 'Sponsored Products') : (TYPE_MAP[type] || 'Sponsored Products');
  const today = localISODate();
  const todayDisplay = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' }).replace(',','');

  // ── Ad Group ──
  const [adGroupName, setAdGroupName] = useState(() => `Ad Group - ${consoleTimestamp()}`);

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
    // Suggested bids as observed on advertising.amazon.in (Oct 2026).
    { key: 'close',       label: 'Close match',  on: true, bid: '', sugg: 6.72,  suggMin: 3.61,  suggMax: 8.42 },
    { key: 'loose',       label: 'Loose match',  on: true, bid: '', sugg: 22.18, suggMin: 16.63, suggMax: 27.73 },
    { key: 'substitutes', label: 'Substitutes',  on: true, bid: '', sugg: 15.39, suggMin: 11.54, suggMax: 19.24 },
    { key: 'complements', label: 'Complements',  on: true, bid: '', sugg: 33.25, suggMin: 24.94, suggMax: 41.56 },
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
  const [kwCustomBid, setKwCustomBid] = useState('3.00');
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

  const AUTO_DEFAULT_SUGG = { sugg: 33.25, min: 24.94, max: 41.56 };
  const AUTO_DEFAULT_START_BID = '3.00';
  const AUTO_GROUP_START_BID = '3.00';
  const KW_GROUP = { type: 'group', name: 'Keywords related to your product category', suggBid: 8.03, suggMin: 5.20, suggMax: 10.04, bid: '' };

  const kwEffBid = (kwData) => kwBidMode === 'suggested'
    ? kwData.sugg.toFixed(2)
    : kwCustomBid; // both 'custom' and 'default' use the bid input value

  const kwGroupAdded = !!addedKws.find(k => k.type === 'group');
  const kwListHasErrors = addedKws.some(k => !validBid(k.bid));
  // Adding the first product loads suggestions: targeting-group bids fill with ₹3.00 and an
  // untouched default bid takes the suggested value (observed on advertising.amazon.in).
  const hasProducts = addedProducts.length > 0;
  useEffect(() => {
    if (!hasProducts) return;
    setAutoGroups(g => g.map(x => (x.bid === '' ? { ...x, bid: AUTO_GROUP_START_BID } : x)));
    setDefaultBid(b => (b === AUTO_DEFAULT_START_BID ? AUTO_DEFAULT_SUGG.sugg.toFixed(2) : b));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProducts]);
  // Choosing manual keyword targeting pre-adds the keyword group with no bid (the console flags "Enter a bid").
  const [kwGroupDismissed, setKwGroupDismissed] = useState(false);
  const isManualKeyword = (adGroupMode ? parentCampaign?.targetingType : targetingType) === 'Manual' && manualTargetType === 'keyword';
  useEffect(() => {
    if (campaignType !== 'Sponsored Products' || !isManualKeyword || kwGroupDismissed) return;
    // With products added the console pre-fills the group's suggested bid; with none it is left empty.
    const groupBid = addedProducts.length > 0 && kwBidMode === 'suggested' ? KW_GROUP.suggBid.toFixed(2) : '';
    setAddedKws(prev => {
      const group = prev.find(k => k.type === 'group');
      if (!group) return [{ ...KW_GROUP, bid: groupBid }, ...prev];
      return group.bid === '' && groupBid ? prev.map(k => (k.type === 'group' ? { ...k, bid: groupBid } : k)) : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManualKeyword, kwGroupDismissed, addedProducts.length]);
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
  // Console default: Expanded only.
  const [ptIndivFilterExact, setPtIndivFilterExact] = useState(false);
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
  const nameStamp = useMemo(() => consoleTimestamp(), []);
  const defaultCampaignName = (setup) => `${setup === 'preset' ? 'Preset campaign' : 'Campaign'} - ${nameStamp}`;
  const [campaignName, setCampaignName] = useState(() => defaultCampaignName('standard'));
  const [portfolioId, setPortfolioId] = useState('');
  // Console defaults: Display pre-fills ₹1,000; Sponsored Products and Brands start empty.
  const [budget, setBudget] = useState(() => (campaignType === 'Sponsored Display' ? '1000' : ''));
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
  // ── SP: setup, sites, audiences, forecast (see pages/builder/sp) ──
  const [spSetup, setSpSetup] = useState('standard'); // standard | preset
  const [searchParams] = useSearchParams();
  const [spSite, setSpSite] = useState(() => parentCampaign?.site || (searchParams.get('site') === SITE_AMAZON_BUSINESS ? SITE_AMAZON_BUSINESS : 'amazon-and-beyond'));
  const [audienceAdj, setAudienceAdj] = useState({ mode: 'none', audience: '', pct: '0' });
  const [spNegKws, setSpNegKws] = useState([]);
  const [spNegProds, setSpNegProds] = useState([]);
  const [forecastPeriod, setForecastPeriod] = useState('Weekly');
  const [extraCountry, setExtraCountry] = useState(false);
  const isPreset = !adGroupMode && campaignType === 'Sponsored Products' && spSetup === 'preset';
  const isBusinessSite = spSite === SITE_AMAZON_BUSINESS;
  // Placement adjustments: editable when creating a campaign, inherited (read-only) for a new ad group.
  const inherited = parentCampaign?.placementAdjustments || {};
  const effectivePlacements = [
    { key: 'top', label: 'Top of search (first page)', val: adGroupMode ? String(inherited.top || 0) : placementTop, set: setPlacementTop },
    { key: 'rest', label: 'Rest of search', val: adGroupMode ? String(inherited.rest || 0) : placementRest, set: setPlacementRest },
    { key: 'product', label: 'Product pages', val: adGroupMode ? String(inherited.product || 0) : placementPages, set: setPlacementPages },
  ];
  const activePlacementCount = effectivePlacements.filter(pl => parseFloat(pl.val) > 0).length;
  const forecast = spForecast({
    products: addedProducts.length,
    targeting: isPreset ? 'Auto' : targetingType,
    manualType: manualTargetType,
    keywords: addedKws.map(k => ({ bid: k.bid, suggMin: k.suggMin, suggMax: k.suggMax })),
    bid: targetingType === 'Auto' ? parseFloat(defaultBid) : (addedKws.reduce((sum, k) => sum + (parseFloat(k.bid) || 0), 0) / Math.max(1, addedKws.length)),
    budget,
    period: forecastPeriod,
  });
  const exampleBid = 3;
  const startAt = (pct) => `₹${(exampleBid * (1 + (parseFloat(pct) || 0) / 100)).toFixed(2)}`;
  const placementExample = `A ₹${exampleBid.toFixed(2)} bid will start at ${startAt(effectivePlacements[0].val)} for top of search, ${startAt(effectivePlacements[1].val)} for rest of search, and ${startAt(effectivePlacements[2].val)} for product pages.${effectiveBiddingStrategy === 'Dynamic bids - up and down' ? ' Dynamic bidding may increase your bids by up to 100% on all placements.' : ''}`;
  const changeSpSetup = (next) => {
    setSpSetup(next);
    // The console renames an untouched default name when you switch setup type.
    // Switching back to Standard keeps the "Preset campaign" name, as the console does.
    if (next === 'preset') setCampaignName(n => (n === defaultCampaignName('standard') ? defaultCampaignName('preset') : n));
  };
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
  const [sbAdTitle, setSbAdTitle] = useState('auto');
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
  const [sbTargetType, setSbTargetType] = useState('keyword');
  // Theme groups are pre-added only once a manual collection has its 3 products (as in the console).
  const [sbAddedTargetGroups, setSbAddedTargetGroups] = useState([]);
  const [sbSite, setSbSite] = useState('amazon');
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
  // Default dynamic-segment suggestions Amazon auto-populates before any product is chosen
  // ── SD targeting drill-down UI state ──
  // Bid mode for the drill-down's "Bid" selector — governs what bid gets assigned to newly
  // added targets. Locked to 'suggested' (with an explanatory tooltip) whenever Cost control
  // is on, since Amazon manages bids automatically in that mode.
  // ── SD Creative state ──

  // ── Launch ──
  const [launchErrors, setLaunchErrors] = useState([]);
  const spDraft = () => ({
    mode: adGroupMode ? 'adGroup' : 'campaign',
    setup: isPreset ? 'preset' : 'standard',
    name: campaignName,
    adGroupName,
    budget,
    startDate,
    endDate,
    portfolioId,
    biddingStrategy,
    targetingType: effectiveTargetingType,
    manualType: manualTargetType,
    autoBidMode,
    defaultBid,
    autoGroups,
    keywords: addedKws,
    productTargets: addedProdTargets,
    negativeKeywords: spNegKws,
    negativeProducts: spNegProds,
    products: addedProducts.map(p => p.asin),
    site: spSite,
    placements: { top: placementTop, rest: placementRest, product: placementPages },
    audience: audienceAdj,
  });

  const handleLaunch = () => {
    const draft = spDraft();
    const errors = validateSpDraft(draft);
    setLaunchErrors(errors);
    if (errors.length) {
      document.querySelector('.ccs-main')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const stamp = Date.now();
    const campaignId = adGroupMode ? paramCampaignId : `c${stamp}`;
    const out = buildSpLaunch(draft, { campaignId, adGroupId: `ag${stamp}`, today, parentCampaign });
    if (out.campaign) addCampaign(out.campaign);
    addAdGroup(out.adGroup);
    if (out.keywords.length) addKeywords(out.keywords);
    if (out.negativeKeywords.length) addNegativeKeywords(out.negativeKeywords);
    if (out.negativeProducts.length) addNegativeProducts(out.negativeProducts);
    navigate(campaignPath(out.campaign || parentCampaign));
  };

  const handleLaunchSB = () => {
    const draft = {
      name: campaignName, adGroupName, budget, budgetType: sbBudgetType, startDate, endDate, portfolioId,
      goal: sbGoal, site: sbSite, adFormat: sbAdFormat, collectionType: sbCollectionType, products: sbProducts,
      titleMode: sbAdTitle, customTitle: sbAdTitleText, brandName: sbBrandName, landingPage: sbLandingPageType,
      targetType: sbTargetType,
      keywords: [
        ...sbAddedTargetGroups.map(g => ({ keyword: g.label, matchType: 'Theme', bid: g.bid })),
        ...addedKws.filter(k => k.type !== 'group').map(k => ({ keyword: k.keyword, matchType: k.matchType, bid: k.bid })),
      ],
      productTargets: addedProdTargets,
      negativeKeywords: addedNegKws,
    };
    const errors = validateSbDraft(draft);
    setLaunchErrors(errors);
    if (errors.length) { document.querySelector('.wizard-content')?.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const out = buildSbLaunch(draft, { campaignId: `c${Date.now()}`, adGroupId: `ag${Date.now()}`, today: localISODate() });
    addCampaign(out.campaign);
    addAdGroup(out.adGroup);
    if (out.keywords.length) addKeywords(out.keywords);
    if (out.negativeKeywords.length) addNegativeKeywords(out.negativeKeywords);
    navigate(campaignPath(out.campaign));
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

  // Console behaviour: the two theme groups appear (pre-added, bid = suggested) the first time a
  // manual collection reaches 3 products; an automatic collection has no suggestions at all.
  const [sbGroupsSeeded, setSbGroupsSeeded] = useState(false);
  useEffect(() => {
    if (sbCollectionType !== 'manual') {
      setSbAddedTargetGroups([]);
      setSbGroupsSeeded(false);
      return;
    }
    if (!sbGroupsSeeded && sbProducts.length >= SB_MIN_PRODUCTS) {
      setSbAddedTargetGroups(SB_THEME_GROUPS);
      setSbGroupsSeeded(true);
    }
  }, [sbCollectionType, sbProducts.length, sbGroupsSeeded]);

  // Cost control has no effect when the card is hidden (impression-share goal)
  const costControlActive = false;

  // ─────────────────────────────────────────────────────────────────
  // SPONSORED BRANDS SCROLL FORM
  // ─────────────────────────────────────────────────────────────────
  if (campaignType === 'Sponsored Brands' && !adGroupMode) {
    // Manual collections hide the ad, targeting and bid sections until 3 products are added.
    const sbHasKwSuggestions = sbCollectionType === 'manual' || sbAdFormat === 'store-spotlight' || sbAdFormat === 'video';
    const sbIsUnlocked = sbAdFormat !== 'product-collection' || sbCollectionType === 'automatic' || sbProducts.length >= SB_MIN_PRODUCTS;
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
            <button className="link-btn ccs-back-link" onClick={() => navigate('/cb')}>
              Go back to campaigns
            </button>
            <button className="btn btn-secondary">Save as draft</button>
            <button className="btn btn-dark" onClick={handleLaunchSB}>Submit for review</button>
          </div>
        </div>

        {/* ── SB Body (no sidebar — full-width scroll like real console) ── */}
        <div className="ccs-body sb-body" style={{ display: 'block', maxWidth: 1340, margin: '0 auto', padding: '32px 24px' }}>

          {launchErrors.length > 0 && (
            <div className="sb-alert" role="alert">
              <strong>Fix the following to submit your campaign for review:</strong>
              <ul>{launchErrors.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}

          {/* ═══ CAMPAIGN SECTION ═══ */}
          <div className="ccs-section-title">Campaign</div>

          {/* Goals */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Goals <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> Learn about goals</a>
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
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> See campaign settings guidance</a>
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
                    <DateField value={startDate} onChange={setStartDate} min={today} />
                  </div>
                  <div className="ccs-field">
                    <label className="ccs-label">End <InfoIcon /></label>
                    <DateField value={endDate} min={startDate} isClearable placeholder="No end date"
                      onChange={v => { setEndDate(v); if (!v && sbBudgetType === 'Lifetime') setSbBudgetType('Daily'); }} />
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
                    <DateField value={startDate} onChange={setStartDate} min={today} />
                  </div>
                  <div className="ccs-field">
                    <label className="ccs-label">End <InfoIcon /></label>
                    <DateField value={endDate} onChange={setEndDate} min={startDate} isClearable placeholder="No end date" />
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

          {sbGoal !== 'share-of-voice' && <SbSitesCard value={sbSite} onChange={setSbSite} />}

          {/* ═══ AD GROUP AND AD SECTION ═══ */}
          {sbGoal !== 'share-of-voice' && <>
          <div className="ccs-section-title">Ad group and ad</div>

          {/* Ad group */}
          <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Ad group <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> How to choose an ad format</a>
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
                  <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> How to add products to your campaign</a>
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
          {/* Products — manual collection only; sections below unlock at 3 products */}
          {sbAdFormat === 'product-collection' && sbCollectionType === 'manual' && (
            <SbProductsCard catalogue={allProducts} products={sbProducts} onChange={setSbProducts} brand={sbBrandName} />
          )}

          {sbAdFormat !== 'store-spotlight' && sbAdFormat !== 'video' && sbIsUnlocked && <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ccs-card-heading">Ad</span>
                <InfoIcon />
              </div>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <CircleHelp size={13} /> {sbCollectionType === 'manual' ? 'Learn about manual collection ads' : 'Learn about automatic collection ads'}
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
                    <CircleHelp size={13} /> Learn about Store Spotlight ads
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
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> How product exclusion works</a>
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

          {/* ═══ TARGETING TYPE SELECTOR — manual collection only ═══ */}
          {((sbCollectionType === 'manual' && sbProducts.length >= 3) || (sbAdFormat === 'store-spotlight' && sbSSStore) || sbAdFormat === 'video') && (sbAdFormat !== 'store-spotlight' || sbSSStore) && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && !(sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight')) && <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header">
              <span style={{ fontSize: 20, fontWeight: 700 }}>Targeting <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> Select your targeting strategy</a>
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
            <SbKeywordTargeting
              key={sbHasKwSuggestions ? 'suggested' : 'list-only'}
              hasSuggestions={sbHasKwSuggestions}
              isVcpm={sbGoal === 'impression-share'}
              suggestions={SUGGESTED_KWS}
              themeGroups={SB_THEME_GROUPS}
              keywords={addedKws.filter(k => k.type !== 'group')}
              onKeywords={setAddedKws}
              groups={sbAddedTargetGroups}
              onGroups={setSbAddedTargetGroups}
            />
          )}

          {/* ─── PRODUCT TARGETING CARD — manual collection + product targeting selected ─── */}
          {((sbCollectionType === 'manual' && sbProducts.length >= 3) || (sbAdFormat === 'store-spotlight' && sbSSStore) || sbAdFormat === 'video') && (sbAdFormat !== 'store-spotlight' || sbSSStore) && sbTargetType === 'product' && (sbAdFormat !== 'video' || sbLandingPage !== 'product-detail' || !!sbVidPDPProduct) && !(sbGoal === 'impression-share' && (sbAdFormat === 'video' || sbAdFormat === 'store-spotlight')) && (
            <div className="ccs-card">
              <div className="ccs-card-header">
                <span className="ccs-card-heading">Product Targeting <InfoIcon /></span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                  <CircleHelp size={13} /> How to use product targeting
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
                          <div className="tg-empty">
                            <strong>No relevant categories available</strong>
                            <button type="button" className="tg-empty-link" onClick={() => setPtCatTab('search')}>Try searching for categories</button>
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
                          <div className="tg-empty">
                            <strong>No suggestions available.</strong>
                            <button type="button" className="tg-empty-link" onClick={() => setPtIndivSubTab('search')}>Try searching for products.</button>
                          </div>
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
                                <IndivProductRow key={p.id} product={p} image={getIndivImage(p)} types={[ptIndivFilterExact && 'Exact', ptIndivFilterExpanded && 'Expanded'].filter(Boolean)} isAdded={(t) => !!addedProdTargets.find(x => x.id === `indiv-${p.id}-${t.toLowerCase()}`)} onAdd={(t) => addProdTarget(t === 'Exact' ? { id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] } : { id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded', brands: [] })} />
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
                                <IndivProductRow key={p.id} product={p} image={getIndivImage(p)} types={[ptIndivFilterExact && 'Exact', ptIndivFilterExpanded && 'Expanded'].filter(Boolean)} isAdded={(t) => !!addedProdTargets.find(x => x.id === `indiv-${p.id}-${t.toLowerCase()}`)} onAdd={(t) => addProdTarget(t === 'Exact' ? { id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] } : { id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded', brands: [] })} />
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
                    <button className="link-btn tg-remove-all" disabled={addedProdTargets.length === 0} onClick={() => setAddedProdTargets([])}>Remove all</button>
                  </div>
                  <div className="ccs-pt-right-head">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Categories and products</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Sugg. bid <InfoIcon /><br/><button className="link-btn" style={{ fontSize: 11, fontWeight: 500 }} onClick={() => setAddedProdTargets(p => p.map(t => ({ ...t, bid: t.sugg ? t.sugg.toFixed(2) : t.bid })))}>Apply all</button></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Bid</span>
                  </div>
                  {addedProdTargets.length === 0 ? (
                    <div className="ccs-kw-right-empty" />
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
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> How to use negative keywords</a>
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
                    ? <div className="ccs-kw-right-empty" />
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
                <CircleHelp size={13} /> How to choose negative products for targeting
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
          {sbIsUnlocked && <div className="ccs-card" style={{ marginBottom: 16 }}>
            <div className="ccs-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Campaign Bid Adjustments</span>
                <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> Learn about bid adjustments</a>
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
          </div>}


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
  if (campaignType === 'Sponsored Display' && !adGroupMode) return <SdBuilder />;

  // Adding an ad group to a campaign that no longer exists: back to Campaigns.
  if (adGroupMode && !parentCampaign) return <Navigate to={ROUTES.allCampaigns} replace />;

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

          {launchErrors.length > 0 && (
            <div className="sb-alert" role="alert">
              <strong>Fix the following to {adGroupMode ? 'create your ad group' : 'launch your campaign'}:</strong>
              <ul>{launchErrors.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}

          {/* ══ CAMPAIGN SETUP (Standard / Preset) ══ */}
          {!adGroupMode && <CampaignSetupCard value={spSetup} onChange={changeSpSetup} />}

          {/* ══ AD GROUPS ══ */}
          {!isPreset && <>
          <div className="ccs-section-title">Ad Groups</div>

          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Ad group settings</span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <CircleHelp size={13} /> How to create an ad group
              </a>
            </div>
            <div className="ccs-card-body">
              <div className="ccs-field">
                <label className="ccs-label">Ad group name <InfoIcon /></label>
                <input className="ccs-input-full" value={adGroupName} onChange={e => setAdGroupName(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ══ SITES ══ */}
          <SitesCard value={spSite} onChange={setSpSite} isReadOnly={adGroupMode} />
          {isBusinessSite && <p className="sb-notice">To view your products, you must sign in to your Amazon Business shopper account.</p>}
          </>}

          {/* ══ PRODUCTS ══ */}
          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Products <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <CircleHelp size={13} /> How to add products to your campaign
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
                                <span className="ccs-product-price-tag">₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                <span className={`ccs-stock-badge ${p.status === 'In stock' ? 'in' : 'out'}`}>
                                  {p.status !== 'In stock' && <InfoIcon />} {p.status}
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
                  <strong>{addedProducts.length} product{addedProducts.length === 1 ? '' : 's'}</strong>
                  {addedProducts.length > 1 && (
                    <button className="link-btn" style={{ fontSize: 12 }} onClick={() => setAddedProducts([])}>Remove all</button>
                  )}
                </div>
                {addedProducts.length === 0 ? (
                  <div className="ccs-added-empty">Add products</div>
                ) : (
                  <div className="ccs-added-list">
                    {addedProducts.map(p => (
                      <div key={p.asin} className="pd-added">
                        <ProductImage imageType={p.imageType} size={60} />
                        <div className="pd-info">
                          <span className="pd-title">{p.name}</span>
                          <span className="pd-meta"><Stars rating={p.rating} /><span className="pd-count">({p.reviews})</span><span className="pd-price">₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
                          <span className={`pd-stock ${p.status === 'In stock' ? '' : 'is-out'}`}>{p.status !== 'In stock' && <InfoIcon />} {p.status}</span>
                          <span className="pd-id">ASIN: {p.asin}</span>
                          <span className="pd-id">SKU: {p.sku}</span>
                        </div>
                        <button className="pd-remove" aria-label="Remove" onClick={() => removeProduct(p.asin)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ PRESET: only name, dates and budget ══ */}
          {isPreset && (
            <PresetSettingsCard
              name={campaignName} onName={setCampaignName}
              startDate={startDate} onStartDate={setStartDate}
              endDate={endDate} onEndDate={setEndDate}
              budget={budget} onBudget={setBudget}
            />
          )}

          {!isPreset && <>
          {/* ══ TARGETING ══ */}
          {!adGroupMode && (
          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Targeting <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <CircleHelp size={13} /> Choose automatic or manual targeting
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
                  <CircleHelp size={13} /> How to set bid pricing
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
                          <span className="ccs-sugg-val">{addedProducts.length === 0 ? '-' : <>₹{AUTO_DEFAULT_SUGG.sugg.toFixed(2)} <span className="tg-range">(₹{AUTO_DEFAULT_SUGG.min.toFixed(2)}-₹{AUTO_DEFAULT_SUGG.max.toFixed(2)})</span></>}</span>
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
                              {addedProducts.length > 0 ? (
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
                                <span className="ccs-tg-sugg-blank">-</span>
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
                  <CircleHelp size={13} /> Choose keyword or product targeting
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
                  <CircleHelp size={13} /> How to add keywords
                </a>
              </div>
              <div className="ccs-kw-layout">
                {/* ── Left panel ── */}
                <div className="ccs-kw-left">
                  <div className="ccs-tab-row">
                    {[['suggested','Suggested'],['enter-list','Enter list'],['upload','Upload file']].map(([k, l]) => (
                      <button key={k} className={`ccs-tab ${kwSugTab === k ? 'active' : ''}`} onClick={() => setKwSugTab(k)}>
                        {l}{k === 'suggested' && <> <InfoIcon /></>}
                      </button>
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

                      {/* Keyword groups (only once products are added) */}
                      {hasProducts && <div className="ccs-kw-group-section">
                        <div className="kwg-hdr kwg-hdr-groups">
                          <span>Keyword groups <InfoIcon /> <span className="sb-badge">Beta</span></span>
                          <span>Sugg. bid <InfoIcon /><br/><span className="kwg-sub">Regular days</span></span>
                          <button className={`kwg-add ${kwGroupAdded ? 'is-done' : ''}`} disabled={kwGroupAdded} onClick={addKwGroup}>Add All</button>
                        </div>
                        <div className="kwg-group-row">
                          <span>Keywords related to your product category <InfoIcon /></span>
                          <span className="kwg-group-sugg">
                            {addedProducts.length === 0 ? '-' : kwBidMode === 'suggested'
                              ? `₹${KW_GROUP.suggBid.toFixed(2)}`
                              : `₹${KW_GROUP.suggMin.toFixed(2)} - ₹${KW_GROUP.suggMax.toFixed(2)}`}
                          </span>
                          {kwGroupAdded
                            ? <span className="kwg-added kwg-added-italic">Added</span>
                            : <button className="kwg-add" onClick={addKwGroup}>Add</button>}
                        </div>
                      </div>}

                      {/* Individual keyword rows */}
                      <div className="ccs-kw-sugg-table">
                        <div className="kwg-hdr">
                          <span>Keyword<br/><span className="kwg-sub">IS | IR <TipIcon tip={TIP_IS_IR} /></span></span>
                          <span className="kwg-hdr-mid">Match type <TipIcon tip={TIP_MATCH_TYPE} /></span>
                          <span>Sugg. bid <TipIcon tip={TIP_SUGG_BID} /><br/><span className="kwg-sub">Regular days</span></span>
                          <button className="kwg-add" onClick={addAllSuggKws}>Add All</button>
                        </div>
                        {!hasProducts && (
                          <div className="tg-empty">
                            <strong>No related keywords</strong>
                            <button type="button" className="tg-empty-link" onClick={() => setKwSugTab('enter-list')}>Try entering your own keywords</button>
                          </div>
                        )}
                        {hasProducts && SUGGESTED_KWS.map(s => {
                          const matches = ['broad', 'phrase', 'exact'].filter(m => kwFilters[m]);
                          if (matches.length === 0) return null;
                          return (
                            // Console layout: keyword + IS in the first column, spanning one row per match type.
                            <div key={s.kw} className="kwg-block">
                              <div className="kwg-name" style={{ gridRow: `1 / span ${Math.max(1, matches.length)}` }}>
                                <span>{s.kw}</span>
                                <span className="kwg-is">IS: {s.is || 0}{s.ir ? ` | IR: ${s.ir}` : ''}</span>
                              </div>
                              {matches.map(m => {
                                const mt = m.charAt(0).toUpperCase() + m.slice(1);
                                const kd = s[m];
                                const isAdded = !!addedKws.find(k => k.type !== 'group' && k.keyword === s.kw && k.matchType === mt);
                                return (
                                  <Fragment key={m}>
                                    <span className="kwg-mt">{mt}</span>
                                    <span className="kwg-bid">
                                      {kwBidMode === 'suggested'
                                        ? `₹${kd.sugg.toFixed(2)}`
                                        : `₹${kd.min.toFixed(2)} - ₹${kd.max.toFixed(2)}`}
                                    </span>
                                    {isAdded
                                      ? <span className="kwg-added">Added</span>
                                      : <button className="kwg-add" onClick={() => addKwFromSugg(s.kw, mt, kd)}>Add</button>}
                                  </Fragment>
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
                    <button className="link-btn tg-remove-all" disabled={addedKws.length === 0} onClick={() => setAddedKws([])}>Remove all</button>
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
                    <div className="ccs-kw-right-empty" />
                  ) : (
                    addedKws.map((k, i) => (
                      <div key={i} className="ccs-kw-right-row">
                        <div>
                          <div style={{ fontSize: 13 }}>{k.type === 'group' ? k.name : k.keyword}</div>
                          {k.type === 'group' && <div style={{ fontSize: 11, color: '#888' }}>Keyword group</div>}
                          {!validBid(k.bid) && <div className="sb-error sb-error-inline">! {k.bid === '' ? 'Enter a bid' : 'Bid must be at least ₹1.00'}</div>}
                        </div>
                        <div>
                          {k.matchType
                            ? <span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span>
                            : <span style={{ color: '#888' }}>-</span>
                          }
                        </div>
                        <div style={{ fontSize: 12 }}>
                          {k.type === 'group' && !hasProducts ? <span style={{ color: '#767676' }}>-</span> : k.suggBid != null ? (
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
                            <button className="ccs-remove-btn" onClick={() => { if (k.type === 'group') setKwGroupDismissed(true); setAddedKws(p => p.filter((_, j) => j !== i)); }}>×</button>
                          </div>
                          {k.isDefaultBid && <span style={{ fontSize: 11, color: '#888' }}>Default bid</span>}
                        </div>
                      </div>
                    ))
                  )}
                  {kwListHasErrors && <div className="sb-list-error">! You have one or more errors in this list</div>}
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
                  <CircleHelp size={13} /> How to use product targeting
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
                          <div className="tg-empty">
                            <strong>No relevant categories available</strong>
                            <button type="button" className="tg-empty-link" onClick={() => setPtCatTab('search')}>Try searching for categories</button>
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
                          <div className="tg-empty">
                            <strong>No suggestions available.</strong>
                            <button type="button" className="tg-empty-link" onClick={() => setPtIndivSubTab('search')}>Try searching for products.</button>
                          </div>
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
                                <IndivProductRow key={p.id} product={p} image={getIndivImage(p)} types={[ptIndivFilterExact && 'Exact', ptIndivFilterExpanded && 'Expanded'].filter(Boolean)} isAdded={(t) => !!addedProdTargets.find(x => x.id === `indiv-${p.id}-${t.toLowerCase()}`)} onAdd={(t) => addProdTarget(t === 'Exact' ? { id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] } : { id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded', brands: [] })} />
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
                                <IndivProductRow key={p.id} product={p} image={getIndivImage(p)} types={[ptIndivFilterExact && 'Exact', ptIndivFilterExpanded && 'Expanded'].filter(Boolean)} isAdded={(t) => !!addedProdTargets.find(x => x.id === `indiv-${p.id}-${t.toLowerCase()}`)} onAdd={(t) => addProdTarget(t === 'Exact' ? { id: `indiv-${p.id}-exact`, name: p.name.slice(0, 50), sugg: p.sugg, bid: p.sugg ? p.sugg.toFixed(2) : '3.00', type: 'Exact', brands: [] } : { id: `indiv-${p.id}-expanded`, name: p.name.slice(0, 50), sugg: p.suggExpanded || null, bid: p.suggExpanded ? p.suggExpanded.toFixed(2) : '3.00', type: 'Expanded', brands: [] })} />
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
                    <button className="link-btn tg-remove-all" disabled={addedProdTargets.length === 0} onClick={() => setAddedProdTargets([])}>Remove all</button>
                  </div>
                  <div className="ccs-pt-right-head">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Categories and products</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Sugg. bid <InfoIcon /><br/><button className="link-btn" style={{ fontSize: 11, fontWeight: 500 }} onClick={() => setAddedProdTargets(p => p.map(t => ({ ...t, bid: t.sugg ? t.sugg.toFixed(2) : t.bid })))}>Apply all</button></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Bid</span>
                  </div>
                  {addedProdTargets.length === 0 ? (
                    <div className="ccs-kw-right-empty" />
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

          {/* ══ NEGATIVE KEYWORD / PRODUCT TARGETING ══ */}
          <NegativeCards
            negKeywords={spNegKws}
            onNegKeywords={setSpNegKws}
            negProducts={spNegProds}
            onNegProducts={setSpNegProds}
            ownBrand={allProducts[0]?.brand || 'SoundMax'}
            searchableProducts={[...allProducts, ...INDIV_SUGGESTED.map(p => ({ asin: p.asin, name: p.name }))]}
          />

          {/* ══ CAMPAIGN ══ */}
          <div className="ccs-section-title">Campaign</div>

          {/* Bidding strategy */}
          <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Campaign bidding strategy <InfoIcon /></span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <CircleHelp size={13} /> How to set your bid strategy
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
                <button className={`ccs-tab ${placementTab==='placements'?'active':''}`} onClick={() => setPlacementTab('placements')}>
                  Placements{adGroupMode && activePlacementCount > 0 && <span className="sb-tab-count">{activePlacementCount}</span>}
                </button>
                <button className={`ccs-tab ${placementTab==='audiences'?'active':''}`} onClick={() => setPlacementTab('audiences')}>
                  Audiences <span className="ccs-new-badge">New</span>
                </button>
              </div>
            </div>
            <div className="ccs-bid-adj-body">
              <div className="ccs-bid-adj-left">
                {placementTab === 'placements' && (
                  <>
                    <p className="ccs-radio-desc" style={{ marginBottom: 14 }}>
                      {isBusinessSite ? 'Increase your bid for specific Amazon Business placements.' : 'Increase your bid for specific Amazon placements.'} <InfoIcon />
                    </p>
                    {effectivePlacements.map(pl => (
                      <div key={pl.key} className="ccs-placement-inline-row">
                        <span className="ccs-placement-label">{pl.label}</span>
                        {adGroupMode ? (
                          <span className="sb-readonly-pct">{pl.val}%</span>
                        ) : (
                          <div className="ccs-pct-input-wrap">
                            <input type="number" className="ccs-pct-input" value={pl.val} min="0" max="900"
                              onChange={e => pl.set(String(Math.min(900, Math.max(0, parseInt(e.target.value) || 0))))} />
                            <span className="ccs-pct-sign">%</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <p className="ccs-placement-summary">{placementExample}</p>
                    {!isBusinessSite && !adGroupMode && (
                      <>
                        <label className="ccs-biz-check-row">
                          <input type="checkbox" checked={bizCheck} onChange={e => setBizCheck(e.target.checked)} />
                          <span>Further increase bids across placements on Amazon Business <InfoIcon /></span>
                        </label>
                        <div className="ccs-biz-tip">
                          <span className="ccs-biz-tip-icon">💡</span>
                          <span>On average, advertisers see a 2x to 3x higher return on ad spending on Amazon Business relative to the overall campaign performance (Amazon internal data, 2024).</span>
                        </div>
                      </>
                    )}
                    {adGroupMode && !isBusinessSite && (
                      <>
                        <p className="sb-subhead">Further increase bids across placements on Amazon Business</p>
                        <div className="ccs-placement-inline-row">
                          <span className="ccs-placement-label">Amazon Business placements</span>
                          <span className="sb-readonly-pct">{parentCampaign?.placementAdjustments?.business || 0}%</span>
                        </div>
                        <p className="ccs-placement-summary">{placementExample}</p>
                      </>
                    )}
                  </>
                )}
                {placementTab === 'audiences' && (
                  <AudienceAdjustments
                    value={adGroupMode ? (parentCampaign?.audienceAdjustment || { mode: 'none' }) : audienceAdj}
                    onChange={setAudienceAdj}
                    baseBid={parseFloat(defaultBid) || 0}
                    strategy={effectiveBiddingStrategy}
                    isReadOnly={adGroupMode}
                  />
                )}
              </div>
              <div className="ccs-bid-adj-right">
                <AdjustmentSummary
                  placements={Object.fromEntries(effectivePlacements.map(pl => [pl.key, pl.val]))}
                  strategy={effectiveBiddingStrategy}
                  audience={adGroupMode ? parentCampaign?.audienceAdjustment : audienceAdj}
                />
              </div>
            </div>
          </div>

          {/* Settings — hidden in ad group mode */}
          {!adGroupMode && <div className="ccs-card">
            <div className="ccs-card-header">
              <span className="ccs-card-heading">Settings</span>
              <a href="#" className="ccs-help-link" onClick={e => e.preventDefault()}>
                <CircleHelp size={13} /> How to set up your campaign
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
                  <DateField value={startDate} onChange={setStartDate} min={today} />
                </div>
                <div className="ccs-field">
                  <label className="ccs-label">End <InfoIcon /></label>
                  <DateField value={endDate} onChange={setEndDate} min={startDate} isClearable placeholder="No end date" />
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
              </div>
              {!isBusinessSite && targetingType === 'Auto' && (
                <label className="sb-check" style={{ marginTop: 14 }}>
                  <input type="checkbox" checked={extraCountry} onChange={e => setExtraCountry(e.target.checked)} />
                  <span>
                    <strong>Launch your campaign in 1 additional country <span className="sb-badge">Beta</span></strong>
                    <a href="#global" className="sb-help" onClick={e => e.preventDefault()}>Learn about global campaigns</a>
                    <small>For each country, we will add your eligible matching products and optimise keywords, bids, and budgets to help drive traffic.</small>
                  </span>
                </label>
              )}
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
                <CircleHelp size={13} /> Learn about automatic rules
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
          </>}

          {/* Bottom launch */}
          <div className="ccs-bottom-bar">
            <div />
            <div style={{ display: 'flex', gap: 10 }}>
              {!adGroupMode && <button className="btn btn-secondary" onClick={() => navigate('/cb')}>Save as draft</button>}
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

        {/* ── FORECAST SIDEBAR (not shown when adding an ad group) ── */}
        {!adGroupMode && (
          <div className="ccs-sidebar">
            <ForecastPanel forecast={forecast} period={forecastPeriod} onPeriod={setForecastPeriod} />
          </div>
        )}

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
