import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, X, TriangleAlert } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { campaignPath } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, sumMetrics, dailySeries, dailyMetrics } from '../../utils/performance';
import { deliveryStatus } from '../../utils/campaignStatus';
import { formatCurrency, formatPercent } from '../../utils/simulation';
import { formatMetric } from '../../components/console/metrics';
import MetricTiles from '../../components/console/MetricTiles';
import TableDateButton from '../../components/console/TableDateButton';

const RECOMMEND_THRESHOLD = 0.9; // recommend more budget when spend uses >90% of it on most days
const RECOMMEND_STEP = 1.5;

/** Share of days in range where spend stayed under the daily budget. */
function timeInBudget(campaign, range) {
  const days = dailyMetrics(campaign, range).filter(d => d.spend > 0);
  if (!days.length || !campaign.budget) return null;
  return (days.filter(d => d.spend < campaign.budget * RECOMMEND_THRESHOLD).length / days.length) * 100;
}

export default function Budgets() {
  const campaigns = useStore(s => s.campaigns);
  const updateCampaign = useStore(s => s.updateCampaign);
  const range = useConsoleRange();
  const [query, setQuery] = useState('');
  const [onlyEnabled, setOnlyEnabled] = useState(true);
  const [isChartHidden, setIsChartHidden] = useState(false);

  const rows = useMemo(() => campaigns
    .filter(c => !onlyEnabled || c.status === 'Enabled')
    .filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()))
    .map(c => ({ c, m: rangeMetrics(c, range), tib: timeInBudget(c, range) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [campaigns, onlyEnabled, query, range.from.getTime(), range.to.getTime()]);

  const tibs = rows.map(r => r.tib).filter(v => v !== null);
  const totals = { ...sumMetrics(rows.map(r => r.m)), tib: tibs.length ? tibs.reduce((a, b) => a + b, 0) / tibs.length : 0 };
  const extra = { tib: { label: 'Avg. time in budget', format: formatPercent, agg: 'AVERAGE' } };

  return (
    <div className="cx-page">
      {!isChartHidden && <MetricTiles initial={['tib', 'sales', 'spend', 'roas']} totals={totals} extraMetrics={extra} series={dailySeries(rows.map(r => r.c), range)} />}
      <div className="cx-filter-row">
        <strong>Filter</strong>
        {onlyEnabled && <span className="cx-filter-pill cx-filter-pill-dark">Active status: Enabled <button type="button" aria-label="remove" onClick={() => setOnlyEnabled(false)}><X size={14} /></button></span>}
        <button type="button" className="cx-link" onClick={() => setOnlyEnabled(false)}>Remove all</button>
      </div>
      <div className="cx-toolbar">
        <label className="cx-search" style={{ width: 240 }}><Search size={16} /><input placeholder="Find a campaign" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <button type="button" className="cx-tool-btn">Filter by <ChevronDown size={14} /></button>
        <button type="button" className="cx-tool-btn" disabled>Bulk actions <ChevronDown size={14} /></button>
        <span className="cx-toolbar-spacer" />
        <button type="button" className="cx-link" onClick={() => setIsChartHidden(h => !h)}>{isChartHidden ? 'Show chart' : 'Hide chart'}</button>
        <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
        <TableDateButton />
        <button type="button" className="cx-tool-btn">Export</button>
      </div>
      <div className="cx-table-wrap cx-card">
        <table className="cx-table">
          <thead><tr><th aria-label="Alerts"><TriangleAlert size={14} /></th><th>Active</th><th>Campaigns</th><th>Status</th><th>Type</th><th className="is-num">Sales</th><th className="is-num">ROAS</th>
            <th className="is-num">Avg. time in budget</th><th className="is-num">Budget</th><th className="is-num">Recommended budget</th></tr></thead>
          <tbody>
            {rows.map(({ c, m, tib }) => {
              const isLimited = tib !== null && tib < 100 * RECOMMEND_THRESHOLD;
              const recommended = Math.ceil(c.budget * RECOMMEND_STEP);
              return (
                <tr key={c.id}>
                  <td>{isLimited && <TriangleAlert size={14} color="#c45500" />}</td>
                  <td><button type="button" className={`cx-switch ${c.status === 'Enabled' ? 'is-on' : ''}`} aria-label={c.status} onClick={() => updateCampaign(c.id, { status: c.status === 'Enabled' ? 'Paused' : 'Enabled' })} /></td>
                  <td><Link className="cx-link" to={campaignPath(c)}>{c.name}</Link></td>
                  <td>{deliveryStatus(c)}</td>
                  <td>{c.type}</td>
                  <td className="is-num">{m.sales ? formatMetric('sales', m.sales) : '—'}</td>
                  <td className="is-num">{m.roas ? formatMetric('roas', m.roas) : '—'}</td>
                  <td className="is-num">{tib === null ? '—' : formatPercent(tib)}</td>
                  <td className="is-num">{formatCurrency(c.budget)}</td>
                  <td className="is-num">
                    {isLimited ? (
                      <>{formatCurrency(recommended)}<br /><button type="button" className="cx-link" onClick={() => updateCampaign(c.id, { budget: recommended })}>Apply</button></>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={10}><div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
