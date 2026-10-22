import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EllipsisVertical, TriangleAlert } from 'lucide-react';
import Info from '../../components/console/InfoGlyph';
import { useStore } from '../../store/useStore';
import { campaignPath, ROUTES } from '../../routes';
import { consoleId } from '../../utils/consoleId';
import { formatCurrency } from '../../utils/simulation';
import { deliveryStatus, STATUS_TONE } from '../../utils/campaignStatus';
import { localISODate } from '../../utils/dateRanges';
import ConsoleTable from '../../components/console/table/ConsoleTable';
import InlineNumber, { ActiveSwitch } from '../../components/console/table/InlineEdit';
import BulkValueDialog from '../../components/console/table/BulkValueDialog';
import { statusBulkSection } from '../../components/console/table/bulkActions';
import { GROUPS, metricColumns, metricFilterFields } from '../../components/console/table/columns';
import { DEFAULT_STATUS_FILTER, statusField, numberField, choiceField } from '../../components/console/table/tableFilters';

const TARGETING_LABEL = { Auto: 'Automatic Targeting', Manual: 'Manual Targeting' };
const MAX_TOP_OF_SEARCH = 900;
const MIN_BUDGET = 1;
// Console defaults: Clicks, CTR, CPC and Total cost; the rest are added from "Customise columns".
const METRIC_KEYS = ['clicks', 'ctr', 'cpc', 'spend', 'impressions', 'orders', 'sales', 'acos', 'roas'];
const DEFAULT_METRICS = ['clicks', 'ctr', 'cpc', 'spend'];

const shortDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${d.getFullYear()}`;
};

function RowMenu({ campaign }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateCampaign = useStore(s => s.updateCampaign);
  return (
    <span className="cx-pop-anchor">
      <button type="button" className="cx-tool-btn" aria-label="Campaign actions" onClick={() => setIsOpen(true)}><EllipsisVertical size={16} /></button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="cx-pop" style={{ left: 0, top: 30 }}>
            <Link className="cx-pop-item" to={campaignPath(campaign)}>View ad groups</Link>
            <Link className="cx-pop-item" to={campaignPath(campaign, 'settings')}>Edit campaign settings</Link>
            {campaign.status !== 'Archived' && (
              <button type="button" className="cx-pop-item" onClick={() => { updateCampaign(campaign.id, { status: 'Archived' }); setIsOpen(false); }}>Archive</button>
            )}
          </div>
        </>
      )}
    </span>
  );
}

function useCampaignColumns(portfolios) {
  const toggleCampaignStatus = useStore(s => s.toggleCampaignStatus);
  const updateCampaign = useStore(s => s.updateCampaign);
  return useMemo(() => {
    const portfolioName = (c) => portfolios.find(p => p.id === c.portfolioId)?.name || '—';
    return [
      { key: 'alerts', label: 'Alerts', header: <TriangleAlert size={14} aria-label="Alerts" />, fixed: true, isUtility: true, cell: () => null },
      { key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => r.campaign.status,
        cell: ({ campaign: c }) => <ActiveSwitch isOn={c.status === 'Enabled'} disabled={c.status === 'Archived'} onToggle={() => toggleCampaignStatus(c.id)} /> },
      { key: 'name', label: 'Campaign name', fixed: true, info: true, csv: r => r.campaign.name,
        cell: ({ campaign: c }) => (
          <div className="cx-name-flex">
            <div><Link className="cx-link" to={campaignPath(c)}>{c.name}</Link><span className="cx-id">{consoleId(c.id)}</span></div>
            <RowMenu campaign={c} />
          </div>
        ) },
      { key: 'country', label: 'Campaign country', group: GROUPS.detail, csv: () => 'India', cell: () => 'India' },
      { key: 'status', label: 'Status', group: GROUPS.settings, info: true, csv: r => deliveryStatus(r.campaign),
        cell: ({ campaign: c }) => { const s = deliveryStatus(c); return <span className={`cx-status ${STATUS_TONE[s]}`}>{s} <Info size={13} /></span>; } },
      { key: 'type', label: 'Type', group: GROUPS.settings, info: true, csv: r => r.campaign.type,
        cell: ({ campaign: c }) => <>{c.type}<span className="cx-sub">{TARGETING_LABEL[c.targetingType] || c.targetingType}</span></> },
      { key: 'startDate', label: 'Campaign start date', group: GROUPS.detail, info: true, csv: r => r.campaign.startDate,
        cell: ({ campaign: c }) => <span className="cx-cell-box is-muted">{shortDate(c.startDate) || '—'}</span> },
      { key: 'endDate', label: 'Campaign end date', group: GROUPS.detail, info: true, csv: r => r.campaign.endDate || 'No End Date',
        cell: ({ campaign: c }) => <span className="cx-cell-box">{shortDate(c.endDate) || 'No End Date'}</span> },
      { key: 'topOfSearch', label: 'Top-of-search bid adjustment', group: GROUPS.settings, num: true, csv: r => r.campaign.placementAdjustments?.top ?? 0,
        sortValue: r => r.campaign.placementAdjustments?.top ?? 0,
        cell: ({ campaign: c }) => (c.type === 'Sponsored Display' ? '—' : (
          <InlineNumber display={`${c.placementAdjustments?.top ?? 0}%`} initial={String(c.placementAdjustments?.top ?? 0)} width={70}
            onSave={n => updateCampaign(c.id, { placementAdjustments: { ...(c.placementAdjustments || {}), top: Math.min(MAX_TOP_OF_SEARCH, Math.round(n)) } })} />
        )) },
      { key: 'budget', label: 'Campaign budget amount', group: GROUPS.detail, num: true, csv: r => Number(r.campaign.budget),
        sortValue: r => Number(r.campaign.budget) || 0,
        total: rows => formatCurrency(rows.reduce((s, r) => s + Number(r.campaign.budget || 0), 0)),
        cell: ({ campaign: c }) => (
          <InlineNumber display={`₹${Number(c.budget).toFixed(2)} - ${(c.budgetType || 'Daily').toLowerCase()}`} initial={Number(c.budget).toFixed(2)}
            min={MIN_BUDGET} onSave={n => updateCampaign(c.id, { budget: n })} />
        ) },
      ...metricColumns(METRIC_KEYS, DEFAULT_METRICS),
      { key: 'portfolio', label: 'Portfolio name', group: GROUPS.detail, isDefault: false, csv: r => portfolioName(r.campaign), cell: r => portfolioName(r.campaign) },
      { key: 'bidStrategy', label: 'Campaign bid strategy', group: GROUPS.detail, isDefault: false, csv: r => r.campaign.biddingStrategy || '',
        cell: r => r.campaign.biddingStrategy || '—' },
      { key: 'costType', label: 'Cost type', group: GROUPS.settings, isDefault: false, csv: r => r.campaign.costType || 'CPC', cell: r => r.campaign.costType || 'CPC' },
    ];
  }, [portfolios, toggleCampaignStatus, updateCampaign]);
}

function campaignFilterFields(portfolios) {
  return [
    choiceField('country', 'Campaign country', [{ value: 'India', label: 'India' }], () => 'India'),
    statusField(r => r.campaign.status),
    choiceField('portfolio', 'Portfolio name', [{ value: 'none', label: 'No portfolio' }, ...portfolios.map(p => ({ value: p.id, label: p.name }))],
      r => r.campaign.portfolioId || 'none', true),
    numberField('budget', 'Campaign budget amount', r => Number(r.campaign.budget) || 0),
    ...metricFilterFields(['impressions', 'clicks', 'ctr', 'cpc', 'spend', 'orders', 'sales', 'acos', 'roas']),
    choiceField('targeting', 'Targeting', [{ value: 'Manual', label: 'Manual Targeting' }, { value: 'Auto', label: 'Automatic Targeting' }],
      r => (r.campaign.targetingType === 'Auto' ? 'Auto' : 'Manual')),
    choiceField('outOfBudget', 'Out of budget', [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
      r => (deliveryStatus(r.campaign) === 'Out of budget' ? 'yes' : 'no')),
  ];
}

const BULK_DIALOGS = {
  budget: { title: 'Update budget', label: 'Daily budget (₹)', type: 'number', validate: v => (Number(v) >= MIN_BUDGET ? null : `Enter a budget of at least ₹${MIN_BUDGET}.00.`) },
  endDate: { title: 'Update end date', label: 'End date', type: 'date', validate: v => (v >= localISODate() ? null : 'The end date can’t be in the past.') },
  portfolio: { title: 'Move to portfolio', label: 'Portfolio', type: 'select' },
};

/**
 * Campaigns table with the console toolbar.
 * @param {{ rows: Array<{ campaign: object, m: object }>, extraFilterPills?: object[] }} props
 */
export default function CampaignsTable({ rows, extraFilterPills }) {
  const navigate = useNavigate();
  const portfolios = useStore(s => s.portfolios);
  const updateCampaign = useStore(s => s.updateCampaign);
  const columns = useCampaignColumns(portfolios);
  const filterFields = useMemo(() => campaignFilterFields(portfolios), [portfolios]);
  const [dialog, setDialog] = useState(null); // { kind, ids }

  const bulkSections = (selectedRows, clear) => {
    const items = selectedRows.map(r => r.campaign);
    const today = localISODate();
    const open = (kind) => setDialog({ kind, ids: items.map(c => c.id), clear });
    return [
      statusBulkSection(items, (c, status) => updateCampaign(c.id, { status }), clear),
      { title: 'Campaign details', items: [
        { label: 'View targets', onClick: () => navigate(ROUTES.targetsView) },
        { label: 'View ad groups', onClick: () => navigate(items.length === 1 ? campaignPath(items[0]) : ROUTES.adGroupsView) },
      ] },
      { title: 'Update', items: [
        { label: 'Start date', disabled: items.some(c => c.startDate && c.startDate <= today), onClick: () => {} },
        { label: 'End date', onClick: () => open('endDate') },
        { label: 'Budget', onClick: () => open('budget') },
      ] },
      { title: 'Portfolio', items: [
        { label: 'Move to portfolio', disabled: portfolios.length === 0, onClick: () => open('portfolio') },
        { label: 'Remove from portfolio', disabled: items.every(c => !c.portfolioId), onClick: () => { items.forEach(c => updateCampaign(c.id, { portfolioId: '' })); clear(); } },
        { label: 'Create portfolio', onClick: () => navigate(ROUTES.portfolios) },
      ] },
    ];
  };

  const applyDialog = (value) => {
    const patch = { budget: { budget: Number(value) }, endDate: { endDate: value }, portfolio: { portfolioId: value } }[dialog.kind];
    dialog.ids.forEach(id => updateCampaign(id, patch));
    dialog.clear();
  };

  return (
    <>
      <ConsoleTable
        tableKey="campaigns"
        exportName="Campaigns"
        columns={columns}
        rows={rows}
        rowKey={r => r.campaign.id}
        filterFields={filterFields}
        initialFilters={[DEFAULT_STATUS_FILTER]}
        extraFilterPills={extraFilterPills}
        search={{ placeholder: 'Search by name or ID', match: (r, q) => r.campaign.name.toLowerCase().includes(q) || consoleId(r.campaign.id).toLowerCase().includes(q) }}
        leftActions={<button type="button" className="cx-btn cx-btn-primary" onClick={() => navigate(ROUTES.createCampaign)}>Create campaign</button>}
        bulkSections={bulkSections}
        empty={<div className="cx-empty"><h3>No campaigns</h3><p>Try adjusting your filters or create a campaign.</p></div>}
      />
      {dialog && (
        <BulkValueDialog {...BULK_DIALOGS[dialog.kind]} options={portfolios.map(p => ({ value: p.id, label: p.name }))}
          onApply={applyDialog} onClose={() => setDialog(null)} />
      )}
    </>
  );
}
