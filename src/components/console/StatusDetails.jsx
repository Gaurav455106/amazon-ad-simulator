import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const TONE = { Delivering: 'is-ok', Paused: '', 'Out of stock': 'is-bad', Suspended: 'is-bad', 'In review': '' };

/**
 * A status with the console's "Details ▾" toggle that explains why (e.g. "You paused this campaign.").
 * @param {{ status: string, reason: string }} props
 */
export default function StatusDetails({ status, reason }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <span className="std">
      <span className={`std-status ${TONE[status] || ''}`}>{status}</span>
      <span className="cx-pop-anchor">
        <button type="button" className="std-toggle" aria-expanded={isOpen} onClick={() => setIsOpen(o => !o)}>Details <ChevronDown size={12} /></button>
        {isOpen && (
          <>
            <div className="drp-scrim" onClick={() => setIsOpen(false)} />
            <span className="std-pop" role="status">{reason}<button type="button" aria-label="Close" onClick={() => setIsOpen(false)}><X size={14} /></button></span>
          </>
        )}
      </span>
    </span>
  );
}
