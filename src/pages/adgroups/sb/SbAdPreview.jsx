import { ChevronLeft, ChevronRight, ChevronDown, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { productVisual } from '../../../data/productImages';

const PREVIEW_PLACEMENTS = [
  { key: 'mobile-top', device: 'mobile', group: 'Mobile', label: 'Top of search' },
  { key: 'desktop-top', device: 'desktop', group: 'Desktop', label: 'Top of search' },
];
const PAGES = 2;

const Stars = ({ rating = 4 }) => <span className="sbp-stars" aria-label={`${rating} out of 5 stars`}>{'★★★★★'.slice(0, Math.round(rating))}<span>{'★★★★★'.slice(Math.round(rating))}</span></span>;
const Logo = ({ brand }) => <span className="sbp-logo">{brand.slice(0, 2).toUpperCase()}</span>;

function Creative({ ad, products, device, page }) {
  const picked = ad.products.map(a => products.find(p => p.asin === a)).filter(Boolean);
  const headline = ad.headline.trim() || 'Your headline here';
  if (page === 1) {
    return (
      <div className={`sbp-creative is-${device} is-carousel`}>
        <div className="sbp-head"><Logo brand={ad.brandName} /><div><strong>{headline}</strong><small>Sponsored · Shop {ad.brandName} ›</small></div></div>
        <div className="sbp-row">
          {picked.slice(0, 3).map(p => <div key={p.asin} className="sbp-tile">{productVisual(p)}<Stars rating={p.rating} /></div>)}
        </div>
      </div>
    );
  }
  return (
    <div className={`sbp-creative is-${device}`}>
      <div className="sbp-head"><Logo brand={ad.brandName} /><div><strong>{headline}</strong><small>Sponsored</small></div></div>
      <div className="sbp-hero">{ad.images > 0 ? <span className="sbp-lifestyle" /> : picked[0] ? productVisual(picked[0]) : null}</div>
      <div className="sbp-row">
        {picked.slice(0, device === 'desktop' ? 3 : 2).map(p => <div key={p.asin} className="sbp-tile">{productVisual(p)}<Stars rating={p.rating} /></div>)}
      </div>
      <span className="sbp-shop">Shop {ad.brandName} ›</span>
    </div>
  );
}

/** "Preview: [Top of search ▾]  1 of 2 ‹ ›" with a phone or desktop mock-up of the ad. */
export default function SbAdPreview({ ad, products }) {
  const [placement, setPlacement] = useState(PREVIEW_PLACEMENTS[0]);
  const [page, setPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="sbp">
      <div className="sbp-bar">
        <strong>Preview:</strong>
        <span className="cx-pop-anchor">
          <button type="button" className="sbp-select" onClick={() => setIsOpen(o => !o)} aria-expanded={isOpen}>
            {placement.device === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />} {placement.label} <ChevronDown size={16} />
          </button>
          {isOpen && (
            <>
              <div className="drp-scrim" onClick={() => setIsOpen(false)} />
              <div className="tf-pop tf-menu" role="listbox">
                {['Mobile', 'Desktop'].map(g => (
                  <div key={g}>
                    <div className="tf-menu-title">{g === 'Mobile' ? <Smartphone size={14} /> : <Monitor size={14} />} {g}</div>
                    {PREVIEW_PLACEMENTS.filter(p => p.group === g).map(p => (
                      <button key={p.key} type="button" role="option" aria-selected={placement.key === p.key}
                        className={`tf-menu-item ${placement.key === p.key ? 'is-active' : ''}`} onClick={() => { setPlacement(p); setIsOpen(false); }}>{p.label}</button>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </span>
        <span className="sbp-pager">{page + 1} of {PAGES}</span>
        <span className="sbp-arrows">
          <button type="button" aria-label="Previous preview" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Next preview" disabled={page === PAGES - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </span>
      </div>
      <div className="sbp-stage">
        <span className="sbp-where">Where will my ad show?</span>
        <div className={`sbp-device is-${placement.device}`}>
          <div className="sbp-screen">
            <div className="sbp-searchbar"><span /></div>
            <Creative ad={ad} products={products} device={placement.device} page={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
