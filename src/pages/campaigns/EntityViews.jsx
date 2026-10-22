import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { adGroupPath, campaignPath } from '../../routes';
import { consoleId } from '../../utils/consoleId';
import { formatCurrency } from '../../utils/simulation';
import ConsoleTable from '../../components/console/table/ConsoleTable';
import InlineNumber, { ActiveSwitch } from '../../components/console/table/InlineEdit';
import { statusBulkSection } from '../../components/console/table/bulkActions';
import { GROUPS, metricColumns, metricFilterFields } from '../../components/console/table/columns';
import { DEFAULT_STATUS_FILTER, statusField, numberField, choiceField } from '../../components/console/table/tableFilters';

const METRIC_KEYS = ['impressions', 'clicks', 'ctr', 'cpc', 'spend', 'orders', 'sales', 'acos', 'roas'];
const DEFAULT_METRICS = ['impressions', 'clicks', 'spend', 'orders', 'sales', 'acos', 'roas'];
const MATCH_TYPES = ['Exact', 'Phrase', 'Broad'].map(v => ({ value: v, label: v }));
const MIN_BID = 1;

const agStatus = (c, ag) => (c.status !== 'Enabled' ? 'Campaign paused' : ag.status === 'Enabled' ? 'Delivering' : 'Paused');
const campaignCell = (c) => <><Link className="cx-link" to={campaignPath(c)}>{c.name}</Link><span className="cx-sub">{c.type}</span></>;

/** All ad groups across campaigns ("Campaigns ▾ → Ad groups" view). */
export function AdGroupsView({ rows }) {
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const columns = useMemo(() => [
    { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => r.adGroup.status,
      cell: ({ adGroup: ag }) => <ActiveSwitch isOn={ag.status === 'Enabled'} disabled={ag.status === 'Archived'} onToggle={() => updateAdGroup(ag.id, { status: ag.status === 'Enabled' ? 'Paused' : 'Enabled' })} /> },
    { key: 'name', label: 'Ad group name', fixed: true, csv: r => r.adGroup.name,
      cell: ({ adGroup: ag, campaign: c }) => <><Link className="cx-link" to={adGroupPath(c, ag.id)}>{ag.name}</Link><span className="cx-id">{consoleId(ag.id)}</span></> },
    { key: 'campaign', label: 'Campaign', group: GROUPS.detail, csv: r => r.campaign.name, cell: r => campaignCell(r.campaign) },
    { key: 'status', label: 'Status', group: GROUPS.settings, csv: r => agStatus(r.campaign, r.adGroup), cell: r => <span className="cx-status">{agStatus(r.campaign, r.adGroup)}</span> },
    { key: 'defaultBid', label: 'Default bid', group: GROUPS.settings, num: true, csv: r => r.adGroup.defaultBid, sortValue: r => r.adGroup.defaultBid || 0,
      cell: ({ adGroup: ag }) => <InlineNumber display={formatCurrency(ag.defaultBid)} initial={Number(ag.defaultBid || 0).toFixed(2)} min={MIN_BID} onSave={n => updateAdGroup(ag.id, { defaultBid: n })} /> },
    ...metricColumns(METRIC_KEYS, DEFAULT_METRICS),
  ], [updateAdGroup]);
  const fields = useMemo(() => [
    statusField(r => r.adGroup.status),
    numberField('defaultBid', 'Default bid', r => r.adGroup.defaultBid || 0),
    ...metricFilterFields(METRIC_KEYS),
  ], []);
  return (
    <ConsoleTable tableKey="all-ad-groups" exportName="Ad groups" columns={columns} rows={rows} rowKey={r => r.adGroup.id}
      filterFields={fields} initialFilters={[DEFAULT_STATUS_FILTER]}
      search={{ placeholder: 'Search by name or ID', match: (r, q) => r.adGroup.name.toLowerCase().includes(q) || consoleId(r.adGroup.id).toLowerCase().includes(q) }}
      bulkSections={(sel, clear) => [statusBulkSection(sel.map(r => r.adGroup), (ag, status) => updateAdGroup(ag.id, { status }), clear)]}
      empty={<div className="cx-empty"><h3>No ad groups</h3><p>Try adjusting your filters.</p></div>} />
  );
}

/** All keyword targets across campaigns ("Campaigns ▾ → Targets" view). */
export function TargetsView({ rows }) {
  const updateKeyword = useStore(s => s.updateKeyword);
  const columns = useMemo(() => [
    { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => r.keyword.status,
      cell: ({ keyword: k }) => <ActiveSwitch isOn={k.status === 'Enabled'} disabled={k.status === 'Archived'} onToggle={() => updateKeyword(k.id, { status: k.status === 'Enabled' ? 'Paused' : 'Enabled' })} /> },
    { key: 'target', label: 'Target', fixed: true, csv: r => r.keyword.keyword, cell: r => r.keyword.keyword },
    { key: 'matchType', label: 'Match type', group: GROUPS.settings, csv: r => r.keyword.matchType, cell: r => r.keyword.matchType },
    { key: 'campaign', label: 'Campaign', group: GROUPS.detail, csv: r => r.campaign.name, cell: r => <Link className="cx-link" to={campaignPath(r.campaign)}>{r.campaign.name}</Link> },
    { key: 'adGroup', label: 'Ad group', group: GROUPS.detail, csv: r => r.adGroup?.name || '',
      cell: ({ adGroup: ag, campaign: c }) => (ag ? <Link className="cx-link" to={adGroupPath(c, ag.id, 'targeting')}>{ag.name}</Link> : '—') },
    { key: 'bid', label: 'Bid', group: GROUPS.settings, num: true, csv: r => r.keyword.bid, sortValue: r => r.keyword.bid || 0,
      cell: ({ keyword: k }) => <InlineNumber display={formatCurrency(k.bid)} initial={Number(k.bid).toFixed(2)} min={MIN_BID} onSave={n => updateKeyword(k.id, { bid: n })} /> },
    ...metricColumns(METRIC_KEYS, DEFAULT_METRICS),
  ], [updateKeyword]);
  const fields = useMemo(() => [
    statusField(r => r.keyword.status),
    choiceField('matchType', 'Match type', MATCH_TYPES, r => r.keyword.matchType),
    numberField('bid', 'Bid', r => r.keyword.bid || 0),
    ...metricFilterFields(METRIC_KEYS),
  ], []);
  return (
    <ConsoleTable tableKey="all-targets" exportName="Targets" columns={columns} rows={rows} rowKey={r => r.keyword.id}
      filterFields={fields} initialFilters={[DEFAULT_STATUS_FILTER]}
      search={{ placeholder: 'Search by target', match: (r, q) => r.keyword.keyword.toLowerCase().includes(q) }}
      bulkSections={(sel, clear) => [statusBulkSection(sel.map(r => r.keyword), (k, status) => updateKeyword(k.id, { status }), clear)]}
      empty={<div className="cx-empty"><h3>No targets</h3><p>Try adjusting your filters.</p></div>} />
  );
}
