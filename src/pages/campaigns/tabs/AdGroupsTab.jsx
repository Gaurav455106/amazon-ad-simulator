import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../../store/useStore';
import { adGroupPath, createAdGroupPath } from '../../../routes';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import ConsoleTable from '../../../components/console/table/ConsoleTable';
import { ActiveSwitch } from '../../../components/console/table/InlineEdit';
import { statusBulkSection } from '../../../components/console/table/bulkActions';
import { GROUPS, metricColumns, metricFilterFields } from '../../../components/console/table/columns';
import { DEFAULT_STATUS_FILTER, statusField, numberField } from '../../../components/console/table/tableFilters';
import { effectiveCpc } from '../../builder/sd/launch';
import { sbAdsFor } from '../../adgroups/sbAds';

// Default metric columns per campaign type, as the console shows them; the rest are in "Customise columns".
const DEFAULT_METRICS = {
  'Sponsored Products': ['spend', 'orders', 'sales', 'roas', 'impressions', 'clicks'],
  'Sponsored Brands': ['clicks', 'dpv', 'spend', 'orders', 'sales', 'acos'],
  'Sponsored Display': ['spend', 'impressions', 'clicks', 'ctr', 'dpv', 'orders'],
};
const ALL_METRICS = ['impressions', 'clicks', 'ctr', 'cpc', 'spend', 'orders', 'sales', 'acos', 'roas', 'dpv'];
const AUTO_TARGET_GROUPS = 4; // close match, loose match, substitutes, complements

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

  const isSB = campaign.type === 'Sponsored Brands';
  const isSD = campaign.type === 'Sponsored Display';
  const isAuto = campaign.type === 'Sponsored Products' && campaign.targetingType === 'Auto';
  const defaults = DEFAULT_METRICS[campaign.type] || DEFAULT_METRICS['Sponsored Products'];

  const rows = useMemo(() => allAdGroups
    .filter(ag => ag.campaignId === campaign.id)
    .map(ag => ({ ag, m: rangeMetrics(withParentStart(ag, campaign), range) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [allAdGroups, campaign, range.from.getTime(), range.to.getTime()]);

  const columns = useMemo(() => {
    const targetCount = (ag) => {
      if (isSD) return (campaign.sdTargets || []).length;
      if (isAuto) return AUTO_TARGET_GROUPS;
      return keywords.filter(k => k.adGroupId === ag.id).length;
    };
    const adCount = (ag) => (isSB ? sbAdsFor(campaign, ag, sbAds).length : (ag.products || []).length);
    const sbAdName = (ag) => sbAdsFor(campaign, ag, sbAds)[0]?.name || ag.name;
    return [
      { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => r.ag.status,
        cell: ({ ag }) => <ActiveSwitch isOn={ag.status === 'Enabled'} disabled={ag.status === 'Archived'} onToggle={() => updateAdGroup(ag.id, { status: ag.status === 'Enabled' ? 'Paused' : 'Enabled' })} /> },
      { key: 'name', label: 'Ad group name', fixed: true, info: true, csv: r => r.ag.name,
        cell: ({ ag }) => <Link className="cx-link" to={adGroupPath(campaign, ag.id)}>{ag.name}</Link> },
      { key: 'status', label: 'Status', group: GROUPS.settings, info: true, csv: r => adGroupStatus(campaign, r.ag), cell: ({ ag }) => <span className="cx-status">{adGroupStatus(campaign, ag)}</span> },
      ...(isSB ? [{ key: 'adName', label: 'Ad name', group: GROUPS.detail, info: true, csv: r => sbAdName(r.ag), cell: ({ ag }) => sbAdName(ag) }] : []),
      ...(isSD ? [{ key: 'bidOpt', label: 'Bid optimisation', group: GROUPS.settings, info: true, csv: () => campaign.goal || '',
        cell: () => ({ reach: 'Reach', conversion: 'Conversions' }[campaign.goal] || 'Page visits') }] : []),
      ...(!isSB ? [{ key: 'bid', label: isSD ? 'Cost control' : 'Default bid', group: GROUPS.settings, num: true, info: true,
        csv: r => (isSD ? campaign.costControlValue ?? '' : r.ag.defaultBid), sortValue: r => r.ag.defaultBid || 0,
        cell: ({ ag }) => (isSD ? <CostControlCell campaign={campaign} /> : <BidCell adGroup={ag} />) }] : []),
      { key: 'targets', label: isSB ? 'Targets' : 'Total targets', group: GROUPS.detail, num: true, info: true, csv: r => targetCount(r.ag), sortValue: r => targetCount(r.ag),
        cell: ({ ag }) => <Link className="cx-link" to={adGroupPath(campaign, ag.id, 'targeting')}>{targetCount(ag)}</Link> },
      { key: 'products', label: isSB || isSD ? 'Ads' : 'Products', group: GROUPS.detail, num: true, info: true, csv: r => adCount(r.ag), sortValue: r => adCount(r.ag),
        cell: ({ ag }) => <Link className="cx-link" to={adGroupPath(campaign, ag.id, 'ads')}>{adCount(ag)}</Link> },
      ...metricColumns([...defaults, ...ALL_METRICS.filter(k => !defaults.includes(k))], defaults),
    ];
  }, [campaign, isSB, isSD, isAuto, keywords, sbAds, defaults, updateAdGroup]);

  const fields = useMemo(() => [
    statusField(r => r.ag.status),
    ...(!isSB && !isSD ? [numberField('bid', 'Default bid', r => r.ag.defaultBid || 0)] : []),
    ...metricFilterFields(ALL_METRICS),
  ], [isSB, isSD]);

  return (
    <ConsoleTable
      tableKey={`ad-groups-${campaign.type}`}
      exportName={`${campaign.name} ad groups`}
      columns={columns}
      rows={rows}
      rowKey={r => r.ag.id}
      filterFields={fields}
      initialFilters={[DEFAULT_STATUS_FILTER]}
      search={{ placeholder: 'Find an ad group', match: (r, q) => r.ag.name.toLowerCase().includes(q) }}
      leftActions={(
        <button type="button" className={isSB || isSD ? 'cx-btn cx-btn-pill' : 'cx-btn cx-btn-primary'} onClick={() => navigate(createAdGroupPath(campaign))}>
          Create ad group
        </button>
      )}
      bulkSections={(sel, clear) => [statusBulkSection(sel.map(r => r.ag), (ag, status) => updateAdGroup(ag.id, { status }), clear)]}
      empty={<div className="cx-empty"><h3>No ad groups</h3><p>Create an ad group to start advertising.</p></div>}
    />
  );
}
