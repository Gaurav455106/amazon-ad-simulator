import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { campaignPath, adGroupPath } from '../../routes';
import { formatCurrency } from '../../utils/simulation';
import ConsoleTable from '../../components/console/table/ConsoleTable';
import ProductLink from '../../components/console/ProductLink';
import { GROUPS, metricColumns, metricFilterFields } from '../../components/console/table/columns';
import { choiceField } from '../../components/console/table/tableFilters';
import { buildReportRows, REPORT_TYPES } from './reportData';

const METRIC_KEYS = ['impressions', 'clicks', 'ctr', 'spend', 'cpc', 'orders', 'sales', 'acos', 'roas'];
const TYPES = ['Sponsored Products', 'Sponsored Brands', 'Sponsored Display'].map(v => ({ value: v, label: v }));
const MATCH_TYPES = ['Exact', 'Phrase', 'Broad'].map(v => ({ value: v, label: v }));

const campaignCol = (fixed) => ({ key: 'campaign', label: 'Campaign name', fixed, group: GROUPS.detail, csv: r => r.campaign.name,
  cell: r => <Link className="cx-link" to={campaignPath(r.campaign)}>{r.campaign.name}</Link> });
const adGroupCol = { key: 'adGroup', label: 'Ad group name', group: GROUPS.detail, csv: r => r.adGroup?.name || '',
  cell: r => (r.adGroup ? <Link className="cx-link" to={adGroupPath(r.campaign, r.adGroup.id)}>{r.adGroup.name}</Link> : '—') };
const typeCol = { key: 'type', label: 'Campaign type', group: GROUPS.settings, csv: r => r.campaign.type, cell: r => r.campaign.type };

// The identifying columns of each report, before its metrics.
const LEAD_COLUMNS = {
  campaign: [campaignCol(true), typeCol, { key: 'status', label: 'Status', group: GROUPS.settings, csv: r => r.campaign.status, cell: r => r.campaign.status }],
  adGroup: [{ key: 'name', label: 'Ad group name', fixed: true, csv: r => r.adGroup.name, cell: r => adGroupCol.cell(r) }, campaignCol(false), typeCol],
  keyword: [
    { key: 'keyword', label: 'Keyword', fixed: true, csv: r => r.keyword.keyword, cell: r => r.keyword.keyword },
    { key: 'matchType', label: 'Match type', group: GROUPS.settings, csv: r => r.keyword.matchType, cell: r => r.keyword.matchType },
    { key: 'bid', label: 'Bid', group: GROUPS.settings, num: true, csv: r => r.keyword.bid, sortValue: r => r.keyword.bid, cell: r => formatCurrency(r.keyword.bid) },
    campaignCol(false), adGroupCol,
  ],
  searchTerm: [
    { key: 'term', label: 'Customer search term', fixed: true, csv: r => r.term, cell: r => r.term },
    { key: 'keyword', label: 'Targeting', group: GROUPS.detail, csv: r => r.keyword.keyword, cell: r => <>{r.keyword.keyword}<span className="cx-sub">{r.keyword.matchType}</span></> },
    campaignCol(false),
  ],
  placement: [{ key: 'placement', label: 'Placement', fixed: true, csv: r => r.placement, cell: r => r.placement }, campaignCol(false), typeCol],
  product: [
    { key: 'product', label: 'Advertised product', fixed: true, csv: r => r.product?.name || r.asin,
      cell: r => <ProductLink asin={r.asin} className="cx-link prod-title">{r.product?.name || r.asin}</ProductLink> },
    { key: 'asin', label: 'Advertised ASIN', group: GROUPS.detail, csv: r => r.asin, cell: r => r.asin },
    { key: 'sku', label: 'Advertised SKU', group: GROUPS.detail, isDefault: false, csv: r => r.product?.sku || '', cell: r => r.product?.sku || '—' },
    campaignCol(false), adGroupCol,
  ],
};

const EXTRA_FIELDS = {
  campaign: [choiceField('type', 'Campaign type', TYPES, r => r.campaign.type)],
  adGroup: [choiceField('type', 'Campaign type', TYPES, r => r.campaign.type)],
  keyword: [choiceField('matchType', 'Match type', MATCH_TYPES, r => r.keyword.matchType)],
  searchTerm: [choiceField('matchType', 'Match type', MATCH_TYPES, r => r.keyword.matchType)],
  placement: [choiceField('type', 'Campaign type', TYPES.slice(0, 2), r => r.campaign.type)],
  product: [],
};

const searchText = (r) => [r.campaign?.name, r.adGroup?.name, r.keyword?.keyword, r.term, r.placement, r.product?.name, r.asin].filter(Boolean).join(' ').toLowerCase();

/** One report (campaign, ad group, keyword, search term, placement or product) as a console table. */
export default function ReportTable({ type }) {
  const campaigns = useStore(s => s.campaigns);
  const adGroups = useStore(s => s.adGroups);
  const keywords = useStore(s => s.keywords);
  const products = useStore(s => s.products);
  const range = useConsoleRange();
  const rows = useMemo(() => buildReportRows(type, { campaigns, adGroups, keywords, products }, range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, campaigns, adGroups, keywords, products, range.from.getTime(), range.to.getTime()]);
  const label = REPORT_TYPES.find(t => t.key === type)?.label || 'Report';

  return (
    <ConsoleTable
      key={type}
      tableKey={`report-${type}`}
      exportName={label}
      columns={[...LEAD_COLUMNS[type], ...metricColumns(METRIC_KEYS)]}
      rows={rows}
      rowKey={r => r.id}
      filterFields={[...EXTRA_FIELDS[type], ...metricFilterFields(METRIC_KEYS)]}
      search={{ placeholder: 'Search this report', match: (r, q) => searchText(r).includes(q) }}
      showSettings={false}
    />
  );
}
