import { useState } from 'react';
import { X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { MoneyInput, SdCard } from './SdBits';
import SdTargetBrowser from './SdTargetBrowser';

/**
 * Targeting card. Reach and Page visits show the browser inline (with the 5 pre-added targets);
 * Conversions shows "Optimised targeting" plus "Manual targeting", which opens the browser in a drawer.
 */
export default function SdTargetingCard({ goal, targets, onTargets, isOptimised, onOptimised, optimisedBid, onOptimisedBid, hasProducts, isCostControl, bidUnit }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const browser = (
    <SdTargetBrowser targets={targets} onTargets={onTargets} hasProducts={hasProducts} isCostControl={isCostControl} bidUnit={bidUnit} />
  );

  if (goal !== 'conversion') {
    return <SdCard title="Targeting" info className="sd-card-flush">{browser}</SdCard>;
  }

  return (
    <SdCard title="Targeting" info>
      <div className="sd-opt-target">
        <div className="sd-opt-row">
          <span className="sd-opt-label">Optimised targeting <Info size={12} /></span>
          <div>
            <label className="sd-check">
              <input type="checkbox" checked={isOptimised} onChange={e => onOptimised(e.target.checked)} />
              Reach audiences who are likely to be interested in your ad
            </label>
            {isOptimised && (
              <div className="sd-indent">
                <span className="sd-field-label">Bid <Info size={12} /></span>
                <MoneyInput value={isCostControl ? '' : optimisedBid} placeholder="-" isDisabled={isCostControl} width={176}
                  ariaLabel="Optimised targeting bid" onChange={onOptimisedBid} />
              </div>
            )}
          </div>
        </div>
        <div className="sd-opt-row sd-opt-row-split">
          <span className="sd-opt-label">Manual targeting <Info size={12} /></span>
          <span className="sd-opt-desc">{targets.length ? `${targets.length} target${targets.length === 1 ? '' : 's'} added` : 'Manually add targeting options'}</span>
          <button type="button" className="sd-pill-btn" onClick={() => setIsDrawerOpen(true)}>{targets.length ? 'Edit' : 'Add'}</button>
        </div>
      </div>
      {isDrawerOpen && (
        <div className="sd-drawer-scrim" onClick={() => setIsDrawerOpen(false)}>
          <aside className="sd-drawer" role="dialog" aria-label="Targeting" onClick={e => e.stopPropagation()}>
            <header className="sd-drawer-head">
              <button type="button" className="sd-x" aria-label="Close" onClick={() => setIsDrawerOpen(false)}><X size={20} /></button>
              <h2>Targeting</h2>
              <button type="button" className="sd-btn-blue" onClick={() => setIsDrawerOpen(false)}>Done</button>
            </header>
            <div className="sd-drawer-body">{browser}</div>
          </aside>
        </div>
      )}
    </SdCard>
  );
}
