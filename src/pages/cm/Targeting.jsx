import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, X, EllipsisVertical } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { adGroupPath, campaignPath } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, sumMetrics, dailySeries, withParentStart } from '../../utils/performance';
import { formatCurrency } from '../../utils/simulation';
import { formatMetric, METRICS } from '../../components/console/metrics';
import MetricTiles from '../../components/console/MetricTiles';
import TableDateButton from '../../components/console/TableDateButton';

const METRIC_COLUMNS = ['impressions', 'clicks', 'orders', 'acos'];
const TOP_PERFORMERS = 5;

export default function Targeting() {
  const keywords = useStore(s => s.keywords);
  const campaigns = useStore(s => s.campaigns);
  const adGroups = useStore(s => s.adGroups);
  const updateKeyword = useStore(s => s.updateKeyword);
  const range = useConsoleRange();
  const [query, setQuery] = useState('');
  const [onlyEnabledTargets, setOnlyEnabledTargets] = useState(true);
  const [onlyEnabledCampaigns, setOnlyEnabledCampaigns] = useState(true);
  const [isChartHidden, setIsChartHidden] = useState(false);

  const allRows = useMemo(() => keywords.map(k => {
    const c = campaigns.find(x => x.id === k.campaignId);
    return c ? { k, c, ag: adGroups.find(a => a.id === k.adGroupId), m: rangeMetrics(withParentStart(k, c), range) } : null;
  }).filter(Boolean),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [keywords, campaigns, adGroups, range.from.getTime(), range.to.getTime()]);

  const rows = allRows
    .filter(r => !onlyEnabledTargets || r.k.status === 'Enabled')
    .filter(r => !onlyEnabledCampaigns || r.c.status === 'Enabled')
    .filter(r => !query || r.k.keyword.toLowerCase().includes(query.toLowerCase()));

  const notDelivering = allRows.filter(r => r.k.status !== 'Enabled' || r.c.status !== 'Enabled').length;
  const top = [...rows].sort((a, b) => b.m.impressions - a.m.impressions).slice(0, TOP_PERFORMERS).filter(r => r.m.impressions > 0);
  const series = useMemo(() => dailySeries(rows.map(r => (withParentStart(r.k, r.c))), range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows.length, keywords, range.from.getTime(), range.to.getTime()]);

  return (
    <div className="cx-page">
      {!isChartHidden && (
        <div className="tg-top">
          <MetricTiles initial={['impressions', 'clicks', 'orders', 'acos']} totals={sumMetrics(rows.map(r => r.m))} series={series} />
          <aside className="tg-side">
            <div className="cx-card tg-card"><h3>Overview</h3><span className="cx-sub">Targets not delivering</span><span className="cx-link tg-big">{notDelivering}</span></div>
            <div className="cx-card tg-card">
              <div className="tg-card-head"><h3>Top performers</h3><EllipsisVertical size={16} /></div>
              <span className="cx-sub">Based on total impressions</span>
              <table className="cx-table">
                <thead><tr><th>Target</th><th>Targeting type</th><th className="is-num">Impressions</th></tr></thead>
                <tbody>
                  {top.map(r => <tr key={r.k.id}><td>{r.k.keyword}</td><td>Keyword</td><td className="is-num">{formatMetric('impressions', r.m.impressions)}</td></tr>)}
                  {top.length === 0 && <tr><td colSpan={3} className="cx-sub">Your targets have no impressions</td></tr>}
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      )}

      <div className="cx-filter-row">
        <strong>Filter</strong>
        {onlyEnabledTargets && <span className="cx-filter-pill cx-filter-pill-dark">Target active status: Enabled <button type="button" aria-label="remove" onClick={() => setOnlyEnabledTargets(false)}><X size={14} /></button></span>}
        {onlyEnabledCampaigns && <span className="cx-filter-pill cx-filter-pill-dark">Campaign active status: Enabled <button type="button" aria-label="remove" onClick={() => setOnlyEnabledCampaigns(false)}><X size={14} /></button></span>}
        <button type="button" className="cx-link" onClick={() => { setOnlyEnabledTargets(false); setOnlyEnabledCampaigns(false); }}>Remove all</button>
      </div>
      <div className="cx-toolbar">
        <label className="cx-search" style={{ width: 240 }}><Search size={16} /><input placeholder="Search targets" value={query} onChange={e => setQuery(e.target.value)} /></label>
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
          <thead><tr><th>Active</th><th>Target</th><th>Status</th><th>Targeting type</th><th>Campaign</th><th>Ad group</th><th className="is-num">Bid</th>
            {METRIC_COLUMNS.map(k => <th key={k} className="is-num">{METRICS[k].label}</th>)}</tr></thead>
          <tbody>
            {rows.map(({ k, c, ag, m }) => (
              <tr key={k.id}>
                <td><button type="button" className={`cx-switch ${k.status === 'Enabled' ? 'is-on' : ''}`} aria-label={k.status} onClick={() => updateKeyword(k.id, { status: k.status === 'Enabled' ? 'Paused' : 'Enabled' })} /></td>
                <td>{k.keyword}<span className="cx-sub">{k.matchType}</span></td>
                <td>{k.status === 'Enabled' && c.status === 'Enabled' ? 'Delivering' : 'Paused'}</td>
                <td>Keyword</td>
                <td><Link className="cx-link" to={campaignPath(c)}>{c.name}</Link></td>
                <td>{ag ? <Link className="cx-link" to={adGroupPath(c, ag.id, 'targeting')}>{ag.name}</Link> : '—'}</td>
                <td className="is-num">{formatCurrency(k.bid)}</td>
                {METRIC_COLUMNS.map(key => <td key={key} className="is-num">{m[key] ? formatMetric(key, m[key]) : '—'}</td>)}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={11}><div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
