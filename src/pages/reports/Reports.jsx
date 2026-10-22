import { useState } from 'react';
import { useStore } from '../../store/useStore';
import DateRangePicker from '../../components/DateRangePicker';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, FileText } from 'lucide-react';
import ReportTable from './ReportTable';
import { REPORT_TYPES } from './reportData';

const COLORS = ['#e47911', '#232f3e', '#f9a825', '#00897b', '#6a1b9a'];

export default function Reports() {
  const campaigns = useStore(s => s.campaigns);
  const chartData = useStore(s => s.chartData);
  const [activeReport, setActiveReport] = useState('campaign');
  const [scheduledName, setScheduledName] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ name: '', type: 'campaign', frequency: 'Daily', email: '' });

  const pieData = campaigns.map(c => ({
    name: c.name.substring(0, 20),
    value: parseFloat(c.metrics.spend.toFixed(2))
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Measurement & Reporting</h1>
          <p className="page-subtitle">Analyze performance across campaigns, keywords, and placements</p>
        </div>
        <div className="page-actions">
          <DateRangePicker />
          <button className="btn btn-primary" onClick={() => setShowSchedule(true)}><Plus size={14} /> Schedule report</button>
        </div>
      </div>

      {/* Report type selector */}
      <div className="report-type-tabs">
        {REPORT_TYPES.map(r => (
          <button key={r.key} className={`report-type-tab ${activeReport === r.key ? 'active' : ''}`} onClick={() => setActiveReport(r.key)}>
            <FileText size={13} /> {r.label}
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

      {scheduledName && <p className="report-note" role="status">Scheduled “{scheduledName}”. In the simulator it isn't emailed; download it any time with Export.</p>}
      <div className="table-card report-table">
        <h3 className="section-title">{REPORT_TYPES.find(r => r.key === activeReport)?.label}</h3>
        <ReportTable type={activeReport} />
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
                    {REPORT_TYPES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
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
              <button className="btn btn-primary" onClick={() => { setScheduledName(scheduleForm.name || REPORT_TYPES.find(r => r.key === scheduleForm.type)?.label); setShowSchedule(false); }}>Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
