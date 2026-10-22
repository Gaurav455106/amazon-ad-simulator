import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { rangeForPreset, formatRangeLabel, DEFAULT_PRESET, parseLocalDate } from '../utils/dateRanges';

const toDate = (s) => (s.length === 10 ? parseLocalDate(s) : new Date(s));

/** Resolves the shared console date range into concrete dates and a label (memoised). */
export function useConsoleRange() {
  const consoleRange = useStore(s => s.consoleRange);
  const { preset = DEFAULT_PRESET, from, to } = consoleRange || {};
  // Day granularity: the range only needs recomputing when the calendar day changes.
  const day = new Date().toDateString();
  return useMemo(() => {
    const range = preset === 'custom' && from && to ? { from: toDate(from), to: toDate(to) } : rangeForPreset(preset);
    return { ...range, preset, label: formatRangeLabel(range) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, from, to, day]);
}
