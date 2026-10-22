import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Info from './InfoGlyph';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { METRICS, SERIES_COLORS, formatMetric } from './metrics';

const MAX_TILES = 4;
const CHART_HEIGHT = 220;
const ADDABLE = ['impressions', 'clicks', 'spend', 'orders', 'sales', 'acos', 'roas', 'ctr', 'cpc'];

/** Tile-style metric selector + chart used on Targeting, Budgets and Portfolios. */
export default function MetricTiles({ initial, totals, series, extraMetrics = {} }) {
  const [tiles, setTiles] = useState(initial);
  const [isPicking, setIsPicking] = useState(false);
  const label = (k) => extraMetrics[k]?.label || METRICS[k]?.label;
  const fmt = (k, v) => (extraMetrics[k]?.format ? extraMetrics[k].format(v) : formatMetric(k, v));
  const agg = (k) => extraMetrics[k]?.agg || METRICS[k]?.agg || 'TOTAL';
  const chartKeys = tiles.filter(k => series?.length && series[0][k] !== undefined);
  const hasData = series?.some(r => chartKeys.some(k => r[k] > 0));

  return (
    <div className="mt">
      <div className="mt-row">
        {tiles.map((k, i) => (
          <div key={k} className="mt-tile" style={{ borderTopColor: SERIES_COLORS[i] }}>
            <div className="mt-tile-head">
              <span>{label(k)} <Info size={12} /></span>
              <button type="button" aria-label={`Remove ${label(k)}`} onClick={() => setTiles(t => t.filter(x => x !== k))}><X size={14} /></button>
            </div>
            <div className="mt-tile-value">{totals && totals[k] ? fmt(k, totals[k]) : '—'} <small>{agg(k)}</small></div>
          </div>
        ))}
        {tiles.length < MAX_TILES && (
          <div className="cx-pop-anchor mt-add-wrap">
            <button type="button" className="mt-add" onClick={() => setIsPicking(true)}><Plus size={14} /> Add metric</button>
            {isPicking && (
              <>
                <div className="drp-scrim" onClick={() => setIsPicking(false)} />
                <div className="cx-pop" style={{ top: 52, right: 0 }}>
                  {ADDABLE.filter(k => !tiles.includes(k)).map(k => (
                    <button key={k} type="button" className="cx-pop-item" onClick={() => { setTiles(t => [...t, k]); setIsPicking(false); }}>{METRICS[k].label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-chart cx-card">
        {hasData ? (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={series} margin={{ top: 12, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid stroke="#ececec" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#565959' }} tickLine={false} minTickGap={24} />
              {chartKeys.map(k => <YAxis key={k} yAxisId={k} hide />)}
              <Tooltip formatter={(v, name) => [fmt(name, v), label(name)]} />
              {chartKeys.map(k => (
                <Line key={k} yAxisId={k} dataKey={k} type="monotone" dot={false} strokeWidth={2} isAnimationActive={false} stroke={SERIES_COLORS[tiles.indexOf(k)]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="cx-empty"><h3>No data available</h3><p>Please try adjusting your filters to see performance data</p></div>
        )}
      </div>
    </div>
  );
}
