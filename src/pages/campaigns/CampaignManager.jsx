import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import StatusBadge from '../../components/StatusBadge';
import DateRangePicker from '../../components/DateRangePicker';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Plus, Download, Upload, Settings, ChevronDown, Search, Filter, Trash2, Play, Pause, Archive } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/simulation';

const COLUMNS = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'ctr', label: 'CTR' },
  { key: 'spend', label: 'Spend' },
  { key: 'cpc', label: 'CPC' },
  { key: 'orders', label: 'Orders' },
  { key: 'sales', label: 'Sales' },
  { key: 'acos', label: 'ACOS' },
  { key: 'roas', label: 'ROAS' },
];

const CAMPAIGN_TYPES = ['All', 'Sponsored Products', 'Sponsored Brands', 'Sponsored Display'];

export default function CampaignManager() {
  const navigate = useNavigate();
  const campaigns = useStore(s => s.campaigns);
  const chartData = useStore(s => s.chartData);
  const toggleStatus = useStore(s => s.toggleCampaignStatus);
  const deleteCampaigns = useStore(s => s.deleteCampaigns);
  const updateCampaign = useStore(s => s.updateCampaign);

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [chartMetric, setChartMetric] = useState('spend');
  const [chartType, setChartType] = useState('line');
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetValue, setBudgetValue] = useState('');
  const [sortCol, setSortCol] = useState('spend');
  const [sortDir, setSortDir] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = useMemo(() => {
    let list = campaigns;
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'All') list = list.filter(c => c.type === typeFilter);
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter);
    return list.sort((a, b) => {
      const av = a.metrics[sortCol] ?? a[sortCol] ?? 0;
      const bv = b.metrics[sortCol] ?? b[sortCol] ?? 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [campaigns, search, typeFilter, statusFilter, sortCol, sortDir]);

  const totals = useMemo(() => {
    const t = { impressions: 0, clicks: 0, spend: 0, orders: 0, sales: 0 };
    filtered.forEach(c => {
      t.impressions += c.metrics.impressions;
      t.clicks += c.metrics.clicks;
      t.spend += c.metrics.spend;
      t.orders += c.metrics.orders;
      t.sales += c.metrics.sales;
    });
    t.ctr = t.impressions ? (t.clicks / t.impressions * 100) : 0;
    t.cpc = t.clicks ? (t.spend / t.clicks) : 0;
    t.acos = t.sales ? (t.spend / t.sales * 100) : 0;
    t.roas = t.spend ? (t.sales / t.spend) : 0;
    return t;
  }, [filtered]);

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const saveBudget = (id) => {
    const val = parseFloat(budgetValue);
    if (!isNaN(val) && val > 0) updateCampaign(id, { budget: val });
    setEditingBudget(null);
  };

  const formatMetric = (key, val) => {
    if (['spend', 'sales', 'cpc'].includes(key)) return formatCurrency(val);
    if (['ctr', 'acos', 'cvr'].includes(key)) return formatPercent(val);
    if (key === 'roas') return `${Number(val || 0).toFixed(2)}x`;
    return formatNumber(val);
  };

  const metricOptions = [
    { key: 'impressions', label: 'Impressions' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'spend', label: 'Spend' },
    { key: 'orders', label: 'Orders' },
    { key: 'sales', label: 'Sales' },
  ];

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaign Manager</h1>
          <p className="page-subtitle">Sponsored ads · All campaigns</p>
        </div>
        <div className="page-actions">
          <DateRangePicker />
          <button className="btn btn-secondary" onClick={() => alert('Bulk export initiated...')}><Download size={14} /> Export</button>
          <button className="btn btn-secondary"><Upload size={14} /> Import</button>
          <button className="btn btn-primary" onClick={() => navigate('/create-campaign')}><Plus size={14} /> Create campaign</button>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="summary-tiles">
        {[
          { label: 'Impressions', value: formatNumber(totals.impressions) },
          { label: 'Clicks', value: formatNumber(totals.clicks) },
          { label: 'Spend', value: formatCurrency(totals.spend) },
          { label: 'Orders', value: formatNumber(totals.orders) },
          { label: 'Sales', value: formatCurrency(totals.sales) },
          { label: 'CTR', value: formatPercent(totals.ctr) },
          { label: 'CPC', value: formatCurrency(totals.cpc) },
          { label: 'ACOS', value: formatPercent(totals.acos) },
          { label: 'ROAS', value: `${Number(totals.roas || 0).toFixed(2)}x` },
        ].map(t => (
          <div key={t.label} className="summary-tile">
            <div className="tile-label">{t.label}</div>
            <div className="tile-value">{t.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-metric-tabs">
            {metricOptions.map(m => (
              <button key={m.key} className={`chart-tab ${chartMetric === m.key ? 'active' : ''}`} onClick={() => setChartMetric(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="chart-type-tabs">
            <button className={`chart-tab ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>Line</button>
            <button className={`chart-tab ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>Bar</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Line type="monotone" dataKey={chartMetric} stroke="#e47911" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Bar dataKey={chartMetric} fill="#e47911" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Filters + Table */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div className="search-input-wrap">
              <Search size={14} />
              <input className="search-input" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {CAMPAIGN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {['All', 'Enabled', 'Paused', 'Archived'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {selected.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selected.length} selected</span>
              <button className="btn btn-sm btn-secondary" onClick={() => selected.forEach(id => toggleStatus(id))}><Play size={12} /> Enable</button>
              <button className="btn btn-sm btn-secondary" onClick={() => selected.forEach(id => toggleStatus(id))}><Pause size={12} /> Pause</button>
              <button className="btn btn-sm btn-danger" onClick={() => { deleteCampaigns(selected); setSelected([]); }}><Trash2 size={12} /> Delete</button>
            </div>
          )}
        </div>

        <div className="table-wrap">
          <table className="ads-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th>Status</th>
                <th className="campaign-name-col">Campaign name</th>
                <th>Type</th>
                <th className="sortable" onClick={() => handleSort('budget')}>
                  Budget {sortCol === 'budget' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </th>
                {COLUMNS.map(col => (
                  <th key={col.key} className="sortable" onClick={() => handleSort(col.key)}>
                    {col.label} {sortCol === col.key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className={selected.includes(c.id) ? 'selected-row' : ''}>
                  <td><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td>
                    <button
                      className={`status-toggle ${c.status === 'Enabled' ? 'on' : 'off'}`}
                      onClick={() => toggleStatus(c.id)}
                      title={c.status}
                    />
                  </td>
                  <td className="campaign-name-col">
                    <button className="link-btn campaign-link" onClick={() => navigate(`/campaigns/${c.id}`)}>
                      {c.name}
                    </button>
                    <div className="campaign-meta">{c.targetingType} · {c.biddingStrategy}</div>
                  </td>
                  <td><span className="type-badge">{{ 'Sponsored Products': 'SP', 'Sponsored Brands': 'SB', 'Sponsored Display': 'SD' }[c.type] || c.type}</span></td>
                  <td>
                    {editingBudget === c.id ? (
                      <div className="inline-edit">
                        <input autoFocus value={budgetValue} onChange={e => setBudgetValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveBudget(c.id)} className="inline-input" />
                        <button className="btn btn-xs btn-primary" onClick={() => saveBudget(c.id)}>✓</button>
                        <button className="btn btn-xs btn-secondary" onClick={() => setEditingBudget(null)}>✕</button>
                      </div>
                    ) : (
                      <button className="editable-cell" onClick={() => { setEditingBudget(c.id); setBudgetValue(c.budget); }}>
                        ₹{c.budget}/day
                      </button>
                    )}
                  </td>
                  <td>{formatNumber(c.metrics.impressions)}</td>
                  <td>{formatNumber(c.metrics.clicks)}</td>
                  <td>{formatPercent(c.metrics.ctr)}</td>
                  <td>{formatCurrency(c.metrics.spend)}</td>
                  <td>{formatCurrency(c.metrics.cpc)}</td>
                  <td>{formatNumber(c.metrics.orders)}</td>
                  <td>{formatCurrency(c.metrics.sales)}</td>
                  <td className={c.metrics.acos > 30 ? 'bad-metric' : c.metrics.acos < 15 ? 'good-metric' : ''}>
                    {formatPercent(c.metrics.acos)}
                  </td>
                  <td className={c.metrics.roas < 5 ? 'bad-metric' : c.metrics.roas > 20 ? 'good-metric' : ''}>
                    {Number(c.metrics.roas || 0).toFixed(2)}x
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn-sm" onClick={() => navigate(`/campaigns/${c.id}`)} title="View ad groups">Ad groups</button>
                      <button className="icon-btn-sm" onClick={() => toggleStatus(c.id)} title={c.status === 'Enabled' ? 'Pause' : 'Enable'}>
                        {c.status === 'Enabled' ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={16} className="empty-row">No campaigns found. <button className="link-btn" onClick={() => navigate('/create-campaign')}>Create your first campaign</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing {filtered.length} of {campaigns.length} campaigns
        </div>
      </div>

      {showCreateModal && <CreateCampaignModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

function CreateCampaignModal({ onClose }) {
  const addCampaign = useStore(s => s.addCampaign);
  const portfolios = useStore(s => s.portfolios);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', type: 'Sponsored Products', targetingType: 'Manual',
    budget: '50', budgetType: 'Daily', startDate: new Date().toISOString().split('T')[0],
    endDate: '', biddingStrategy: 'Dynamic bids - down only', portfolioId: '',
    status: 'Enabled',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    addCampaign(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create campaign</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wizard-steps">
          {['Campaign settings', 'Ad groups', 'Products', 'Targeting'].map((s, i) => (
            <div key={s} className={`wizard-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Campaign name</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter campaign name" />
              </div>
              <div className="form-group">
                <label>Campaign type</label>
                <div className="type-cards">
                  {['Sponsored Products', 'Sponsored Brands', 'Sponsored Display'].map(t => (
                    <button key={t} className={`type-card ${form.type === t ? 'selected' : ''}`} onClick={() => set('type', t)}>
                      <div className="type-card-icon">{t === 'Sponsored Products' ? '📦' : t === 'Sponsored Brands' ? '🏷️' : '🖼️'}</div>
                      <strong>{t}</strong>
                      <small>{t === 'Sponsored Products' ? 'Promote individual products in search results' : t === 'Sponsored Brands' ? 'Showcase your brand and product portfolio' : 'Re-engage shoppers across Amazon'}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Portfolio (optional)</label>
                <select className="form-input" value={form.portfolioId} onChange={e => set('portfolioId', e.target.value)}>
                  <option value="">No portfolio</option>
                  {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Targeting</label>
                <div className="radio-group">
                  {['Manual', 'Auto'].map(t => (
                    <label key={t} className="radio-label">
                      <input type="radio" checked={form.targetingType === t} onChange={() => set('targetingType', t)} />
                      <div>
                        <strong>{t} targeting</strong>
                        <small>{t === 'Manual' ? 'You choose keywords/products to target' : 'Amazon automatically targets relevant customers'}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Daily budget (₹)</label>
                <input type="number" className="form-input" value={form.budget} onChange={e => set('budget', e.target.value)} min="1" />
                <small className="form-hint">Minimum ₹1.00 per day</small>
              </div>
              <div className="form-group">
                <label>Bidding strategy</label>
                <select className="form-input" value={form.biddingStrategy} onChange={e => set('biddingStrategy', e.target.value)}>
                  <option>Dynamic bids - down only</option>
                  <option>Dynamic bids - up and down</option>
                  <option>Fixed bid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start date</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label>End date (optional)</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="form-group full">
              <p className="info-box">Ad groups will be configured after campaign creation. You can add ad groups from the campaign detail page.</p>
            </div>
          )}
          {step === 3 && (
            <div className="form-group full">
              <p className="info-box">Products can be added from the campaign detail page after creation.</p>
            </div>
          )}
          {step === 4 && (
            <div className="form-group full">
              <p className="info-box">Targeting keywords and products will be configured in the ad group settings.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={step > 1 ? () => setStep(s => s - 1) : onClose}>
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.name}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleCreate}>Launch campaign</button>
          )}
        </div>
      </div>
    </div>
  );
}
