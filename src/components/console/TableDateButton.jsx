import { useState } from 'react';
import { Calendar } from 'lucide-react';
import DateRangePopover from './DateRangePopover';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { formatDayLabel } from '../../utils/dateRanges';

/** Compact date trigger used in table toolbars ("📅 20 Oct, 2026"). */
export default function TableDateButton({ align = 'right' }) {
  const range = useConsoleRange();
  const [isOpen, setIsOpen] = useState(false);
  const isSingleDay = range.from.toDateString() === range.to.toDateString();
  const label = isSingleDay ? formatDayLabel(range.to) : range.label;

  return (
    <div className="cx-pop-anchor">
      <button type="button" className="cx-tool-btn" onClick={() => setIsOpen(true)}>
        <Calendar size={16} /> {label}
      </button>
      {isOpen && <DateRangePopover align={align} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
