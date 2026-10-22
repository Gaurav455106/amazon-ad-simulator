import { useState } from 'react';

/**
 * A table cell value that becomes an input on click (Enter saves, Escape cancels).
 * @param {{ display: import('react').ReactNode, initial: string, onSave: (n: number) => void, min?: number, width?: number }} props
 */
export default function InlineNumber({ display, initial, onSave, min = 0, width }) {
  const [draft, setDraft] = useState(null);
  if (draft === null) {
    return <button type="button" className="cx-cell-box" onClick={() => setDraft(initial)}>{display}</button>;
  }
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n) && n >= min) onSave(n);
    setDraft(null);
  };
  return (
    <input autoFocus className="cx-cell-input" style={width ? { width } : undefined} value={draft}
      onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setDraft(null); }} />
  );
}

/** The console's on/off switch in the "Active" column. */
export function ActiveSwitch({ isOn, disabled, onToggle }) {
  return (
    <button type="button" role="switch" aria-checked={isOn} className={`cx-switch ${isOn ? 'is-on' : ''}`}
      aria-label={isOn ? 'Enabled' : 'Paused'} disabled={disabled} onClick={onToggle} />
  );
}
