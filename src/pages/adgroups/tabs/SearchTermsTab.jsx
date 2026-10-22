import { useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import { useConsoleRange } from '../../../hooks/useConsoleRange';
import { rangeMetrics, withParentStart } from '../../../utils/performance';
import { buildSearchTerms } from '../../../utils/searchTerms';
import { formatCurrency } from '../../../utils/simulation';
import ConsoleTable from '../../../components/console/table/ConsoleTable';
import { GROUPS, metricColumns, metricFilterFields } from '../../../components/console/table/columns';
import { choiceField, numberField } from '../../../components/console/table/tableFilters';

const METRIC_KEYS = ['spend', 'orders', 'sales', 'acos', 'impressions', 'clicks', 'ctr', 'cpc', 'roas'];
const DEFAULT_METRICS = ['spend', 'orders', 'sales', 'acos', 'impressions', 'clicks', 'ctr'];
const MATCH_TYPES = ['Exact', 'Phrase', 'Broad'].map(v => ({ value: v, label: v }));

export default function SearchTermsTab({ campaign, adGroup }) {
  const keywords = useStore(s => s.keywords);
  const negativeKeywords = useStore(s => s.negativeKeywords);
  const addKeywords = useStore(s => s.addKeywords);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const range = useConsoleRange();

  const agKeywords = keywords.filter(k => k.adGroupId === adGroup.id);
  const terms = useMemo(() => buildSearchTerms(agKeywords.map(k => ({ k, m: rangeMetrics(withParentStart(k, campaign), range) })))
    .filter(t => t.impressions >= 1)
    .map(t => ({ ...t, m: t })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [keywords, adGroup.id, campaign.startDate, range.from.getTime(), range.to.getTime()]);

  const addedAs = (term) => {
    const tags = [];
    if (agKeywords.some(k => k.keyword === term && k.matchType === 'Exact')) tags.push('Keyword (exact)');
    if (negativeKeywords.some(n => n.campaignId === campaign.id && n.keyword === term)) tags.push('Negative');
    return tags;
  };
  const addAsKeyword = (t) => addKeywords([{ keyword: t.term, matchType: 'Exact', bid: t.keyword.bid, adGroupId: adGroup.id, campaignId: campaign.id, status: 'Enabled' }]);
  const addAsNegative = (t) => addNegativeKeywords([{ keyword: t.term, matchType: 'Exact', campaignId: campaign.id, adGroupId: adGroup.id, level: 'Ad Group' }]);

  const columns = [
    { key: 'actions', label: 'Actions', fixed: true, isUtility: true,
      cell: (t) => {
        const tags = addedAs(t.term);
        return (
          <span className="st-actions">
            {!tags.includes('Keyword (exact)') && <button type="button" className="cx-link" onClick={() => addAsKeyword(t)}>Add as keyword</button>}
            {!tags.includes('Negative') && <button type="button" className="cx-link" onClick={() => addAsNegative(t)}>Add as negative</button>}
          </span>
        );
      } },
    { key: 'addedAs', label: 'Added as', fixed: true, csv: t => addedAs(t.term).join('; '), cell: t => addedAs(t.term).join(', ') || '—' },
    { key: 'term', label: 'Customer search term', fixed: true, info: true, csv: t => t.term, cell: t => t.term },
    { key: 'keyword', label: 'Keywords', group: GROUPS.detail, info: true, csv: t => `${t.keyword.keyword} (${t.keyword.matchType})`,
      cell: t => <>{t.keyword.keyword}<span className="cx-sub">{t.keyword.matchType}</span></> },
    { key: 'bid', label: 'Target bid', group: GROUPS.settings, num: true, info: true, csv: t => t.keyword.bid, sortValue: t => t.keyword.bid, cell: t => formatCurrency(t.keyword.bid) },
    ...metricColumns(METRIC_KEYS, DEFAULT_METRICS),
  ];
  const fields = [
    choiceField('matchType', 'Match type', MATCH_TYPES, t => t.keyword.matchType),
    numberField('bid', 'Target bid', t => t.keyword.bid),
    ...metricFilterFields(METRIC_KEYS),
  ];

  return (
    <ConsoleTable tableKey="search-terms" exportName={`${adGroup.name} search terms`} columns={columns} rows={terms} rowKey={t => t.id}
      filterFields={fields} showSettings={false}
      search={{ placeholder: 'Find a search term', match: (t, q) => t.term.includes(q) }} />
  );
}
