import { useState } from 'react';
import { useStore } from '../store/useStore';
import DateRangePicker from '../components/DateRangePicker';
import { Search, Filter } from 'lucide-react';

const HISTORY = [
  { id: 1, date: '2024-01-15 14:32', entity: 'Keyword', name: 'wireless headphones', field: 'Bid', oldVal: '₹0.75', newVal: '₹0.85', user: 'You', campaign: 'Summer Sale' },
  { id: 2, date: '2024-01-15 11:20', entity: 'Campaign', name: 'Summer Sale - Sponsored Products', field: 'Status', oldVal: 'Paused', newVal: 'Enabled', user: 'You', campaign: 'Summer Sale' },
  { id: 3, date: '2024-01-14 16:45', entity: 'Campaign', name: 'Summer Sale - Sponsored Products', field: 'Daily budget', oldVal: '₹40.00', newVal: '₹50.00', user: 'You', campaign: 'Summer Sale' },
  { id: 4, date: '2024-01-14 09:10', entity: 'Keyword', name: 'bluetooth headphones', field: 'Status', oldVal: 'Enabled', newVal: 'Paused', user: 'Automation Rule', campaign: 'Summer Sale' },
  { id: 5, date: '2024-01-13 15:30', entity: 'Ad Group', name: 'Core Keywords', field: 'Default bid', oldVal: '₹0.65', newVal: '₹0.75', user: 'You', campaign: 'Summer Sale' },
  { id: 6, date: '2024-01-12 10:00', entity: 'Campaign', name: 'Brand Defense - Sponsored Brands', field: 'Bidding strategy', oldVal: 'Dynamic bids - up and down', newVal: 'Fixed bid', user: 'You', campaign: 'Brand Defense' },
  { id: 7, date: '2024-01-11 14:22', entity: 'Keyword', name: 'noise cancelling', field: 'Bid', oldVal: '₹0.45', newVal: '₹0.55', user: 'You', campaign: 'Summer Sale' },
  { id: 8, date: '2024-01-10 09:00', entity: 'Campaign', name: 'Competitor Targeting - Sponsored Display', field: 'Status', oldVal: 'Enabled', newVal: 'Paused', user: 'You', campaign: 'Competitor Targeting' },
];

export default function ChangeHistory() {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');

  const filtered = HISTORY.filter(h => {
    if (entityFilter !== 'All' && h.entity !== entityFilter) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Change History</h1>
          <p className="page-subtitle">Audit log of all changes made to your campaigns</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input className="search-input" placeholder="Search changes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
            {['All', 'Campaign', 'Ad Group', 'Keyword', 'Negative Keyword'].map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        <table className="ads-table">
          <thead>
            <tr>
              <th>Date & time</th>
              <th>Entity type</th>
              <th>Entity name</th>
              <th>Campaign</th>
              <th>Field changed</th>
              <th>Previous value</th>
              <th>New value</th>
              <th>Changed by</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => (
              <tr key={h.id}>
                <td className="text-mono">{h.date}</td>
                <td><span className="entity-badge">{h.entity}</span></td>
                <td>{h.name}</td>
                <td>{h.campaign}</td>
                <td>{h.field}</td>
                <td className="old-value">{h.oldVal}</td>
                <td className="new-value">{h.newVal}</td>
                <td><span className={h.user === 'Automation Rule' ? 'auto-badge' : ''}>{h.user}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">{filtered.length} changes</div>
      </div>
    </div>
  );
}
