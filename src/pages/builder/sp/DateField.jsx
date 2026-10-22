import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { monthGrid, localISODate, parseLocalDate } from '../../../utils/dateRanges';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const label = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null);

/**
 * Console-style date button ("📅 Oct 21, 2026" / "📅 No end date") with a month picker.
 * @param {{ value: string, onChange: (iso: string) => void, min?: string, isClearable?: boolean, placeholder?: string }} props
 */
export default function DateField({ value, onChange, min, isClearable, placeholder = 'Select date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const base = value ? parseLocalDate(value) : min ? parseLocalDate(min) : new Date();
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const shift = (n) => setView(v => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const pick = (d) => { onChange(localISODate(d)); setIsOpen(false); };

  return (
    <div className="df">
      <button type="button" className="df-btn" onClick={() => setIsOpen(o => !o)}>
        <Calendar size={14} /> {label(value) || placeholder}
      </button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="df-pop" role="dialog" aria-label="Choose a date">
            <div className="df-nav">
              <button type="button" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
              <strong>{new Date(view.y, view.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
              <button type="button" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
            </div>
            <div className="df-grid">
              {WEEKDAYS.map(w => <span key={w} className="df-wd">{w}</span>)}
              {monthGrid(view.y, view.m).flat().map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const iso = localISODate(d);
                const isDisabled = min && iso < min;
                return (
                  <button type="button" key={iso} disabled={isDisabled}
                    className={`df-day ${iso === value ? 'is-selected' : ''}`} onClick={() => pick(d)}>{d.getDate()}</button>
                );
              })}
            </div>
            {isClearable && <button type="button" className="df-clear" onClick={() => { onChange(''); setIsOpen(false); }}>No end date</button>}
          </div>
        </>
      )}
    </div>
  );
}
