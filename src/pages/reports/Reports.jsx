import { useState } from 'react';
import { useStore } from '../../store/useStore';
import DateRangePicker from '../../components/DateRangePicker';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Plus, FileText } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/simulation';

const COLORS = ['#e47911', '#232f3e', '#f9a825', '#00897b', '#6a1b9a'];

const REPORT_TYPES = [
  'Campaign performance', 'Ad group performance', 'Keyword performance',
  'Search term report', 'Product ads report', 'Placement report', 'Advertised product report'
];

export default function Reports() {
  const campaigns = useStore(s => s.campaigns);
  const chartData = useStore(s => s.chartData);
  const [activeReport, setActiveReport] = useState('Campaign performance');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ name: '', type: 'Campaign performance', frequency: 'Daily', email: '' });

  const pieData = campaigns.map(c => ({
    name: c.name.substring(0, 20),
    value: parseFloat(c.metrics.spend.toFixed(2))
  }));

  const placementData = [
    { placement: 'Top of search (first page)', impressions: 28400, clicks: 920, spend: 32.40, orders: 52, ctr: 3.24, acos: 13.2 },
    { placement: 'Rest of search', impressions: 19600, clicks: 540, spend: 18.20, orders: 28, ctr: 2.76, acos: 18.7 },
    { placement: 'Product pages', impressions: 11200, clicks: 220, spend: 8.90, orders: 11, ctr: 1.96, acos: 24.1 },
  ];

  const handleDownload = (format) => {
    alert(`Downloading ${activeReport} as ${format}... (simulation)`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Measurement & Reporting</h1>
          <p className="page-subtitle">Analyze performance across campaigns, keywords, and placements</p>
        </div>
        <div className="page-actions">
          <DateRangePicker />
          <button className="btn btn-secondary" onClick={() => handleDownload('CSV')}><Download size={14} /> CSV</button>
          <button className="btn btn-secondary" onClick={() => handleDownload('Excel')}><Download size={14} /> Excel</button>
          <button className="btn btn-primary" onClick={() => setShowSchedule(true)}><Plus size={14} /> Schedule report</button>
        </div>
      </div>

      {/* Report type selector */}
      <div className="report-type-tabs">
        {REPORT_TYPES.map(r => (
          <button key={r} className={`report-type-tab ${activeReport === r ? 'active' : ''}`} onClick={() => setActiveReport(r)}>
            <FileText size={13} /> {r}
          </button>
        ))}
      </div>

      {/* Overview charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <h3 className="chart-title">Spend & Sales over time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e47911" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e47911" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#232f3e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#232f3e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={5} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={(v, n) => [n === 'spend' ? `₹${v}` : `₹${v}`, n === 'spend' ? 'Spend' : 'Sales']} />
              <Legend />
              <Area type="monotone" dataKey="spend" stroke="#e47911" fill="url(#colorSpend)" strokeWidth={2} />
              <Area type="monotone" dataKey="sales" stroke="#232f3e" fill="url(#colorSales)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Spend by campaign</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v}`, 'Spend']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Clicks & Impressions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#e47911" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Placement Report */}
      {activeReport === 'Placement report' && (
        <div className="table-card">
          <h3 className="section-title">Placement performance</h3>
          <table className="ads-table">
            <thead>
              <tr>
                <th>Placement</th><th>Impressions</th><th>Clicks</th><th>CTR</th>
                <th>Spend</th><th>Orders</th><th>ACOS</th>
              </tr>
            </thead>
            <tbody>
              {placementData.map(p => (
                <tr key={p.placement}>
                  <td>{p.placement}</td>
                  <td>{formatNumber(p.impressions)}</td>
                  <td>{formatNumber(p.clicks)}</td>
                  <td>{formatPercent(p.ctr)}</td>
                  <td>{formatCurrency(p.spend)}</td>
                  <td>{p.orders}</td>
                  <td className={p.acos > 25 ? 'bad-metric' : p.acos < 15 ? 'good-metric' : ''}>{formatPercent(p.acos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaign Performance Table */}
      <div className="table-card">
        <h3 className="section-title">{activeReport}</h3>
        <table className="ads-table">
          <thead>
            <tr>
              <th>Campaign</th><th>Status</th><th>Impressions</th><th>Clicks</th>
              <th>CTR</th><th>Spend</th><th>CPC</th><th>Orders</th><th>Sales</th><th>ACOS</th><th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td><span className={`status-dot ${c.status === 'Enabled' ? 'green' : 'yellow'}`} />{c.status}</td>
                <td>{formatNumber(c.metrics.impressions)}</td>
                <td>{formatNumber(c.metrics.clicks)}</td>
                <td>{formatPercent(c.metrics.ctr)}</td>
                <td>{formatCurrency(c.metrics.spend)}</td>
                <td>{formatCurrency(c.metrics.cpc)}</td>
                <td>{formatNumber(c.metrics.orders)}</td>
                <td>{formatCurrency(c.metrics.sales)}</td>
                <td className={c.metrics.acos > 30 ? 'bad-metric' : c.metrics.acos < 15 ? 'good-metric' : ''}>{formatPercent(c.metrics.acos)}</td>
                <td>{Number(c.metrics.roas || 0).toFixed(2)}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSchedule && (
        <div className="modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule report</h2>
              <button className="modal-close" onClick={() => setShowSchedule(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Report name</label>
                  <input className="form-input" value={scheduleForm.name} onChange={e => setScheduleForm(f => ({ ...f, name: e.target.value }))} placeholder="My weekly report" />
                </div>
                <div className="form-group">
                  <label>Report type</label>
                  <select className="form-input" value={scheduleForm.type} onChange={e => setScheduleForm(f => ({ ...f, type: e.target.value }))}>
                    {REPORT_TYPES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select className="form-input" value={scheduleForm.frequency} onChange={e => setScheduleForm(f => ({ ...f, frequency: e.target.value }))}>
                    <option>Daily</option><option>Weekly</option><option>Monthly</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Email recipients</label>
                  <input className="form-input" value={scheduleForm.email} onChange={e => setScheduleForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSchedule(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert('Report scheduled!'); setShowSchedule(false); }}>Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
