import { useState } from 'react';
import { Check, ListFilter, X } from 'lucide-react';
import FilterEditor from './FilterEditor';
import { describeFilter, upsertFilter } from './tableFilters';

const Scrim = ({ onClose }) => <div className="drp-scrim" onClick={onClose} />;

/** "Filter" row: one pill per applied filter (click to edit, × to remove), extra pills (quick filters) and "Remove all". */
export function FilterRow({ filters, fields, onChange, extras = [] }) {
  const [editingKey, setEditingKey] = useState(null);
  if (filters.length === 0 && extras.length === 0) return null;
  const close = () => setEditingKey(null);
  return (
    <div className="cx-filter-row tf-row">
      <strong>Filter</strong>
      {filters.map(f => {
        const { label, value } = describeFilter(f, fields);
        const field = fields.find(x => x.key === f.key);
        return (
          <span key={f.key} className="cx-pop-anchor">
            <span className="cx-filter-pill tf-pill">
              <button type="button" className="tf-pill-text" onClick={() => setEditingKey(f.key)}><strong>{label}:</strong><span className="tf-pill-value">{value}</span></button>
              <button type="button" aria-label={`Remove ${label} filter`} onClick={() => onChange(filters.filter(x => x.key !== f.key))}><X size={14} /></button>
            </span>
            {editingKey === f.key && field && (
              <>
                <Scrim onClose={close} />
                <div className="tf-pop">
                  <FilterEditor field={field} filter={f} fields={fields} onCancel={close}
                    onRemove={() => { onChange(filters.filter(x => x.key !== f.key)); close(); }}
                    onApply={next => { onChange(upsertFilter(filters, next)); close(); }} />
                </div>
              </>
            )}
          </span>
        );
      })}
      {extras.map(x => (
        <span key={x.label} className="cx-filter-pill tf-pill">
          <span className="tf-pill-text">{x.label}</span>
          <button type="button" aria-label={`Remove ${x.label}`} onClick={x.onRemove}><X size={14} /></button>
        </span>
      ))}
      <button type="button" className="cx-link" onClick={() => { onChange([]); extras.forEach(x => x.onRemove()); }}>Remove all</button>
    </div>
  );
}

/** The funnel icon: a "Filters" menu of fields, then that field's editor. */
export function FilterMenu({ filters, fields, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState(null);
  const close = () => { setIsOpen(false); setFieldKey(null); };
  const field = fields.find(f => f.key === fieldKey);
  return (
    <span className="cx-pop-anchor">
      <button type="button" className={`cx-tool-btn ${isOpen ? 'is-open' : ''}`} aria-label="Filter by" aria-expanded={isOpen} onClick={() => setIsOpen(o => !o)}>
        <ListFilter size={16} />
      </button>
      {isOpen && (
        <>
          <Scrim onClose={close} />
          <div className="tf-pop">
            {field ? (
              <FilterEditor field={field} filter={filters.find(f => f.key === field.key)} fields={fields} onCancel={close}
                onApply={next => { onChange(upsertFilter(filters, next)); close(); }} />
            ) : (
              <div className="tf-menu" role="menu">
                <div className="tf-menu-title">Filters</div>
                {fields.map(f => (
                  <button key={f.key} type="button" role="menuitem" className="tf-menu-item" onClick={() => setFieldKey(f.key)}>
                    <span className="tf-check">{filters.some(x => x.key === f.key) && <Check size={14} />}</span>{f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </span>
  );
}
