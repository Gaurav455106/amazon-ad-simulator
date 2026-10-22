import { useMemo, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import ConsoleTable from '../../../components/console/table/ConsoleTable';
import { ActiveSwitch } from '../../../components/console/table/InlineEdit';
import { statusBulkSection } from '../../../components/console/table/bulkActions';
import { GROUPS, metricColumns, metricFilterFields } from '../../../components/console/table/columns';
import { DEFAULT_STATUS_FILTER, statusField, numberField, choiceField } from '../../../components/console/table/tableFilters';
import AddKeywordsModal from '../../../components/console/AddKeywordsModal';
import { SUGGESTED_KWS } from '../../../data/keywordSuggestions';

const METRIC_COLUMNS = ['impressions', 'clicks', 'ctr', 'spend', 'orders', 'sales', 'acos', 'roas'];
const AUTO_GROUPS = [
  { key: 'close', label: 'Close match', hint: 'Shoppers searching with terms closely related to your products' },
  { key: 'loose', label: 'Loose match', hint: 'Shoppers searching with terms loosely related to your products' },
  { key: 'substitutes', label: 'Substitutes', hint: 'Shoppers viewing detail pages of products similar to yours' },
  { key: 'complements', label: 'Complements', hint: 'Shoppers viewing detail pages of products that complement yours' },
];
const MIN_BID = 1;

const suggestedFor = (k) => {
  const s = SUGGESTED_KWS.find(x => x.kw === k.keyword)?.[String(k.matchType).toLowerCase()];
  if (s) return s;
  const sugg = k.suggestedBid || k.bid;
  return { sugg, min: sugg * 0.7, max: sugg * 1.35 };
};

function BidInput({ value, onSave }) {
  const [draft, setDraft] = useState(null);
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n) && n >= MIN_BID) onSave(n);
    setDraft(null);
  };
  if (draft === null) return <button type="button" className="cx-cell-box" onClick={() => setDraft(Number(value).toFixed(2))}>₹{Number(value).toFixed(2)}</button>;
  return <input autoFocus className="cx-cell-input" value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
    onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }} />;
}

const MATCH_TYPES = ['Exact', 'Phrase', 'Broad'].map(v => ({ value: v, label: v }));
const activeCol = (get, toggle) => ({ key: 'active', label: 'Active status', header: 'Active', fixed: true, csv: r => get(r),
  cell: r => <ActiveSwitch isOn={get(r) === 'Enabled'} disabled={get(r) === 'Archived'} onToggle={() => toggle(r)} /> });
const statusCol = (get) => ({ key: 'status', label: 'Status', group: GROUPS.settings, info: true, csv: get, cell: r => <span className="cx-status">{get(r)}</span> });
const pill = (label, isPill, onAdd) => (
  <button type="button" className={isPill ? 'cx-btn cx-btn-pill' : 'cx-btn cx-btn-primary'} disabled={!onAdd}
    title={onAdd ? undefined : 'Not available in the simulator yet'} onClick={onAdd}>{label}</button>
);

function AutoTargets({ campaign, adGroup }) {
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const range = useConsoleRange();
  const groups = adGroup.autoTargets || {};
  const agMetrics = rangeMetrics(withParentStart(adGroup, campaign), range);
  const setGroup = (key, patch) => updateAdGroup(adGroup.id, { autoTargets: { ...groups, [key]: { status: 'Enabled', bid: adGroup.defaultBid, ...groups[key], ...patch } } });
  const enabledCount = AUTO_GROUPS.filter(g => (groups[g.key]?.status || 'Enabled') === 'Enabled').length;

  const rows = AUTO_GROUPS.map(g => {
    const st = groups[g.key] || { status: 'Enabled', bid: adGroup.defaultBid };
    const isOn = st.status === 'Enabled';
    const share = isOn ? 1 / Math.max(1, enabledCount) : 0;
    const m = Object.fromEntries(METRIC_COLUMNS.map(k => [k, ['ctr', 'acos', 'roas'].includes(k) ? (isOn ? agMetrics[k] : 0) : agMetrics[k] * share]));
    return { g, st, isOn, m };
  });
  const columns = [
    activeCol(r => r.st.status, r => setGroup(r.g.key, { status: r.isOn ? 'Paused' : 'Enabled' })),
    { key: 'group', label: 'Targeting group', fixed: true, csv: r => r.g.label, cell: r => <>{r.g.label}<span className="cx-sub">{r.g.hint}</span></> },
    statusCol(r => (r.isOn ? 'Delivering' : 'Paused')),
    { key: 'sugg', label: 'Suggested bid', group: GROUPS.settings, num: true, csv: () => (adGroup.defaultBid * 1.12).toFixed(2), cell: () => `₹${(adGroup.defaultBid * 1.12).toFixed(2)}` },
    { key: 'bid', label: 'Bid', group: GROUPS.settings, num: true, csv: r => r.st.bid ?? adGroup.defaultBid,
      cell: r => <BidInput value={r.st.bid ?? adGroup.defaultBid} onSave={(bid) => setGroup(r.g.key, { bid })} /> },
    ...metricColumns(METRIC_COLUMNS),
  ];
  return <ConsoleTable tableKey="auto-targets" exportName={`${adGroup.name} targeting`} columns={columns} rows={rows} rowKey={r => r.g.key}
    filterFields={[statusField(r => r.st.status), ...metricFilterFields(METRIC_COLUMNS)]} paginate={false} />;
}

function DisplayTargets({ campaign }) {
  const updateCampaign = useStore(s => s.updateCampaign);
  const targets = campaign.sdTargets || [];
  const rows = targets.map((t, i) => ({ t, i, isOn: t.status !== 'Paused' }));
  const patch = (i, p) => updateCampaign(campaign.id, { sdTargets: targets.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const kind = (t) => ({ Contextual: 'Contextual targeting', Optimised: 'Optimised targeting' }[t.type] || 'Audience');
  const columns = [
    activeCol(r => (r.isOn ? 'Enabled' : 'Paused'), r => patch(r.i, { status: r.isOn ? 'Paused' : 'Enabled' })),
    { key: 'target', label: 'Categories and products', fixed: true, csv: r => r.t.name, cell: r => <><span className="cx-sub">{kind(r.t)}</span>{r.t.name}</> },
    statusCol(r => (r.isOn ? 'Delivering' : 'Paused')),
    { key: 'bid', label: 'Bid', group: GROUPS.settings, num: true, csv: r => r.t.bid ?? '',
      cell: r => (campaign.costControlEnabled ? <span className="cx-sub" title="Bids are set by cost control">—</span> : r.t.bid ? <BidInput value={r.t.bid} onSave={(bid) => patch(r.i, { bid })} /> : '—') },
  ];
  return <ConsoleTable tableKey="display-targets" exportName={`${campaign.name} targeting`} columns={columns} rows={rows} rowKey={r => `${r.t.type}-${r.t.name}`}
    filterFields={[statusField(r => (r.isOn ? 'Enabled' : 'Paused'))]} paginate={false} showDate={false}
    leftActions={pill('Add contextual targets', true)}
    empty={<div className="cx-empty"><h3>No targets</h3><p>Add contextual or audience targets to reach shoppers.</p></div>} />;
}

export default function TargetingTab({ campaign, adGroup }) {
  const keywords = useStore(s => s.keywords);
  const addKeywords = useStore(s => s.addKeywords);
  const updateKeyword = useStore(s => s.updateKeyword);
  const range = useConsoleRange();
  const [isAdding, setIsAdding] = useState(false);

  const isSD = campaign.type === 'Sponsored Display';
  const isAuto = campaign.type === 'Sponsored Products' && campaign.targetingType === 'Auto';

  const rows = useMemo(() => keywords
    .filter(k => k.adGroupId === adGroup.id)
    .map(k => ({ k, m: rangeMetrics(withParentStart(k, campaign), range) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [keywords, adGroup.id, campaign.startDate, range.from.getTime(), range.to.getTime()]);

  if (isSD) return <DisplayTargets campaign={campaign} />;
  if (isAuto) return <AutoTargets campaign={campaign} adGroup={adGroup} />;

  const status = (k) => (k.status === 'Archived' ? 'Archived' : campaign.status !== 'Enabled' || adGroup.status !== 'Enabled' || k.status !== 'Enabled' ? 'Paused' : 'Delivering');
  const columns = [
    activeCol(r => r.k.status, r => updateKeyword(r.k.id, { status: r.k.status === 'Enabled' ? 'Paused' : 'Enabled' })),
    { key: 'keyword', label: 'Keyword', fixed: true, csv: r => r.k.keyword, cell: r => r.k.keyword },
    { key: 'matchType', label: 'Target match type', group: GROUPS.settings, info: true, csv: r => r.k.matchType, cell: r => r.k.matchType },
    statusCol(r => status(r.k)),
    { key: 'sugg', label: 'Suggested bid', group: GROUPS.settings, num: true, info: true, csv: r => suggestedFor(r.k).sugg.toFixed(2),
      cell: ({ k }) => {
        const s = suggestedFor(k);
        return (
          <>
            ₹{s.sugg.toFixed(2)}
            <span className="cx-sub">₹{s.min.toFixed(2)} - ₹{s.max.toFixed(2)}</span>
            {Math.abs(k.bid - s.sugg) > 0.005 && <button type="button" className="cx-link" onClick={() => updateKeyword(k.id, { bid: Number(s.sugg.toFixed(2)) })}>Apply</button>}
          </>
        );
      } },
    { key: 'bid', label: 'Bid', group: GROUPS.settings, num: true, csv: r => r.k.bid, sortValue: r => r.k.bid,
      cell: ({ k }) => <BidInput value={k.bid} onSave={(bid) => updateKeyword(k.id, { bid })} /> },
    ...metricColumns(METRIC_COLUMNS),
  ];
  const fields = [
    statusField(r => r.k.status),
    choiceField('matchType', 'Target match type', MATCH_TYPES, r => r.k.matchType),
    numberField('bid', 'Bid', r => r.k.bid),
    ...metricFilterFields(METRIC_COLUMNS),
  ];

  return (
    <>
      <ConsoleTable
        tableKey="keyword-targets"
        exportName={`${adGroup.name} keywords`}
        columns={columns}
        rows={rows}
        rowKey={r => r.k.id}
        filterFields={fields}
        initialFilters={[DEFAULT_STATUS_FILTER]}
        search={{ placeholder: 'Find a target', match: (r, q) => r.k.keyword.toLowerCase().includes(q) }}
        leftActions={pill('Add keywords', campaign.type === 'Sponsored Brands', () => setIsAdding(true))}
        bulkSections={(sel, clear) => [statusBulkSection(sel.map(r => r.k), (k, st) => updateKeyword(k.id, { status: st }), clear)]}
        empty={<div className="cx-empty"><h3>No keywords</h3><p>Add keywords to show your ads in shopper searches.</p></div>}
      />
      {isAdding && (
        <AddKeywordsModal
          defaultBid={adGroup.defaultBid || 1}
          existing={rows.map(r => r.k)}
          onClose={() => setIsAdding(false)}
          onSave={(kws) => addKeywords(kws.map(kw => ({ ...kw, adGroupId: adGroup.id, campaignId: campaign.id, status: 'Enabled' })))}
        />
      )}
    </>
  );
}
