import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Search, X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import ProductImage from '../../../components/console/ProductImage';
import { SB_MIN_PRODUCTS, SB_MAX_PRODUCTS, parseAsinList } from './limits';
import ProductLink from '../../../components/console/ProductLink';
const BEST_RESULTS_PRODUCTS = 5;
const PAGE_SIZE = 10;
const STAR_PATH = 'M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7z';

function Stars({ rating }) {
  return (
    <span className="sbp-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d={STAR_PATH} fill={rating >= i - 0.25 ? '#de7921' : 'none'} stroke="#de7921" strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}

function ProductMeta({ product: p }) {
  const isOut = p.status && p.status !== 'In stock';
  return (
    <>
      <span className="sbp-meta">
        <Stars rating={p.rating} /><span className="sbp-count">({p.reviews.toLocaleString('en-IN')})</span>
        <span className="sbp-sep" />Price may vary by location
        <span className="sbp-sep" /><span className={isOut ? 'sbp-out' : ''}>{isOut && <Info size={11} />} {p.status || 'In stock'}</span>
      </span>
      <span className="sbp-asin">ASIN: {p.asin}</span>
    </>
  );
}

/**
 * Sponsored Brands "Products" card (manual collection). Mirrors the console: Search / Enter list /
 * Upload on the left, the ordered product list on the right, 3–10 products required.
 * @param {{ catalogue: object[], products: object[], onChange: (next: object[]) => void, brand: string }} props
 */
export default function SbProductsCard({ catalogue, products, onChange, brand }) {
  const [tab, setTab] = useState('search');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [listText, setListText] = useState('');
  const [listError, setListError] = useState('');

  const count = products.length;
  const isAdded = (asin) => products.some(p => p.asin === asin);
  const isFull = count >= SB_MAX_PRODUCTS;
  const hasError = count > 0 && count < SB_MIN_PRODUCTS;
  const add = (items) => {
    const fresh = items.filter(p => !isAdded(p.asin)).slice(0, SB_MAX_PRODUCTS - count);
    if (fresh.length) onChange([...products, ...fresh]);
  };
  const remove = (asin) => onChange(products.filter(p => p.asin !== asin));
  const move = (from, to) => {
    if (to < 0 || to >= count) return;
    const next = [...products];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const addFromText = (text) => {
    const { found, invalid } = parseAsinList(text, catalogue);
    add(found);
    setListError(invalid.length ? `${invalid.length} ASIN${invalid.length > 1 ? 's' : ''} could not be added: ${invalid.join(', ')}` : '');
    setListText('');
  };
  const onUpload = async (file) => {
    if (!file) return;
    try { addFromText(await file.text()); } catch { setListError('We could not read that file. Upload a CSV or TXT file.'); }
  };

  const q = query.trim().toLowerCase();
  const results = catalogue.filter(p => !q || `${p.name} ${p.asin}`.toLowerCase().includes(q));
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const shown = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const exportCsv = () => {
    const csv = ['ASIN,Product', ...products.map(p => `${p.asin},"${p.name.replace(/"/g, '""')}"`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'sb-products.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={`ccs-card sbp-card ${hasError ? 'has-error' : ''}`}>
      <header className="sbp-head">
        <div>
          <h2 className="ccs-card-heading">Products</h2>
          <p>Choose related products to feature in your ad.</p>
        </div>
        <a href="#help" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> How to add products to your campaign</a>
      </header>
      <div className="sbp-layout">
        <div className="sbp-left">
          <div className="ng-sub-tabs sbp-tabs">
            {[['search', 'Search'], ['enter-list', 'Enter list'], ['upload', 'Upload']].map(([k, l]) => (
              <button type="button" key={k} className={`ng-sub-tab ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          {tab === 'search' && (
            <>
              <div className="sbp-search-row">
                <label className="ng-search sbp-search"><Search size={14} />
                  <input placeholder="Search by product name or ASIN" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} />
                </label>
                <button type="button" className="sbp-icon-btn" aria-label="Search"><Search size={14} /></button>
                <span className="sbp-brand">{brand} <ChevronDown size={16} /></span>
              </div>
              <div className="sbp-results">
                {shown.length === 0 && <p className="ng-hint">No products found.</p>}
                {shown.map(p => (
                  <div key={p.asin} className="sbp-row">
                    <ProductImage product={p} size={60} />
                    <div className="sbp-info"><ProductLink asin={p.asin} className="sbp-title">{p.name}</ProductLink><ProductMeta product={p} /></div>
                    <button type="button" className="sbp-add" disabled={isAdded(p.asin) || isFull} onClick={() => add([p])}>
                      {isAdded(p.asin) ? 'Added' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="sbp-pager">
                <span>{results.length ? `${page * PAGE_SIZE + 1}-${page * PAGE_SIZE + shown.length}` : 0} of {results.length} results</span>
                <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <button type="button" aria-label="Next page" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </>
          )}
          {tab === 'enter-list' && (
            <div className="ng-pad">
              <textarea className="ng-textarea" placeholder="Enter ASINs separated by a comma, space or new line." value={listText} onChange={e => setListText(e.target.value)} />
              {listError && <p className="sb-error">{listError}</p>}
              <div className="ng-actions"><button type="button" className="ng-btn" disabled={!listText.trim() || isFull} onClick={() => addFromText(listText)}>Add</button></div>
            </div>
          )}
          {tab === 'upload' && (
            <div className="ng-pad">
              <p className="ng-hint ng-hint-left">Use the template to make sure your information uploads accurately.</p>
              <a className="ng-btn sbp-template" href="data:text/csv;charset=utf-8,ASIN%0A" download="sb-products-template.csv">Download the CSV template</a>
              <label className="ng-drop">
                <input type="file" accept=".csv,.tsv,.txt" onChange={e => { onUpload(e.target.files?.[0]); e.target.value = ''; }} />
                <strong>Drag and drop file to add</strong>
                <span>or click to select from your computer</span>
                <small>Accepted formats: CSV, TSV, TXT</small>
              </label>
              {listError && <p className="sb-error">{listError}</p>}
            </div>
          )}
        </div>
        <div className="sbp-right">
          <div className="sbp-right-head">
            <strong>{count} product{count === 1 ? '' : 's'}</strong>
            {count > 0 && (
              <span className="sbp-right-actions">
                <button type="button" className="ng-link" onClick={exportCsv}>Export <Info size={11} /></button>
                <button type="button" className="ng-link" onClick={() => onChange([])}>Remove all</button>
              </span>
            )}
          </div>
          {hasError && <div className="sbp-error" role="alert"><span>!</span> Add at least three products to advertise</div>}
          {products.map((p, i) => (
            <div key={p.asin} className="sbp-added">
              <span className="sbp-grip" title="Drag to reorder" draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}
                onDragOver={e => e.preventDefault()}
                onDrop={e => move(Number(e.dataTransfer.getData('text/plain')), i)}>⋮⋮</span>
              <ProductImage product={p} size={56} />
              <div className="sbp-info"><ProductLink asin={p.asin} className="sbp-title sbp-title-2">{p.name}</ProductLink><ProductMeta product={p} /></div>
              <button type="button" className="ng-x" aria-label={`Remove ${p.asin}`} onClick={() => remove(p.asin)}><X size={14} /></button>
            </div>
          ))}
          {count < SB_MIN_PRODUCTS && <p className="sbp-hint">Add 3-10 products to feature in your ad.<br />Drag cards to change the display order.</p>}
          {count >= SB_MIN_PRODUCTS && count < BEST_RESULTS_PRODUCTS && (
            <p className="sbp-more"><Info size={13} /> Add {BEST_RESULTS_PRODUCTS - count} more product{BEST_RESULTS_PRODUCTS - count > 1 ? 's' : ''} for best results.</p>
          )}
        </div>
      </div>
    </section>
  );
}
