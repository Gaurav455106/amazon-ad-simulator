import { useMemo, useState } from 'react';
import { Search, ListFilter, ChevronDown } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, sumMetrics, withParentStart } from '../../../utils/performance';
import { formatMetric, METRICS } from '../../../components/console/metrics';
import TableDateButton from '../../../components/console/TableDateButton';
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

function Toolbar({ addLabel, onAdd, query, onQuery, isPill }) {
  return (
    <div className="cx-toolbar">
      {addLabel && (
        <button type="button" className={isPill ? 'cx-btn cx-btn-pill' : 'cx-btn cx-btn-primary'} disabled={!onAdd}
          title={onAdd ? undefined : 'Not available in the simulator yet'} onClick={onAdd}>
          {addLabel}
        </button>
      )}
      <label className="cx-search" style={{ width: 240 }}><Search size={16} /><input placeholder="Find a target" value={query} onChange={e => onQuery(e.target.value)} /></label>
      <button type="button" className="cx-tool-btn" aria-label="Filter by"><ListFilter size={16} /></button>
      <span className="cx-toolbar-spacer" />
      <button type="button" className="cx-tool-btn">View: Default <ChevronDown size={14} /></button>
      <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
      <TableDateButton />
      <button type="button" className="cx-tool-btn">Export</button>
    </div>
  );
}

const MetricHeads = () => METRIC_COLUMNS.map(k => <th key={k} className="is-num"><Info size={13} /> {METRICS[k].label}</th>);
const MetricCells = ({ m }) => METRIC_COLUMNS.map(k => <td key={k} className="is-num">{m && m[k] ? formatMetric(k, m[k]) : '—'}</td>);

function AutoTargets({ campaign, adGroup }) {
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const range = useConsoleRange();
  const groups = adGroup.autoTargets || {};
  const agMetrics = rangeMetrics(withParentStart(adGroup, campaign), range);
  const setGroup = (key, patch) => updateAdGroup(adGroup.id, { autoTargets: { ...groups, [key]: { status: 'Enabled', bid: adGroup.defaultBid, ...groups[key], ...patch } } });
  const enabled = AUTO_GROUPS.filter(g => (groups[g.key]?.status || 'Enabled') === 'Enabled');

  return (
    <div className="cx-table-wrap">
      <table className="cx-table">
        <thead><tr><th>Active</th><th>Targeting group</th><th>Status</th><th className="is-num">Suggested bid</th><th className="is-num">Bid</th><MetricHeads /></tr></thead>
        <tbody>
          {AUTO_GROUPS.map(g => {
            const st = groups[g.key] || { status: 'Enabled', bid: adGroup.defaultBid };
            const isOn = st.status === 'Enabled';
            const share = isOn ? 1 / Math.max(1, enabled.length) : 0;
            const m = Object.fromEntries(METRIC_COLUMNS.map(k => [k, ['ctr', 'acos', 'roas'].includes(k) ? (isOn ? agMetrics[k] : 0) : agMetrics[k] * share]));
            return (
              <tr key={g.key}>
                <td><button type="button" className={`cx-switch ${isOn ? 'is-on' : ''}`} aria-label={st.status} onClick={() => setGroup(g.key, { status: isOn ? 'Paused' : 'Enabled' })} /></td>
                <td>{g.label}<span className="cx-sub">{g.hint}</span></td>
                <td>{isOn ? 'Delivering' : 'Paused'}</td>
                <td className="is-num">₹{(adGroup.defaultBid * 1.12).toFixed(2)}</td>
                <td className="is-num"><BidInput value={st.bid ?? adGroup.defaultBid} onSave={(bid) => setGroup(g.key, { bid })} /></td>
                <MetricCells m={m} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DisplayTargets({ campaign }) {
  const updateCampaign = useStore(s => s.updateCampaign);
  const targets = campaign.sdTargets || [];
  return (
    <div className="cx-table-wrap">
      <table className="cx-table">
        <thead><tr><th>Active</th><th>Categories and products</th><th>Status</th><th className="is-num">Bid</th></tr></thead>
        <tbody>
          {targets.map((t, i) => {
            const isOn = t.status !== 'Paused';
            const patch = (p) => updateCampaign(campaign.id, { sdTargets: targets.map((x, j) => (j === i ? { ...x, ...p } : x)) });
            return (
              <tr key={`${t.type}-${t.name}`}>
                <td><button type="button" className={`cx-switch ${isOn ? 'is-on' : ''}`} aria-label={isOn ? 'Enabled' : 'Paused'} onClick={() => patch({ status: isOn ? 'Paused' : 'Enabled' })} /></td>
                <td><span className="cx-sub">{{ Contextual: 'Contextual targeting', Optimised: 'Optimised targeting' }[t.type] || 'Audience'}</span>{t.name}</td>
                <td>{isOn ? 'Delivering' : 'Paused'}</td>
                <td className="is-num">{campaign.costControlEnabled ? <span className="cx-sub" title="Bids are set by cost control">—</span> : t.bid ? <BidInput value={t.bid} onSave={(bid) => patch({ bid })} /> : '—'}</td>
              </tr>
            );
          })}
          {targets.length === 0 && <tr><td colSpan={4}><div className="cx-empty"><h3>No targets</h3><p>Add contextual or audience targets to reach shoppers.</p></div></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function TargetingTab({ campaign, adGroup }) {
  const keywords = useStore(s => s.keywords);
  const addKeywords = useStore(s => s.addKeywords);
  const updateKeyword = useStore(s => s.updateKeyword);
  const range = useConsoleRange();
  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isSD = campaign.type === 'Sponsored Display';
  const isAuto = campaign.type === 'Sponsored Products' && campaign.targetingType === 'Auto';

  const rows = useMemo(() => keywords
    .filter(k => k.adGroupId === adGroup.id)
    .filter(k => !query || k.keyword.toLowerCase().includes(query.toLowerCase()))
    .map(k => ({ k, m: rangeMetrics(withParentStart(k, campaign), range) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [keywords, adGroup.id, query, campaign.startDate, range.from.getTime(), range.to.getTime()]);

  if (isSD) return <><Toolbar addLabel="Add contextual targets" isPill query={query} onQuery={setQuery} /><DisplayTargets campaign={campaign} /></>;
  if (isAuto) return <><Toolbar query={query} onQuery={setQuery} /><AutoTargets campaign={campaign} adGroup={adGroup} /></>;

  const status = (k) => (campaign.status !== 'Enabled' || adGroup.status !== 'Enabled' || k.status !== 'Enabled' ? 'Paused' : 'Delivering');

  return (
    <>
      <Toolbar addLabel="Add keywords" isPill={campaign.type === 'Sponsored Brands'} query={query} onQuery={setQuery} onAdd={() => setIsAdding(true)} />
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr><th><input type="checkbox" aria-label="Select all" /></th><th>Active</th><th>Keyword</th><th>Target match type <Info size={13} /></th><th>Status <Info size={13} /></th>
              <th className="is-num">Suggested bid <Info size={13} /></th><th className="is-num">Bid</th><MetricHeads /></tr>
          </thead>
          <tbody>
            {rows.map(({ k, m }) => {
              const s = suggestedFor(k);
              return (
                <tr key={k.id}>
                  <td><input type="checkbox" aria-label="select" /></td>
                  <td><button type="button" className={`cx-switch ${k.status === 'Enabled' ? 'is-on' : ''}`} aria-label={k.status}
                    onClick={() => updateKeyword(k.id, { status: k.status === 'Enabled' ? 'Paused' : 'Enabled' })} /></td>
                  <td>{k.keyword}</td>
                  <td>{k.matchType}</td>
                  <td><span className="cx-status">{status(k)}</span></td>
                  <td className="is-num">
                    ₹{s.sugg.toFixed(2)}
                    <span className="cx-sub">₹{s.min.toFixed(2)} - ₹{s.max.toFixed(2)}</span>
                    {Math.abs(k.bid - s.sugg) > 0.005 && <button type="button" className="cx-link" onClick={() => updateKeyword(k.id, { bid: Number(s.sugg.toFixed(2)) })}>Apply</button>}
                  </td>
                  <td className="is-num"><BidInput value={k.bid} onSave={(bid) => updateKeyword(k.id, { bid })} /></td>
                  <MetricCells m={m} />
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={15}><div className="cx-empty"><h3>No keywords</h3><p>Add keywords to show your ads in shopper searches.</p></div></td></tr>}
          </tbody>
          {rows.length > 0 && <tfoot><tr><td colSpan={7}>Total: {rows.length}</td><MetricCells m={sumMetrics(rows.map(r => r.m))} /></tr></tfoot>}
        </table>
      </div>
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
