import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EllipsisVertical, TriangleAlert, ArrowDown, ArrowUp } from 'lucide-react';
import Info from '../../components/console/InfoGlyph';
import { useStore } from '../../store/useStore';
import { campaignPath } from '../../routes';
import { consoleId } from '../../utils/consoleId';
import { formatCurrency } from '../../utils/simulation';
import { deliveryStatus, STATUS_TONE } from '../../utils/campaignStatus';
import { METRICS, formatMetric } from '../../components/console/metrics';
import Pagination from '../../components/console/Pagination';

const METRIC_COLUMNS = ['clicks', 'spend', 'orders', 'sales', 'acos', 'roas', 'impressions', 'ctr', 'cpc'];
const DEFAULT_PAGE_SIZE = 50;
const TARGETING_LABEL = { Auto: 'Automatic Targeting', Manual: 'Manual Targeting' };

const shortDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${d.getFullYear()}`;
};

function InlineNumber({ value, suffix, prefix, onSave, width }) {
  const [draft, setDraft] = useState(null);
  if (draft === null) {
    return (
      <button type="button" className="cx-cell-box" onClick={() => setDraft(String(value ?? ''))}>
        {prefix}{value}{suffix}
      </button>
    );
  }
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n) && n >= 0) onSave(n);
    setDraft(null);
  };
  return (
    <input
      autoFocus
      className="cx-cell-input"
      style={width ? { width } : undefined}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }}
    />
  );
}

function RowMenu({ campaign }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateCampaign = useStore(s => s.updateCampaign);
  const isArchived = campaign.status === 'Archived';
  return (
    <span className="cx-pop-anchor">
      <button type="button" className="cx-tool-btn" aria-label="Campaign actions" onClick={() => setIsOpen(true)}>
        <EllipsisVertical size={16} />
      </button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="cx-pop" style={{ left: 0, top: 30 }}>
            <Link className="cx-pop-item" to={campaignPath(campaign)}>View ad groups</Link>
            <Link className="cx-pop-item" to={campaignPath(campaign, 'settings')}>Edit campaign settings</Link>
            {!isArchived && (
              <button type="button" className="cx-pop-item" onClick={() => { updateCampaign(campaign.id, { status: 'Archived' }); setIsOpen(false); }}>
                Archive
              </button>
            )}
          </div>
        </>
      )}
    </span>
  );
}

/**
 * @param {{ rows: Array<{ campaign: object, m: object }> }} props
 *   rows: campaigns paired with their metrics for the selected date range
 */
export default function CampaignsTable({ rows, selected, onSelectedChange }) {
  const toggleCampaignStatus = useStore(s => s.toggleCampaignStatus);
  const updateCampaign = useStore(s => s.updateCampaign);
  const [sort, setSort] = useState({ key: null, dir: 'desc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const val = (r) => (sort.key === 'budget' ? r.campaign.budget : r.m[sort.key]);
    return [...rows].sort((a, b) => (sort.dir === 'desc' ? val(b) - val(a) : val(a) - val(b)));
  }, [rows, sort]);

  const visible = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const allSelected = visible.length > 0 && visible.every(r => selected.includes(r.campaign.id));
  const totals = useMemo(() => {
    const t = { clicks: 0, spend: 0, orders: 0, sales: 0, impressions: 0 };
    rows.forEach(r => Object.keys(t).forEach(k => { t[k] += r.m[k]; }));
    return { ...t, acos: t.sales ? t.spend / t.sales * 100 : 0, roas: t.spend ? t.sales / t.spend : 0, ctr: t.impressions ? t.clicks / t.impressions * 100 : 0, cpc: t.clicks ? t.spend / t.clicks : 0 };
  }, [rows]);

  const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  const sortIcon = (key) => (sort.key === key ? (sort.dir === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />) : null);
  const toggleRow = (id) => onSelectedChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  const toggleAllVisible = () => onSelectedChange(allSelected ? [] : visible.map(r => r.campaign.id));

  return (
    <>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAllVisible} /></th>
              <th aria-label="Alerts"><TriangleAlert size={14} /></th>
              <th>Active</th>
              <th>Campaign name <Info size={13} /></th>
              <th>Campaign<br />country</th>
              <th>Status <Info size={13} /></th>
              <th>Type <Info size={13} /></th>
              <th>Campaign start<br />date</th>
              <th>Campaign end<br />date</th>
              <th className="is-num">Top-of-search bid<br />adjustment</th>
              <th className="is-num is-sortable" onClick={() => toggleSort('budget')}>Campaign budget<br />amount {sortIcon('budget')}</th>
              {METRIC_COLUMNS.map(k => (
                <th key={k} className="is-num is-sortable" onClick={() => toggleSort(k)}>{METRICS[k].label} {sortIcon(k)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(({ campaign: c, m }) => {
              const status = deliveryStatus(c);
              const isOn = c.status === 'Enabled';
              return (
                <tr key={c.id} className={selected.includes(c.id) ? 'is-selected' : ''}>
                  <td><input type="checkbox" aria-label="select" checked={selected.includes(c.id)} onChange={() => toggleRow(c.id)} /></td>
                  <td />
                  <td>
                    <button
                      type="button"
                      className={`cx-switch ${isOn ? 'is-on' : ''}`}
                      aria-label={isOn ? 'Enabled' : 'Paused'}
                      disabled={c.status === 'Archived'}
                      onClick={() => toggleCampaignStatus(c.id)}
                    />
                  </td>
                  <td className="cx-name-cell">
                    <div className="cx-name-flex">
                      <div>
                        <Link className="cx-link" to={campaignPath(c)}>{c.name}</Link>
                        <span className="cx-id">{consoleId(c.id)}</span>
                      </div>
                      <RowMenu campaign={c} />
                    </div>
                  </td>
                  <td>India</td>
                  <td><span className={`cx-status ${STATUS_TONE[status]}`}>{status} <Info size={13} /></span></td>
                  <td>
                    {c.type}
                    <span className="cx-sub">{TARGETING_LABEL[c.targetingType] || c.targetingType}</span>
                  </td>
                  <td><span className="cx-cell-box is-muted">{shortDate(c.startDate) || '—'}</span></td>
                  <td><span className="cx-cell-box">{shortDate(c.endDate) || 'No End Date'}</span></td>
                  <td className="is-num">
                    {c.type === 'Sponsored Display' ? '—' : (
                      <InlineNumber
                        value={c.placementAdjustments?.top ?? 0}
                        suffix="%"
                        width={70}
                        onSave={(n) => updateCampaign(c.id, { placementAdjustments: { ...(c.placementAdjustments || {}), top: Math.min(900, n) } })}
                      />
                    )}
                  </td>
                  <td className="is-num">
                    <InlineNumber
                      value={Number(c.budget).toFixed(2)}
                      prefix="₹"
                      suffix={` - ${(c.budgetType || 'Daily').toLowerCase()}`}
                      onSave={(n) => n >= 1 && updateCampaign(c.id, { budget: n })}
                    />
                  </td>
                  {METRIC_COLUMNS.map(k => (
                    <td key={k} className="is-num">{m[k] ? formatMetric(k, m[k]) : '—'}</td>
                  ))}
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={11 + METRIC_COLUMNS.length}><div className="cx-empty"><h3>No campaigns</h3><p>Try adjusting your filters or create a campaign.</p></div></td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={10}>Total: {rows.length}</td>
                <td className="is-num">{formatCurrency(rows.reduce((s, r) => s + Number(r.campaign.budget || 0), 0))}</td>
                {METRIC_COLUMNS.map(k => <td key={k} className="is-num">{totals[k] ? formatMetric(k, totals[k]) : '—'}</td>)}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <Pagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
    </>
  );
}
