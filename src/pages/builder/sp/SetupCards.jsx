import { useState } from 'react';
import { ChevronDown, ChevronRight, CircleHelp } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { SITE_OPTIONS } from './constants';

const SETUP_OPTIONS = [
  {
    key: 'standard',
    label: 'Standard',
    lead: 'Create a single campaign yourself from scratch.',
    detail: 'Choose your products, targeting type (keywords or product targeting, automatic or manual), budget and bids.',
  },
  {
    key: 'preset',
    label: 'Preset',
    badge: 'Beta',
    lead: 'Choose products and budget, and we will set up a campaign with preset keywords, bids and bidding strategy.',
    detail: 'Keyword groups and dynamic bids will automatically adjust based on performance.',
  },
];


const HelpLink = ({ children }) => (
  <a href="#help" className="sb-help" onClick={e => e.preventDefault()}><CircleHelp size={13} /> {children}</a>
);

/** "Campaign setup": Standard vs Preset tiles (collapsible, as on the console). */
export function CampaignSetupCard({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <section className="sb-card">
      <header className="sb-card-head sb-card-head-lg">
        <button type="button" className="sb-collapse" aria-label={isOpen ? 'collapse' : 'expand'} onClick={() => setIsOpen(o => !o)}>
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <h2 className="sb-h-setup">Campaign setup</h2>
      </header>
      {isOpen && (
        <div className="sb-tiles" role="radiogroup" aria-label="Campaign setup">
          {SETUP_OPTIONS.map(o => (
            <label key={o.key} className={`sb-tile ${value === o.key ? 'is-selected' : ''}`}>
              <input type="radio" name="campaign-setup" checked={value === o.key} onChange={() => onChange(o.key)} />
              <strong>{o.label}{o.badge && <span className="sb-badge">{o.badge}</span>}</strong>
              <span>{o.lead}</span>
              <span className="sb-muted">{o.detail}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

/** "Sites": where all ads in the campaign appear. Read-only when adding an ad group. */
export function SitesCard({ value, onChange, isReadOnly }) {
  const selected = SITE_OPTIONS.find(o => o.key === value) || SITE_OPTIONS[0];
  return (
    <section className="sb-card">
      <header className="sb-card-head sb-card-head-top">
        <div>
          <h3 className="sb-h-card">Sites <Info size={14} /></h3>
          <p className="sb-card-intro">Based on your advertising strategy, choose where all the ads in your campaign will appear.</p>
        </div>
        <HelpLink>How to choose where your ads appear</HelpLink>
      </header>
      <div className="sb-card-body">
        {isReadOnly ? (
          <div className="sb-readonly">
            <strong>{selected.label}</strong>
            <span>{selected.key === 'amazon-and-beyond'
              ? 'Ads appear on Amazon—including both Amazon retail and Amazon Business—as well as select sites and apps off Amazon.'
              : selected.desc}</span>
          </div>
        ) : SITE_OPTIONS.map(o => (
          <label key={o.key} className="sb-radio">
            <input type="radio" name="sites" checked={value === o.key} onChange={() => onChange(o.key)} />
            <span><strong>{o.label}</strong><small>{o.desc}</small></span>
          </label>
        ))}
      </div>
    </section>
  );
}

/** Preset campaigns only ask for name, dates and budget; targeting and bids are fixed. */
export function PresetSettingsCard({ name, onName, startDate, onStartDate, endDate, onEndDate, budget, onBudget }) {
  return (
    <section className="sb-card">
      <header className="sb-card-head">
        <h3 className="sb-h-card">Campaign Settings</h3>
        <HelpLink>How to set up your campaign</HelpLink>
      </header>
      <div className="sb-card-body sb-form">
        <label className="sb-field">Campaign name <Info size={13} />
          <input className="sb-input" value={name} onChange={e => onName(e.target.value)} />
        </label>
        <div className="sb-row">
          <label className="sb-field">Start <Info size={13} />
            <input type="date" className="sb-input" value={startDate} onChange={e => onStartDate(e.target.value)} />
          </label>
          <label className="sb-field">End <Info size={13} />
            <input type="date" className="sb-input" value={endDate} min={startDate} onChange={e => onEndDate(e.target.value)} />
          </label>
        </div>
        <label className="sb-field sb-field-narrow">Daily budget <Info size={13} />
          <span className="sb-money"><span>₹</span><input value={budget} onChange={e => onBudget(e.target.value)} /></span>
        </label>
        <div className="sb-field">
          <strong>Targeting &amp; bids</strong>
          <p className="sb-muted">
            Your campaign will use keyword groups related to your products with a Dynamic bids - up and down bidding strategy.
            Performance may take up to 14 days to stabilise as the campaign optimises. You can review and adjust after launch.
          </p>
        </div>
      </div>
    </section>
  );
}
