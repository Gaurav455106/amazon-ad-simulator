import { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics } from '../../../utils/performance';
import { placementBreakdown } from '../../../utils/placements';
import { METRICS, formatMetric } from '../../../components/console/metrics';
import TableDateButton from '../../../components/console/TableDateButton';

const MAX_ADJUSTMENT = 900;
const METRIC_COLUMNS = ['impressions', 'clicks', 'ctr', 'spend', 'orders', 'sales', 'roas'];
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
          <div className="cx-toolbar">
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
                  <th>Placement name <Info size={13} /></th>
                  <th>Campaign bid strategy <Info size={13} /></th>
                  <th className="is-num"><Info size={13} /> Bid adjustment</th>
                  {METRIC_COLUMNS.map(k => <th key={k} className="is-num"><Info size={13} /> {METRICS[k].label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key}>
                    <td>{r.label}</td>
                    <td>{strategy}</td>
                    <td className="is-num">
                      <AdjustmentInput
                        value={subTab === 'business' ? (adjustments[`ab_${r.key}`] || 0) : (adjustments[r.key] || 0)}
                        onSave={(n) => updateCampaign(campaign.id, {
                          placementAdjustments: { ...adjustments, [subTab === 'business' ? `ab_${r.key}` : r.key]: n },
                        })}
                      />
                    </td>
                    {METRIC_COLUMNS.map(k => <td key={k} className="is-num">{r.m[k] ? formatMetric(k, r.m[k]) : '—'}</td>)}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3}>Total: {rows.length}</td>{METRIC_COLUMNS.map(k => <td key={k} className="is-num">{totals[k] ? formatMetric(k, totals[k]) : '—'}</td>)}</tr>
              </tfoot>
            </table>
          </div>
          <p className="tab-footnote">Bid adjustment data is current, but other placement data could be delayed up to 12 hours.</p>
        </>
      )}
    </>
  );
}
