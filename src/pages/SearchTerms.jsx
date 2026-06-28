import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import DateRangePicker from '../components/DateRangePicker';
import { Download, Search, Filter } from 'lucide-react';
import { getSearchTerms } from '../utils/simulation';
import { formatCurrency, formatNumber, formatPercent } from '../utils/simulation';

export default function SearchTerms() {
  const keywords = useStore(s => s.keywords);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const campaigns = useStore(s => s.campaigns);

  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('impressions');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);

  const allTerms = useMemo(() => getSearchTerms(keywords), [keywords]);

  const filtered = useMemo(() => {
    let list = allTerms;
    if (search) list = list.filter(t => t.searchTerm.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => sortDir === 'desc' ? b[sortCol] - a[sortCol] : a[sortCol] - b[sortCol]);
  }, [allTerms, search, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const toggleSelect = (term) => setSelected(prev =>
    prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
  );

  const addAsNegative = () => {
    const campaign = campaigns.find(c => c.status === 'Enabled');
    if (!campaign) return;
    addNegativeKeywords(selected.map(kw => ({
      keyword: kw, matchType: 'Exact', campaignId: campaign.id, adGroupId: null, level: 'Campaign'
    })));
    setSelected([]);
    alert(`Added ${selected.length} terms as negative keywords to "${campaign.name}"`);
  };

  const sortArrow = (col) => sortCol === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Search Term Report</h1>
          <p className="page-subtitle">Discover what customers search for before clicking your ads</p>
        </div>
        <div className="page-actions">
          <DateRangePicker />
          <button className="btn btn-secondary"><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="info-banner">
        <strong>💡 Tip:</strong> Add high-spend, low-conversion terms as negative keywords to reduce wasted spend.
        Select terms below and click "Add as negative".
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <Search size={14} />
            <input className="search-input" placeholder="Filter search terms..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {selected.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selected.length} selected</span>
              <button className="btn btn-sm btn-secondary" onClick={addAsNegative}>Add as negative keyword</button>
              <button className="btn btn-sm btn-secondary" onClick={() => alert('Adding to keyword list...')}>Add as keyword</button>
            </div>
          )}
        </div>

        <div className="table-wrap">
          <table className="ads-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th className="sortable" onClick={() => handleSort('searchTerm')}>Search term{sortArrow('searchTerm')}</th>
                <th>Matched keyword</th>
                <th>Match type</th>
                <th className="sortable" onClick={() => handleSort('impressions')}>Impressions{sortArrow('impressions')}</th>
                <th className="sortable" onClick={() => handleSort('clicks')}>Clicks{sortArrow('clicks')}</th>
                <th className="sortable" onClick={() => handleSort('ctr')}>CTR{sortArrow('ctr')}</th>
                <th className="sortable" onClick={() => handleSort('spend')}>Spend{sortArrow('spend')}</th>
                <th className="sortable" onClick={() => handleSort('cpc')}>CPC{sortArrow('cpc')}</th>
                <th className="sortable" onClick={() => handleSort('orders')}>Orders{sortArrow('orders')}</th>
                <th className="sortable" onClick={() => handleSort('acos')}>ACOS{sortArrow('acos')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} className={selected.includes(t.searchTerm) ? 'selected-row' : ''}>
                  <td><input type="checkbox" checked={selected.includes(t.searchTerm)} onChange={() => toggleSelect(t.searchTerm)} /></td>
                  <td>{t.searchTerm}</td>
                  <td>{t.keyword}</td>
                  <td><span className={`match-badge match-${t.matchType.toLowerCase()}`}>{t.matchType}</span></td>
                  <td>{formatNumber(t.impressions)}</td>
                  <td>{formatNumber(t.clicks)}</td>
                  <td>{formatPercent(t.ctr)}</td>
                  <td>{formatCurrency(t.spend)}</td>
                  <td>{formatCurrency(t.cpc)}</td>
                  <td>{t.orders}</td>
                  <td className={t.acos > 30 ? 'bad-metric' : t.acos < 15 ? 'good-metric' : ''}>{formatPercent(t.acos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">{filtered.length} search terms</div>
      </div>
    </div>
  );
}
