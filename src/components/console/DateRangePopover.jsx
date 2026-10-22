import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { DATE_PRESETS, rangeForPreset, monthGrid, localISODate } from '../../utils/dateRanges';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

function Month({ year, month, draft, onPick }) {
  const today = new Date();
  return (
    <div className="drp-month">
      <div className="drp-month-title">
        {new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' })} {year}
      </div>
      <div className="drp-grid">
        {WEEKDAYS.map(d => <span key={d} className="drp-wd">{d}</span>)}
        {monthGrid(year, month).flat().map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const isFuture = day > today;
          const isEdge = sameDay(day, draft.from) || sameDay(day, draft.to);
          const isInside = draft.from && draft.to && day > draft.from && day < draft.to;
          return (
            <button
              type="button"
              key={day.toISOString()}
              disabled={isFuture}
              className={`drp-day ${isEdge ? 'is-edge' : ''} ${isInside ? 'is-inside' : ''}`}
              onClick={() => onPick(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The console's date-range popover: presets on the left, two months on the right. */
export default function DateRangePopover({ onClose, align = 'left' }) {
  const current = useConsoleRange();
  const setConsoleRange = useStore(s => s.setConsoleRange);
  const [draft, setDraft] = useState({ preset: current.preset, from: current.from, to: current.to });
  const [anchor, setAnchor] = useState(() => new Date(current.to.getFullYear(), current.to.getMonth(), 1));

  const second = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const shiftMonth = (n) => setAnchor(a => new Date(a.getFullYear(), a.getMonth() + n, 1));

  const pickPreset = (key) => setDraft({ preset: key, ...rangeForPreset(key) });
  const pickDay = (day) => setDraft(d => {
    const isStartingNew = !d.from || (d.from && d.to && d.preset !== 'selecting');
    if (isStartingNew) return { preset: 'selecting', from: day, to: null };
    return day < d.from ? { preset: 'custom', from: day, to: d.from } : { preset: 'custom', from: d.from, to: day };
  });

  const apply = () => {
    if (!draft.from || !draft.to) return;
    const isPreset = DATE_PRESETS.some(p => p.key === draft.preset);
    setConsoleRange(isPreset
      ? { preset: draft.preset, from: null, to: null }
      : { preset: 'custom', from: localISODate(draft.from), to: localISODate(draft.to) });
    onClose();
  };

  return (
    <>
      <div className="drp-scrim" onClick={onClose} />
      <div className={`drp cx-card drp-${align}`} role="dialog" aria-label="Choose date range">
        <div className="drp-presets">
          {DATE_PRESETS.map(p => (
            <button
              type="button"
              key={p.key}
              className={`drp-preset ${draft.preset === p.key ? 'is-active' : ''}`}
              onClick={() => pickPreset(p.key)}
            >
              {p.label}
            </button>
          ))}
          <p className="drp-note">Dates are based on the campaign&apos;s country.</p>
        </div>
        <div className="drp-cal">
          <div className="drp-cal-nav">
            <button type="button" className="cx-tool-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
            <button type="button" className="cx-tool-btn" onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight size={16} /></button>
          </div>
          <div className="drp-months">
            <Month year={anchor.getFullYear()} month={anchor.getMonth()} draft={draft} onPick={pickDay} />
            <Month year={second.getFullYear()} month={second.getMonth()} draft={draft} onPick={pickDay} />
          </div>
          <div className="drp-actions">
            <button type="button" className="cx-link" onClick={onClose}>Cancel</button>
            <button type="button" className="cx-btn cx-btn-primary" disabled={!draft.from || !draft.to} onClick={apply}>Apply</button>
          </div>
        </div>
      </div>
    </>
  );
}
