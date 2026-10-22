import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { adGroupPath, ROUTES } from '../../../routes';
import { localISODate } from '../../../utils/dateRanges';
import SbCreativeEditor from './SbCreativeEditor';
import SbLandingPage from './SbLandingPage';
import { defaultAdName, sbAdsFor, toStoredAd, validateSbAd } from '../sbAds';

/** "× New Ad" (/cb/sb/adGroups/:adGroupId/ads?campaignId=…): add another ad to a Sponsored Brands ad group. */
export default function SbNewAdPage() {
  const navigate = useNavigate();
  const { adGroupId } = useParams();
  const [params] = useSearchParams();
  const campaign = useStore(s => s.campaigns.find(c => c.id === params.get('campaignId')));
  const adGroup = useStore(s => s.adGroups.find(ag => ag.id === adGroupId));
  const sbAds = useStore(s => s.sbAds || []);
  const catalogue = useStore(s => s.products);
  const addSbAd = useStore(s => s.addSbAd);
  const [errors, setErrors] = useState([]);
  const [draft, setDraft] = useState(() => {
    const base = campaign && adGroup ? sbAdsFor(campaign, adGroup, sbAds)[0] : null;
    return {
      id: 'new', campaignId: campaign?.id, adGroupId, name: defaultAdName(), status: 'Enabled',
      brandName: base?.brandName || '', headline: '', products: (adGroup?.products || []).slice(0, 3), images: 0,
      optimiseHeadline: false, landingPage: 'store', storePage: 'Home', pendingReview: true, createdAt: localISODate(),
    };
  });

  if (!campaign || !adGroup) return <Navigate to={ROUTES.allCampaigns} replace />;
  const back = () => navigate(adGroupPath(campaign, adGroup.id, 'ads'));
  const submit = () => {
    const problems = validateSbAd(draft);
    setErrors(problems);
    if (problems.length) return;
    // A brand-new SB campaign keeps its first ad on the campaign; store it so both ads show.
    const existing = sbAdsFor(campaign, adGroup, sbAds).filter(a => a.isVirtual).map(toStoredAd);
    [...existing, toStoredAd(draft)].forEach(addSbAd);
    back();
  };

  return (
    <div className="ccs-root">
      <div className="ccs-topbar">
        <div className="ccs-topbar-left">
          <button type="button" className="ccs-topbar-close" aria-label="Close" onClick={back}><X size={16} /></button>
          <span className="ccs-topbar-title">New Ad</span>
        </div>
        <div className="ccs-topbar-right">
          <button type="button" className="link-btn ccs-back-link" onClick={() => navigate(ROUTES.allCampaigns)}>Go back to campaigns</button>
          <button type="button" className="btn btn-dark" onClick={submit}>Submit for review</button>
        </div>
      </div>
      <div className="sbn">
        {errors.length > 0 && (
          <div className="sb-alert" role="alert"><strong>Fix the following to submit your ad for review:</strong><ul>{errors.map(e => <li key={e}>{e}</li>)}</ul></div>
        )}
        <h1 className="sbn-title">Ad group and ad</h1>
        <SbLandingPage draft={draft} onChange={setDraft} adFormat={campaign.adFormat} title="Ad group" />
        <h1 className="sbn-title">Create an ad</h1>
        <section className="sbm-card">
          <h3 className="sbm-card-title">Ad settings</h3>
          <div className="sbm-card-body">
            <label className="sbn-field"><span>Ad name <Info size={13} /></span>
              <input className="tf-input sbn-name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
            </label>
          </div>
        </section>
        <section className="sbm-card"><SbCreativeEditor draft={draft} onChange={setDraft} catalogue={catalogue} /></section>
      </div>
    </div>
  );
}
