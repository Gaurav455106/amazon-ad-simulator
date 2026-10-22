import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Play } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import ProductImage from '../../../components/console/ProductImage';
import { PillSelect, SdCard, Toggle } from './SdBits';
import { HEADLINE_MAX, PREVIEWS_PER_PAGE, SD_PREVIEW_SIZES } from './sdConfig';

function Logo({ brand, size }) {
  return <span className="sd-logo" style={{ width: size, height: size, fontSize: size * 0.32 }}>{brand.slice(0, 2).toUpperCase()}</span>;
}

/** Example ad tile for one placement size. */
function AdTile({ size, brand, products, creative }) {
  const p = products[0];
  const isWide = size.layout === 'wide';
  const title = creative.headlineOn && creative.headline ? creative.headline : p?.name || brand;
  return (
    <div className={`sd-ad ${isWide ? 'is-wide' : ''}`} style={{ width: size.w, height: size.h }}>
      {creative.adFormat === 'video'
        ? <div className="sd-ad-video"><Play size={18} fill="#fff" color="#fff" /></div>
        : (
          <div className="sd-ad-visual">
            {creative.logo && <Logo brand={brand} size={isWide ? Math.min(size.h - 10, 34) : 36} />}
            {creative.imageOn ? <span className="sd-ad-lifestyle" /> : products.slice(0, 2).map(x => <ProductImage key={x.asin} product={x} size={isWide ? Math.min(size.h - 10, 34) : 40} />)}
          </div>
        )}
      <div className="sd-ad-copy">
        <span className="sd-ad-title">{title}</span>
        {size.hasButton && <span className="sd-ad-shop">Shop now</span>}
      </div>
    </div>
  );
}

function OptionLine({ label, isOn, onToggle, status, onOpen, isRequired }) {
  return (
    <div className="sd-cr-row">
      {isRequired ? <span className="sd-cr-required" /> : <Toggle isOn={isOn} onChange={onToggle} label={label} />}
      <strong>{label}</strong>
      <span className="sd-cr-status">{status}</span>
      <button type="button" className="sd-cr-open" aria-label={`Edit ${label.toLowerCase()}`} onClick={onOpen}><ChevronRight size={16} /></button>
    </div>
  );
}

/**
 * "Creative" card (appears once a product is added): customise options + Key ad sizes preview.
 * On an ad group's Creative tab it starts as preview only (`isReadOnly`) with an "Edit creative" button.
 */
export default function SdCreativeCard({ brand, products, creative, onCreative, adFormat, isReadOnly = false, onEdit, isBare = false }) {
  const [panel, setPanel] = useState(null);
  const [page, setPage] = useState(0);
  const set = (patch) => onCreative({ ...creative, ...patch });
  const isVideo = adFormat === 'video';
  const pageCount = Math.ceil(SD_PREVIEW_SIZES.length / PREVIEWS_PER_PAGE);
  const shown = SD_PREVIEW_SIZES.slice(page * PREVIEWS_PER_PAGE, (page + 1) * PREVIEWS_PER_PAGE);
  const done = <CheckCircle2 size={16} className="sd-ok" aria-label="Complete" />;
  const statusFor = (isOn, isComplete, openKey) => (!isOn ? null : isComplete ? done
    : <button type="button" className="sd-link" onClick={() => setPanel(openKey)}>Add</button>);

  return (
    <Wrapper isBare={isBare}>
      <div className={`sd-creative ${isReadOnly ? 'is-read-only' : ''}`}>
        {!isReadOnly && <div className="sd-cr-left">
          {!panel && (
            <>
              <p className="sd-cr-intro">Choose how you would like to customise your ad. <Info size={12} /></p>
              {isVideo && <OptionLine label="Video" isRequired status={creative.video ? done : <button type="button" className="sd-link" onClick={() => setPanel('video')}>Add</button>} onOpen={() => setPanel('video')} />}
              <OptionLine label="Logo" isOn={creative.logo} onToggle={(v) => set({ logo: v })} status={creative.logo ? done : null} onOpen={() => setPanel('logo')} />
              <OptionLine label="Headline" isOn={creative.headlineOn} onToggle={(v) => set({ headlineOn: v })}
                status={statusFor(creative.headlineOn, !!creative.headline.trim(), 'headline')} onOpen={() => setPanel('headline')} />
              {!isVideo && (
                <>
                  <OptionLine label="Image" isOn={creative.imageOn} onToggle={(v) => set({ imageOn: v })}
                    status={statusFor(creative.imageOn, creative.imageOn, 'image')} onOpen={() => setPanel('image')} />
                  <p className="sd-cr-note"><Info size={13} /> AI-generated images are available.</p>
                </>
              )}
            </>
          )}
          {panel && (
            <div className="sd-cr-panel">
              <button type="button" className="sd-back" onClick={() => setPanel(null)}><ChevronLeft size={14} /> Back</button>
              {panel === 'headline' && (
                <>
                  <div className="sd-cr-panel-head"><strong>Headline <Info size={12} /></strong><a href="#guidelines" className="sd-help" onClick={e => e.preventDefault()}><CircleHelp size={13} /> See messaging guidelines</a></div>
                  <div className="sd-cr-box">
                    <input className="sd-input" maxLength={HEADLINE_MAX} placeholder="Your headline here" value={creative.headline}
                      onChange={e => set({ headline: e.target.value, headlineOn: true })} />
                    <small>{HEADLINE_MAX - creative.headline.length} characters remaining.</small>
                  </div>
                </>
              )}
              {panel === 'logo' && (
                <>
                  <div className="sd-cr-panel-head"><strong>Logo <Info size={12} /></strong></div>
                  <div className="sd-cr-box sd-cr-logo"><Logo brand={brand} size={64} /><span>Your brand logo from your Brand Registry. It appears on every ad size.</span></div>
                </>
              )}
              {panel === 'image' && (
                <>
                  <div className="sd-cr-panel-head"><strong>Image <Info size={12} /></strong></div>
                  <div className="sd-cr-box">
                    <p className="sd-muted">Add a lifestyle image to show alongside your product. Use 1200 × 628 px or larger, without text or logos.</p>
                    <div className="sd-actions sd-actions-left">
                      <label className="sd-btn">Upload image<input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && set({ imageOn: true })} /></label>
                      <button type="button" className="sd-btn" onClick={() => set({ imageOn: true })}>Generate images</button>
                    </div>
                  </div>
                </>
              )}
              {panel === 'video' && (
                <>
                  <div className="sd-cr-panel-head"><strong>Video <Info size={12} /></strong></div>
                  <div className="sd-cr-box">
                    <p className="sd-muted">Upload a 6–45 second video, 16:9, at least 1920 × 1080, up to 500 MB (H.264, MPEG-2 or MPEG-4).</p>
                    <label className="sd-btn">Upload video<input type="file" accept="video/*" hidden onChange={e => e.target.files?.[0] && set({ video: e.target.files[0].name })} /></label>
                    {creative.video && <p className="sd-ok-text">{creative.video}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>}
        <div className="sd-cr-right">
          <div className="sd-preview-bar">
            {isReadOnly ? <button type="button" className="sd-btn" onClick={onEdit}>Edit creative</button> : <strong>Preview:</strong>}
            <PillSelect value="key" onChange={() => {}} width={250} ariaLabel="Preview sizes" options={[{ value: 'key', label: 'Key ad sizes' }]} />
            <span className="sd-push">{page * PREVIEWS_PER_PAGE + 1} of {SD_PREVIEW_SIZES.length}</span>
            <span className="sd-arrows">
              <button type="button" aria-label="Previous preview" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
              <button type="button" aria-label="Next preview" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
            </span>
          </div>
          <p className="sd-preview-note">These previews are examples only and may not show all possible versions of your ad.</p>
          <div className="sd-preview-grid">
            {shown.map(size => (
              <figure key={size.key}>
                <AdTile size={size} brand={brand} products={products} creative={{ ...creative, adFormat }} />
                <figcaption>{size.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

function Wrapper({ isBare, children }) {
  if (isBare) return <div className="sd-card sd-card-flush">{children}</div>;
  return <SdCard title="Creative" help="How to customize your creative" className="sd-card-flush">{children}</SdCard>;
}
