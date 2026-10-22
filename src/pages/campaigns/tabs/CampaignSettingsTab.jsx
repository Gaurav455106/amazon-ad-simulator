import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleHelp } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { campaignPath } from '../../../routes';
import { consoleId } from '../../../utils/consoleId';
import { PLACEMENTS } from '../../../utils/placements';

const SP_STRATEGIES = [
  { key: 'Dynamic bids - up and down', hint: 'We will raise your bids (by a maximum of 100% for all placements) in real time when your ad may be more likely to convert to a sale, and lower your bids when less likely to convert to a sale.' },
  { key: 'Dynamic bids - down only', hint: 'We will lower your bids in real time when your ad may be less likely to convert to a sale.' },
  { key: 'Fixed bid', hint: 'We will use your exact bid and any manual adjustments you set, and will not change your bids based on likelihood of a sale.' },
];
const MIN_BUDGET = 50;
const MAX_ADJUSTMENT = 900;
const EXAMPLE_BID = 1;

function validate(draft, campaign) {
  if (!draft.name.trim()) return 'Campaign name cannot be empty.';
  const budget = parseFloat(draft.budget);
  if (Number.isNaN(budget) || budget < MIN_BUDGET) return `Budget must be at least ₹${MIN_BUDGET}.00.`;
  if (draft.endDate && draft.endDate < (campaign.startDate || '')) return 'End date must be after the start date.';
  const badAdj = PLACEMENTS.find(p => { const v = parseFloat(draft.adjustments[p.key]); return Number.isNaN(v) || v < 0 || v > MAX_ADJUSTMENT; });
  if (badAdj) return `${badAdj.label}: enter a value between 0% and ${MAX_ADJUSTMENT}%.`;
  return null;
}

const initialDraft = (c) => ({
  name: c.name,
  portfolioId: c.portfolioId || '',
  endDate: c.endDate || '',
  budget: String(c.budget),
  biddingStrategy: c.biddingStrategy || 'Dynamic bids - down only',
  adjustments: Object.fromEntries(PLACEMENTS.map(p => [p.key, String(c.placementAdjustments?.[p.key] ?? 0)])),
  offAmazon: c.offAmazon ?? true,
});

export default function CampaignSettingsTab({ campaign }) {
  const updateCampaign = useStore(s => s.updateCampaign);
  const toggleCampaignStatus = useStore(s => s.toggleCampaignStatus);
  const portfolios = useStore(s => s.portfolios);
  const [draft, setDraft] = useState(() => initialDraft(campaign));
  const [savedAt, setSavedAt] = useState(null);

  const isSP = campaign.type === 'Sponsored Products';
  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setSavedAt(null); };
  const setAdj = (k, v) => set('adjustments', { ...draft.adjustments, [k]: v });
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialDraft(campaign));
  const error = validate(draft, campaign);

  const save = () => {
    if (error) return;
    updateCampaign(campaign.id, {
      name: draft.name.trim(),
      portfolioId: draft.portfolioId,
      endDate: draft.endDate,
      budget: parseFloat(draft.budget),
      ...(isSP && {
        biddingStrategy: draft.biddingStrategy,
        placementAdjustments: { ...(campaign.placementAdjustments || {}), ...Object.fromEntries(PLACEMENTS.map(p => [p.key, parseFloat(draft.adjustments[p.key])])) },
        offAmazon: draft.offAmazon,
      }),
    });
    setSavedAt(new Date());
  };

  const exampleBid = (key) => (EXAMPLE_BID * (1 + (parseFloat(draft.adjustments[key]) || 0) / 100)).toFixed(2);

  return (
    <div className="cx-settings">
      <div className="cx-settings-row"><div>Campaign name</div><div><input className="cx-input" value={draft.name} onChange={e => set('name', e.target.value)} /></div></div>
      <div className="cx-settings-row"><div>Campaign ID</div><div>{consoleId(campaign.id)}</div></div>
      <div className="cx-settings-row">
        <div>Portfolio</div>
        <div>
          <select className="cx-input cx-select-chip" value={draft.portfolioId} onChange={e => set('portfolioId', e.target.value)}>
            <option value="">No portfolio</option>
            {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="cx-settings-row"><div>Type</div><div>{campaign.type}</div></div>
      <div className="cx-settings-row">
        <div>Active/Paused</div>
        <div>
          <div className="settings-inline">
            <button type="button" className={`cx-switch ${campaign.status === 'Enabled' ? 'is-on' : ''}`} disabled={campaign.status === 'Archived'}
              aria-label={campaign.status} onClick={() => toggleCampaignStatus(campaign.id)} />
            {campaign.status === 'Enabled' ? 'Active' : campaign.status}
          </div>
          {campaign.status !== 'Archived' && (
            <button type="button" className="cx-link" onClick={() => updateCampaign(campaign.id, { status: 'Archived' })}>Archive this campaign</button>
          )}
        </div>
      </div>
      <div className="cx-settings-row"><div>Status</div><div>{campaign.status === 'Enabled' ? 'Delivering' : campaign.status}</div></div>
      <div className="cx-settings-row"><div>Sites</div><div>Amazon</div></div>
      <div className="cx-settings-row">
        <div>Schedule</div>
        <div className="settings-inline">
          <input type="date" className="cx-input cx-input-date" value={campaign.startDate || ''} disabled title="Start date can't be changed after launch" />
          <input type="date" className="cx-input cx-input-date" value={draft.endDate} min={campaign.startDate} onChange={e => set('endDate', e.target.value)} />
          {draft.endDate && <button type="button" className="cx-link" onClick={() => set('endDate', '')}>No end date</button>}
        </div>
      </div>
      <div className="cx-settings-row">
        <div>Budget</div>
        <div>
          <span className="cx-input-prefix">₹<input value={draft.budget} onChange={e => set('budget', e.target.value)} /></span>
          <div className="cx-sub">{campaign.budgetType || 'Daily'}</div>
          <Link className="cx-link" to={campaignPath(campaign, 'budget-rules')}>Add budget rule</Link>
        </div>
      </div>
      <div className="cx-settings-row"><div>Campaign targeting</div><div>{campaign.targetingType === 'Auto' ? 'Automatic targeting' : `${campaign.targetingType || 'Manual'} targeting`}</div></div>

      {isSP && (
        <>
          <div className="cx-settings-row">
            <div>Campaign bidding strategy</div>
            <div>
              <a className="cx-link" href="#strategies" onClick={e => e.preventDefault()}><CircleHelp size={13} /> Learn about bidding strategies</a>
              {SP_STRATEGIES.map(s => (
                <label key={s.key} className="radio-row">
                  <input type="radio" checked={draft.biddingStrategy === s.key} onChange={() => set('biddingStrategy', s.key)} />
                  <span><strong>{s.key}</strong><small>{s.hint}</small></span>
                </label>
              ))}
              <h4 className="settings-subhead">Adjust bids by placement</h4>
              <p className="cx-sub">Increase your bid for specific Amazon placements.</p>
              {PLACEMENTS.map(p => (
                <div key={p.key} className="placement-row">
                  <span>{p.label}</span>
                  <span className="cx-input-prefix"><input value={draft.adjustments[p.key]} onChange={e => setAdj(p.key, e.target.value)} />%</span>
                </div>
              ))}
              <p className="cx-sub">
                A ₹{EXAMPLE_BID.toFixed(2)} bid will start at ₹{exampleBid('top')} for top of search, ₹{exampleBid('rest')} for rest of search, and ₹{exampleBid('product')} for product pages.
                {draft.biddingStrategy === 'Dynamic bids - up and down' && ' Dynamic bidding may increase your bids by up to 100% for all placements.'}
              </p>
            </div>
          </div>
          <div className="cx-settings-row">
            <div>Adjust reach on and off Amazon</div>
            <div>
              <label className="radio-row"><input type="radio" checked={draft.offAmazon} onChange={() => set('offAmazon', true)} />
                <span><strong>Increase reach off-Amazon</strong><small>Allow ad placements both on and off Amazon.</small></span></label>
              <label className="radio-row"><input type="radio" checked={!draft.offAmazon} onChange={() => set('offAmazon', false)} />
                <span><strong>Limit reach to Amazon</strong><small>Restrict ad placements to Amazon owned-and-operated properties only.</small></span></label>
            </div>
          </div>
        </>
      )}
      {!isSP && <div className="cx-settings-row"><div>Cost type</div><div>{campaign.costType || 'CPC'}</div></div>}

      <div className="settings-savebar">
        {error && isDirty && <span className="form-error">{error}</span>}
        {savedAt && !isDirty && <span className="settings-saved">Changes saved</span>}
        <button type="button" className="cx-btn" disabled={!isDirty} onClick={() => setDraft(initialDraft(campaign))}>Cancel</button>
        <button type="button" className="cx-btn cx-btn-primary" disabled={!isDirty || !!error} onClick={save}>Save changes</button>
      </div>
    </div>
  );
}
