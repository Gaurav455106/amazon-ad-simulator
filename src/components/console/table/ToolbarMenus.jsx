import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Copy, ExternalLink, Info, Settings, X } from 'lucide-react';
import { ROUTES } from '../../../routes';

const Scrim = ({ onClose }) => <div className="drp-scrim" onClick={onClose} />;

/** A toolbar button with a dropdown of options; `children(close)` renders the menu. */
function Dropdown({ label, ariaLabel, children, align = 'left', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  return (
    <span className="cx-pop-anchor">
      <button type="button" className={`cx-tool-btn ${isOpen ? 'is-open' : ''}`} aria-label={ariaLabel} aria-expanded={isOpen}
        disabled={disabled} onClick={() => setIsOpen(o => !o)}>
        {label}
      </button>
      {isOpen && (
        <>
          <Scrim onClose={close} />
          <div className={`tf-pop tf-menu is-${align}`} role="menu">{children(close)}</div>
        </>
      )}
    </span>
  );
}

const MenuItem = ({ isActive, disabled, onClick, children }) => (
  <button type="button" role="menuitem" className={`tf-menu-item ${isActive ? 'is-active' : ''}`} disabled={disabled} onClick={onClick}>{children}</button>
);

const DENSITIES = [{ key: 'default', label: 'Default' }, { key: 'compact', label: 'Compact' }];

/** "View: Default | Compact" — compact narrows columns so more fit on screen. */
export function ViewMenu({ density, onChange }) {
  return (
    <Dropdown label={<>View: {DENSITIES.find(d => d.key === density)?.label} <ChevronDown size={14} /></>} align="right">
      {close => DENSITIES.map(d => (
        <MenuItem key={d.key} isActive={density === d.key} onClick={() => { onChange(d.key); close(); }}>{d.label}</MenuItem>
      ))}
    </Dropdown>
  );
}

/** "Columns": Customise columns / Reset to default. */
export function ColumnsMenu({ onCustomise, onReset }) {
  return (
    <Dropdown label={<>Columns <ChevronDown size={14} /></>} align="right">
      {close => (
        <>
          <MenuItem onClick={() => { onCustomise(); close(); }}>Customise columns</MenuItem>
          <MenuItem onClick={() => { onReset(); close(); }}>Reset to default</MenuItem>
        </>
      )}
    </Dropdown>
  );
}

/** "Export": download the current table as CSV, or go to Reporting. */
export function ExportMenu({ onDownload }) {
  return (
    <Dropdown label={<>Export <ChevronDown size={14} /></>} align="right">
      {close => (
        <>
          <div className="tf-menu-title">Current table data</div>
          <MenuItem onClick={() => { onDownload(); close(); }}>Download</MenuItem>
          <div className="tf-menu-sep" />
          <div className="tf-menu-title">Reporting</div>
          <Link role="menuitem" className="tf-menu-item" to={ROUTES.reports} onClick={close}>Create report <ExternalLink size={13} /></Link>
        </>
      )}
    </Dropdown>
  );
}

/** Gear → Settings dialog with the Media Rating Council (MRC) data toggle. */
export function TableSettings({ mrcOnly, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(mrcOnly);
  const open = () => { setDraft(mrcOnly); setIsOpen(true); };
  return (
    <>
      <button type="button" className="cx-tool-btn" aria-label="Table settings" onClick={open}><Settings size={16} /></button>
      {isOpen && (
        <div className="tcm-scrim" onClick={() => setIsOpen(false)}>
          <div className="tcm tcm-small" role="dialog" aria-modal="true" aria-label="Settings" onClick={e => e.stopPropagation()}>
            <header className="tcm-head">
              <h2>Settings</h2>
              <button type="button" className="tcm-close" aria-label="Close" onClick={() => setIsOpen(false)}><X size={18} /></button>
            </header>
            <div className="tcm-pad">
              <div className="tset-title">Media Rating Council (MRC) accreditation <Info size={13} /></div>
              <label className="tset-row">
                <button type="button" role="switch" aria-checked={draft} className={`cx-switch ${draft ? 'is-on' : ''}`} onClick={() => setDraft(d => !d)} />
                <span>Show only MRC accredited data for Sponsored Products campaigns.<br /><a className="cx-link" href="#mrc" onClick={e => e.preventDefault()}>Learn more about MRC accreditation</a></span>
              </label>
            </div>
            <footer className="tcm-foot">
              <button type="button" className="tf-link" onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="button" className="tf-apply" onClick={() => { onSave(draft); setIsOpen(false); }}>Save</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The bulk-actions icon: disabled until rows are selected, then a sectioned menu.
 * @param {{ count: number, sections: Array<{ title: string, items: Array<{ label: string, disabled?: boolean, onClick: () => void }> }> }} props
 */
export function BulkActionsMenu({ count, sections }) {
  return (
    <Dropdown label={<Copy size={16} />} ariaLabel={count ? `Bulk actions (${count} selected)` : 'Bulk actions'} disabled={count === 0}>
      {close => sections.map(sec => (
        <div key={sec.title} className="tf-menu-section">
          <div className="tf-menu-title">{sec.title}</div>
          {sec.items.map(it => (
            <MenuItem key={it.label} disabled={it.disabled} onClick={() => { it.onClick(); close(); }}>{it.label}</MenuItem>
          ))}
        </div>
      ))}
    </Dropdown>
  );
}
