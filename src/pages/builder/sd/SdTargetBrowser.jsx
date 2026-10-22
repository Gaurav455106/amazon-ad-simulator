import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { MoneyInput, PillSelect, SubTabs } from './SdBits';
import { SD_DYNAMIC_SEGMENTS, SD_TARGET_GROUPS, DEFAULT_LOOKBACK, LOOKBACK_DAYS } from './sdConfig';
import { COMPETITOR_PRODUCTS, PRODUCT_GATED_SUGGESTIONS, TREE_FOR_GROUP, flattenTree, pseudoSugg } from './sdTaxonomy';
import { AddedTarget, NoCategories, OptionRow, SectionLabel, SuggestionBar, TreeRow } from './SdTargetParts';

const ASIN_RE = /^B[0-9A-Z]{9}$/;
const TYPE_FOR_GROUP = { contextual: 'Contextual', 'in-market': 'In-market', 'interest-lifestyle': 'Interest & lifestyle' };
const BROWSE_HEADING = { contextual: 'All product categories', remarketing: 'All audience categories', 'in-market': 'All audiences', 'interest-lifestyle': 'All audiences' };
const SUGGEST_HEADING = { contextual: 'Product categories', remarketing: 'Audience categories', 'in-market': 'Audiences', 'interest-lifestyle': 'Audiences' };
const LOCKED_BID_MESSAGE = 'Bid controls are not available when you set a desired outcome for a primary metric. We will optimise bids to meet the desired outcome.';
const FLAT = Object.fromEntries(Object.entries(TREE_FOR_GROUP).map(([g, tree]) => [g, flattenTree(tree)]));

/**
 * The Display "Targeting" browser: category list → drill-down per targeting group, with the
 * "N added" panel on the right. Used inline (Reach / Page visits) and in the Manual targeting drawer.
 */
export default function SdTargetBrowser({ targets, onTargets, hasProducts, isCostControl, bidUnit }) {
  const [view, setView] = useState(null);
  const [query, setQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [ctxTab, setCtxTab] = useState('categories');
  const [catTab, setCatTab] = useState('suggested');
  const [indivTab, setIndivTab] = useState('suggested');
  const [audTab, setAudTab] = useState('suggested');
  const [lookbackType, setLookbackType] = useState('views');
  const [lookbackDays, setLookbackDays] = useState(DEFAULT_LOOKBACK);
  const [bidMode, setBidMode] = useState('suggested');
  const [customBid, setCustomBid] = useState('');
  const [asinText, setAsinText] = useState('');
  const [notice, setNotice] = useState('');
  const [isLockOpen, setIsLockOpen] = useState(false);

  const isAdded = (key) => targets.some(t => t.key === key);
  const bidFor = (key) => {
    if (isCostControl) return '';
    if (bidMode === 'custom') return customBid;
    return hasProducts ? pseudoSugg(key).sugg.toFixed(2) : '';
  };
  const add = (items) => onTargets([...targets, ...items.filter(t => !isAdded(t.key)).map(t => ({ ...t, bid: bidFor(t.key) }))]);
  const fromSegment = (s) => ({ ...s, lookbackDays: s.lookbackType ? lookbackDays : undefined });
  const fromNode = (group, n) => (group === 'remarketing'
    ? { key: `${n.id}-${lookbackType}`, group, type: `${lookbackType === 'views' ? 'Views' : 'Purchases'} remarketing`, label: n.name, lookbackType, lookbackDays }
    : { key: n.id, group, type: TYPE_FOR_GROUP[group], label: n.name });
  const fromProduct = (p) => ({ key: `asin-${p.asin}`, group: 'product', type: 'Contextual · Product', label: p.name, sub: `ASIN: ${p.asin}` });
  const gated = (group) => (hasProducts ? PRODUCT_GATED_SUGGESTIONS[group].map(id => FLAT[group].find(n => n.id === id)) : []);

  const open = (key) => { setView(key); setQuery(''); setNotice(''); };
  const groupLabel = SD_TARGET_GROUPS.find(g => g.key === view)?.label;

  const bidRow = (
    <div className="sd-bid-row">
      <span className="sd-field-label">Bid <Info size={12} /></span>
      <PillSelect value={isCostControl ? 'suggested' : bidMode} onChange={setBidMode} isDisabled={isCostControl}
        onDisabledClick={() => setIsLockOpen(o => !o)} ariaLabel="Bid type"
        options={[
          { value: 'suggested', label: 'Suggested bid', desc: 'Based on past bidding activity to predict bids that are more likely to win' },
          { value: 'custom', label: 'Custom bid', desc: 'Can customise bids for each target without overriding your set bid amount' },
        ]} />
      {!isCostControl && bidMode === 'custom' && <MoneyInput value={customBid} onChange={setCustomBid} width={92} ariaLabel="Custom bid" />}
      <span className="sd-unit">{bidUnit}</span>
      {isLockOpen && isCostControl && <p className="sd-lock-tip" role="note">{LOCKED_BID_MESSAGE}</p>}
    </div>
  );

  const lookbackRow = (
    <div className="sd-bid-row">
      <span className="sd-field-label">Lookback</span>
      <PillSelect value={lookbackType} onChange={setLookbackType} ariaLabel="Lookback type"
        options={[{ value: 'views', label: 'Views' }, { value: 'purchases', label: 'Purchases' }]} />
      <PillSelect value={lookbackDays} onChange={setLookbackDays} ariaLabel="Lookback days"
        options={LOOKBACK_DAYS.map(d => ({ value: d, label: `${d} days` }))} />
    </div>
  );

  const browse = (group) => (
    <div className="sd-scroll">
      <SectionLabel>{BROWSE_HEADING[group]}</SectionLabel>
      {TREE_FOR_GROUP[group].map(n => (
        <TreeRow key={n.id} node={n} query={query} isAdded={(id) => isAdded(group === 'remarketing' ? `${id}-${lookbackType}` : id)}
          onAdd={(node) => add([fromNode(group, node)])} />
      ))}
    </div>
  );

  const suggested = (group) => {
    const segs = SD_DYNAMIC_SEGMENTS.filter(s => s.group === group && (group !== 'remarketing' || s.lookbackType === lookbackType));
    const nodes = gated(group);
    const all = [...segs.map(fromSegment), ...nodes.map(n => fromNode(group, n))];
    return (
      <div className="sd-scroll">
        <SuggestionBar count={all.length} onAddAll={() => add(all)} />
        {segs.length > 0 && <SectionLabel>Dynamic segments <Info size={12} /></SectionLabel>}
        {segs.map(s => <OptionRow key={s.key} caption={s.type} label={s.label} desc={s.desc} isAdded={isAdded(s.key)} onAdd={() => add([fromSegment(s)])} />)}
        <SectionLabel>{SUGGEST_HEADING[group]}</SectionLabel>
        {nodes.length === 0 ? <NoCategories /> : nodes.map(n => {
          const t = fromNode(group, n);
          return <OptionRow key={t.key} caption={t.type} label={n.name} isAdded={isAdded(t.key)} onAdd={() => add([t])} />;
        })}
      </div>
    );
  };

  const productSearch = () => {
    const q = productQuery.trim().toLowerCase();
    const hits = q ? COMPETITOR_PRODUCTS.filter(p => `${p.name} ${p.asin}`.toLowerCase().includes(q)) : [];
    return (
      <div className="sd-scroll">
        <div className="sd-pad-sm"><label className="sd-search"><Search size={14} /><input placeholder="Search by product name or ASIN" value={productQuery} onChange={e => setProductQuery(e.target.value)} /></label></div>
        {!q && <p className="sd-center-msg">Search for products you want to target.</p>}
        {q && hits.length === 0 && <p className="sd-center-msg">No products found for "{productQuery}".</p>}
        {hits.map(p => <OptionRow key={p.asin} label={p.name} sub={`ASIN: ${p.asin}`} isAdded={isAdded(`asin-${p.asin}`)} onAdd={() => add([fromProduct(p)])} />)}
      </div>
    );
  };

  const addAsins = () => {
    const asins = [...new Set(asinText.split(/[\s,;]+/).map(a => a.trim().toUpperCase()).filter(Boolean))];
    const bad = asins.filter(a => !ASIN_RE.test(a));
    add(asins.filter(a => ASIN_RE.test(a)).map(a => fromProduct(COMPETITOR_PRODUCTS.find(p => p.asin === a) || { asin: a, name: a })));
    setNotice(bad.length ? `Invalid ASIN: ${bad.join(', ')}` : '');
    setAsinText('');
  };

  const contextual = () => (
    <>
      <SubTabs value={ctxTab} onChange={setCtxTab} className="sd-tabs-main"
        tabs={[{ key: 'categories', label: 'Categories', info: true }, { key: 'individual', label: 'Individual products', info: true }]} />
      {ctxTab === 'categories' ? (
        <>
          <SubTabs value={catTab} onChange={setCatTab} tabs={[{ key: 'suggested', label: 'Suggested', info: true }, { key: 'browse', label: 'Browse' }]} />
          {bidRow}
          {catTab === 'suggested' ? suggested('contextual') : browse('contextual')}
        </>
      ) : (
        <>
          <SubTabs value={indivTab} onChange={setIndivTab}
            tabs={[{ key: 'suggested', label: 'Suggested', info: true }, { key: 'search', label: 'Search' }, { key: 'list', label: 'Enter list' }]} />
          {bidRow}
          {indivTab === 'suggested' && (hasProducts
            ? <div className="sd-scroll">{COMPETITOR_PRODUCTS.map(p => <OptionRow key={p.asin} label={p.name} sub={`ASIN: ${p.asin}`} isAdded={isAdded(`asin-${p.asin}`)} onAdd={() => add([fromProduct(p)])} />)}</div>
            : <p className="sd-center-msg">No suggestions available. <button type="button" className="sd-link" onClick={() => setIndivTab('search')}>Try searching for products.</button></p>)}
          {indivTab === 'search' && productSearch()}
          {indivTab === 'list' && (
            <div className="sd-pad-sm">
              <textarea className="sd-textarea" placeholder="Enter ASINs separated by a comma, space or new line." value={asinText} onChange={e => setAsinText(e.target.value)} />
              {notice && <p className="sd-notice">{notice}</p>}
              <div className="sd-actions"><button type="button" className="sd-btn" disabled={!asinText.trim()} onClick={addAsins}>Add</button></div>
            </div>
          )}
        </>
      )}
    </>
  );

  const audiences = (group) => (
    <>
      <SubTabs value={audTab} onChange={setAudTab} tabs={[{ key: 'suggested', label: 'Suggested', info: true }, { key: 'browse', label: 'Browse' }]} />
      {bidRow}
      {group === 'remarketing' && lookbackRow}
      {audTab === 'suggested' ? suggested(group) : browse(group)}
    </>
  );

  const q = query.trim().toLowerCase();
  const searchHits = !view && q ? Object.entries(FLAT).flatMap(([g, nodes]) => nodes.filter(n => n.name.toLowerCase().includes(q)).map(n => ({ g, n }))) : [];

  return (
    <div className="sd-split sd-split-targeting">
      <div className="sd-split-left">
        <div className="sd-target-tools">
          <PillSelect value={view || 'all'} ariaLabel="Targeting type" width={86}
            onChange={(v) => open(v === 'all' ? null : v)}
            options={[{ value: 'all', label: 'All' }, ...SD_TARGET_GROUPS.map(g => ({ value: g.key, label: g.label }))]} />
          <label className="sd-search sd-grow"><Search size={14} /><input placeholder="Search targeting" value={query} onChange={e => setQuery(e.target.value)} /></label>
        </div>
        {!view && !q && SD_TARGET_GROUPS.map(g => (
          <button type="button" key={g.key} className="sd-group-row" onClick={() => open(g.key)}>
            <span><strong>{g.label}</strong><span>{g.desc}</span></span><ChevronRight size={16} />
          </button>
        ))}
        {!view && q && (
          <div className="sd-scroll">
            {searchHits.length === 0 && <p className="sd-center-msg">No targeting options match "{query}".</p>}
            {searchHits.map(({ g, n }) => {
              const t = fromNode(g, n);
              return <OptionRow key={t.key} caption={SD_TARGET_GROUPS.find(x => x.key === g).label} label={n.name} sub={n.path.join(' › ')} isAdded={isAdded(t.key)} onAdd={() => add([t])} />;
            })}
          </div>
        )}
        {view && (
          <>
            <button type="button" className="sd-back" onClick={() => open(null)}><ChevronLeft size={14} /> Back</button>
            <h3 className="sd-drill-title">{groupLabel} <Info size={13} /></h3>
            {view === 'contextual' ? contextual() : audiences(view)}
          </>
        )}
      </div>
      <div className="sd-split-right">
        <div className="sd-right-head"><strong>{targets.length} added</strong>
          <button type="button" className="sd-link" disabled={targets.length === 0} onClick={() => onTargets([])}>Remove all</button></div>
        <div className="sd-added-cols"><span>Audiences, categories, products</span><span>Bid <Info size={12} /></span></div>
        <div className="sd-added-list">
          {targets.map(t => (
            <AddedTarget key={t.key} target={t} isCostControl={isCostControl}
              onChange={(patch) => onTargets(targets.map(x => (x.key === t.key ? { ...x, ...patch } : x)))}
              onRemove={() => onTargets(targets.filter(x => x.key !== t.key))} />
          ))}
        </div>
      </div>
    </div>
  );
}
