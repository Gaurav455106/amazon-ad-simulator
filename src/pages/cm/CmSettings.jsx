import { useState } from 'react';
import Info from '../../components/console/InfoGlyph';
import { useStore } from '../../store/useStore';

const DEFAULTS = { budgetCap: 'campaign', budgetCapAmount: '', dailyIncrease: '25' };

/** Account-level Sponsored Products budget settings (Campaign manager → Settings). */
export default function CmSettings() {
  const saved = useStore(s => s.accountSettings) || DEFAULTS;
  const setAccountSettings = useStore(s => s.setAccountSettings);
  const [draft, setDraft] = useState(saved);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const capAmount = parseFloat(draft.budgetCapAmount);
  const error = draft.budgetCap === 'cap' && (Number.isNaN(capAmount) || capAmount <= 0) ? 'Enter a daily budget cap greater than ₹0.' : null;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  return (
    <div className="cx-page">
      <div className="cx-settings cx-card">
        <div className="cx-settings-row">
          <div>Sponsored Products budget cap <Info size={13} /></div>
          <div>
            <label className="radio-row"><input type="radio" checked={draft.budgetCap === 'campaign'} onChange={() => set('budgetCap', 'campaign')} /><span>Use campaign level budgets</span></label>
            <label className="radio-row">
              <input type="radio" checked={draft.budgetCap === 'cap'} onChange={() => set('budgetCap', 'cap')} />
              <span>Use daily budget cap</span>
              <span className="cx-input-prefix">₹<input value={draft.budgetCapAmount} disabled={draft.budgetCap !== 'cap'} onChange={e => set('budgetCapAmount', e.target.value)} /></span>
            </label>
          </div>
        </div>
        <div className="cx-settings-row">
          <div>Average daily budget increase</div>
          <div>
            <label className="radio-row"><input type="radio" checked={draft.dailyIncrease === '25'} onChange={() => set('dailyIncrease', '25')} /><span>Spend up to 25% more than the average daily budget using unspent budget amounts <Info size={13} /></span></label>
            <label className="radio-row"><input type="radio" checked={draft.dailyIncrease === '100'} onChange={() => set('dailyIncrease', '100')} /><span>Spend up to 100% more than the average daily budget using unspent budget amounts <Info size={13} /></span></label>
          </div>
        </div>
        <div className="settings-savebar">
          {error && <span className="form-error">{error}</span>}
          <button type="button" className="cx-btn" disabled={!isDirty} onClick={() => setDraft(saved)}>Cancel</button>
          <button type="button" className="cx-btn cx-btn-primary" disabled={!isDirty || !!error} onClick={() => setAccountSettings(draft)}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
