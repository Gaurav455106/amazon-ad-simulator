import { useMemo, useState } from 'react';
import { X, ExternalLink, Search } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import ProductImage from '../../../components/console/ProductImage';
import ConsoleTable from '../../../components/console/table/ConsoleTable';
import { ActiveSwitch } from '../../../components/console/table/InlineEdit';
import { GROUPS, metricColumns, metricFilterFields } from '../../../components/console/table/columns';
import { DEFAULT_STATUS_FILTER, statusField } from '../../../components/console/table/tableFilters';
import ProductLink from '../../../components/console/ProductLink';

const PRODUCT_COLUMNS = ['spend', 'orders', 'sales', 'roas', 'impressions', 'clicks'];
const PRODUCT_EXTRA = ['ctr', 'cpc', 'acos'];
const SB_COLUMNS = ['clicks', 'dpv', 'spend', 'orders', 'sales'];
const SB_EXTRA = ['impressions', 'ctr', 'cpc', 'acos', 'roas'];
const RATIO_METRICS = ['ctr', 'cpc', 'acos', 'roas'];

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
  const [isAdding, setIsAdding] = useState(false);

  const isSB = campaign.type === 'Sponsored Brands';
  const isSD = campaign.type === 'Sponsored Display';
  const asins = useMemo(() => adGroup.products || [], [adGroup.products]);
  const paused = adGroup.pausedProducts || [];
  const agMetrics = rangeMetrics(withParentStart(adGroup, campaign), range);
  const isLive = campaign.status === 'Enabled' && adGroup.status === 'Enabled';

  // Split ad group performance across its product ads by a stable per-ASIN share (ratios stay the ad group's).
  const rows = useMemo(() => {
    const weights = asins.map((a, i) => 1 + ((a.charCodeAt(a.length - 1) + i) % 5) / 4);
    const total = weights.reduce((x, y) => x + y, 0) || 1;
    return asins.map((asin, i) => {
      const share = weights[i] / total;
      const isOn = !paused.includes(asin);
      const m = Object.fromEntries(Object.entries(agMetrics).map(([k, v]) => [k, RATIO_METRICS.includes(k) ? v : v * share]));
      return { asin, product: products.find(p => p.asin === asin), isOn, m };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asins, products, paused.join(), agMetrics.spend, agMetrics.impressions]);

  const toggleProduct = (asin) => updateAdGroup(adGroup.id, {
    pausedProducts: paused.includes(asin) ? paused.filter(a => a !== asin) : [...paused, asin],
  });
  const adStatus = (r) => (!isLive || !r.isOn ? 'Paused' : r.product?.status === 'Out of stock' ? 'Out of stock' : 'Delivering');

  if (isSB) {
    const creative = campaign.sbCreative || {};
    const sbRows = [{ id: adGroup.id, m: agMetrics }];
    const columns = [
      { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: () => adGroup.status,
        cell: () => <ActiveSwitch isOn={adGroup.status === 'Enabled'} onToggle={() => updateAdGroup(adGroup.id, { status: adGroup.status === 'Enabled' ? 'Paused' : 'Enabled' })} /> },
      { key: 'name', label: 'Ad name', fixed: true, csv: () => creative.headline || adGroup.name,
        cell: () => <><span className="cx-cell-box">{creative.headline || adGroup.name}</span><br /><button type="button" className="cx-link">Manage ad</button></> },
      { key: 'status', label: 'Status', group: GROUPS.settings, csv: () => (isLive ? 'Delivering' : 'Paused'), cell: () => (isLive ? 'Delivering' : 'Paused') },
      { key: 'landing', label: 'Landing page', group: GROUPS.detail, csv: () => 'Store', cell: () => <span className="cx-link">View landing page <ExternalLink size={12} /></span> },
      ...metricColumns([...SB_COLUMNS, ...SB_EXTRA], SB_COLUMNS),
    ];
    return (
      <ConsoleTable tableKey="sb-ads" exportName={`${adGroup.name} ads`} columns={columns} rows={sbRows} rowKey={r => r.id}
        filterFields={metricFilterFields([...SB_COLUMNS, ...SB_EXTRA])} paginate={false}
        leftActions={<button type="button" className="cx-btn cx-btn-pill">Create ad</button>} />
    );
  }

  const columns = [
    { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => (r.isOn ? 'Enabled' : 'Paused'),
      cell: r => <ActiveSwitch isOn={r.isOn} onToggle={() => toggleProduct(r.asin)} /> },
    { key: 'name', label: 'Ad name', fixed: true, info: true, csv: r => r.product?.name || r.asin,
      cell: r => (
        <div className="prod-row">
          <ProductImage product={r.product} size={40} />
          <ProductLink asin={r.asin} className="cx-link prod-title">{r.product?.name || r.asin}</ProductLink>
        </div>
      ) },
    { key: 'status', label: 'Status', group: GROUPS.settings, info: true, csv: adStatus, cell: adStatus },
    { key: 'sku', label: 'SKU/ASIN', group: GROUPS.detail, csv: r => `${r.product?.sku || ''} ${r.asin}`.trim(), cell: r => <>{r.product?.sku || '—'}<span className="cx-sub">{r.asin}</span></> },
    ...metricColumns([...PRODUCT_COLUMNS, ...PRODUCT_EXTRA], PRODUCT_COLUMNS),
  ];
  const bulkSections = (sel, clear) => {
    const setPaused = (isPaused) => {
      const picked = sel.map(r => r.asin);
      const next = isPaused ? [...new Set([...paused, ...picked])] : paused.filter(a => !picked.includes(a));
      updateAdGroup(adGroup.id, { pausedProducts: next });
      clear();
    };
    return [{ title: 'Quick Actions', items: [
      { label: 'Enable', disabled: sel.every(r => r.isOn), onClick: () => setPaused(false) },
      { label: 'Pause', disabled: sel.every(r => !r.isOn), onClick: () => setPaused(true) },
    ] }];
  };

  return (
    <>
      <ConsoleTable
        tableKey={isSD ? 'sd-ads' : 'sp-ads'}
        exportName={`${adGroup.name} ads`}
        columns={columns}
        rows={rows}
        rowKey={r => r.asin}
        filterFields={[statusField(r => (r.isOn ? 'Enabled' : 'Paused')), ...metricFilterFields([...PRODUCT_COLUMNS, ...PRODUCT_EXTRA])]}
        initialFilters={[DEFAULT_STATUS_FILTER]}
        search={{ placeholder: isSD ? 'Find a product' : 'Search ads', match: (r, q) => `${r.product?.name} ${r.asin} ${r.product?.sku}`.toLowerCase().includes(q) }}
        leftActions={(
          <button type="button" className={isSD ? 'cx-btn cx-btn-pill' : 'cx-btn cx-btn-primary'} onClick={() => setIsAdding(true)}>
            {isSD ? 'Add products to advertise' : 'Add products'}
          </button>
        )}
        bulkSections={bulkSections}
        empty={<div className="cx-empty"><h3>No ads</h3><p>Add products to start advertising in this ad group.</p></div>}
      />
      {isAdding && <AddProductsModal existing={asins} onClose={() => setIsAdding(false)} onSave={(added) => updateAdGroup(adGroup.id, { products: [...asins, ...added] })} />}
    </>
  );
}
