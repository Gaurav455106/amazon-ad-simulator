import { useState } from 'react';
import { Search } from 'lucide-react';
import { STATUS_OPTIONS, NUMBER_OPERATORS, isFilterValid } from './tableFilters';

function RadioList({ name, options, value, onChange }) {
  return (
    <div className="tf-options" role="radiogroup">
      {options.map(o => (
        <label key={o.value} className="tf-option">
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function ChoiceBody({ field, draft, setDraft }) {
  const [query, setQuery] = useState('');
  const options = field.options.filter(o => !query || o.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      {field.isSearchable && (
        <label className="tf-search"><Search size={14} /><input placeholder="Enter Search Term" value={query} onChange={e => setQuery(e.target.value)} /></label>
      )}
      <RadioList name={field.key} options={options} value={draft.value} onChange={value => setDraft({ ...draft, value })} />
      {options.length === 0 && <p className="tf-empty">No matches</p>}
    </>
  );
}

function NumberBody({ draft, setDraft }) {
  const op = draft.op || 'gt';
  return (
    <div className="tf-number">
      <select className="tf-select" value={op} onChange={e => setDraft({ ...draft, op: e.target.value })} aria-label="Comparison">
        {NUMBER_OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input className="tf-input" inputMode="decimal" value={draft.value ?? ''} onChange={e => setDraft({ ...draft, value: e.target.value })} aria-label="Value" />
      {op === 'between' && (
        <>
          <span className="tf-and">and</span>
          <input className="tf-input" inputMode="decimal" value={draft.value2 ?? ''} onChange={e => setDraft({ ...draft, value2: e.target.value })} aria-label="Second value" />
        </>
      )}
    </div>
  );
}

const startDraft = (field, filter) => {
  if (filter) return filter;
  if (field.kind === 'number') return { key: field.key, op: 'gt', value: '0' };
  return { key: field.key, value: undefined };
};

/**
 * The popover for one filter: title, Remove, the field's inputs, Cancel / Apply.
 * @param {{ field: object, filter?: object, fields: object[], onApply: (f: object) => void, onCancel: () => void, onRemove?: () => void }} props
 */
export default function FilterEditor({ field, filter, fields, onApply, onCancel, onRemove }) {
  const [draft, setDraft] = useState(() => startDraft(field, filter));
  const canApply = isFilterValid(draft, fields);
  return (
    <div className="tf-editor" role="dialog" aria-label={field.label}>
      <header className="tf-head">
        <strong>{field.label}</strong>
        <button type="button" className="tf-link" onClick={onRemove || onCancel}>Remove</button>
      </header>
      <div className="tf-body">
        {field.kind === 'status' && <RadioList name="status" options={STATUS_OPTIONS} value={draft.value} onChange={value => setDraft({ ...draft, value })} />}
        {field.kind === 'choice' && <ChoiceBody field={field} draft={draft} setDraft={setDraft} />}
        {field.kind === 'number' && <NumberBody draft={draft} setDraft={setDraft} />}
      </div>
      <footer className="tf-foot">
        <button type="button" className="tf-link" onClick={onCancel}>Cancel</button>
        <button type="button" className="tf-apply" disabled={!canApply} onClick={() => onApply(draft)}>Apply</button>
      </footer>
    </div>
  );
}
