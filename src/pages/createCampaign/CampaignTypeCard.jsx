import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

function Dots({ count, index, onPick }) {
  return (
    <div className="cct-dots" role="tablist" aria-label="Slides">
      {Array.from({ length: count }).map((_, i) => (
        <button type="button" role="tab" key={i} aria-selected={i === index} aria-label={`Slide ${i + 1} of ${count}`}
          className={`cct-dot ${i === index ? 'is-active' : ''}`} onClick={() => onPick(i)} />
      ))}
    </div>
  );
}

/** Enlarged slide view opened from the expand icon, with its caption. */
function SlideModal({ title, slides, index, onIndex, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % slides.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + slides.length) % slides.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, slides.length, onClose, onIndex]);
  const step = (d) => onIndex((index + d + slides.length) % slides.length);
  return (
    <div className="cct-modal-scrim" onClick={onClose}>
      <div className="cct-modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <header><h2>{title}</h2><button type="button" className="cct-modal-close" aria-label="Close modal" onClick={onClose}><X size={18} /></button></header>
        <div className="cct-modal-body">
          <button type="button" className="cct-arrow" aria-label="Previous slide" onClick={() => step(-1)}><ChevronLeft size={22} /></button>
          <figure>{slides[index].art}<figcaption>{slides[index].caption}</figcaption></figure>
          <button type="button" className="cct-arrow" aria-label="Next slide" onClick={() => step(1)}><ChevronRight size={22} /></button>
        </div>
        <Dots count={slides.length} index={index} onPick={onIndex} />
      </div>
    </div>
  );
}

/** Image carousel of a campaign-type card: arrows outside the image, expand icon, dots. */
export function Carousel({ title, slides }) {
  const [index, setIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const step = (d) => setIndex(i => (i + d + slides.length) % slides.length);
  const current = slides[Math.min(index, slides.length - 1)];
  return (
    <div className="cct-carousel">
      <div className="cct-carousel-stage">
        <button type="button" className="cct-arrow" aria-label="Previous slide" onClick={() => step(-1)}><ChevronLeft size={18} /></button>
        <div className="cct-carousel-image" title={current.caption}>{current.art}</div>
        <button type="button" className="cct-arrow" aria-label="Next slide" onClick={() => step(1)}><ChevronRight size={18} /></button>
        <button type="button" className="cct-expand" aria-label={`Expand ${title} images`} onClick={() => setIsExpanded(true)}><Maximize2 size={16} /></button>
      </div>
      <Dots count={slides.length} index={index} onPick={setIndex} />
      {isExpanded && <SlideModal title={title} slides={slides} index={index} onIndex={setIndex} onClose={() => setIsExpanded(false)} />}
    </div>
  );
}

const HelpGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5" fill="#0053ca" /><path d="M6.1 6.2a2 2 0 1 1 2.6 1.9c-.5.2-.7.5-.7 1v.4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" /><circle cx="8" cy="11.6" r="0.9" fill="#fff" /></svg>
);

/**
 * One campaign-type card (title bar, optional tabs, carousel, copy, Create campaign).
 * @param {{ title: string, tabs?: { key: string, label: string }[], tab?: string, onTab?: (k: string) => void,
 *           slides: object[], subTitle?: string, headline?: string, desc: string, link: string, onCreate: () => void }} props
 */
export default function CampaignTypeCard({ title, tabs, tab, onTab, slides, subTitle, headline, desc, link, onCreate }) {
  return (
    <section className="cct-type-card">
      <header className="cct-type-head">
        <h2>{title}</h2>
        {tabs && (
          <div className="cct-type-tabs" role="tablist">
            {tabs.map(t => (
              <button type="button" role="tab" key={t.key} aria-selected={tab === t.key}
                className={`cct-type-tab ${tab === t.key ? 'is-active' : ''}`} onClick={() => onTab(t.key)}>{t.label}</button>
            ))}
          </div>
        )}
      </header>
      <div className="cct-type-body">
        <Carousel key={tab} title={title} slides={slides} />
        <div className="cct-type-copy">
          {subTitle && <h3 className="cct-type-sub">{subTitle}</h3>}
          {headline && <h3 className="cct-type-headline">{headline}</h3>}
          <p>{desc}</p>
          <a href="#learn" className="cct-type-link" onClick={e => e.preventDefault()}><HelpGlyph /> {link}</a>
          <button type="button" className="cct-type-create" onClick={onCreate}>Create campaign</button>
        </div>
      </div>
    </section>
  );
}
