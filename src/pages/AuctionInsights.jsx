import { useState } from 'react';
import { useStore } from '../store/useStore';
import { simulateAuction, formatCurrency, formatPercent } from '../utils/simulation';
import { TrendingUp, Award } from 'lucide-react';

const COMPETITORS = ['Competitor A', 'Competitor B', 'Competitor C', 'Competitor D', 'Competitor E'];

export default function AuctionInsights() {
  const keywords = useStore(s => s.keywords);
  const [selectedKw, setSelectedKw] = useState(keywords[0] || null);
  const [auctionResult, setAuctionResult] = useState(null);

  const runAuction = (kw) => {
    setSelectedKw(kw);
    setAuctionResult(simulateAuction(kw, COMPETITORS));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Auction Insights</h1>
          <p className="page-subtitle">Understand how your ads compete in real-time auctions</p>
        </div>
      </div>

      <div className="auction-layout">
        <div className="table-card auction-kw-list">
          <h3>Select a keyword to simulate</h3>
          {keywords.map(k => (
            <button
              key={k.id}
              className={`auction-kw-item ${selectedKw?.id === k.id ? 'selected' : ''}`}
              onClick={() => runAuction(k)}
            >
              <div className="kw-name">{k.keyword}</div>
              <div className="kw-meta">
                <span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span>
                <span>Bid: {formatCurrency(k.bid)}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="auction-result">
          {!auctionResult ? (
            <div className="empty-state">
              <TrendingUp size={48} color="#ccc" />
              <p>Select a keyword to run an auction simulation</p>
            </div>
          ) : (
            <>
              <div className="table-card">
                <div className="auction-header">
                  <h3>Auction result for "{selectedKw.keyword}"</h3>
                  <div className="auction-stats">
                    <div className="auction-stat">
                      <label>Your position</label>
                      <div className="position-badge">#{auctionResult.position}</div>
                    </div>
                    <div className="auction-stat">
                      <label>Quality score</label>
                      <div className={`quality-score ${auctionResult.qualityScore >= 8 ? 'good' : auctionResult.qualityScore >= 6 ? 'ok' : 'bad'}`}>
                        {auctionResult.qualityScore}/10
                      </div>
                    </div>
                    <div className="auction-stat">
                      <label>Actual CPC</label>
                      <div className="metric-highlight">{formatCurrency(auctionResult.actualCpc)}</div>
                    </div>
                    <div className="auction-stat">
                      <label>Your bid</label>
                      <div className="metric-highlight">{formatCurrency(selectedKw.bid)}</div>
                    </div>
                  </div>
                </div>

                <div className="auction-table-wrap">
                  <table className="ads-table">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Advertiser</th>
                        <th>Bid</th>
                        <th>Quality score</th>
                        <th>Ad rank score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auctionResult.allScores.map((s, i) => (
                        <tr key={i} className={s.name === 'Your Ad' ? 'your-row' : ''}>
                          <td>
                            {i === 0 && <Award size={14} color="#e47911" />} #{i + 1}
                          </td>
                          <td><strong>{s.name}</strong></td>
                          <td>{formatCurrency(s.bid)}</td>
                          <td>
                            <div className="quality-bar">
                              <div className="quality-fill" style={{ width: `${s.quality * 10}%`, background: s.quality >= 8 ? '#4caf50' : s.quality >= 6 ? '#e47911' : '#f44336' }} />
                              <span>{s.quality}/10</span>
                            </div>
                          </td>
                          <td>{s.score.toFixed(3)}</td>
                          <td>
                            <span className={`status-badge ${i < 3 ? 'badge-green' : 'badge-gray'}`}>
                              {i < 3 ? 'Showing' : 'Not shown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="auction-explanation table-card">
                <h3>How the auction works</h3>
                <div className="auction-steps">
                  <div className="auction-step">
                    <div className="step-num">1</div>
                    <div>
                      <strong>Ad Rank = Bid × Quality Score</strong>
                      <p>Your ad rank: {selectedKw.bid} × {auctionResult.qualityScore}/10 = <strong>{(selectedKw.bid * auctionResult.qualityScore / 10).toFixed(3)}</strong></p>
                    </div>
                  </div>
                  <div className="auction-step">
                    <div className="step-num">2</div>
                    <div>
                      <strong>Positions assigned by rank</strong>
                      <p>The advertiser with the highest ad rank wins position #1</p>
                    </div>
                  </div>
                  <div className="auction-step">
                    <div className="step-num">3</div>
                    <div>
                      <strong>You pay the next advertiser's rank ÷ your quality</strong>
                      <p>Actual CPC = <strong>{formatCurrency(auctionResult.actualCpc)}</strong> (not your max bid of {formatCurrency(selectedKw.bid)})</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
