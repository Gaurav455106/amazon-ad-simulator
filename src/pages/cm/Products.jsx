import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Star } from 'lucide-react';
import Info from '../../components/console/InfoGlyph';
import { useStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, sumMetrics, withParentStart } from '../../utils/performance';
import { formatMetric } from '../../components/console/metrics';
import ProductImage from '../../components/console/ProductImage';
import TableDateButton from '../../components/console/TableDateButton';

const FULL_STARS = 5;

function Stars({ rating, reviews }) {
  return (
    <span className="prod-stars">
      {Array.from({ length: FULL_STARS }, (_, i) => <Star key={i} size={12} fill={i < Math.round(rating) ? '#de7921' : 'none'} stroke="#de7921" />)}
      <span className="cx-link">({reviews})</span>
    </span>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const products = useStore(s => s.products);
  const adGroups = useStore(s => s.adGroups);
  const campaigns = useStore(s => s.campaigns);
  const range = useConsoleRange();
  const [tab, setTab] = useState('advertised');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});

  // Each product's performance = its share of every ad group that advertises it.
  const perProduct = useMemo(() => {
    const out = {};
    adGroups.forEach(ag => {
      const c = campaigns.find(x => x.id === ag.campaignId);
      const asins = ag.products || [];
      if (!c || asins.length === 0) return;
      const m = rangeMetrics(withParentStart(ag, c), range);
      asins.forEach(a => {
        out[a] = out[a] || { campaigns: new Set(), parts: [] };
        out[a].campaigns.add(c.name);
        out[a].parts.push(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v / asins.length])));
      });
    });
    return Object.fromEntries(Object.entries(out).map(([a, v]) => [a, { campaigns: [...v.campaigns], m: sumMetrics(v.parts) }]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adGroups, campaigns, range.from.getTime(), range.to.getTime()]);

  const list = products
    .filter(p => tab === 'all' || perProduct[p.asin])
    .filter(p => !query || `${p.name} ${p.asin}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="cx-page">
      <div className="sub-tabs sub-tabs-lg">
        <button type="button" className={`sub-tab ${tab === 'advertised' ? 'is-active' : ''}`} onClick={() => setTab('advertised')}>Advertised products <Info size={13} /></button>
        <button type="button" className={`sub-tab ${tab === 'all' ? 'is-active' : ''}`} onClick={() => setTab('all')}>All sold products <Info size={13} /> <span className="gnav-badge">Beta</span></button>
      </div>
      <div className="cx-toolbar">
        <button type="button" className="cx-btn" onClick={() => navigate(ROUTES.createCampaign)}>Create campaign <ChevronDown size={14} /></button>
        <button type="button" className="cx-btn" disabled>Add to existing campaign</button>
        <label className="cx-search" style={{ width: 260 }}><Search size={16} /><input placeholder="Search by product name or ASIN" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <button type="button" className="cx-tool-btn">Filter by <ChevronDown size={14} /></button>
        <span className="cx-toolbar-spacer" />
        <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
        <TableDateButton />
        <button type="button" className="cx-tool-btn">Export</button>
      </div>
      <div className="cx-table-wrap cx-card">
        <table className="cx-table">
          <thead>
            <tr><th /><th /><th>Products <Info size={13} /></th><th>Recommendations</th><th>Trends</th><th>Sponsored Products eligibility <Info size={13} /></th>
              <th className="is-num">Sales <Info size={13} /></th><th className="is-num">ROAS <Info size={13} /></th><th className="is-num">Total cost</th></tr>
          </thead>
          <tbody>
            {list.map(p => {
              const data = perProduct[p.asin];
              const isOpen = !!expanded[p.asin];
              return (
                <Fragment key={p.asin}>
                  <tr>
                    <td><input type="checkbox" aria-label="select" /></td>
                    <td><button type="button" className="cx-tool-btn" aria-label="Expand" onClick={() => setExpanded(e => ({ ...e, [p.asin]: !isOpen }))}>{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button></td>
                    <td>
                      <div className="prod-row">
                        <ProductImage imageType={p.imageType} size={44} />
                        <div className="prod-row-text">
                          <span className="cx-link prod-title">{p.name}</span>
                          <Stars rating={p.rating} reviews={p.reviews} /> <span className="cx-sub">Price may vary by location</span>
                          <span className="cx-sub">ASIN: {p.asin} | SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>—</td>
                    <td><span className="cx-link">View trends</span></td>
                    <td>{p.status === 'Out of stock' ? <span className="form-error">Ineligible</span> : 'Eligible'}</td>
                    <td className="is-num">{data?.m.sales ? formatMetric('sales', data.m.sales) : '—'}</td>
                    <td className="is-num">{data?.m.roas ? formatMetric('roas', data.m.roas) : '—'}</td>
                    <td className="is-num">{data?.m.spend ? formatMetric('spend', data.m.spend) : '—'}</td>
                  </tr>
                  {isOpen && (
                    <tr><td /><td /><td colSpan={7} className="cx-sub">
                      {data ? `Advertised in: ${data.campaigns.join(', ')}` : 'Not advertised in any campaign yet.'}
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
            {list.length === 0 && <tr><td colSpan={9}><div className="cx-empty"><h3>No advertised products</h3><p>Products you add to campaigns appear here.</p></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
