import { useState } from 'react';
import { useStore } from '../../../store/useStore';

const MIN_BID = 1;

export default function AdGroupSettingsTab({ campaign, adGroup }) {
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const initial = { name: adGroup.name, defaultBid: Number(adGroup.defaultBid || 0).toFixed(2) };
  const [draft, setDraft] = useState(initial);
  const [isSaved, setIsSaved] = useState(false);

  const isDirty = draft.name !== initial.name || draft.defaultBid !== initial.defaultBid;
  const bid = parseFloat(draft.defaultBid);
  const error = !draft.name.trim() ? 'Ad group name cannot be empty.'
    : Number.isNaN(bid) || bid < MIN_BID ? `Default bid must be at least ₹${MIN_BID.toFixed(2)}.` : null;
  const set = (k, v) => { setDraft(d => ({ ...d, [k]: v })); setIsSaved(false); };
  const isOn = adGroup.status === 'Enabled';
  const showBid = campaign.type !== 'Sponsored Brands';

  return (
    <div className="cx-settings">
      <div className="cx-settings-row"><div>Ad group name</div><div><input className="cx-input" value={draft.name} onChange={e => set('name', e.target.value)} /></div></div>
      <div className="cx-settings-row">
        <div>Active/Paused</div>
        <div>
          <div className="settings-inline">
            <button type="button" className={`cx-switch ${isOn ? 'is-on' : ''}`} aria-label={adGroup.status} disabled={adGroup.status === 'Archived'}
              onClick={() => updateAdGroup(adGroup.id, { status: isOn ? 'Paused' : 'Enabled' })} />
            {isOn ? 'Active' : adGroup.status}
          </div>
          {adGroup.status !== 'Archived' && <button type="button" className="cx-link" onClick={() => updateAdGroup(adGroup.id, { status: 'Archived' })}>Archive this ad group</button>}
        </div>
      </div>
      <div className="cx-settings-row"><div>Status</div><div>{campaign.status !== 'Enabled' ? 'Paused' : isOn ? 'Delivering' : adGroup.status}</div></div>
      {showBid && (
        <div className="cx-settings-row">
          <div>Default bid</div>
          <div><span className="cx-input-prefix">₹<input value={draft.defaultBid} onChange={e => set('defaultBid', e.target.value)} /></span></div>
        </div>
      )}
      <div className="settings-savebar">
        {error && isDirty && <span className="form-error">{error}</span>}
        {isSaved && !isDirty && <span className="settings-saved">Changes saved</span>}
        <button type="button" className="cx-btn" disabled={!isDirty} onClick={() => setDraft(initial)}>Cancel</button>
        <button type="button" className="cx-btn cx-btn-primary" disabled={!isDirty || !!error}
          onClick={() => { updateAdGroup(adGroup.id, { name: draft.name.trim(), defaultBid: bid }); setIsSaved(true); }}>
          Save changes
        </button>
      </div>
    </div>
  );
}
