import { useMemo, useState } from 'react';
import { Search, Copy, ChevronDown, X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';

const NEG_MATCH_TYPES = [
  { key: 'Exact', label: 'Negative exact' },
  { key: 'Phrase', label: 'Negative phrase' },
];
const ASIN_RE = /^B[A-Z0-9]{9}$/;

function AddNegativeKeywordsModal({ onClose, onSave }) {
  const [text, setText] = useState('');
  const [types, setTypes] = useState(['Exact']);
  const [added, setAdded] = useState([]);

  const addFromText = () => {
    const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
    const next = words.flatMap(w => types.map(t => ({ keyword: w, matchType: t })))
      .filter(n => !added.some(a => a.keyword === n.keyword && a.matchType === n.matchType));
    setAdded(a => [...a, ...next]);
    setText('');
  };

  return (
    <div className="cx-modal-overlay" onClick={onClose}>
      <div className="cx-modal" onClick={e => e.stopPropagation()}>
        <div className="cx-modal-head">
          <h2>Add negative keywords</h2>
          <button type="button" className="cx-tool-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="cx-modal-body kw-modal">
          <div className="kw-modal-left">
            <div className="kw-row">
              <span className="kw-row-label">Match type <Info size={13} /></span>
              {NEG_MATCH_TYPES.map(t => (
                <label key={t.key} className="kw-check">
                  <input type="checkbox" checked={types.includes(t.key)}
                    onChange={() => setTypes(ts => (ts.includes(t.key) ? ts.filter(x => x !== t.key) : [...ts, t.key]))} />
                  {t.label}
                </label>
              ))}
            </div>
            <textarea className="kw-textarea" placeholder="Enter keywords separated by new line." value={text} onChange={e => setText(e.target.value)} />
            <div style={{ textAlign: 'right' }}>
              <button type="button" className="cx-btn" disabled={!text.trim() || types.length === 0} onClick={addFromText}>Add keywords</button>
            </div>
          </div>
          <div className="kw-modal-right">
            <div className="kw-added-head">
              <strong>{added.length} added</strong>
              <button type="button" className="cx-link" onClick={() => setAdded([])}>Remove all</button>
            </div>
            <table className="cx-table">
              <thead><tr><th>Keyword</th><th>Match type</th><th /></tr></thead>
              <tbody>
                {added.map((a, i) => (
                  <tr key={`${a.keyword}|${a.matchType}`}>
                    <td>{a.keyword}</td>
                    <td>{NEG_MATCH_TYPES.find(t => t.key === a.matchType).label}</td>
                    <td><button type="button" className="cx-tool-btn" aria-label="Remove" onClick={() => setAdded(x => x.filter((_, j) => j !== i))}><X size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="cx-modal-foot">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="cx-btn cx-btn-primary" disabled={added.length === 0} onClick={() => { onSave(added); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function AddNegativeProductsModal({ onClose, onSave }) {
  const products = useStore(s => s.products);
  const [text, setText] = useState('');
  const asins = text.split(/[\s,]+/).map(a => a.trim().toUpperCase()).filter(Boolean);
  const invalid = asins.filter(a => !ASIN_RE.test(a));
  return (
    <div className="cx-modal-overlay" onClick={onClose}>
      <div className="cx-modal" style={{ width: 'min(620px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="cx-modal-head">
          <h2>Exclude products</h2>
          <button type="button" className="cx-tool-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="cx-modal-body" style={{ padding: 18 }}>
          <p className="tab-intro">Enter ASINs separated by a comma, space or new line.</p>
          <textarea className="kw-textarea" placeholder={products.slice(0, 2).map(p => p.asin).join('\n')} value={text} onChange={e => setText(e.target.value)} />
          {invalid.length > 0 && <p className="form-error">Invalid ASIN: {invalid.join(', ')}</p>}
        </div>
        <div className="cx-modal-foot">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="cx-btn cx-btn-primary" disabled={asins.length === 0 || invalid.length > 0} onClick={() => { onSave([...new Set(asins)]); onClose(); }}>Exclude</button>
        </div>
      </div>
    </div>
  );
}

/** Negative keywords / products, at campaign level or (with adGroup) ad group level. */
export default function NegativeTargetingTab({ campaign, adGroup }) {
  const negativeKeywords = useStore(s => s.negativeKeywords);
  const negativeProducts = useStore(s => s.negativeProducts || []);
  const products = useStore(s => s.products);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const deleteNegativeKeyword = useStore(s => s.deleteNegativeKeyword);
  const addNegativeProducts = useStore(s => s.addNegativeProducts);
  const deleteNegativeProduct = useStore(s => s.deleteNegativeProduct);

  const isSD = campaign.type === 'Sponsored Display';
  const [subTab, setSubTab] = useState(isSD ? 'products' : 'keywords');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const inScope = (n) => n.campaignId === campaign.id && (adGroup ? n.adGroupId === adGroup.id : !n.adGroupId);
  const keywords = useMemo(() => negativeKeywords.filter(inScope).filter(n => !search || n.keyword.toLowerCase().includes(search.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [negativeKeywords, campaign.id, adGroup?.id, search]);
  const excluded = useMemo(() => negativeProducts.filter(inScope).filter(n => !search || n.asin.toLowerCase().includes(search.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [negativeProducts, campaign.id, adGroup?.id, search]);

  const scope = { campaignId: campaign.id, adGroupId: adGroup?.id || null, level: adGroup ? 'Ad Group' : 'Campaign' };
  const subTabs = isSD ? [{ key: 'products', label: 'Negative products' }] : [{ key: 'keywords', label: 'Negative keywords' }, { key: 'products', label: 'Negative products' }];
  const productName = (asin) => products.find(p => p.asin === asin)?.name;

  return (
    <>
      <div className="sub-tabs">
        {subTabs.map(t => (
          <button key={t.key} type="button" className={`sub-tab ${subTab === t.key ? 'is-active' : ''}`} onClick={() => { setSubTab(t.key); setSearch(''); }}>{t.label}</button>
        ))}
      </div>
      <div className="cx-toolbar">
        <button type="button" className="cx-btn cx-btn-primary" onClick={() => setModal(subTab)}>
          {subTab === 'keywords' ? 'Add negative keywords' : 'Add negative products'}
        </button>
        <label className="cx-search" style={{ width: 240 }}>
          <Search size={16} />
          <input placeholder={subTab === 'keywords' ? 'Find a negative keyword' : 'Find a negative product'} value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <button type="button" className="cx-tool-btn" aria-label="Copy" disabled><Copy size={16} /></button>
        <span className="cx-toolbar-spacer" />
        <button type="button" className="cx-tool-btn">View: Default <ChevronDown size={14} /></button>
        <button type="button" className="cx-tool-btn">Export</button>
      </div>

      <div className="cx-table-wrap">
        {subTab === 'keywords' ? (
          <table className="cx-table">
            <thead><tr><th><input type="checkbox" aria-label="Select all" /></th><th>Keyword</th><th>Target match type <Info size={13} /></th><th>Status</th><th /></tr></thead>
            <tbody>
              {keywords.map(n => (
                <tr key={n.id}>
                  <td><input type="checkbox" aria-label="select" /></td>
                  <td>{n.keyword}</td>
                  <td>{n.matchType === 'Phrase' ? 'Negative phrase' : 'Negative exact'}</td>
                  <td>Delivering</td>
                  <td><button type="button" className="cx-link" onClick={() => deleteNegativeKeyword(n.id)}>Archive</button></td>
                </tr>
              ))}
              {keywords.length === 0 && <tr><td colSpan={5}><div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div></td></tr>}
            </tbody>
          </table>
        ) : (
          <table className="cx-table">
            <thead><tr><th><input type="checkbox" aria-label="Select all" /></th><th>Product</th><th>Status</th><th /></tr></thead>
            <tbody>
              {excluded.map(n => (
                <tr key={n.id}>
                  <td><input type="checkbox" aria-label="select" /></td>
                  <td>{n.brand ? <>Brand: <strong>{n.brand}</strong></> : <>{productName(n.asin) || n.name || n.asin}<span className="cx-sub">ASIN: {n.asin}</span></>}</td>
                  <td>Excluded</td>
                  <td><button type="button" className="cx-link" onClick={() => deleteNegativeProduct(n.id)}>Archive</button></td>
                </tr>
              ))}
              {excluded.length === 0 && <tr><td colSpan={4}><div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'keywords' && (
        <AddNegativeKeywordsModal onClose={() => setModal(null)} onSave={(list) => addNegativeKeywords(list.map(n => ({ ...n, ...scope })))} />
      )}
      {modal === 'products' && (
        <AddNegativeProductsModal onClose={() => setModal(null)} onSave={(asins) => addNegativeProducts(asins.map(asin => ({ asin, ...scope })))} />
      )}
    </>
  );
}
