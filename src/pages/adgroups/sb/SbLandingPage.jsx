import { ExternalLink, Info } from 'lucide-react';
import { STORE_PAGES, formatLabel, brandPageUrl } from '../sbAds';


export function ViewPageLink({ brand, label = 'View page' }) {
  return <a className="cx-link" href={brandPageUrl(brand)} target="_blank" rel="noopener noreferrer">{label} <ExternalLink size={12} /></a>;
}

/**
 * "Landing page": Store on Amazon (choose a Store and page) or New landing page.
 * @param {{ draft: object, onChange: (ad: object) => void, adFormat?: string, title?: string }} props
 */
export default function SbLandingPage({ draft, onChange, adFormat, title = 'Landing page' }) {
  const set = (patch) => onChange({ ...draft, ...patch });
  return (
    <section className="sbm-card">
      <h3 className="sbm-card-title">{title} <Info size={14} /></h3>
      <div className="sbm-card-body">
        <p><strong>Ad format:</strong> {formatLabel(adFormat)}</p>
        <p className="sbm-label">Landing page:</p>
        <label className="tf-option">
          <input type="radio" name={`lp-${draft.id}`} checked={draft.landingPage === 'store'} onChange={() => set({ landingPage: 'store' })} />
          <span>Store on Amazon (including subpages)</span>
        </label>
        {draft.landingPage === 'store' && (
          <div className="sbm-store">
            <label><span>Choose a Store</span>
              <select className="tf-select" value={draft.brandName} disabled><option>{draft.brandName}</option></select>
            </label>
            <label><span>Choose a page</span>
              <select className="tf-select" value={draft.storePage} onChange={e => set({ storePage: e.target.value })}>
                {STORE_PAGES.map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
            <ViewPageLink brand={draft.brandName} label="See page" />
          </div>
        )}
        <label className="tf-option">
          <input type="radio" name={`lp-${draft.id}`} checked={draft.landingPage === 'new'} onChange={() => set({ landingPage: 'new' })} />
          <span>New landing page<small className="sbm-sub">Pick products to advertise and we will create a landing page for you.</small></span>
        </label>
      </div>
    </section>
  );
}
