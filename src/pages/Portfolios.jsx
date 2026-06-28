import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/simulation';

export default function Portfolios() {
  const portfolios = useStore(s => s.portfolios);
  const campaigns = useStore(s => s.campaigns);
  const addPortfolio = useStore(s => s.addPortfolio);
  const updatePortfolio = useStore(s => s.updatePortfolio);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', budget: '200', budgetType: 'Monthly' });

  const getCampaignsByPortfolio = (pid) => campaigns.filter(c => c.portfolioId === pid);

  const getPortfolioMetrics = (pid) => {
    const cs = getCampaignsByPortfolio(pid);
    return cs.reduce((acc, c) => ({
      spend: acc.spend + c.metrics.spend,
      sales: acc.sales + c.metrics.sales,
      impressions: acc.impressions + c.metrics.impressions,
      clicks: acc.clicks + c.metrics.clicks,
      orders: acc.orders + c.metrics.orders,
    }), { spend: 0, sales: 0, impressions: 0, clicks: 0, orders: 0 });
  };

  const handleCreate = () => {
    if (!form.name) return;
    addPortfolio({ ...form, budget: parseFloat(form.budget), status: 'Active' });
    setForm({ name: '', budget: '200', budgetType: 'Monthly' });
    setShowCreate(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Portfolios</h1>
          <p className="page-subtitle">Organize campaigns and set shared budgets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create portfolio</button>
      </div>

      <div className="portfolio-grid">
        {portfolios.map(p => {
          const metrics = getPortfolioMetrics(p.id);
          const cs = getCampaignsByPortfolio(p.id);
          const budgetUsed = metrics.spend;
          const budgetPct = Math.min(100, (budgetUsed / p.budget) * 100).toFixed(0);
          return (
            <div key={p.id} className="portfolio-card">
              <div className="portfolio-card-header">
                <div>
                  <h3>{p.name}</h3>
                  <span className="info-chip">{cs.length} campaigns</span>
                </div>
                <button className="icon-btn"><Edit2 size={14} /></button>
              </div>
              <div className="budget-bar-wrap">
                <div className="budget-labels">
                  <span>Budget: {formatCurrency(p.budget)}/{p.budgetType.toLowerCase()}</span>
                  <span>{budgetPct}% used</span>
                </div>
                <div className="budget-bar">
                  <div className="budget-fill" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? '#f44336' : '#e47911' }} />
                </div>
              </div>
              <div className="portfolio-metrics">
                <div className="pm"><label>Spend</label><span>{formatCurrency(metrics.spend)}</span></div>
                <div className="pm"><label>Sales</label><span>{formatCurrency(metrics.sales)}</span></div>
                <div className="pm"><label>Orders</label><span>{formatNumber(metrics.orders)}</span></div>
                <div className="pm"><label>ACOS</label><span>{metrics.sales ? (metrics.spend / metrics.sales * 100).toFixed(1) : 0}%</span></div>
              </div>
              <div className="portfolio-campaigns">
                {cs.map(c => (
                  <div key={c.id} className="portfolio-campaign-item">
                    <span className={`status-dot ${c.status === 'Enabled' ? 'green' : 'yellow'}`} />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create portfolio</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Portfolio name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Q1 2024 Campaigns" />
                </div>
                <div className="form-group">
                  <label>Budget cap</label>
                  <input type="number" className="form-input" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Budget type</label>
                  <select className="form-input" value={form.budgetType} onChange={e => setForm(f => ({ ...f, budgetType: e.target.value }))}>
                    <option>Monthly</option><option>Lifetime</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create portfolio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
