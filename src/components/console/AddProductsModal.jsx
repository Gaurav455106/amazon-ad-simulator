import { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { parseAsinList } from '../../pages/builder/sb/limits';
import ProductImage from './ProductImage';
import ProductLink from './ProductLink';

const TABS = ['Search', 'Enter list', 'Upload'];
const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

function ProductLine({ p, action }) {
  return (
    <div className="apm-line">
      <ProductImage product={p} size={44} />
      <div className="apm-text">
        <ProductLink asin={p.asin} className="cx-link apm-title">{p.name}</ProductLink>
        <span className="apm-meta">★ {p.rating} ({p.reviews}) <span className="apm-price">{inr(p.price)}</span> {p.status}</span>
        <span className="apm-ids">ASIN: {p.asin} | SKU: {p.sku}</span>
      </div>
      {action}
    </div>
  );
}

/**
 * "Add products to advertise" (ad group Ads tab): Search / Enter list / Upload on the left,
 * the products being added on the right, then Cancel / Add products to advertise.
 * @param {{ existing: string[], onClose: () => void, onSave: (asins: string[]) => void, title?: string }} props
 */
export default function AddProductsModal({ existing, onClose, onSave, title = 'Add products to advertise' }) {
  const catalogue = useStore(s => s.products);
  const [tab, setTab] = useState('Search');
  const [query, setQuery] = useState('');
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [picked, setPicked] = useState([]);
  const [listText, setListText] = useState('');
  const [listResult, setListResult] = useState(null);

  const isAdded = (asin) => existing.includes(asin) || picked.includes(asin);
  const add = (asins) => setPicked(list => [...list, ...asins.filter(a => !isAdded(a))]);
  const ordered = isNewestFirst ? catalogue : [...catalogue].reverse();
  const results = ordered.filter(p => !query || `${p.name} ${p.asin} ${p.sku}`.toLowerCase().includes(query.toLowerCase()));
  const addList = (text) => {
    const { found, invalid } = parseAsinList(text, catalogue);
    add(found.map(p => p.asin));
    setListResult({ added: found.length, invalid });
  };
  const readFile = (file) => file?.text().then(addList).catch(() => setListResult({ added: 0, invalid: ['The file could not be read.'] }));

  return (
    <div className="tcm-scrim" onClick={onClose}>
      <div className="tcm apm" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <header className="tcm-head"><h2>{title}</h2><button type="button" className="tcm-close" aria-label="Close" onClick={onClose}><X size={18} /></button></header>
        <div className="apm-body">
          <div className="apm-left">
            <div className="apm-tabs" role="tablist">
              {TABS.map(t => <button key={t} type="button" role="tab" aria-selected={tab === t} className={`apm-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
            </div>
            {tab === 'Search' && (
              <>
                <label className="tf-search apm-search"><Search size={14} /><input placeholder="Search by product name, ASIN or SKU" value={query} onChange={e => setQuery(e.target.value)} /></label>
                <div className="apm-sort">
                  <span>Sort by date added</span>
                  <button type="button" className="tf-select apm-sort-btn" onClick={() => setIsNewestFirst(v => !v)}>{isNewestFirst ? 'Descending' : 'Ascending'} <ChevronDown size={12} /></button>
                  <button type="button" className="tf-link apm-add-all" onClick={() => add(results.map(p => p.asin))}>Add all on this page</button>
                </div>
                <div className="apm-list">
                  {results.map(p => (
                    <ProductLine key={p.asin} p={p} action={isAdded(p.asin)
                      ? <span className="apm-added">Added</span>
                      : <button type="button" className="cx-btn apm-add" onClick={() => add([p.asin])}>Add</button>} />
                  ))}
                  {results.length === 0 && <p className="tf-empty">No products match your search.</p>}
                </div>
              </>
            )}
            {tab === 'Enter list' && (
              <div className="apm-pad">
                <p className="cx-sub">Enter ASINs separated by a comma, space or new line.</p>
                <textarea className="apm-textarea" rows={8} value={listText} onChange={e => setListText(e.target.value)} placeholder={'B0BSXC1Z63\nB09J578NDM'} />
                <button type="button" className="cx-btn" disabled={!listText.trim()} onClick={() => { addList(listText); setListText(''); }}>Add</button>
              </div>
            )}
            {tab === 'Upload' && (
              <div className="apm-pad">
                <p className="cx-sub">Upload a .csv or .txt file with one ASIN per line.</p>
                <label className="cx-btn apm-upload">Choose file<input type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={e => readFile(e.target.files?.[0])} /></label>
              </div>
            )}
            {listResult && tab !== 'Search' && (
              <p className={listResult.invalid.length ? 'sbe-error' : 'cx-sub'}>
                {listResult.added} product{listResult.added === 1 ? '' : 's'} added.{listResult.invalid.length > 0 && ` Not found in your catalogue: ${listResult.invalid.join(', ')}`}
              </p>
            )}
          </div>
          <div className="apm-right">
            <div className="apm-right-head"><strong>{picked.length} product{picked.length === 1 ? '' : 's'}</strong>{picked.length > 0 && <button type="button" className="tf-link" onClick={() => setPicked([])}>Remove all</button>}</div>
            {picked.length === 0 && <p className="apm-empty">Add products</p>}
            {picked.map(a => {
              const p = catalogue.find(x => x.asin === a);
              return <ProductLine key={a} p={p} action={<button type="button" className="sbe-remove" aria-label={`Remove ${p.name}`} onClick={() => setPicked(list => list.filter(x => x !== a))}><X size={14} /></button>} />;
            })}
          </div>
        </div>
        <footer className="tcm-foot">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="tf-apply" disabled={picked.length === 0} onClick={() => { onSave(picked); onClose(); }}>{title}</button>
        </footer>
      </div>
    </div>
  );
}
