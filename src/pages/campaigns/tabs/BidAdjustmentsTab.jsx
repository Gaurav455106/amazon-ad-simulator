import { useState } from 'react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics } from '../../../utils/performance';
import { placementBreakdown } from '../../../utils/placements';
import ConsoleTable from '../../../components/console/table/ConsoleTable';
import { GROUPS, metricColumns, metricFilterFields } from '../../../components/console/table/columns';

const MAX_ADJUSTMENT = 900;
const METRIC_COLUMNS = ['impressions', 'clicks', 'ctr', 'spend', 'orders', 'sales', 'roas'];
const EXTRA_METRICS = ['cpc', 'acos'];
const STRATEGY_LABEL = {
  'Dynamic bids - up and down': 'Dynamic bidding (up and down)',
  'Dynamic bids - down only': 'Dynamic bidding (down only)',
  'Fixed bid': 'Fixed bids',
  'Fixed bids': 'Fixed bids',
};

function AdjustmentInput({ value, onSave }) {
  const [draft, setDraft] = useState(null);
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) onSave(Math.max(0, Math.min(MAX_ADJUSTMENT, Math.round(n))));
    setDraft(null);
  };
  if (draft === null) return <button type="button" className="cx-cell-box" onClick={() => setDraft(String(value))}>{value}%</button>;
  return (
    <input autoFocus className="cx-cell-input" style={{ width: 70 }} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }} />
  );
}

export default function BidAdjustmentsTab({ campaign }) {
  const updateCampaign = useStore(s => s.updateCampaign);
  const range = useConsoleRange();
  const [subTab, setSubTab] = useState('placements');
  const isSP = campaign.type === 'Sponsored Products';
  const adjustments = campaign.placementAdjustments || {};
  const totals = rangeMetrics(campaign, range);
  const rows = placementBreakdown(totals, adjustments);
  const strategy = isSP ? (STRATEGY_LABEL[campaign.biddingStrategy] || 'Dynamic bidding (down only)') : '—';

  const adjKey = (key) => (subTab === 'business' ? `ab_${key}` : key);
  const placementColumns = [
    { key: 'placement', label: 'Placement name', fixed: true, info: true, csv: r => r.label, cell: r => r.label },
    { key: 'strategy', label: 'Campaign bid strategy', group: GROUPS.settings, info: true, csv: () => strategy, cell: () => strategy },
    { key: 'adjustment', label: 'Bid adjustment', group: GROUPS.settings, num: true, info: true, csv: r => adjustments[adjKey(r.key)] || 0,
      sortValue: r => adjustments[adjKey(r.key)] || 0,
      cell: r => (
        <AdjustmentInput value={adjustments[adjKey(r.key)] || 0}
          onSave={(n) => updateCampaign(campaign.id, { placementAdjustments: { ...adjustments, [adjKey(r.key)]: n } })} />
      ) },
    ...metricColumns([...METRIC_COLUMNS, ...EXTRA_METRICS], METRIC_COLUMNS),
  ];

  const subTabs = isSP
    ? [{ key: 'placements', label: 'All placements' }, { key: 'audiences', label: 'Audiences' }, { key: 'business', label: 'Amazon Business placements' }]
    : [{ key: 'placements', label: 'Placements' }];

  return (
    <>
      <div className="sub-tabs">
        {subTabs.map(t => (
          <button key={t.key} type="button" className={`sub-tab ${subTab === t.key ? 'is-active' : ''}`} onClick={() => setSubTab(t.key)}>
            {t.label} {t.key !== 'audiences' && <Info size={13} />}
          </button>
        ))}
      </div>

      {subTab === 'audiences' ? (
        <div className="cx-empty">
          <h3>No audience bid adjustments</h3>
          <p>Increase bids by up to 900% for shoppers in an audience segment. Add one from Campaign settings.</p>
        </div>
      ) : (
        <>
          <p className="tab-intro">
            {subTab === 'business'
              ? 'Further increase bids across placements on Amazon Business.'
              : `Increase your bid for specific placements.${isSP ? ' These placements include Amazon Business.' : ''}`}
          </p>
          <ConsoleTable
            key={subTab}
            tableKey="placements"
            exportName={`${campaign.name} placements`}
            columns={placementColumns}
            rows={rows}
            rowKey={r => r.key}
            filterFields={metricFilterFields([...METRIC_COLUMNS, ...EXTRA_METRICS])}
            paginate={false}
          />
          <p className="tab-footnote">Bid adjustment data is current, but other placement data could be delayed up to 12 hours.</p>
        </>
      )}
    </>
  );
}
