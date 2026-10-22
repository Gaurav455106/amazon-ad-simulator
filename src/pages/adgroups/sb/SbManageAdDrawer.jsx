import { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import SbAdPreview from './SbAdPreview';
import SbCreativeEditor from './SbCreativeEditor';
import SbLandingPage, { ViewPageLink } from './SbLandingPage';
import { TRANSLATION_LOCALES, validateSbAd } from '../sbAds';

const REVIEW_NOTE = 'The review process usually takes 1 to 3 business days. If your campaign is delivering, the previously approved version of your ad will run until this version is approved.';

function Translations() {
  return (
    <section className="sbm-card">
      <h3 className="sbm-card-title">Translations</h3>
      <div className="sbm-card-body">
        <p className="sbm-inline"><button type="button" className="cx-btn" disabled>Edit Translations</button> <span className="cx-sub">Editing translations will not impact the delivery of your campaign in the default language.</span></p>
        <table className="sbm-locales">
          <thead><tr><th>Locales</th><th /></tr></thead>
          <tbody>
            {TRANSLATION_LOCALES.map(l => (
              <tr key={l}><td>{l}</td><td><span className="sbm-pending">Pending translations</span> <button type="button" className="cx-link" disabled>Submit your own translation</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * "Manage ad": a side panel with the creative and landing page, a preview and translations.
 * Edit creative / Edit landing page switch it into an editor that ends with "Submit for review".
 * @param {{ ad: object, adFormat?: string, catalogue: object[], onSubmit: (ad: object) => void, onClose: () => void }} props
 */
export default function SbManageAdDrawer({ ad, adFormat, catalogue, onSubmit, onClose }) {
  const [mode, setMode] = useState('view'); // view | creative | landing
  const [draft, setDraft] = useState(ad);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cancel = () => { setDraft(ad); setErrors([]); setMode('view'); };
  const submit = () => {
    const problems = validateSbAd(draft);
    setErrors(problems);
    if (problems.length === 0) { onSubmit({ ...draft, pendingReview: true }); onClose(); }
  };

  return (
    <div className="sbm-scrim" onClick={onClose}>
      <button type="button" className="sbm-close" aria-label="Close" onClick={onClose}><X size={22} /></button>
      <aside className="sbm" role="dialog" aria-modal="true" aria-label={ad.name} onClick={e => e.stopPropagation()}>
        <header className="sbm-head">{mode === 'creative' ? <h2>Creative</h2> : <span>{ad.name}</span>}</header>
        <div className="sbm-body">
          {mode === 'view' && (
            <>
              <section className="sbm-card">
                <div className="sbm-card-row">
                  <div>
                    <h3 className="sbm-card-title">Creative and landing page</h3>
                    <p><strong>Landing page:</strong> {draft.landingPage === 'new' ? 'New landing page' : 'Store on Amazon'} <ViewPageLink brand={draft.brandName} /></p>
                    {ad.pendingReview && <p className="sbm-pending">An updated version of this ad is in review.</p>}
                  </div>
                  <div className="sbm-actions">
                    <button type="button" className="cx-btn" onClick={() => setMode('creative')}>Edit creative</button>
                    <button type="button" className="cx-btn" onClick={() => setMode('landing')}>Edit landing page</button>
                  </div>
                </div>
                <SbAdPreview ad={draft} products={catalogue} />
              </section>
              <Translations />
            </>
          )}
          {mode === 'landing' && (
            <>
              <p className="sbm-reset"><button type="button" className="cx-link" onClick={() => setDraft(ad)}><RotateCcw size={13} /> Reset ad</button></p>
              <SbLandingPage draft={draft} onChange={setDraft} adFormat={adFormat} />
              <section className="sbm-card"><h3 className="sbm-card-title">Creative</h3><SbCreativeEditor draft={draft} onChange={setDraft} catalogue={catalogue} /></section>
            </>
          )}
          {mode === 'creative' && <SbCreativeEditor draft={draft} onChange={setDraft} catalogue={catalogue} />}
        </div>
        {mode !== 'view' && (
          <footer className="sbm-foot">
            {errors.length > 0 ? <p className="sbe-error" role="alert">{errors.join(' ')}</p> : <p className="cx-sub"><span aria-hidden="true">ⓘ</span> {REVIEW_NOTE}</p>}
            <button type="button" className="tf-link" onClick={cancel}>Cancel</button>
            <button type="button" className="tf-apply" onClick={submit}>Submit for review</button>
          </footer>
        )}
      </aside>
    </div>
  );
}
