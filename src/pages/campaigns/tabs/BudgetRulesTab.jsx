import { useState } from 'react';
import { X } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { useStore } from '../../../store/useStore';
import { localISODate } from '../../../utils/dateRanges';

const RULE_TYPES = [
  { key: 'schedule', label: 'Schedule', hint: 'Increase budget for a date range, such as a sale event.' },
  { key: 'performance', label: 'Performance', hint: 'Increase budget when a performance metric meets a threshold.' },
];
const PERF_METRICS = ['ROAS', 'ACOS', 'CTR', 'CVR'];
const MAX_INCREASE = 900;

const today = () => localISODate();

function ruleStatus(rule) {
  if (rule.type !== 'schedule') return 'Active';
  const t = today();
  if (rule.endDate && rule.endDate < t) return 'Ended';
  if (rule.startDate > t) return 'Scheduled';
  return 'Active';
}

function ruleDescription(rule) {
  if (rule.type === 'schedule') return `Increase budget by ${rule.increase}% from ${rule.startDate} to ${rule.endDate || 'no end date'}`;
  return `Increase budget by ${rule.increase}% when ${rule.metric} is ${rule.metric === 'ACOS' ? 'less than' : 'greater than'} ${rule.threshold}`;
}

function AddRuleModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', type: 'schedule', startDate: today(), endDate: '', metric: 'ROAS', threshold: '3', increase: '20' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const increase = parseFloat(form.increase);
  const error = !form.name.trim() ? 'Enter a rule name'
    : Number.isNaN(increase) || increase <= 0 || increase > MAX_INCREASE ? `Budget increase must be between 1% and ${MAX_INCREASE}%`
      : form.type === 'schedule' && form.endDate && form.endDate < form.startDate ? 'End date must be after start date'
        : null;

  return (
    <div className="cx-modal-overlay" onClick={onClose}>
      <div className="cx-modal" style={{ width: 'min(600px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="cx-modal-head">
          <h2>Add budget rule</h2>
          <button type="button" className="cx-tool-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="cx-modal-body form-stack">
          <label>Rule name<input className="cx-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Diwali budget boost" /></label>
          <fieldset>
            <legend>Rule type</legend>
            {RULE_TYPES.map(t => (
              <label key={t.key} className="radio-row">
                <input type="radio" checked={form.type === t.key} onChange={() => set('type', t.key)} />
                <span><strong>{t.label}</strong><small>{t.hint}</small></span>
              </label>
            ))}
          </fieldset>
          {form.type === 'schedule' ? (
            <div className="form-inline">
              <label>Start date<input type="date" className="cx-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></label>
              <label>End date<input type="date" className="cx-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></label>
            </div>
          ) : (
            <div className="form-inline">
              <label>Metric<select className="cx-input" value={form.metric} onChange={e => set('metric', e.target.value)}>{PERF_METRICS.map(m => <option key={m}>{m}</option>)}</select></label>
              <label>Threshold<input className="cx-input" value={form.threshold} onChange={e => set('threshold', e.target.value)} /></label>
            </div>
          )}
          <label>Increase budget by (%) <Info size={13} /><input className="cx-input" value={form.increase} onChange={e => set('increase', e.target.value)} /></label>
          {error && <p className="form-error">{error}</p>}
        </div>
        <div className="cx-modal-foot">
          <button type="button" className="cx-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="cx-btn cx-btn-primary" disabled={!!error}
            onClick={() => { onSave({ ...form, id: `br${Date.now()}`, increase, name: form.name.trim() }); onClose(); }}>
            Add rule
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetRulesTab({ campaign }) {
  const updateCampaign = useStore(s => s.updateCampaign);
  const [isAdding, setIsAdding] = useState(false);
  const rules = campaign.budgetRules || [];

  return (
    <>
      <div className="cx-toolbar">
        <button type="button" className="cx-btn cx-btn-primary" onClick={() => setIsAdding(true)}>Add budget rule</button>
      </div>
      <div className="cx-table-wrap">
        <table className="cx-table">
          <thead><tr><th>Rule name</th><th>Type</th><th>Status</th><th className="is-num">Budget increase</th><th>Description</th><th /></tr></thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{RULE_TYPES.find(t => t.key === r.type)?.label}</td>
                <td><span className="cx-status">{ruleStatus(r)}</span></td>
                <td className="is-num">{r.increase}%</td>
                <td>{ruleDescription(r)}</td>
                <td><button type="button" className="cx-link" onClick={() => updateCampaign(campaign.id, { budgetRules: rules.filter(x => x.id !== r.id) })}>Remove</button></td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={6}><div className="cx-empty"><h3>No budget rules</h3><p>Add a rule to raise this campaign&apos;s budget for events or when performance is strong.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
      {isAdding && <AddRuleModal onClose={() => setIsAdding(false)} onSave={(rule) => updateCampaign(campaign.id, { budgetRules: [...rules, rule] })} />}
    </>
  );
}
