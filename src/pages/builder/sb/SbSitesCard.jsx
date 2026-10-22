import { CircleHelp } from 'lucide-react';

const SB_SITE_OPTIONS = [
  { key: 'amazon', label: 'Amazon', desc: 'Ads appear on Amazon—including both Amazon retail and Amazon Business.' },
  { key: 'amazon-business', label: 'Amazon Business', desc: 'Exclusively reach business shoppers on Amazon Business.' },
];

/** Sponsored Brands "Sites" card: Amazon (default) or Amazon Business only. */
export default function SbSitesCard({ value, onChange }) {
  return (
    <section className="sb-card">
      <header className="sb-card-head">
        <h3 className="sb-h-card">Sites</h3>
        <a href="#help" className="ccs-help-link" onClick={e => e.preventDefault()}><CircleHelp size={13} /> How to choose where your ads appear</a>
      </header>
      <div className="sb-card-body">
        {SB_SITE_OPTIONS.map(o => (
          <label key={o.key} className="sb-radio">
            <input type="radio" name="sb-sites" checked={value === o.key} onChange={() => onChange(o.key)} />
            <span><strong>{o.label}</strong><small>{o.desc}</small></span>
          </label>
        ))}
      </div>
    </section>
  );
}
