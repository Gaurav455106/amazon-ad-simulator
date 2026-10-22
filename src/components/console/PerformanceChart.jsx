import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, Maximize2 } from 'lucide-react';
import Info from './InfoGlyph';
import { METRICS, SERIES_COLORS, formatMetric } from './metrics';

const SELECTABLE = ['impressions', 'clicks', 'spend', 'orders', 'sales', 'ctr', 'cpc', 'acos', 'roas', 'dpv', 'ntbOrders', 'ntbSales'];
const CHART_HEIGHT = 260;

function MetricSlot({ metricKey, color, value, usedKeys, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="pc-slot">
      <div className="pc-slot-head">
        <button type="button" className="pc-slot-btn" onClick={() => setIsOpen(o => !o)} aria-label={`Select a metric ${METRICS[metricKey].label}`}>
          {METRICS[metricKey].label} <ChevronDown size={14} />
        </button>
        <Info size={14} className="pc-info" />
      </div>
      <div className="pc-slot-value">
        <span className="pc-swatch" style={{ background: color }} />
        {value === null ? '—' : formatMetric(metricKey, value)}
      </div>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="cx-pop pc-pop">
            {SELECTABLE.map(k => (
              <button
                type="button"
                key={k}
                className={`cx-pop-item ${k === metricKey ? 'is-active' : ''}`}
                disabled={k !== metricKey && usedKeys.includes(k)}
                onClick={() => { onChange(k); setIsOpen(false); }}
              >
                {METRICS[k].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * @param {{ series: Array<object>, totals: object, title?: string, subtitle?: string,
 *           initialMetrics?: string[] }} props
 */
export default function PerformanceChart({ series, totals, title = 'Performance', subtitle, initialMetrics }) {
  const [slots, setSlots] = useState(initialMetrics || ['clicks', 'spend', 'orders', 'ntbSales']);
  const hasData = series.some(row => slots.some(k => row[k] > 0));

  return (
    <section className="pc cx-card">
      <div className="pc-head">
        <h2 className="pc-title">{title}</h2>
        {subtitle && <span className="pc-subtitle">{subtitle}</span>}
        <button type="button" className="cx-tool-btn pc-expand" aria-label="View chart only"><Maximize2 size={16} /></button>
      </div>
      <div className="pc-slots">
        {slots.map((k, i) => (
          <MetricSlot
            key={i}
            metricKey={k}
            color={SERIES_COLORS[i]}
            value={hasData ? totals[k] : null}
            usedKeys={slots}
            onChange={(next) => setSlots(s => s.map((x, j) => (j === i ? next : x)))}
          />
        ))}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={series} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
            <CartesianGrid stroke="#ececec" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#565959' }} tickLine={false} axisLine={{ stroke: '#d5d9d9' }} minTickGap={24} />
            {slots.map(k => <YAxis key={k} yAxisId={k} hide domain={[0, 'auto']} />)}
            <Tooltip formatter={(v, name) => [formatMetric(name, v), METRICS[name]?.label]} labelStyle={{ fontWeight: 700 }} />
            {slots.map((k, i) => (
              <Line key={k} yAxisId={k} type="monotone" dataKey={k} stroke={SERIES_COLORS[i]} strokeWidth={2} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="cx-empty">
          <h3>No data</h3>
          <p>To see the chart, choose different metrics or filters</p>
        </div>
      )}
    </section>
  );
}
