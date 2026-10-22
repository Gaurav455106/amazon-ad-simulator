import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { MoneyInput, PillSelect } from './SdBits';
import { LOOKBACK_DAYS } from './sdConfig';

/** "N suggestions … Add all" bar. */
export function SuggestionBar({ count, onAddAll }) {
  return (
    <div className="sd-sugg-bar">
      <span>{count} suggestion{count === 1 ? '' : 's'}</span>
      {count > 0 ? <button type="button" className="sd-link" onClick={onAddAll}>Add all</button> : <span className="sd-muted-italic">Add all</span>}
    </div>
  );
}

export const SectionLabel = ({ children }) => <div className="sd-section-label">{children}</div>;

export const NoCategories = () => <p className="sd-no-results">We could not find any related categories. Try searching for categories.</p>;

/** A suggestion / search-result row with its type caption and Add / Added. */
export function OptionRow({ caption, label, desc, sub, isAdded, onAdd }) {
  return (
    <div className="sd-option">
      <div>
        {caption && <span className="sd-caption">{caption}</span>}
        <strong className="sd-option-label">{label} {desc && <span title={desc}><Info size={12} /></span>}</strong>
        {sub && <span className="sd-option-sub">{sub}</span>}
      </div>
      {isAdded ? <span className="sd-added-text">Added</span> : <button type="button" className="sd-link" onClick={onAdd}>Add</button>}
    </div>
  );
}

/** Expandable browse row; every node is addable, children expand under the chevron. */
export function TreeRow({ node, depth = 0, query, isAdded, onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const q = query.trim().toLowerCase();
  const matches = (n) => n.name.toLowerCase().includes(q) || n.children.some(matches);
  if (q && !matches(node)) return null;
  const hasChildren = node.children.length > 0;
  const isExpanded = isOpen || (q && hasChildren);
  return (
    <>
      <div className="sd-tree-row" style={{ paddingLeft: 12 + depth * 18 }}>
        <button type="button" className="sd-tree-toggle" disabled={!hasChildren} aria-expanded={hasChildren ? isExpanded : undefined}
          aria-label={hasChildren ? `${isExpanded ? 'Collapse' : 'Expand'} ${node.name}` : undefined} onClick={() => setIsOpen(o => !o)}>
          {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <ChevronDown size={14} className="sd-invisible" />}
          <span>{node.name}</span>
        </button>
        {isAdded(node.id) ? <span className="sd-added-text">Added</span> : <button type="button" className="sd-link" onClick={() => onAdd(node)}>Add</button>}
      </div>
      {isExpanded && node.children.map(c => <TreeRow key={c.id} node={c} depth={depth + 1} query={query} isAdded={isAdded} onAdd={onAdd} />)}
    </>
  );
}

/** Right-hand row in "N added": type, name, lookback picker, bid and remove. */
export function AddedTarget({ target: t, isCostControl, onChange, onRemove }) {
  const lookbackOptions = LOOKBACK_DAYS.map(d => ({ value: d, label: `${t.lookbackType === 'purchases' ? 'Purchases' : 'Views'} ${d} days` }));
  return (
    <div className="sd-added-row">
      <div className="sd-added-main">
        <span className="sd-caption">{t.type}</span>
        <strong className="sd-option-label">{t.label} {t.desc && <span title={t.desc}><Info size={12} /></span>}</strong>
        {t.sub && <span className="sd-option-sub">{t.sub}</span>}
        {t.lookbackType && (
          <>
            <span className="sd-lookback"><b>Lookback:</b> {t.lookbackDays} days</span>
            <PillSelect value={t.lookbackDays} options={lookbackOptions} ariaLabel="Lookback" onChange={(d) => onChange({ lookbackDays: d })} />
          </>
        )}
      </div>
      <MoneyInput value={isCostControl ? '' : t.bid} placeholder="-" isDisabled={isCostControl} width={86}
        hasError={!isCostControl && t.touched && !(parseFloat(t.bid) > 0)}
        ariaLabel={`Bid for ${t.type} ${t.label}`} onChange={(bid) => onChange({ bid, touched: true })} />
      <button type="button" className="sd-x" aria-label={`Remove ${t.label}`} onClick={onRemove}><X size={15} /></button>
    </div>
  );
}
