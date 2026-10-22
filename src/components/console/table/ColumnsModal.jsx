import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

const ALL_GROUP = 'All';

/**
 * "Customise columns": groups on the left, checkboxes in the middle, chosen columns on the right.
 * Fixed columns (e.g. Active status, Campaign name) are always shown and can't be removed.
 * @param {{ columns: object[], visible: string[], onApply: (keys: string[]) => void, onClose: () => void }} props
 */
export default function ColumnsModal({ columns, visible, onApply, onClose }) {
  const [chosen, setChosen] = useState(visible);
  const [group, setGroup] = useState(ALL_GROUP);
  const [query, setQuery] = useState('');

  const fixed = columns.filter(c => c.fixed && !c.isUtility);
  const optional = columns.filter(c => !c.fixed);
  const groups = useMemo(() => [ALL_GROUP, ...new Set(optional.map(c => c.group).filter(Boolean))], [optional]);
  const shown = optional
    .filter(c => group === ALL_GROUP || c.group === group)
    .filter(c => !query || c.label.toLowerCase().includes(query.toLowerCase()));
  const byKey = Object.fromEntries(columns.map(c => [c.key, c]));

  const toggle = (key) => setChosen(list => (list.includes(key) ? list.filter(k => k !== key) : [...list, key]));
  const selectAll = () => setChosen(list => [...list, ...shown.map(c => c.key).filter(k => !list.includes(k))]);

  return (
    <div className="tcm-scrim" onClick={onClose}>
      <div className="tcm" role="dialog" aria-modal="true" aria-label="Customise columns" onClick={e => e.stopPropagation()}>
        <header className="tcm-head">
          <h2>Customise columns</h2>
          <button type="button" className="tcm-close" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="tcm-body">
          <nav className="tcm-groups">
            {groups.map(g => (
              <button key={g} type="button" className={`tcm-group ${group === g ? 'is-active' : ''}`} onClick={() => setGroup(g)}>{g}</button>
            ))}
          </nav>
          <div className="tcm-available">
            <div className="tcm-label">Available columns</div>
            <label className="tf-search"><Search size={14} /><input placeholder="Quick search" value={query} onChange={e => setQuery(e.target.value)} /></label>
            <button type="button" className="tf-link tcm-select-all" onClick={selectAll}>Select all</button>
            <div className="tcm-checks">
              {shown.map(c => (
                <label key={c.key} className="tcm-check">
                  <input type="checkbox" checked={chosen.includes(c.key)} onChange={() => toggle(c.key)} />
                  <span>{c.label}</span>
                </label>
              ))}
              {shown.length === 0 && <p className="tf-empty">No columns match</p>}
            </div>
          </div>
          <div className="tcm-selected">
            <div className="tcm-selected-head">
              <strong>{fixed.length + chosen.length} selected</strong>
              <button type="button" className="tf-link" onClick={() => setChosen([])}>Remove all</button>
            </div>
            <ul className="tcm-list">
              {fixed.map(c => <li key={c.key} className="tcm-item">{c.label}</li>)}
              {chosen.filter(k => byKey[k]).map(k => (
                <li key={k} className="tcm-item">
                  {byKey[k].label}
                  <button type="button" aria-label={`Remove column ${byKey[k].label}`} onClick={() => toggle(k)}><X size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <footer className="tcm-foot">
          <button type="button" className="tf-link" onClick={onClose}>Cancel</button>
          <button type="button" className="tf-apply" onClick={() => { onApply(chosen); onClose(); }}>Apply</button>
        </footer>
      </div>
    </div>
  );
}
