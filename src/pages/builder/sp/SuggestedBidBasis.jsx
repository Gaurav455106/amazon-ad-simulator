import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// The console only offers event bids in the 45 days before a special event (Prime Day,
// Great Indian Festival…). With none coming up the selector is disabled and explains why.
const NO_EVENT_MESSAGE = 'No upcoming special events. Bids for special events will be available for 45 days before the event.';

/** "Suggested bid for regular days" selector above suggested bids. */
export default function SuggestedBidBasis() {
  const [isTipOpen, setIsTipOpen] = useState(false);
  return (
    <span className="sbb-wrap" onMouseEnter={() => setIsTipOpen(true)} onMouseLeave={() => setIsTipOpen(false)}>
      <button type="button" className="sbb-select" disabled aria-describedby="sbb-tip">
        Suggested bid for regular days <ChevronDown size={14} />
      </button>
      {isTipOpen && (
        <span id="sbb-tip" role="tooltip" className="sbb-tip">
          {NO_EVENT_MESSAGE}
          <button type="button" className="sbb-tip-close" aria-label="Close" onClick={() => setIsTipOpen(false)}>×</button>
        </span>
      )}
    </span>
  );
}
