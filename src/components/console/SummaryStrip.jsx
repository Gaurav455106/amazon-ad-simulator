import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Info from './InfoGlyph';
import DateRangePopover from './DateRangePopover';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { METRICS, formatMetric } from './metrics';

const STRIP_METRICS = ['impressions', 'clicks', 'brandedSearches', 'dpv', 'ntbOrders', 'sales'];

/** Top-of-page summary: date range + headline metrics, each with "View details". */
export default function SummaryStrip({ totals, onViewDetails }) {
  const range = useConsoleRange();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <section className="sstrip cx-card">
      <div className="sstrip-cell sstrip-date">
        <span className="sstrip-label">Date range <Info size={14} /></span>
        <button type="button" className="sstrip-date-btn" onClick={() => setIsPickerOpen(true)}>
          {range.label} <ChevronDown size={16} />
        </button>
        {isPickerOpen && <DateRangePopover onClose={() => setIsPickerOpen(false)} />}
      </div>
      {STRIP_METRICS.map(k => (
        <div key={k} className="sstrip-cell">
          <span className="sstrip-label">{METRICS[k].label} <Info size={14} /></span>
          <strong className="sstrip-value">{formatMetric(k, totals[k])}</strong>
          <button type="button" className="cx-link sstrip-details" onClick={() => onViewDetails?.(k)}>View details</button>
        </div>
      ))}
    </section>
  );
}
