import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../../../store/useStore';

const fmtWhen = (iso) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

const LEVELS = ['All', 'Campaign', 'Ad group'];

/** Change log for a campaign, or (with adGroup) a single ad group. */
export default function HistoryTab({ campaign, adGroup }) {
  const history = useStore(s => s.history || []);
  const adGroups = useStore(s => s.adGroups);
  const [level, setLevel] = useState('All');
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  const rows = useMemo(() => history
    .filter(h => h.campaignId === campaign.id && (!adGroup || h.adGroupId === adGroup.id))
    .filter(h => level === 'All' || h.level === level),
  [history, campaign.id, adGroup, level]);

  const levelName = (h) => (h.level === 'Ad group'
    ? `Ad group: ${adGroups.find(ag => ag.id === h.adGroupId)?.name || '—'}`
    : `Campaign: ${campaign.name}`);

  return (
    <>
      <div className="cx-toolbar">
        <div className="cx-pop-anchor">
          <button type="button" className="cx-btn" onClick={() => setIsLevelOpen(o => !o)}>Filter by <ChevronDown size={14} /></button>
          {isLevelOpen && (
            <>
              <div className="drp-scrim" onClick={() => setIsLevelOpen(false)} />
              <div className="cx-pop" style={{ top: 36, left: 0 }}>
                {LEVELS.map(l => (
                  <button key={l} type="button" className={`cx-pop-item ${level === l ? 'is-active' : ''}`} onClick={() => { setLevel(l); setIsLevelOpen(false); }}>
                    {l === 'All' ? 'All change levels' : l}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead><tr><th>Change level</th><th>Change type</th><th>From</th><th>To</th><th>Date and time</th></tr></thead>
          <tbody>
            {rows.length > 0 && <tr><td colSpan={5} className="cx-sub">Results: {rows.length}</td></tr>}
            {rows.map(h => (
              <tr key={h.id}>
                <td>{levelName(h)}</td>
                <td>{h.changeType}</td>
                <td>{h.from}</td>
                <td>{h.to}</td>
                <td>{fmtWhen(h.at)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5}><div className="cx-empty"><h3>No changes yet</h3><p>Changes you make to bids, budgets, status and targeting appear here.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
