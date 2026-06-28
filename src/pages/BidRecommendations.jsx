import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { getBidRecommendations, formatCurrency, formatNumber } from '../utils/simulation';
import { Zap, TrendingUp } from 'lucide-react';

export default function BidRecommendations() {
  const keywords = useStore(s => s.keywords);
  const updateKeyword = useStore(s => s.updateKeyword);
  const [applied, setApplied] = useState({});

  const recs = useMemo(() => getBidRecommendations(keywords), [keywords]);

  const applyBid = (k) => {
    updateKeyword(k.id, { bid: k.suggestedBid });
    setApplied(prev => ({ ...prev, [k.id]: true }));
  };

  const applyAll = () => {
    recs.forEach(k => applyBid(k));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bid Recommendations</h1>
          <p className="page-subtitle">Amazon-suggested bids based on auction data and competition</p>
        </div>
        <button className="btn btn-primary" onClick={applyAll}><Zap size={14} /> Apply all recommended bids</button>
      </div>

      <div className="info-banner">
        <Zap size={14} color="#e47911" />
        <span>Bids are calculated based on recent auction data. Applying suggested bids may increase your ad visibility and competitiveness.</span>
      </div>

      <div className="table-card">
        <table className="ads-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Match type</th>
              <th>Current bid</th>
              <th>Suggested bid</th>
              <th>Bid range</th>
              <th>Est. clicks</th>
              <th>Est. impressions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recs.map(k => {
              const diff = k.suggestedBid - k.bid;
              const pct = (diff / k.bid * 100).toFixed(0);
              const isApplied = applied[k.id];
              return (
                <tr key={k.id}>
                  <td>{k.keyword}</td>
                  <td><span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span></td>
                  <td>{formatCurrency(k.bid)}</td>
                  <td>
                    <div className="suggested-bid-display">
                      <strong>{formatCurrency(k.suggestedBid)}</strong>
                      <span className={diff > 0 ? 'change-up' : 'change-down'}>
                        {diff > 0 ? '▲' : '▼'} {Math.abs(pct)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="bid-range-bar">
                      <span>{formatCurrency(k.suggestedBidRange[0])}</span>
                      <div className="range-bar">
                        <div className="range-fill" style={{ width: '60%' }} />
                        <div className="range-dot" />
                      </div>
                      <span>{formatCurrency(k.suggestedBidRange[1])}</span>
                    </div>
                  </td>
                  <td>{formatNumber(k.estimatedClicks)}</td>
                  <td>{formatNumber(k.estimatedImpressions)}</td>
                  <td>
                    {isApplied ? (
                      <span className="applied-badge">✓ Applied</span>
                    ) : (
                      <button className="btn btn-sm btn-orange" onClick={() => applyBid(k)}>Apply ₹{k.suggestedBid}</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
