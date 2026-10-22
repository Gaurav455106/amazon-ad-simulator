import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, CircleCheck, CircleHelp, Info, Plus, TriangleAlert, X } from 'lucide-react';
import ProductImage from '../../../components/console/ProductImage';
import ProductLink from '../../../components/console/ProductLink';
import SbAdPreview from './SbAdPreview';
import { creativeStrength, moveItem, SB_HEADLINE_MAX, SB_MIN_PRODUCTS } from '../sbAds';

const MAX_PRODUCTS = 10;
const ok = <CircleCheck size={18} className="sbe-ok" aria-label="Complete" />;
const warn = <TriangleAlert size={18} className="sbe-warn" aria-label="Needs attention" />;

function Row({ label, count, status, note, onOpen }) {
  return (
    <button type="button" className="sbe-row" onClick={onOpen}>
      <span className="sbe-row-main"><strong>{label}</strong>{count !== undefined && <span className="sbe-count">{count}</span>}{note && <small><Info size={12} /> {note}</small>}</span>
      {status}
      <ChevronRight size={18} />
    </button>
  );
}

function ProductsPanel({ draft, set, catalogue }) {
  const [isPicking, setIsPicking] = useState(false);
  const picked = draft.products.map(a => catalogue.find(p => p.asin === a) || { asin: a, name: a });
  const available = catalogue.filter(p => !draft.products.includes(p.asin));
  return (
    <>
      <div className="sbe-panel-head"><strong>Edit products <Info size={12} /></strong></div>
      <p className="sbe-muted">Use the arrows to reorder products. Products can be changed to any product on your landing page. Out of stock products may affect your ad format.</p>
      <div className="sbe-products">
        {picked.map((p, i) => (
          <div key={p.asin} className="sbe-product">
            <span className="sbe-order">
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => set({ products: moveItem(draft.products, i, -1) })}><ArrowUp size={13} /></button>
              <button type="button" aria-label="Move down" disabled={i === picked.length - 1} onClick={() => set({ products: moveItem(draft.products, i, 1) })}><ArrowDown size={13} /></button>
            </span>
            <ProductImage product={p} size={56} />
            <span className="sbe-product-text"><ProductLink asin={p.asin} className="cx-link">{p.name}</ProductLink>{p.rating && <small>★ {p.rating} ({p.reviews})</small>}</span>
            <button type="button" className="sbe-remove" aria-label={`Remove ${p.name}`} onClick={() => set({ products: draft.products.filter(a => a !== p.asin) })}><X size={14} /></button>
          </div>
        ))}
      </div>
      {draft.products.length < SB_MIN_PRODUCTS && <p className="sbe-error">Add at least {SB_MIN_PRODUCTS} products.</p>}
      {draft.products.length < MAX_PRODUCTS && (
        isPicking ? (
          <div className="sbe-picker">
            {available.map(p => (
              <button key={p.asin} type="button" className="sbe-pick" onClick={() => { set({ products: [...draft.products, p.asin] }); setIsPicking(false); }}>
                <ProductImage product={p} size={36} /><span>{p.name}</span>
              </button>
            ))}
            {available.length === 0 && <p className="sbe-muted">All your products are already in this ad.</p>}
          </div>
        ) : (
          <button type="button" className="sbe-add" onClick={() => setIsPicking(true)}><Plus size={16} /> Add products</button>
        )
      )}
    </>
  );
}

function Panel({ panel, draft, set, catalogue }) {
  if (panel === 'headline') {
    return (
      <>
        <div className="sbe-panel-head"><strong>Headline <Info size={12} /></strong><a className="sbe-help" href="#guidelines" onClick={e => e.preventDefault()}><CircleHelp size={13} /> See messaging guidelines</a></div>
        <label className="sbe-optimise">
          <input type="checkbox" checked={draft.optimiseHeadline} onChange={e => set({ optimiseHeadline: e.target.checked })} />
          <span><strong>Optimise your headline <Info size={12} /></strong>To help improve performance while your campaign is live, let Amazon Ads enhance or generate new headlines to match customer intent.</span>
        </label>
        <div className="sbe-box">
          <input className="tf-input sbe-input" maxLength={SB_HEADLINE_MAX} placeholder="Add a headline" value={draft.headline} onChange={e => set({ headline: e.target.value })} />
          <small>Characters remaining: {SB_HEADLINE_MAX - draft.headline.length}</small>
        </div>
      </>
    );
  }
  if (panel === 'brand') {
    return (
      <>
        <div className="sbe-panel-head"><strong>Brand name <Info size={12} /></strong></div>
        <div className="sbe-box"><input className="tf-input sbe-input" maxLength={30} value={draft.brandName} onChange={e => set({ brandName: e.target.value })} /></div>
      </>
    );
  }
  if (panel === 'logo') {
    return (
      <>
        <div className="sbe-panel-head"><strong>Logo <Info size={12} /></strong></div>
        <div className="sbe-box sbe-logo-box"><span className="sbp-logo is-large">{draft.brandName.slice(0, 2).toUpperCase()}</span><span>Your brand logo from your Brand Registry, at least 400 × 400 px.</span></div>
      </>
    );
  }
  if (panel === 'images') {
    return (
      <>
        <div className="sbe-panel-head"><strong>Images <Info size={12} /></strong></div>
        <p className="sbe-muted">Add up to 5 lifestyle images (1200 × 628 px or larger, without text). Ads with more images can show in more places.</p>
        <div className="sbe-box">
          <strong>{draft.images} of 5 added</strong>
          <div className="sbe-actions">
            <button type="button" className="cx-btn" disabled={draft.images >= 5} onClick={() => set({ images: draft.images + 1 })}>Add image</button>
            <button type="button" className="cx-btn" disabled={draft.images >= 5} onClick={() => set({ images: Math.min(5, draft.images + 2) })}>Generate images</button>
            {draft.images > 0 && <button type="button" className="cx-link" onClick={() => set({ images: draft.images - 1 })}>Remove one</button>}
          </div>
        </div>
      </>
    );
  }
  return <ProductsPanel draft={draft} set={set} catalogue={catalogue} />;
}

/**
 * The console's "Creative" editor: asset list (or one asset's panel) on the left, strength and preview on the right.
 * @param {{ draft: object, onChange: (ad: object) => void, catalogue: object[] }} props
 */
export default function SbCreativeEditor({ draft, onChange, catalogue }) {
  const [panel, setPanel] = useState(null);
  const set = (patch) => onChange({ ...draft, ...patch });
  const strength = creativeStrength(draft);
  return (
    <div className="sbe">
      <div className="sbe-left">
        {panel ? (
          <div className="sbe-panel">
            <div className="sbe-panel-top">
              <button type="button" className="sbe-back" onClick={() => setPanel(null)}><ChevronLeft size={14} /> Back</button>
            </div>
            <Panel panel={panel} draft={draft} set={set} catalogue={catalogue} />
          </div>
        ) : (
          <>
            <Row label="Logo" status={ok} onOpen={() => setPanel('logo')} />
            <Row label="Brand name" status={draft.brandName.trim() ? ok : warn} onOpen={() => setPanel('brand')} />
            <Row label="Headline" status={draft.headline.trim() ? ok : warn} note={draft.headline.trim() ? 'New headlines are available.' : 'Add a headline'} onOpen={() => setPanel('headline')} />
            <Row label="Products" count={draft.products.length} status={draft.products.length >= SB_MIN_PRODUCTS ? ok : warn} onOpen={() => setPanel('products')} />
            <Row label="Images" count={draft.images} status={draft.images ? ok : null} note="AI-generated images are available." onOpen={() => setPanel('images')} />
          </>
        )}
      </div>
      <div className="sbe-right">
        <div className="sbe-strength">
          <span className="sbe-donut" style={{ '--pct': `${strength.score}%` }} aria-hidden="true" />
          <span><strong>Creative strength:</strong><span className={`sbe-badge is-${strength.label.toLowerCase()}`}>{strength.label}</span></span>
          <span className="sbe-tips">
            <span>Maximise performance by adding multiple assets <Info size={12} /></span>
            <span className="sbe-tip-list">{strength.suggestions.length ? strength.suggestions.map(s => <span key={s}>◔ {s}</span>) : <span>{ok} All recommended assets added</span>}</span>
          </span>
        </div>
        <SbAdPreview ad={draft} products={catalogue} />
      </div>
    </div>
  );
}
