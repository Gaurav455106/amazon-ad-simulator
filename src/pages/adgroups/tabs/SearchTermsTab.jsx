import { useMemo, useState } from 'react';
import { Search, ListFilter, ChevronDown } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import { buildSearchTerms } from '../../../utils/searchTerms';
import { formatMetric, METRICS } from '../../../components/console/metrics';
import { formatCurrency } from '../../../utils/simulation';
import TableDateButton from '../../../components/console/TableDateButton';

const METRIC_COLUMNS = ['spend', 'orders', 'sales', 'acos', 'impressions', 'clicks', 'ctr'];

export default function SearchTermsTab({ campaign, adGroup }) {
  const keywords = useStore(s => s.keywords);
  const negativeKeywords = useStore(s => s.negativeKeywords);
  const addKeywords = useStore(s => s.addKeywords);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const range = useConsoleRange();
  const [query, setQuery] = useState('');

  const agKeywords = keywords.filter(k => k.adGroupId === adGroup.id);
  const terms = useMemo(() => buildSearchTerms(agKeywords.map(k => ({ k, m: rangeMetrics(withParentStart(k, campaign), range) })))
    .filter(t => t.impressions >= 1)
    .filter(t => !query || t.term.includes(query.toLowerCase())),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [keywords, adGroup.id, query, campaign.startDate, range.from.getTime(), range.to.getTime()]);

  const addedAs = (term) => {
    const tags = [];
    if (agKeywords.some(k => k.keyword === term && k.matchType === 'Exact')) tags.push('Keyword (exact)');
    if (negativeKeywords.some(n => n.campaignId === campaign.id && n.keyword === term)) tags.push('Negative');
    return tags;
  };

  const addAsKeyword = (t) => addKeywords([{ keyword: t.term, matchType: 'Exact', bid: t.keyword.bid, adGroupId: adGroup.id, campaignId: campaign.id, status: 'Enabled' }]);
  const addAsNegative = (t) => addNegativeKeywords([{ keyword: t.term, matchType: 'Exact', campaignId: campaign.id, adGroupId: adGroup.id, level: 'Ad Group' }]);

  return (
    <>
      <div className="cx-toolbar">
        <label className="cx-search" style={{ width: 240 }}><Search size={16} /><input placeholder="Find a search term" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <button type="button" className="cx-tool-btn" aria-label="Filter by"><ListFilter size={16} /></button>
        <span className="cx-toolbar-spacer" />
        <button type="button" className="cx-tool-btn">View: Default <ChevronDown size={14} /></button>
        <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
        <TableDateButton />
        <button type="button" className="cx-tool-btn">Export</button>
      </div>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead>
            <tr><th>Actions</th><th>Added as</th><th>Customer search term <Info size={13} /></th><th>Keywords <Info size={13} /></th><th className="is-num"><Info size={13} /> Target bid</th>
              {METRIC_COLUMNS.map(k => <th key={k} className="is-num"><Info size={13} /> {METRICS[k].label}</th>)}</tr>
          </thead>
          <tbody>
            {terms.map(t => {
              const tags = addedAs(t.term);
              return (
                <tr key={t.id}>
                  <td className="st-actions">
                    {!tags.includes('Keyword (exact)') && <button type="button" className="cx-link" onClick={() => addAsKeyword(t)}>Add as keyword</button>}
                    {!tags.includes('Negative') && <button type="button" className="cx-link" onClick={() => addAsNegative(t)}>Add as negative</button>}
                  </td>
                  <td>{tags.length ? tags.join(', ') : '—'}</td>
                  <td>{t.term}</td>
                  <td>{t.keyword.keyword}<span className="cx-sub">{t.keyword.matchType}</span></td>
                  <td className="is-num">{formatCurrency(t.keyword.bid)}</td>
                  {METRIC_COLUMNS.map(k => <td key={k} className="is-num">{t[k] ? formatMetric(k, t[k]) : '—'}</td>)}
                </tr>
              );
            })}
            {terms.length === 0 && <tr><td colSpan={12}><div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
