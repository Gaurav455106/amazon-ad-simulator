import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import { adStatus } from '../../../utils/campaignStatus';
import { localISODate } from '../../../utils/dateRanges';
import { newSbAdPath } from '../../../routes';
import { amazonPdpUrl } from '../../../data/demoProducts';
import ProductImage from '../../../components/console/ProductImage';
import ProductLink from '../../../components/console/ProductLink';
import StatusDetails from '../../../components/console/StatusDetails';
import AddProductsModal from '../../../components/console/AddProductsModal';
import ConsoleTable from '../../../components/console/table/ConsoleTable';
import { ActiveSwitch } from '../../../components/console/table/InlineEdit';
import { GROUPS, metricColumns, metricFilterFields } from '../../../components/console/table/columns';
import { DEFAULT_STATUS_FILTER, statusField } from '../../../components/console/table/tableFilters';
import SbManageAdDrawer from '../sb/SbManageAdDrawer';
import { ViewPageLink } from '../sb/SbLandingPage';
import { sbAdsFor, toStoredAd } from '../sbAds';

const PRODUCT_COLUMNS = ['spend', 'orders', 'sales', 'roas', 'impressions', 'clicks'];
const PRODUCT_EXTRA = ['ctr', 'cpc', 'acos'];
const SD_COLUMNS = ['impressions', 'clicks', 'ctr', 'spend', 'cpc', 'dpv', 'orders'];
const SD_EXTRA = ['sales', 'acos', 'roas'];
const SB_COLUMNS = ['clicks', 'dpv', 'spend', 'orders', 'sales'];
const SB_EXTRA = ['impressions', 'ctr', 'cpc', 'acos', 'roas'];
const RATIO_METRICS = ['ctr', 'cpc', 'acos', 'roas', 'cvr'];

/** Splits an ad group's metrics by share; ratio metrics stay the ad group's own. */
const splitMetrics = (m, share) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, RATIO_METRICS.includes(k) ? (share ? v : 0) : v * share]));

/** The ad name box: click to rename in place (Enter saves, Escape cancels). */
function AdNameBox({ name, onRename }) {
  const [draft, setDraft] = useState(null);
  if (draft === null) return <button type="button" className="cx-cell-box ad-name-box" onClick={() => setDraft(name)}>{name}</button>;
  const commit = () => { if (draft.trim()) onRename(draft.trim()); setDraft(null); };
  return <input autoFocus className="cx-cell-input ad-name-input" value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
    onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }} />;
}

function SbAds({ campaign, adGroup, agMetrics }) {
  const navigate = useNavigate();
  const sbAds = useStore(s => s.sbAds || []);
  const catalogue = useStore(s => s.products);
  const addSbAd = useStore(s => s.addSbAd);
  const updateSbAd = useStore(s => s.updateSbAd);
  const [managing, setManaging] = useState(null);
  const ads = sbAdsFor(campaign, adGroup, sbAds);

  // Ads added today have no history yet; the ad group's delivery splits across the older ones.
  const today = localISODate();
  const olderCount = ads.filter(a => !a.createdAt || a.createdAt < today).length || 1;
  const rows = ads.map(ad => ({ ad, isOn: ad.status === 'Enabled', m: splitMetrics(agMetrics, ad.createdAt === today ? 0 : 1 / olderCount) }));
  const save = (ad, patch = {}) => {
    const next = { ...ad, ...patch };
    if (ad.isVirtual) addSbAd(toStoredAd(next)); else updateSbAd(ad.id, toStoredAd(next));
  };
  const statusOf = (r) => adStatus({ campaign, adGroup, isOn: r.isOn, pendingReview: r.ad.pendingReview });

  const columns = [
    { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => r.ad.status,
      cell: r => <ActiveSwitch isOn={r.isOn} onToggle={() => save(r.ad, { status: r.isOn ? 'Paused' : 'Enabled' })} /> },
    { key: 'name', label: 'Ad name', fixed: true, csv: r => r.ad.name,
      cell: r => <><AdNameBox name={r.ad.name} onRename={name => save(r.ad, { name })} /><br /><button type="button" className="cx-link" onClick={() => setManaging(r.ad)}>Manage ad</button></> },
    { key: 'status', label: 'Status', group: GROUPS.settings, csv: r => statusOf(r).status, cell: r => <StatusDetails {...statusOf(r)} /> },
    { key: 'landing', label: 'Landing page', group: GROUPS.detail, csv: r => (r.ad.landingPage === 'new' ? 'New landing page' : 'Store on Amazon'),
      cell: r => <ViewPageLink brand={r.ad.brandName} label="View landing page" /> },
    ...metricColumns([...SB_COLUMNS, ...SB_EXTRA], SB_COLUMNS),
  ];
  return (
    <>
      <ConsoleTable tableKey="sb-ads" exportName={`${adGroup.name} ads`} columns={columns} rows={rows} rowKey={r => r.ad.id}
        filterFields={[statusField(r => r.ad.status), ...metricFilterFields([...SB_COLUMNS, ...SB_EXTRA])]} paginate={false}
        search={{ placeholder: 'Find an ad', match: (r, q) => r.ad.name.toLowerCase().includes(q) }}
        leftActions={<button type="button" className="cx-btn cx-btn-pill" onClick={() => navigate(newSbAdPath(campaign, adGroup.id))}>Create ad</button>} />
      {managing && (
        <SbManageAdDrawer ad={managing} adFormat={campaign.adFormat} catalogue={catalogue}
          onSubmit={next => save(managing, next)} onClose={() => setManaging(null)} />
      )}
    </>
  );
}

/** Product ads (Sponsored Products and Display): one row per advertised ASIN. */
function ProductAds({ campaign, adGroup, agMetrics, isSD }) {
  const products = useStore(s => s.products);
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const [isAdding, setIsAdding] = useState(false);
  const asins = useMemo(() => adGroup.products || [], [adGroup.products]);
  const paused = adGroup.pausedProducts || [];
  const [main, extra] = isSD ? [SD_COLUMNS, SD_EXTRA] : [PRODUCT_COLUMNS, PRODUCT_EXTRA];

  // Split ad group performance across its product ads by a stable per-ASIN share.
  const rows = useMemo(() => {
    const weights = asins.map((a, i) => 1 + ((a.charCodeAt(a.length - 1) + i) % 5) / 4);
    const total = weights.reduce((x, y) => x + y, 0) || 1;
    return asins.map((asin, i) => ({ asin, product: products.find(p => p.asin === asin), isOn: !paused.includes(asin), m: splitMetrics(agMetrics, weights[i] / total) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asins, products, paused.join(), agMetrics.spend, agMetrics.impressions]);

  const setPaused = (picked, isPaused) => updateAdGroup(adGroup.id, {
    pausedProducts: isPaused ? [...new Set([...paused, ...picked])] : paused.filter(a => !picked.includes(a)),
  });
  const statusOf = (r) => adStatus({ campaign, adGroup, isOn: r.isOn, product: r.product });

  const columns = [
    { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => (r.isOn ? 'Enabled' : 'Paused'),
      cell: r => <ActiveSwitch isOn={r.isOn} onToggle={() => setPaused([r.asin], r.isOn)} /> },
    { key: 'name', label: isSD ? 'Ads' : 'Ad name', fixed: true, info: true, csv: r => r.product?.name || r.asin,
      cell: r => (
        <div className="prod-row">
          <ProductImage product={r.product} size={40} />
          <ProductLink asin={r.asin} className="cx-link prod-title">{r.product?.name || r.asin}</ProductLink>
        </div>
      ) },
    { key: 'status', label: 'Status', group: GROUPS.settings, info: true, csv: r => statusOf(r).status, cell: r => <StatusDetails {...statusOf(r)} /> },
    { key: 'sku', label: 'SKU/ASIN', group: GROUPS.detail, csv: r => `${r.product?.sku || ''} ${r.asin}`.trim(),
      cell: r => <>{r.product?.sku || '—'}<a className="cx-link cx-sub-link" href={amazonPdpUrl(r.asin) || '#'} target="_blank" rel="noopener noreferrer">{r.asin} <ExternalLink size={11} /></a></> },
    ...metricColumns([...main, ...extra], main),
  ];
  const bulkSections = (sel, clear) => [{ title: 'Quick Actions', items: [
    { label: 'Enable', disabled: sel.every(r => r.isOn), onClick: () => { setPaused(sel.map(r => r.asin), false); clear(); } },
    { label: 'Pause', disabled: sel.every(r => !r.isOn), onClick: () => { setPaused(sel.map(r => r.asin), true); clear(); } },
  ] }];

  return (
    <>
      <ConsoleTable
        tableKey={isSD ? 'sd-ads' : 'sp-ads'}
        exportName={`${adGroup.name} ads`}
        columns={columns}
        rows={rows}
        rowKey={r => r.asin}
        filterFields={[statusField(r => (r.isOn ? 'Enabled' : 'Paused')), ...metricFilterFields([...main, ...extra])]}
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
      {isAdding && (
        <AddProductsModal existing={asins} title={isSD ? 'Add products to advertise' : 'Add products'}
          onClose={() => setIsAdding(false)} onSave={(added) => updateAdGroup(adGroup.id, { products: [...asins, ...added] })} />
      )}
    </>
  );
}

export default function AdsTab({ campaign, adGroup }) {
  const range = useConsoleRange();
  const agMetrics = rangeMetrics(withParentStart(adGroup, campaign), range);
  if (campaign.type === 'Sponsored Brands') return <SbAds campaign={campaign} adGroup={adGroup} agMetrics={agMetrics} />;
  return <ProductAds campaign={campaign} adGroup={adGroup} agMetrics={agMetrics} isSD={campaign.type === 'Sponsored Display'} />;
}
