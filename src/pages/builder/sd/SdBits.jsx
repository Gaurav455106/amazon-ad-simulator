import { useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';

/** Card with the Display builder's heading row (light 24px title + optional help link). */
export function SdCard({ title, info, help, intro, children, className = '' }) {
  return (
    <section className={`sd-card ${className}`}>
      <header className="sd-card-head">
        <div>
          <h2 className="sd-card-title">{title}{info && <Info size={13} />}</h2>
          {intro && <p className="sd-card-intro">{intro}</p>}
        </div>
        {help && <HelpLink>{help}</HelpLink>}
      </header>
      {children}
    </section>
  );
}

export function HelpLink({ children }) {
  return <a href="#help" className="sd-help" onClick={e => e.preventDefault()}><CircleHelp size={14} /> {children}</a>;
}

/** Grey rounded dropdown ("No Portfolio ▾", "Weekly ▾", "Suggested bid ▾"). */
export function PillSelect({ value, options, onChange, isDisabled, onDisabledClick, ariaLabel, width }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = options.find(o => o.value === value) || options[0];
  const toggle = () => (isDisabled ? onDisabledClick?.() : setIsOpen(o => !o));
  return (
    <div className="sd-pill-wrap">
      <button type="button" className={`sd-pill ${isDisabled ? 'is-disabled' : ''}`} style={width ? { minWidth: width } : undefined}
        aria-haspopup="listbox" aria-expanded={isOpen} aria-label={ariaLabel} onClick={toggle}>
        <span className="sd-pill-text">{current?.label}</span> <ChevronDown size={14} />
      </button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="sd-menu" role="listbox">
            {options.map(o => (
              <button type="button" role="option" aria-selected={o.value === value} key={o.value}
                className={`sd-menu-item ${o.value === value ? 'is-selected' : ''}`}
                onClick={() => { onChange(o.value); setIsOpen(false); }}>
                <strong>{o.label}</strong>{o.desc && <span>{o.desc}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Toggle({ isOn, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={isOn} aria-label={label} className={`sd-toggle ${isOn ? 'is-on' : ''}`} onClick={() => onChange(!isOn)}>
      <span className="sd-toggle-knob" />
    </button>
  );
}

/** "₹ [ 1,000.00 ]" input. */
export function MoneyInput({ value, onChange, isDisabled, placeholder, ariaLabel, width = 130, hasError }) {
  return (
    <label className={`sd-money ${isDisabled ? 'is-disabled' : ''} ${hasError ? 'has-error' : ''}`} style={{ width }}>
      <span>₹</span>
      <input type="number" min="0" step="0.01" value={value} placeholder={placeholder} disabled={isDisabled}
        aria-label={ariaLabel} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

export function SubTabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`sd-tabs ${className}`} role="tablist">
      {tabs.map(t => (
        <button type="button" role="tab" aria-selected={value === t.key} key={t.key}
          className={`sd-tab ${value === t.key ? 'is-active' : ''}`} onClick={() => onChange(t.key)}>
          {t.label}{t.info && <Info size={12} />}
        </button>
      ))}
    </div>
  );
}
