import { useStore } from '../store/useStore';

const options = [
  { value: '1', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'ytd', label: 'Year to date' },
];

export default function DateRangePicker() {
  const dateRange = useStore(s => s.dateRange);
  const setDateRange = useStore(s => s.setDateRange);
  return (
    <select className="date-picker" value={dateRange} onChange={e => setDateRange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
