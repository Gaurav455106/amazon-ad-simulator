import { NavLink } from 'react-router-dom';

/**
 * Header of a campaign / ad group page: "Campaign: <name>" + status switch + meta chips.
 * @param {{ kind: string, name: string, isOn: boolean, onToggle: () => void,
 *           chips: Array<{ label: string, value: string }>, isToggleDisabled?: boolean }} props
 */
export function EntityHeader({ kind, name, isOn, onToggle, chips, isToggleDisabled }) {
  return (
    <div className="ent-head">
      <h1 className="ent-title">{kind}: <strong>{name}</strong></h1>
      <div className="ent-meta">
        <button
          type="button"
          className={`cx-switch ${isOn ? 'is-on' : ''}`}
          aria-label={isOn ? 'Enabled' : 'Paused'}
          disabled={isToggleDisabled}
          onClick={onToggle}
        />
        {chips.map(c => (
          <span key={c.label} className="ent-meta-item">
            {c.label}: <span className="cx-chip">{c.value}</span>
          </span>
        ))}
        <button type="button" className="ent-feedback">Give feedback</button>
      </div>
    </div>
  );
}

/** Left-hand vertical tab list; each tab is a real URL segment. */
export function EntityTabs({ tabs, basePath }) {
  return (
    <nav className="ent-tabs" aria-label="Sections">
      {tabs.map(t => (
        <NavLink key={t.key} to={`${basePath}/${t.key}`} className={({ isActive }) => `ent-tab ${isActive ? 'is-active' : ''}`}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
