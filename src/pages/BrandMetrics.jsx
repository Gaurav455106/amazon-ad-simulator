import { useStore } from '../store/useStore';
import DateRangePicker from '../components/DateRangePicker';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber, formatCurrency } from '../utils/simulation';

export default function BrandMetrics() {
  const chartData = useStore(s => s.chartData);

  const brandMetrics = {
    newToBrandOrders: 142,
    newToBrandRevenue: 4280.50,
    newToBrandOrderRate: 68.3,
    brandedSearches: 8420,
    brandedSearchGrowth: 12.4,
    detailPageViews: 28940,
    detailPageViewGrowth: 8.2,
    brandHaloOrders: 38,
    brandHaloRevenue: 1140.00,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Brand Metrics</h1>
          <p className="page-subtitle">Measure how your brand is growing on Amazon</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="brand-metrics-grid">
        <div className="brand-metric-card highlight">
          <div className="bm-label">New-to-brand orders</div>
          <div className="bm-value">{formatNumber(brandMetrics.newToBrandOrders)}</div>
          <div className="bm-sub">Orders from customers who haven't purchased from your brand in last 12 months</div>
        </div>
        <div className="brand-metric-card">
          <div className="bm-label">New-to-brand revenue</div>
          <div className="bm-value">{formatCurrency(brandMetrics.newToBrandRevenue)}</div>
          <div className="bm-sub">Revenue from new-to-brand customers</div>
        </div>
        <div className="brand-metric-card">
          <div className="bm-label">% New-to-brand orders</div>
          <div className="bm-value">{brandMetrics.newToBrandOrderRate}%</div>
          <div className="bm-sub">Share of orders from new customers</div>
        </div>
        <div className="brand-metric-card">
          <div className="bm-label">Branded searches</div>
          <div className="bm-value">{formatNumber(brandMetrics.brandedSearches)}</div>
          <div className="bm-sub change-up">↑ {brandMetrics.brandedSearchGrowth}% vs prior period</div>
        </div>
        <div className="brand-metric-card">
          <div className="bm-label">Detail page views</div>
          <div className="bm-value">{formatNumber(brandMetrics.detailPageViews)}</div>
          <div className="bm-sub change-up">↑ {brandMetrics.detailPageViewGrowth}% vs prior period</div>
        </div>
        <div className="brand-metric-card">
          <div className="bm-label">Brand halo orders</div>
          <div className="bm-value">{formatNumber(brandMetrics.brandHaloOrders)}</div>
          <div className="bm-sub">Orders on non-advertised products from brand</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="chart-title">Branded search trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData.map(d => ({ ...d, brandedSearches: Math.floor(d.impressions * 0.3) }))}>
              <defs>
                <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e47911" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#e47911" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={5} />
              <YAxis tick={{ fontSize: 10 }} width={45} />
              <Tooltip />
              <Area type="monotone" dataKey="brandedSearches" stroke="#e47911" fill="url(#colorBrand)" strokeWidth={2} name="Branded searches" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-card">
        <h3 className="section-title">Brand funnel</h3>
        <div className="brand-funnel">
          {[
            { stage: 'Awareness', metric: 'Impressions', value: '86,620', pct: 100 },
            { stage: 'Consideration', metric: 'Detail page views', value: '28,940', pct: 33 },
            { stage: 'Purchase intent', metric: 'Add to cart', value: '4,820', pct: 5.6 },
            { stage: 'Purchase', metric: 'Orders', value: '208', pct: 0.24 },
          ].map(f => (
            <div key={f.stage} className="funnel-stage">
              <div className="funnel-bar-wrap">
                <div className="funnel-bar" style={{ width: `${f.pct}%` }} />
              </div>
              <div className="funnel-info">
                <span className="funnel-stage-label">{f.stage}</span>
                <span className="funnel-metric">{f.metric}: {f.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
