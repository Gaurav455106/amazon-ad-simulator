import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ListFilter, Copy, ChevronDown, Settings } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { adGroupPath, createAdGroupPath } from '../../../routes';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import { formatMetric, METRICS } from '../../../components/console/metrics';
import TableDateButton from '../../../components/console/TableDateButton';
import { effectiveCpc } from '../../builder/sd/launch';

const METRIC_COLUMNS = {
  'Sponsored Products': ['spend', 'orders', 'sales', 'roas', 'impressions', 'clicks'],
  'Sponsored Brands': ['clicks', 'dpv', 'spend', 'orders', 'sales', 'acos'],
  'Sponsored Display': ['spend', 'impressions', 'clicks', 'ctr', 'dpv', 'orders'],
};

function BidCell({ adGroup }) {
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const [draft, setDraft] = useState(null);
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n) && n > 0) updateAdGroup(adGroup.id, { defaultBid: n });
    setDraft(null);
  };
  if (draft !== null) {
    return (
      <input autoFocus className="cx-cell-input" value={draft} onChange={e => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }} />
    );
  }
  return <button type="button" className="cx-cell-box" onClick={() => setDraft(String(adGroup.defaultBid ?? ''))}>₹{Number(adGroup.defaultBid || 0).toFixed(2)}</button>;
}

/** Display ad groups show the cost-control target (CPC, vCPM or cost per order) instead of a default bid. */
function CostControlCell({ campaign }) {
  const updateCampaign = useStore(s => s.updateCampaign);
  const [draft, setDraft] = useState(null);
  if (!campaign.costControlEnabled) return <span className="cx-sub">—</span>;
  const value = campaign.costControlValue ?? campaign.bid ?? 0;
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n) && n > 0) updateCampaign(campaign.id, { costControlValue: n, bid: effectiveCpc(campaign.goal, n) });
    setDraft(null);
  };
  if (draft !== null) {
    return (
      <input autoFocus className="cx-cell-input" value={draft} onChange={e => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }} />
    );
  }
  return <button type="button" className="cx-cell-box" onClick={() => setDraft(String(value))}>₹{Number(value).toFixed(2)}</button>;
}

const adGroupStatus = (campaign, ag) => {
  if (campaign.status !== 'Enabled') return campaign.status === 'Archived' ? 'Campaign archived' : 'Campaign paused';
  return ag.status === 'Enabled' ? 'Delivering' : 'Paused';
};

export default function AdGroupsTab({ campaign }) {
  const navigate = useNavigate();
  const allAdGroups = useStore(s => s.adGroups);
  const keywords = useStore(s => s.keywords);
  const sbAds = useStore(s => s.sbAds || []);
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const range = useConsoleRange();
  const [search, setSearch] = useState('');

  const isSB = campaign.type === 'Sponsored Brands';
  const isSD = campaign.type === 'Sponsored Display';
  const columns = METRIC_COLUMNS[campaign.type] || METRIC_COLUMNS['Sponsored Products'];

  const rows = useMemo(() => allAdGroups
    .filter(ag => ag.campaignId === campaign.id)
    .filter(ag => !search || ag.name.toLowerCase().includes(search.toLowerCase()))
    .map(ag => ({ ag, m: rangeMetrics(withParentStart(ag, campaign), range) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [allAdGroups, campaign, search, range.from.getTime(), range.to.getTime()]);

  const isAuto = campaign.type === 'Sponsored Products' && campaign.targetingType === 'Auto';
  const AUTO_TARGET_GROUPS = 4; // close match, loose match, substitutes, complements
  const targetCount = (ag) => {
    if (isSD) return (campaign.sdTargets || []).length;
    if (isAuto) return AUTO_TARGET_GROUPS;
    return keywords.filter(k => k.adGroupId === ag.id).length;
  };
  const sbAdName = (ag) => sbAds.find(a => a.campaignId === campaign.id)?.name || campaign.sbCreative?.headline || ag.name;

  return (
    <>
      <div className="cx-toolbar">
        <button type="button" className={isSB || isSD ? 'cx-btn cx-btn-pill' : 'cx-btn cx-btn-primary'} onClick={() => navigate(createAdGroupPath(campaign))}>
          Create ad group
        </button>
        <label className="cx-search" style={{ width: 240 }}>
          <Search size={16} />
          <input placeholder="Find an ad group" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <button type="button" className="cx-tool-btn" aria-label="Filter by"><ListFilter size={16} /></button>
        <button type="button" className="cx-tool-btn" aria-label="Copy" disabled><Copy size={16} /></button>
        <span className="cx-toolbar-spacer" />
        <button type="button" className="cx-tool-btn">View: Default <ChevronDown size={14} /></button>
        <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
        <TableDateButton />
        <button type="button" className="cx-tool-btn" aria-label="Table settings"><Settings size={16} /></button>
        <button type="button" className="cx-tool-btn">Export</button>
      </div>

      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Select all" /></th>
              <th>Active</th>
              <th>Ad group name <Info size={13} /></th>
              <th>Status <Info size={13} /></th>
              {isSB && <th>Ad name <Info size={13} /></th>}
              {isSD && <th>Bid optimisation <Info size={13} /></th>}
              {!isSB && <th className="is-num">{isSD ? 'Cost control' : 'Default bid'} <Info size={13} /></th>}
              <th className="is-num">{isSB ? 'Targets' : 'Total targets'} <Info size={13} /></th>
              {!isSB && <th className="is-num">{isSD ? 'Ads' : 'Products'} <Info size={13} /></th>}
              {columns.map(k => <th key={k} className="is-num">{METRICS[k].label} <Info size={13} /></th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ ag, m }) => (
              <tr key={ag.id}>
                <td><input type="checkbox" aria-label="select" /></td>
                <td>
                  <button type="button" className={`cx-switch ${ag.status === 'Enabled' ? 'is-on' : ''}`} aria-label={ag.status}
                    onClick={() => updateAdGroup(ag.id, { status: ag.status === 'Enabled' ? 'Paused' : 'Enabled' })} />
                </td>
                <td><Link className="cx-link" to={adGroupPath(campaign, ag.id)}>{ag.name}</Link></td>
                <td><span className="cx-status">{adGroupStatus(campaign, ag)}</span></td>
                {isSB && <td>{sbAdName(ag)}</td>}
                {isSD && <td>{{ reach: 'Reach', conversion: 'Conversions' }[campaign.goal] || 'Page visits'}</td>}
                {!isSB && <td className="is-num">{isSD ? <CostControlCell campaign={campaign} /> : <BidCell adGroup={ag} />}</td>}
                <td className="is-num"><Link className="cx-link" to={adGroupPath(campaign, ag.id, 'targeting')}>{targetCount(ag)}</Link></td>
                {!isSB && <td className="is-num"><Link className="cx-link" to={adGroupPath(campaign, ag.id, 'ads')}>{(ag.products || []).length}</Link></td>}
                {columns.map(k => <td key={k} className="is-num">{m[k] ? formatMetric(k, m[k]) : '—'}</td>)}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={12}><div className="cx-empty"><h3>No ad groups</h3><p>Create an ad group to start advertising.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
