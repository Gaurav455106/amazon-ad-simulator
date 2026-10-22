import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { BRAND_NAME } from '../../../data/demoProducts';
import SdCreativeCard from '../../builder/sd/SdCreativeCard';
import { HEADLINE_MAX } from '../../builder/sd/sdConfig';

const REVIEW_NOTE = 'The review process usually takes 1 to 3 business days. If your campaign is delivering, the previously approved version of your ad will run until this version is approved.';

/** Stored `sdCreative` → the builder's editable creative shape. */
const toDraft = (c = {}) => ({ logo: c.logo !== false, headlineOn: Boolean(c.headline), headline: c.headline || '', imageOn: Boolean(c.customImage), video: c.video || '' });

/**
 * Display ad group "Creative" tab: the Key ad sizes preview, and "Edit creative" for the
 * Logo / Headline / Image options, ending in "Submit for review" as on the console.
 */
export default function CreativeTab({ campaign, adGroup }) {
  const catalogue = useStore(s => s.products);
  const updateCampaign = useStore(s => s.updateCampaign);
  const creative = campaign.sdCreative || {};
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => toDraft(creative));
  const [error, setError] = useState('');
  const asins = adGroup.products?.length ? adGroup.products : (creative.products || []);
  const products = asins.map(a => catalogue.find(p => p.asin === a)).filter(Boolean);
  const adFormat = creative.adFormat || 'image';

  const cancel = () => { setDraft(toDraft(creative)); setError(''); setIsEditing(false); };
  const submit = () => {
    if (draft.headlineOn && !draft.headline.trim()) return setError('Add a headline or turn the headline off.');
    if (draft.headline.length > HEADLINE_MAX) return setError(`Keep the headline to ${HEADLINE_MAX} characters.`);
    if (adFormat === 'video' && !draft.video) return setError('Add a video.');
    updateCampaign(campaign.id, {
      sdCreative: { ...creative, logo: draft.logo, headline: draft.headlineOn ? draft.headline.trim() : '', customImage: adFormat === 'image' && draft.imageOn, video: draft.video },
      sdCreativeInReview: true,
    });
    setError('');
    return setIsEditing(false);
  };

  return (
    <div className="sd-root sd-creative-tab">
      {campaign.sdCreativeInReview && !isEditing && <p className="report-note" role="status">Your updated creative is in review. The approved version keeps running until then.</p>}
      <SdCreativeCard brand={BRAND_NAME} products={products} creative={draft} onCreative={setDraft} adFormat={adFormat}
        isBare isReadOnly={!isEditing} onEdit={() => setIsEditing(true)} />
      {isEditing && (
        <div className="sd-creative-foot">
          {error ? <p className="sbe-error" role="alert">{error}</p> : <p className="cx-sub"><span aria-hidden="true">ⓘ</span> {REVIEW_NOTE}</p>}
          <button type="button" className="tf-link" onClick={cancel}>Cancel</button>
          <button type="button" className="tf-apply" onClick={submit}>Submit for review</button>
        </div>
      )}
    </div>
  );
}
