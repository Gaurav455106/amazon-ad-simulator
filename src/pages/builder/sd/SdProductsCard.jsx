import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import ProductImage from '../../../components/console/ProductImage';
import { SdCard, PillSelect, SubTabs } from './SdBits';
import ProductLink from '../../../components/console/ProductLink';

const STAR_PATH = 'M8 1.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12l-4.2 2.2.8-4.7L1.2 6.2l4.7-.7z';
const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Stars({ rating }) {
  return (
    <span className="sd-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
          <path d={STAR_PATH} fill={rating >= i - 0.25 ? '#ffa41c' : 'none'} stroke="#de7921" strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}

function ProductMeta({ p }) {
  const isOut = p.status && p.status !== 'In stock';
  return (
    <>
      <span className="sd-prod-meta">
        <Stars rating={p.rating} /><span>({p.reviews.toLocaleString('en-IN')})</span>
        <i className="sd-sep" /><span className="sd-price">{inr(p.price)}</span>
        <i className="sd-sep" /><span className={isOut ? 'sd-out' : 'sd-in'}>{isOut && <Info size={11} />} {p.status || 'In stock'}</span>
      </span>
      <span className="sd-prod-ids">ASIN: {p.asin}<i className="sd-sep" />SKU: {p.sku}</span>
    </>
  );
}

/** Parses typed/uploaded ASINs or SKUs against the catalogue. */
function matchProducts(text, catalogue) {
  const tokens = [...new Set(text.split(/[\s,;]+/).map(t => t.trim()).filter(Boolean))];
  const lookup = (t) => catalogue.find(p => p.asin === t.toUpperCase() || p.sku === t);
  return { found: tokens.map(lookup).filter(Boolean), invalid: tokens.filter(t => !lookup(t)) };
}

/** "Products to advertise" card of the Display builder. */
export default function SdProductsCard({ catalogue, products, onChange, isVideo }) {
  const [tab, setTab] = useState('search');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('desc');
  const [listText, setListText] = useState('');
  const [notice, setNotice] = useState('');

  const isAdded = (asin) => products.some(p => p.asin === asin);
  const add = (items) => onChange([...products, ...items.filter(p => !isAdded(p.asin))]);
  const q = query.trim().toLowerCase();
  // The catalogue is stored oldest-first, so "Descending" (newest first) reverses it.
  const results = catalogue.filter(p => !q || `${p.name} ${p.asin} ${p.sku}`.toLowerCase().includes(q));
  const ordered = sort === 'desc' ? [...results].reverse() : results;

  const addFromText = (text) => {
    const { found, invalid } = matchProducts(text, catalogue);
    add(found);
    setNotice(invalid.length ? `We couldn't find ${invalid.length === 1 ? 'this product' : 'these products'} in your catalogue: ${invalid.join(', ')}` : '');
    setListText('');
  };
  const onUpload = async (file) => {
    if (!file) return;
    try { addFromText(await file.text()); } catch { setNotice('We could not read that file. Upload a CSV, TSV or TXT file.'); }
  };

  return (
    <SdCard title="Products to advertise" info help="How to add products to your campaign"
      intro={isVideo ? <span className="sd-tip">✦ On average, advertisers who promoted 10 or more products saw an increase of 13% in sales over a 30-day period compared to advertisers who did not. (Amazon internal data, 2023)</span> : null}>
      <div className="sd-split sd-split-products">
        <div className="sd-split-left">
          <SubTabs value={tab} onChange={(k) => { setTab(k); setNotice(''); }}
            tabs={[{ key: 'search', label: 'Search' }, { key: 'list', label: 'Enter list' }, { key: 'upload', label: 'Upload' }]} />
          {tab === 'search' && (
            <>
              <div className="sd-search-row">
                <label className="sd-search"><Search size={14} />
                  <input placeholder="Search by product name, ASIN or SKU" value={query} onChange={e => setQuery(e.target.value)} />
                </label>
                <button type="button" className="sd-search-btn" aria-label="Search"><Search size={15} /></button>
              </div>
              <div className="sd-sort-row">
                <span className="sd-sort-label">Sort by date added</span>
                <PillSelect value={sort} onChange={setSort} ariaLabel="Sort order"
                  options={[{ value: 'desc', label: 'Descending' }, { value: 'asc', label: 'Ascending' }]} />
                <button type="button" className="sd-link sd-push" onClick={() => add(ordered)}>Add all on this page</button>
              </div>
              <div className="sd-prod-list">
                {ordered.map(p => (
                  <div key={p.asin} className="sd-prod-row">
                    <ProductImage product={p} size={56} />
                    <div className="sd-prod-info"><ProductLink asin={p.asin} className="sd-prod-title">{p.name}</ProductLink><ProductMeta p={p} /></div>
                    <button type="button" className="sd-add-pill" disabled={isAdded(p.asin)} onClick={() => add([p])}>{isAdded(p.asin) ? 'Added' : 'Add'}</button>
                  </div>
                ))}
                {ordered.length === 0 && <p className="sd-empty">No products match "{query}".</p>}
              </div>
              <div className="sd-pager">1-{ordered.length} of {ordered.length} results</div>
            </>
          )}
          {tab === 'list' && (
            <div className="sd-pad">
              <p className="sd-muted">Enter ASINs or SKUs separated by a comma, space or new line.</p>
              <textarea className="sd-textarea" value={listText} onChange={e => setListText(e.target.value)} placeholder={'B0CF244HDV\nB0CF24MSGB'} />
              {notice && <p className="sd-notice">{notice}</p>}
              <div className="sd-actions"><button type="button" className="sd-btn" disabled={!listText.trim()} onClick={() => addFromText(listText)}>Add</button></div>
            </div>
          )}
          {tab === 'upload' && (
            <div className="sd-pad">
              <p className="sd-muted">Use the template to make sure your information uploads accurately.</p>
              <a className="sd-btn sd-btn-inline" href="data:text/csv;charset=utf-8,ASIN%20or%20SKU%0A" download="sd-products-template.csv">Download the CSV template</a>
              <label className="sd-drop">
                <input type="file" accept=".csv,.tsv,.txt" onChange={e => { onUpload(e.target.files?.[0]); e.target.value = ''; }} />
                <strong>Drag and drop file to add</strong>
                <span>or click to select from your computer</span>
                <small>Accepted formats: CSV, TSV, TXT</small>
              </label>
              {notice && <p className="sd-notice">{notice}</p>}
            </div>
          )}
        </div>
        <div className="sd-split-right">
          <div className="sd-right-head"><strong>{products.length} product{products.length === 1 ? '' : 's'}</strong>
            {products.length > 0 && <button type="button" className="sd-link" onClick={() => onChange([])}>Remove all</button>}</div>
          {products.length === 0 && <p className="sd-right-empty">Add products</p>}
          {products.map(p => (
            <div key={p.asin} className="sd-added-prod">
              <ProductImage product={p} size={48} />
              <div className="sd-prod-info"><ProductLink asin={p.asin} className="sd-prod-title sd-clamp">{p.name}</ProductLink><ProductMeta p={p} /></div>
              <button type="button" className="sd-x" aria-label={`Remove ${p.asin}`} onClick={() => onChange(products.filter(x => x.asin !== p.asin))}><X size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </SdCard>
  );
}
