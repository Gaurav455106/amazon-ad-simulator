import { useMemo, useState } from 'react';
import { Search, ListFilter, ChevronDown, X, ExternalLink } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import { formatMetric, METRICS } from '../../../components/console/metrics';
import ProductImage from '../../../components/console/ProductImage';
import TableDateButton from '../../../components/console/TableDateButton';
import ProductLink from '../../../components/console/ProductLink';

const PRODUCT_COLUMNS = ['spend', 'orders', 'sales', 'roas', 'impressions', 'clicks'];
const SB_COLUMNS = ['clicks', 'dpv', 'spend', 'orders', 'sales'];

function AddProductsModal({ existing, onClose, onSave }) {
  const products = useStore(s => s.products);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState([]);
  const list = products.filter(p => !query || `${p.name} ${p.asin} ${p.sku}`.toLowerCase().includes(query.toLowerCase()));
  const isAdded = (asin) => existing.includes(asin) || picked.includes(asin);

  return (
    <div className="cx-modal-overlay" onClick={onClose}>
      <div className="cx-modal" onClick={e => e.stopPropagation()}>
        <div className="cx-modal-head">
          <h2>Add products</h2>
          <button type="button" className="cx-tool-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="cx-modal-body kw-modal">
          <div className="kw-modal-left">
            <label className="cx-search"><Search size={16} /><input placeholder="Search by product name, ASIN or SKU" value={query} onChange={e => setQuery(e.target.value)} /></label>
            <div className="prod-list">
              {list.map(p => (
                <div key={p.asin} className="prod-row">
                  <ProductImage product={p} size={44} />
                  <div className="prod-row-text">
                    <ProductLink asin={p.asin} className="cx-link prod-title">{p.name}</ProductLink>
                    <span className="cx-sub">₹{p.price} · ASIN: {p.asin} · SKU: {p.sku}</span>
                  </div>
                  {isAdded(p.asin)
                    ? <span className="cx-sub">Added</span>
                    : <button type="button" className="cx-btn" onClick={() => setPicked(x => [...x, p.asin])}>Add</button>}
                </div>
              ))}
            </div>
          </div>
          <div className="kw-modal-right">
            <div className="kw-added-head"><strong>{picked.length} products</strong><button type="button" className="cx-link" onClick={() => setPicked([])}>Remove all</button></div>
            {picked.map(asin => (
              <div key={asin} className="prod-row">
                <span className="prod-row-text">{products.find(p => p.asin === asin)?.name}</span>
                <button type="button" className="cx-tool-btn" aria-label="Remove" onClick={() => setPicked(x => x.filter(a => a !== asin))}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="cx-modal-foot">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="cx-btn cx-btn-primary" disabled={picked.length === 0} onClick={() => { onSave(picked); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function AdsTab({ campaign, adGroup }) {
  const products = useStore(s => s.products);
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const range = useConsoleRange();
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isSB = campaign.type === 'Sponsored Brands';
  const isSD = campaign.type === 'Sponsored Display';
  const asins = useMemo(() => adGroup.products || [], [adGroup.products]);
  const paused = adGroup.pausedProducts || [];
  const agMetrics = rangeMetrics(withParentStart(adGroup, campaign), range);

  // Split ad group performance across its product ads by a stable per-ASIN share.
  const rows = useMemo(() => {
    const weights = asins.map((a, i) => 1 + ((a.charCodeAt(a.length - 1) + i) % 5) / 4);
    const total = weights.reduce((x, y) => x + y, 0) || 1;
    return asins
      .map((asin, i) => ({ asin, product: products.find(p => p.asin === asin), share: weights[i] / total }))
      .filter(r => !query || `${r.product?.name} ${r.asin}`.toLowerCase().includes(query.toLowerCase()));
  }, [asins, products, query]);

  const shareOf = (share) => Object.fromEntries(PRODUCT_COLUMNS.map(k => [k, ['roas'].includes(k) ? agMetrics[k] : agMetrics[k] * share]));
  const toggleProduct = (asin) => updateAdGroup(adGroup.id, {
    pausedProducts: paused.includes(asin) ? paused.filter(a => a !== asin) : [...paused, asin],
  });

  if (isSB) {
    const creative = campaign.sbCreative || {};
    return (
      <>
        <div className="cx-toolbar">
          <button type="button" className="cx-btn cx-btn-pill">Create ad</button>
          <button type="button" className="cx-tool-btn">Filter by <ChevronDown size={14} /></button>
          <span className="cx-toolbar-spacer" />
          <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
          <TableDateButton />
          <button type="button" className="cx-tool-btn">Export</button>
        </div>
        <div className="cx-table-wrap">
          <table className="cx-table">
            <thead><tr><th>Active</th><th>Ad name</th><th>Status</th><th>Landing page</th>{SB_COLUMNS.map(k => <th key={k} className="is-num">{METRICS[k].label} <Info size={13} /></th>)}</tr></thead>
            <tbody>
              <tr>
                <td><button type="button" className={`cx-switch ${adGroup.status === 'Enabled' ? 'is-on' : ''}`} aria-label={adGroup.status}
                  onClick={() => updateAdGroup(adGroup.id, { status: adGroup.status === 'Enabled' ? 'Paused' : 'Enabled' })} /></td>
                <td><span className="cx-cell-box">{creative.headline || adGroup.name}</span><br /><button type="button" className="cx-link">Manage ad</button></td>
                <td>{campaign.status === 'Enabled' && adGroup.status === 'Enabled' ? 'Delivering' : 'Paused'}</td>
                <td><span className="cx-link">View landing page <ExternalLink size={12} /></span></td>
                {SB_COLUMNS.map(k => <td key={k} className="is-num">{agMetrics[k] ? formatMetric(k, agMetrics[k]) : '—'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cx-toolbar">
        <button type="button" className={isSD ? 'cx-btn cx-btn-pill' : 'cx-btn cx-btn-primary'} onClick={() => setIsAdding(true)}>
          {isSD ? 'Add products to advertise' : 'Add products'}
        </button>
        <label className="cx-search" style={{ width: 240 }}>
          <Search size={16} /><input placeholder={isSD ? 'Find a product' : 'Search ads'} value={query} onChange={e => setQuery(e.target.value)} />
        </label>
        <button type="button" className="cx-tool-btn" aria-label="Filter by"><ListFilter size={16} /></button>
        <span className="cx-toolbar-spacer" />
        <button type="button" className="cx-tool-btn">View: Default <ChevronDown size={14} /></button>
        <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
        <TableDateButton />
        <button type="button" className="cx-tool-btn">Export</button>
      </div>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr><th><input type="checkbox" aria-label="Select all" /></th><th>Active</th><th>Ad name <Info size={13} /></th><th>Status <Info size={13} /></th><th>SKU/ASIN</th>
              {PRODUCT_COLUMNS.map(k => <th key={k} className="is-num"><Info size={13} /> {METRICS[k].label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(({ asin, product, share }) => {
              const isOn = !paused.includes(asin);
              const m = shareOf(share);
              return (
                <tr key={asin}>
                  <td><input type="checkbox" aria-label="select" /></td>
                  <td><button type="button" className={`cx-switch ${isOn ? 'is-on' : ''}`} aria-label={isOn ? 'Enabled' : 'Paused'} onClick={() => toggleProduct(asin)} /></td>
                  <td>
                    <div className="prod-row">
                      <ProductImage product={product} size={40} />
                      <span className="cx-link prod-title">{product?.name || asin}</span>
                    </div>
                  </td>
                  <td>{campaign.status !== 'Enabled' || adGroup.status !== 'Enabled' || !isOn ? 'Paused' : product?.status === 'Out of stock' ? 'Out of stock' : 'Delivering'}</td>
                  <td>{product?.sku || '—'}<span className="cx-sub">{asin}</span></td>
                  {PRODUCT_COLUMNS.map(k => <td key={k} className="is-num">{m[k] ? formatMetric(k, m[k]) : '—'}</td>)}
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={11}><div className="cx-empty"><h3>No ads</h3><p>Add products to start advertising in this ad group.</p></div></td></tr>}
          </tbody>
        </table>
      </div>
      {isAdding && <AddProductsModal existing={asins} onClose={() => setIsAdding(false)} onSave={(added) => updateAdGroup(adGroup.id, { products: [...asins, ...added] })} />}
    </>
  );
}
