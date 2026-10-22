import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleHelp, Search } from 'lucide-react';
import Info from '../../../components/console/InfoGlyph';
import { AMAZON_AUDIENCES, MAX_AUDIENCE_ADJUSTMENT, DYNAMIC_UP_FACTOR } from './constants';

const PLACEMENT_LABELS = { top: 'Top of search (first page)', rest: 'Rest of search', product: 'Product pages' };
const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

/**
 * Bid adjustments → Audiences. "Increase bids" requires picking an Amazon-built
 * audience; the helper line shows how far a bid can rise for it.
 */
export function AudienceAdjustments({ value, onChange, baseBid, strategy, isReadOnly }) {
  const [isPicking, setIsPicking] = useState(false);
  const [query, setQuery] = useState('');
  const isOn = value.mode === 'increase';
  const audience = AMAZON_AUDIENCES.find(a => a.key === value.audience);
  const pct = parseFloat(value.pct) || 0;
  const isDynamicUp = strategy === 'Dynamic bids - up and down';
  const maxBid = baseBid * (1 + pct / 100) * (isDynamicUp ? DYNAMIC_UP_FACTOR : 1);
  const set = (patch) => onChange({ ...value, ...patch });

  if (isReadOnly) {
    return <p className="sb-muted">{isOn && audience ? `${audience.label}: +${pct}%` : 'Do not increase bids for an audience'}</p>;
  }

  return (
    <div className="sb-audiences">
      <label className="sb-radio"><input type="radio" checked={isOn} onChange={() => set({ mode: 'increase' })} /><span>Increase bids for audiences built by Amazon</span></label>
      <label className="sb-radio"><input type="radio" checked={!isOn} onChange={() => set({ mode: 'none' })} /><span>Do not increase bids for an audience</span></label>
      {isOn && (
        <div className="sb-audience-row">
          <strong>Audience</strong>
          <div className="sb-inline">
            <div className="sb-select-anchor">
              <button type="button" className="sb-select" onClick={() => setIsPicking(p => !p)}>
                {audience ? audience.label : 'Choose an audience'} <ChevronDown size={14} />
              </button>
              {isPicking && (
                <div className="sb-menu">
                  <label className="sb-menu-search"><Search size={14} /><input autoFocus placeholder="Choose an audience" value={query} onChange={e => setQuery(e.target.value)} /></label>
                  {AMAZON_AUDIENCES.filter(a => a.label.toLowerCase().includes(query.toLowerCase())).map(a => (
                    <button type="button" key={a.key} className="sb-menu-item" onClick={() => { set({ audience: a.key }); setIsPicking(false); }}>
                      {a.label} - {a.id} <Info size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="sb-pct"><input value={value.pct} onChange={e => set({ pct: e.target.value })} /> %</span>
          </div>
          <p className="sb-muted">
            With {strategy.toLowerCase().startsWith('dynamic') ? strategy.charAt(0).toLowerCase() + strategy.slice(1) : 'fixed bids'}, a {fmt(baseBid)} bid can be up to {fmt(maxBid)} for this audience.
          </p>
          {!audience && <p className="sb-error">Add a bid adjustments audience</p>}
          {pct > MAX_AUDIENCE_ADJUSTMENT && <p className="sb-error">Enter a value between 0% and {MAX_AUDIENCE_ADJUSTMENT}%</p>}
        </div>
      )}
    </div>
  );
}

/** Right-hand "N adjustments applied" card. */
export function AdjustmentSummary({ placements, strategy, audience }) {
  const [isOpen, setIsOpen] = useState(true);
  const active = Object.entries(placements).filter(([, v]) => parseFloat(v) > 0);
  const aud = audience?.mode === 'increase' ? AMAZON_AUDIENCES.find(a => a.key === audience.audience) : null;
  const count = (active.length ? 1 : 0) + 1 + (aud ? 1 : 0);
  return (
    <aside className="sb-adj-summary">
      <button type="button" className="sb-adj-toggle" onClick={() => setIsOpen(o => !o)}>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {count} adjustment{count === 1 ? '' : 's'} applied
      </button>
      {isOpen && (
        <>
          {active.length > 0 && (
            <div className="sb-adj-group">
              <span className="sb-adj-label">PLACEMENT</span>
              {active.map(([k, v]) => <div key={k} className="sb-adj-line"><span>{PLACEMENT_LABELS[k]}</span><span>+{parseFloat(v)}%</span></div>)}
            </div>
          )}
          {aud && (
            <div className="sb-adj-group">
              <span className="sb-adj-label">AUDIENCE</span>
              <div className="sb-adj-line"><span>{aud.label}</span><span>+{parseFloat(audience.pct) || 0}%</span></div>
            </div>
          )}
          <div className="sb-adj-group">
            <span className="sb-adj-label">BIDDING STRATEGY</span>
            <div className="sb-adj-line"><span>{strategy}</span></div>
          </div>
        </>
      )}
    </aside>
  );
}

const PERIODS = ['Weekly', 'Daily'];
const range = ([a, b]) => `${a.toLocaleString('en-IN')} - ${b.toLocaleString('en-IN')}`;

/** Right rail "Forecast (Beta)" panel; content comes from utils/spForecast. */
export function ForecastPanel({ forecast, period, onPeriod }) {
  const [isPicking, setIsPicking] = useState(false);
  const isEstimate = forecast.kind === 'estimate';
  return (
    <aside className="sb-forecast">
      <h2 className="sb-forecast-title">Forecast <Info size={15} /> <span className="sb-badge">Beta</span></h2>
      <p className="sb-forecast-desc">Estimates of performance are based on historical campaigns with similar targeting and bids.</p>
      <a href="#forecasts" className="sb-help sb-help-underline" onClick={e => e.preventDefault()}><CircleHelp size={13} /> Learn about forecasts</a>
      <div className="sb-select-anchor sb-period-wrap">
        <button type="button" className="sb-period" disabled={!isEstimate} onClick={() => setIsPicking(p => !p)}>{period} <ChevronDown size={14} /></button>
        {isPicking && (
          <div className="sb-menu">
            {PERIODS.map(p => <button type="button" key={p} className="sb-menu-item" onClick={() => { onPeriod(p); setIsPicking(false); }}>{p}</button>)}
          </div>
        )}
      </div>
      <div className="sb-forecast-row">Cost type: CPC</div>
      <div className="sb-forecast-metric"><span>Clicks <Info size={13} /></span><span>{isEstimate ? range(forecast.clicks) : '—'}</span></div>
      <div className="sb-forecast-metric"><span>Orders <Info size={13} /></span><span>{isEstimate ? range(forecast.orders) : '—'}</span></div>
      <div className="sb-forecast-foot">
        {forecast.kind === 'todo' && (<><p>{forecast.title}</p><ul>{forecast.items.map(i => <li key={i}>{i}</li>)}</ul></>)}
        {forecast.kind === 'unavailable' && (<><p>Forecast not available for these settings:</p><ul>{forecast.items.map(i => <li key={i}>{i}</li>)}</ul></>)}
        {forecast.kind === 'message' && <p>{forecast.text}</p>}
        {isEstimate && <p>Forecasts are estimates, not guarantees of performance.</p>}
      </div>
    </aside>
  );
}
