import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Small dialog for a bulk update (budget, bid, end date, portfolio).
 * @param {{ title: string, label: string, type: 'number'|'date'|'select', options?: Array<{ value: string, label: string }>,
 *           initial?: string, validate?: (v: string) => string|null, onApply: (v: string) => void, onClose: () => void }} props
 */
export default function BulkValueDialog({ title, label, type, options = [], initial = '', validate, onApply, onClose }) {
  const [value, setValue] = useState(initial);
  const error = validate ? validate(value) : null;
  const canApply = value !== '' && !error;
  return (
    <div className="tcm-scrim" onClick={onClose}>
      <div className="tcm tcm-small" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <header className="tcm-head">
          <h2>{title}</h2>
          <button type="button" className="tcm-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="tcm-pad">
          <label className="tbv-field">
            <span>{label}</span>
            {type === 'select' ? (
              <select className="tf-select" value={value} onChange={e => setValue(e.target.value)}>
                <option value="">Select</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input className="tf-input tbv-input" type={type === 'date' ? 'date' : 'text'} inputMode={type === 'number' ? 'decimal' : undefined}
                value={value} onChange={e => setValue(e.target.value)} autoFocus />
            )}
          </label>
          {value !== '' && error && <p className="tbv-error">{error}</p>}
        </div>
        <footer className="tcm-foot">
          <button type="button" className="tf-link" onClick={onClose}>Cancel</button>
          <button type="button" className="tf-apply" disabled={!canApply} onClick={() => { onApply(value); onClose(); }}>Apply</button>
        </footer>
      </div>
    </div>
  );
}
