import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ label, value, change, changeType, prefix = '', suffix = '', highlight }) {
  const positive = changeType === 'positive';
  return (
    <div className={`metric-card ${highlight ? 'highlighted' : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{prefix}{value}{suffix}</div>
      {change !== undefined && (
        <div className={`metric-change ${positive ? 'up' : 'down'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  );
}
