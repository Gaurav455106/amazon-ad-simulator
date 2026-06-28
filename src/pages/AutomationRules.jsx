import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Zap, Play, Pause, Trash2 } from 'lucide-react';

const INITIAL_RULES = [
  { id: 'r1', name: 'Pause high ACOS keywords', condition: 'ACOS > 40%', action: 'Pause keyword', frequency: 'Daily', status: 'Active', lastRun: '6 hours ago', affected: 2 },
  { id: 'r2', name: 'Increase bid for top performers', condition: 'ROAS > 10x AND Impressions > 500', action: 'Increase bid by 10%', frequency: 'Weekly', status: 'Active', lastRun: '2 days ago', affected: 3 },
  { id: 'r3', name: 'Budget alert', condition: 'Daily spend > 90% of budget', action: 'Send email notification', frequency: 'Daily', status: 'Paused', lastRun: '5 days ago', affected: 0 },
];

const CONDITIONS = ['ACOS > %', 'ACOS < %', 'ROAS > x', 'ROAS < x', 'Spend > $', 'Clicks < ', 'Impressions < ', 'CTR < %'];
const ACTIONS = ['Pause keyword', 'Enable keyword', 'Increase bid by %', 'Decrease bid by %', 'Set bid to $', 'Pause campaign', 'Send email notification', 'Increase budget by %'];

export default function AutomationRules() {
  const campaigns = useStore(s => s.campaigns);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', condition: CONDITIONS[0], conditionValue: '40', action: ACTIONS[0], frequency: 'Daily', appliesTo: 'All campaigns' });

  const toggleRule = (id) => setRules(rs => rs.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r));
  const deleteRule = (id) => setRules(rs => rs.filter(r => r.id !== id));

  const handleCreate = () => {
    if (!form.name) return;
    setRules(rs => [...rs, { id: `r${Date.now()}`, ...form, lastRun: 'Never', affected: 0 }]);
    setShowCreate(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Automation Rules</h1>
          <p className="page-subtitle">Automatically optimize your campaigns based on performance rules</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create rule</button>
      </div>

      <div className="info-banner">
        <Zap size={14} color="#e47911" />
        <span>Automation rules run at the frequency you set and apply changes automatically. Review the log to see what was changed.</span>
      </div>

      <div className="table-card">
        <table className="ads-table">
          <thead>
            <tr>
              <th>Status</th><th>Rule name</th><th>Condition</th><th>Action</th>
              <th>Frequency</th><th>Last run</th><th>Items affected</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td>
                  <button className={`status-toggle ${r.status === 'Active' ? 'on' : 'off'}`} onClick={() => toggleRule(r.id)} />
                </td>
                <td><strong>{r.name}</strong></td>
                <td><code className="condition-code">{r.condition}</code></td>
                <td>{r.action}</td>
                <td>{r.frequency}</td>
                <td>{r.lastRun}</td>
                <td>{r.affected}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-xs btn-secondary" onClick={() => alert('Rule log coming soon...')}>View log</button>
                    <button className="icon-btn-sm" onClick={() => deleteRule(r.id)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create automation rule</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Rule name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Pause unprofitable keywords" />
                </div>
                <div className="form-group full">
                  <label>Applies to</label>
                  <select className="form-input" value={form.appliesTo} onChange={e => setForm(f => ({ ...f, appliesTo: e.target.value }))}>
                    <option>All campaigns</option>
                    {campaigns.map(c => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>If condition</label>
                  <select className="form-input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input type="number" className="form-input" value={form.conditionValue} onChange={e => setForm(f => ({ ...f, conditionValue: e.target.value }))} />
                </div>
                <div className="form-group full">
                  <label>Then action</label>
                  <select className="form-input" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
                    {ACTIONS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Run frequency</label>
                  <select className="form-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    <option>Daily</option><option>Weekly</option><option>Monthly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
