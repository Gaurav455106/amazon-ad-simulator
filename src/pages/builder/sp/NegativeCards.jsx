import { useState } from 'react';
import { ChevronDown, ChevronRight, CircleHelp, Search, X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import ProductLink from '../../../components/console/ProductLink';

const ASIN_RE = /^B[0-9A-Z]{9}$/;
const NEG_MATCH = [
  { key: 'Exact', label: 'Negative exact' },
  { key: 'Phrase', label: 'Negative phrase' },
];

function Collapsible({ title, help, isOpen, onToggle, children }) {
  return (
    <section className="ccs-card ccs-collapsible">
      <button type="button" className="ccs-collapsible-header" onClick={onToggle}>
        <div className="ccs-collapsible-left">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="ccs-card-heading">{title} <Info size={14} /></span>
          <span className="ccs-optional-tag">optional</span>
        </div>
        <a href="#help" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> {help}</a>
      </button>
      {isOpen && <div className="ng-layout">{children}</div>}
    </section>
  );
}

function AddedPanel({ count, onClear, columns, children }) {
  return (
    <div className="ng-right">
      <div className="ng-right-head">
        <strong>{count} added</strong>
        <button type="button" className="link-btn tg-remove-all" disabled={count === 0} onClick={onClear}>Remove all</button>
      </div>
      <div className="ng-cols">{columns}</div>
      {children}
    </div>
  );
}

/**
 * "Negative keyword targeting" and "Negative product targeting" cards of the SP builder.
 * Negative keywords: { keyword, matchType: 'Exact'|'Phrase' }.
 * Negative products: { kind: 'brand', brand } | { kind: 'product', asin, name }.
 */
export default function NegativeCards({ negKeywords, onNegKeywords, negProducts, onNegProducts, ownBrand, searchableProducts }) {
  const [isKwOpen, setIsKwOpen] = useState(false);
  const [isProdOpen, setIsProdOpen] = useState(false);
  const [matchType, setMatchType] = useState('Exact');
  const [kwText, setKwText] = useState('');
  const [prodTab, setProdTab] = useState('brands');
  const [prodSub, setProdSub] = useState('search');
  const [brandQuery, setBrandQuery] = useState('');
  const [prodQuery, setProdQuery] = useState('');
  const [asinText, setAsinText] = useState('');
  const [asinError, setAsinError] = useState('');

  const addKeywords = () => {
    const words = [...new Set(kwText.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean))];
    const fresh = words.filter(w => !negKeywords.some(n => n.keyword === w && n.matchType === matchType));
    onNegKeywords([...negKeywords, ...fresh.map(keyword => ({ keyword, matchType }))]);
    setKwText('');
  };

  const isExcluded = (item) => negProducts.some(n => (item.kind === 'brand' ? n.brand === item.brand : n.asin === item.asin));
  const exclude = (item) => { if (!isExcluded(item)) onNegProducts([...negProducts, item]); };

  const excludeAsins = (text) => {
    const asins = [...new Set(text.split(/[\s,]+/).map(a => a.trim().toUpperCase()).filter(Boolean))];
    const bad = asins.filter(a => !ASIN_RE.test(a));
    if (bad.length) { setAsinError(`Invalid ASIN: ${bad.join(', ')}`); return; }
    setAsinError('');
    asins.forEach(asin => exclude({ kind: 'product', asin, name: searchableProducts.find(p => p.asin === asin)?.name || asin }));
    setAsinText('');
  };

  const onUpload = async (file) => {
    if (!file) return;
    try { excludeAsins(await file.text()); } catch { setAsinError('We could not read that file. Upload a CSV, TSV or TXT file.'); }
  };

  const q = prodQuery.trim().toLowerCase();
  const matches = q ? searchableProducts.filter(p => `${p.name} ${p.asin}`.toLowerCase().includes(q)) : [];
  const brandMatch = !brandQuery || ownBrand.toLowerCase().includes(brandQuery.toLowerCase());

  return (
    <>
      <Collapsible title="Negative keyword targeting" help="How to use negative keywords" isOpen={isKwOpen} onToggle={() => setIsKwOpen(o => !o)}>
        <div className="ng-left">
          <div className="ng-match-row">
            <span className="ng-label">Match type <Info size={12} /></span>
            {NEG_MATCH.map(m => (
              <label key={m.key} className="ng-radio">
                <input type="radio" name="sp-neg-match" checked={matchType === m.key} onChange={() => setMatchType(m.key)} /> {m.label}
              </label>
            ))}
          </div>
          <textarea className="ng-textarea" placeholder="Enter keywords separated by new line." value={kwText} onChange={e => setKwText(e.target.value)} />
          <div className="ng-actions"><button type="button" className="ng-btn" disabled={!kwText.trim()} onClick={addKeywords}>Add keywords</button></div>
        </div>
        <AddedPanel count={negKeywords.length} onClear={() => onNegKeywords([])}
          columns={<><span>Keyword</span><span>Match type <Info size={12} /></span><span /></>}>
          {negKeywords.map((n, i) => (
            <div key={`${n.keyword}|${n.matchType}`} className="ng-item ng-item-kw">
              <span>{n.keyword}</span>
              <span>{n.matchType === 'Phrase' ? 'Negative phrase' : 'Negative exact'}</span>
              <button type="button" className="ng-x" aria-label="Remove" onClick={() => onNegKeywords(negKeywords.filter((_, j) => j !== i))}><X size={14} /></button>
            </div>
          ))}
        </AddedPanel>
      </Collapsible>

      <Collapsible title="Negative product targeting" help="How to choose negative products for targeting" isOpen={isProdOpen} onToggle={() => setIsProdOpen(o => !o)}>
        <div className="ng-left ng-left-flush">
          <div className="ng-main-tabs">
            {[['brands', 'Exclude brands'], ['products', 'Exclude products']].map(([k, l]) => (
              <button type="button" key={k} className={`ng-main-tab ${prodTab === k ? 'is-active' : ''}`} onClick={() => setProdTab(k)}>{l} <Info size={13} /></button>
            ))}
          </div>
          {prodTab === 'brands' ? (
            <div className="ng-pad">
              <label className="ng-search"><Search size={14} /><input placeholder="Search by brand name" value={brandQuery} onChange={e => setBrandQuery(e.target.value)} /></label>
              <div className="ng-brand-head"><span>YOUR BRANDS</span>
                <button type="button" className="ng-link" onClick={() => exclude({ kind: 'brand', brand: ownBrand })}>Exclude all</button></div>
              {brandMatch && (
                <div className="ng-brand-row"><span>{ownBrand}</span>
                  {isExcluded({ kind: 'brand', brand: ownBrand })
                    ? <span className="ng-muted">Excluded</span>
                    : <button type="button" className="ng-link" onClick={() => exclude({ kind: 'brand', brand: ownBrand })}>Exclude</button>}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="ng-sub-tabs">
                {[['search', 'Search'], ['list', 'Enter list'], ['upload', 'Upload']].map(([k, l]) => (
                  <button type="button" key={k} className={`ng-sub-tab ${prodSub === k ? 'is-active' : ''}`} onClick={() => setProdSub(k)}>{l}</button>
                ))}
              </div>
              {prodSub === 'search' && (
                <div className="ng-pad">
                  <label className="ng-search"><Search size={14} /><input placeholder="Search by product name or ASIN" value={prodQuery} onChange={e => setProdQuery(e.target.value)} /></label>
                  {!q && <p className="ng-hint">Search for products you want to exclude.</p>}
                  {q && matches.length === 0 && <p className="ng-hint">No products found for "{prodQuery}".</p>}
                  {matches.map(p => (
                    <div key={p.asin} className="ng-prod-row">
                      <span className="ng-prod-name"><ProductLink asin={p.asin}>{p.name}</ProductLink><small>ASIN: {p.asin}</small></span>
                      {isExcluded({ kind: 'product', asin: p.asin })
                        ? <span className="ng-muted">Excluded</span>
                        : <button type="button" className="ng-link" onClick={() => exclude({ kind: 'product', asin: p.asin, name: p.name })}>Exclude</button>}
                    </div>
                  ))}
                </div>
              )}
              {prodSub === 'list' && (
                <div className="ng-pad">
                  <textarea className="ng-textarea" placeholder="Enter ASINs separated by a comma, space or new line." value={asinText} onChange={e => setAsinText(e.target.value)} />
                  {asinError && <p className="sb-error">{asinError}</p>}
                  <div className="ng-actions"><button type="button" className="ng-btn" disabled={!asinText.trim()} onClick={() => excludeAsins(asinText)}>Exclude</button></div>
                </div>
              )}
              {prodSub === 'upload' && (
                <div className="ng-pad">
                  <p className="ng-hint ng-hint-left">Upload a CSV, TSV or TXT file with one ASIN per row.</p>
                  <label className="ng-drop">
                    <input type="file" accept=".csv,.tsv,.txt" onChange={e => onUpload(e.target.files?.[0])} />
                    <strong>Drag and drop the file to add</strong>
                    <span>or choose a file from your computer.</span>
                    <small>Accepted formats: CSV, TSV, TXT</small>
                  </label>
                  {asinError && <p className="sb-error">{asinError}</p>}
                </div>
              )}
            </>
          )}
        </div>
        <AddedPanel count={negProducts.length} onClear={() => onNegProducts([])} columns={<><span>Brands and products</span><span /></>}>
          {negProducts.map((n, i) => (
            <div key={n.brand || n.asin} className="ng-item">
              <span>{n.kind === 'brand' ? <>Brand: <strong>{n.brand}</strong></> : <>{n.name}<small>ASIN: {n.asin}</small></>}</span>
              <button type="button" className="ng-x" aria-label="Remove" onClick={() => onNegProducts(negProducts.filter((_, j) => j !== i))}><X size={14} /></button>
            </div>
          ))}
        </AddedPanel>
      </Collapsible>
    </>
  );
}
