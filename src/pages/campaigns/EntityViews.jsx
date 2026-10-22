import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { adGroupPath, campaignPath } from '../../routes';
import { consoleId } from '../../utils/consoleId';
import { formatCurrency } from '../../utils/simulation';
import { METRICS, formatMetric } from '../../components/console/metrics';
import Pagination from '../../components/console/Pagination';

const METRIC_COLUMNS = ['impressions', 'clicks', 'spend', 'orders', 'sales', 'acos', 'roas'];
const DEFAULT_PAGE_SIZE = 50;

function usePaging(total) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const slice = (list) => list.slice(page * pageSize, (page + 1) * pageSize);
  return { slice, footer: <Pagination total={total} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} /> };
}

const MetricCells = ({ m }) => METRIC_COLUMNS.map(k => <td key={k} className="is-num">{m[k] ? formatMetric(k, m[k]) : '—'}</td>);
const MetricHeads = () => METRIC_COLUMNS.map(k => <th key={k} className="is-num">{METRICS[k].label}</th>);

/** All ad groups across campaigns ("Campaigns ▾ → Ad groups" view). */
export function AdGroupsView({ rows }) {
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const { slice, footer } = usePaging(rows.length);
  return (
    <>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr>
              <th>Active</th><th>Ad group name</th><th>Campaign</th><th>Status</th><th className="is-num">Default bid</th>
              <MetricHeads />
            </tr>
          </thead>
          <tbody>
            {slice(rows).map(({ adGroup: ag, campaign: c, m }) => (
              <tr key={ag.id}>
                <td>
                  <button type="button" className={`cx-switch ${ag.status === 'Enabled' ? 'is-on' : ''}`} aria-label={ag.status}
                    onClick={() => updateAdGroup(ag.id, { status: ag.status === 'Enabled' ? 'Paused' : 'Enabled' })} />
                </td>
                <td className="cx-name-cell">
                  <Link className="cx-link" to={adGroupPath(c, ag.id)}>{ag.name}</Link>
                  <span className="cx-id">{consoleId(ag.id)}</span>
                </td>
                <td><Link className="cx-link" to={campaignPath(c)}>{c.name}</Link><span className="cx-sub">{c.type}</span></td>
                <td><span className="cx-status">{c.status !== 'Enabled' ? 'Campaign paused' : ag.status === 'Enabled' ? 'Delivering' : 'Paused'}</span></td>
                <td className="is-num">{formatCurrency(ag.defaultBid)}</td>
                <MetricCells m={m} />
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={12}><div className="cx-empty"><h3>No ad groups</h3><p>Try adjusting your filters.</p></div></td></tr>}
          </tbody>
        </table>
      </div>
      {footer}
    </>
  );
}

/** All keyword targets across campaigns ("Campaigns ▾ → Targets" view). */
export function TargetsView({ rows }) {
  const updateKeyword = useStore(s => s.updateKeyword);
  const { slice, footer } = usePaging(rows.length);
  return (
    <>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr>
              <th>Active</th><th>Target</th><th>Match type</th><th>Campaign</th><th>Ad group</th><th className="is-num">Bid</th>
              <MetricHeads />
            </tr>
          </thead>
          <tbody>
            {slice(rows).map(({ keyword: k, campaign: c, adGroup: ag, m }) => (
              <tr key={k.id}>
                <td>
                  <button type="button" className={`cx-switch ${k.status === 'Enabled' ? 'is-on' : ''}`} aria-label={k.status}
                    onClick={() => updateKeyword(k.id, { status: k.status === 'Enabled' ? 'Paused' : 'Enabled' })} />
                </td>
                <td>{k.keyword}</td>
                <td>{k.matchType}</td>
                <td><Link className="cx-link" to={campaignPath(c)}>{c.name}</Link></td>
                <td>{ag ? <Link className="cx-link" to={adGroupPath(c, ag.id, 'targeting')}>{ag.name}</Link> : '—'}</td>
                <td className="is-num">{formatCurrency(k.bid)}</td>
                <MetricCells m={m} />
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={13}><div className="cx-empty"><h3>No targets</h3><p>Try adjusting your filters.</p></div></td></tr>}
          </tbody>
        </table>
      </div>
      {footer}
    </>
  );
}
