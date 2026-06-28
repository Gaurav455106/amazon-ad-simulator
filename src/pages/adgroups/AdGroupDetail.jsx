import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSearchTerms } from '../../utils/simulation';
import { useStore } from '../../store/useStore';
import StatusBadge from '../../components/StatusBadge';
import DateRangePicker from '../../components/DateRangePicker';
import { Plus, Trash2, Zap } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/simulation';

const MATCH_TYPES = ['Exact', 'Phrase', 'Broad'];
const SUGGESTED_KEYWORDS = [
  'wireless headphones', 'bluetooth headphones', 'noise cancelling headphones',
  'over ear headphones', 'headphones with mic', 'gaming headphones',
  'studio headphones', 'wireless earbuds', 'sports headphones', 'foldable headphones'
];

export default function AdGroupDetail() {
  const { campaignId, adGroupId } = useParams();
  const navigate = useNavigate();
  const campaigns = useStore(s => s.campaigns);
  const adGroups = useStore(s => s.adGroups);
  const keywords = useStore(s => s.keywords);
  const addKeywords = useStore(s => s.addKeywords);
  const updateKeyword = useStore(s => s.updateKeyword);
  const deleteKeyword = useStore(s => s.deleteKeyword);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const deleteNegativeKeyword = useStore(s => s.deleteNegativeKeyword);
  const negativeKeywords = useStore(s => s.negativeKeywords);

  const campaign = campaigns.find(c => c.id === campaignId);
  const adGroup = adGroups.find(ag => ag.id === adGroupId);
  const agKeywords = keywords.filter(k => k.adGroupId === adGroupId);
  const agNKs = negativeKeywords.filter(nk => nk.adGroupId === adGroupId);

  const [activeTab, setActiveTab] = useState('keywords');
  const [showAddKw, setShowAddKw] = useState(false);
  const [kwText, setKwText] = useState('');
  const [defaultBid, setDefaultBid] = useState('0.75');
  const [matchType, setMatchType] = useState('Exact');
  const [editingBid, setEditingBid] = useState(null);
  const [bidValue, setBidValue] = useState('');
  const [nkText, setNkText] = useState('');
  const [nkMatch, setNkMatch] = useState('Exact');
  const [showAddNk, setShowAddNk] = useState(false);

  if (!campaign || !adGroup) return (
    <div className="page"><div className="empty-state">Not found. <button className="link-btn" onClick={() => navigate('/')}>Go back</button></div></div>
  );

  const handleAddKeywords = () => {
    const lines = kwText.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    addKeywords(lines.map(kw => ({
      adGroupId, campaignId, keyword: kw, matchType, bid: parseFloat(defaultBid), status: 'Enabled'
    })));
    setKwText('');
    setShowAddKw(false);
  };

  const addSuggested = (kw) => {
    addKeywords([{ adGroupId, campaignId, keyword: kw, matchType: 'Exact', bid: parseFloat(defaultBid), status: 'Enabled' }]);
  };

  const saveBid = (id) => {
    const val = parseFloat(bidValue);
    if (!isNaN(val) && val >= 0.02) updateKeyword(id, { bid: val });
    setEditingBid(null);
  };

  const handleAddNK = () => {
    const lines = nkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    addNegativeKeywords(lines.map(kw => ({ keyword: kw, matchType: nkMatch, campaignId, adGroupId, level: 'Ad Group' })));
    setNkText('');
    setShowAddNk(false);
  };

  return (
    <div className="page">
      <div className="breadcrumb">
        <button className="link-btn" onClick={() => navigate('/')}>Campaign Manager</button>
        <span> / </span>
        <button className="link-btn" onClick={() => navigate(`/campaigns/${campaignId}`)}>{campaign.name}</button>
        <span> / </span>
        <span>{adGroup.name}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{adGroup.name}</h1>
          <div className="campaign-info-row">
            <StatusBadge status={adGroup.status} />
            <span className="info-chip">Default bid: ₹{adGroup.defaultBid}</span>
            <span className="info-chip">{campaign.type}</span>
          </div>
        </div>
        <DateRangePicker />
      </div>

      <div className="metric-row">
        {[
          { l: 'Impressions', v: formatNumber(adGroup.metrics.impressions) },
          { l: 'Clicks', v: formatNumber(adGroup.metrics.clicks) },
          { l: 'Spend', v: formatCurrency(adGroup.metrics.spend) },
          { l: 'Orders', v: formatNumber(adGroup.metrics.orders) },
          { l: 'Sales', v: formatCurrency(adGroup.metrics.sales) },
        ].map(m => (
          <div key={m.l} className="mini-metric">
            <div className="mini-metric-label">{m.l}</div>
            <div className="mini-metric-value">{m.v}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {['keywords', 'negatives', 'products', 'search-terms'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'search-terms' ? 'Search terms' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'keywords' && (
        <div className="table-card">
          <div className="table-toolbar">
            <span>Keywords ({agKeywords.length})</span>
            <button className="btn btn-primary" onClick={() => setShowAddKw(true)}><Plus size={14} /> Add keywords</button>
          </div>

          {showAddKw && (
            <div className="add-kw-panel">
              <div className="add-kw-left">
                <label>Enter keywords (one per line)</label>
                <textarea className="form-textarea" rows={6} value={kwText} onChange={e => setKwText(e.target.value)} placeholder="wireless headphones&#10;bluetooth earbuds&#10;noise cancelling" />
                <div className="kw-options">
                  <div className="form-group">
                    <label>Match type</label>
                    <div className="btn-group">
                      {MATCH_TYPES.map(m => (
                        <button key={m} className={`btn btn-sm ${matchType === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMatchType(m)}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Default bid (₹)</label>
                    <input type="number" className="form-input" value={defaultBid} onChange={e => setDefaultBid(e.target.value)} style={{ width: 100 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleAddKeywords}>Add keywords</button>
                  <button className="btn btn-secondary" onClick={() => setShowAddKw(false)}>Cancel</button>
                </div>
              </div>
              <div className="add-kw-right">
                <label>Suggested keywords <Zap size={12} color="#e47911" /></label>
                <div className="suggested-list">
                  {SUGGESTED_KEYWORDS.filter(s => !agKeywords.find(k => k.keyword === s)).map(s => (
                    <div key={s} className="suggested-item">
                      <span>{s}</span>
                      <button className="btn btn-xs btn-secondary" onClick={() => addSuggested(s)}>Add</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <table className="ads-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Keyword</th>
                <th>Match type</th>
                <th>Bid</th>
                <th>Suggested bid</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Spend</th>
                <th>Orders</th>
                <th>Sales</th>
                <th>ACOS</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agKeywords.map(k => {
                const acos = k.metrics.sales ? (k.metrics.spend / k.metrics.sales * 100) : 0;
                const ctr = k.metrics.impressions ? (k.metrics.clicks / k.metrics.impressions * 100) : 0;
                return (
                  <tr key={k.id}>
                    <td>
                      <button className={`status-toggle ${k.status === 'Enabled' ? 'on' : 'off'}`}
                        onClick={() => updateKeyword(k.id, { status: k.status === 'Enabled' ? 'Paused' : 'Enabled' })} />
                    </td>
                    <td>{k.keyword}</td>
                    <td><span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span></td>
                    <td>
                      {editingBid === k.id ? (
                        <div className="inline-edit">
                          <span>₹</span>
                          <input autoFocus className="inline-input" value={bidValue} onChange={e => setBidValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveBid(k.id)} style={{ width: 60 }} />
                          <button className="btn btn-xs btn-primary" onClick={() => saveBid(k.id)}>✓</button>
                          <button className="btn btn-xs btn-secondary" onClick={() => setEditingBid(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="editable-cell" onClick={() => { setEditingBid(k.id); setBidValue(k.bid); }}>₹{k.bid}</button>
                      )}
                    </td>
                    <td className="suggested-bid-cell">
                      ₹{k.suggestedBid}
                      {k.suggestedBid > k.bid && (
                        <button className="btn btn-xs btn-orange" onClick={() => updateKeyword(k.id, { bid: k.suggestedBid })}>Apply</button>
                      )}
                    </td>
                    <td>{formatNumber(k.metrics.impressions)}</td>
                    <td>{formatNumber(k.metrics.clicks)}</td>
                    <td>{formatPercent(ctr)}</td>
                    <td>{formatCurrency(k.metrics.spend)}</td>
                    <td>{formatNumber(k.metrics.orders)}</td>
                    <td>{formatCurrency(k.metrics.sales)}</td>
                    <td className={acos > 30 ? 'bad-metric' : acos < 15 ? 'good-metric' : ''}>{formatPercent(acos)}</td>
                    <td><button className="icon-btn-sm" onClick={() => deleteKeyword(k.id)}><Trash2 size={12} /></button></td>
                  </tr>
                );
              })}
              {agKeywords.length === 0 && (
                <tr><td colSpan={13} className="empty-row">No keywords yet. <button className="link-btn" onClick={() => setShowAddKw(true)}>Add keywords</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'negatives' && (
        <div className="table-card">
          <div className="table-toolbar">
            <span>Negative keywords ({agNKs.length})</span>
            <button className="btn btn-primary" onClick={() => setShowAddNk(true)}><Plus size={14} /> Add negatives</button>
          </div>
          {showAddNk && (
            <div className="inline-form" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <textarea className="form-textarea" rows={4} value={nkText} onChange={e => setNkText(e.target.value)} placeholder="One keyword per line" />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select className="form-input" value={nkMatch} onChange={e => setNkMatch(e.target.value)}>
                  <option>Exact</option><option>Phrase</option>
                </select>
                <button className="btn btn-primary" onClick={handleAddNK}>Add</button>
                <button className="btn btn-secondary" onClick={() => setShowAddNk(false)}>Cancel</button>
              </div>
            </div>
          )}
          <table className="ads-table">
            <thead><tr><th>Keyword</th><th>Match type</th><th>Level</th><th>Actions</th></tr></thead>
            <tbody>
              {agNKs.map(nk => (
                <tr key={nk.id}>
                  <td>{nk.keyword}</td>
                  <td><span className="match-badge">{nk.matchType}</span></td>
                  <td>{nk.level}</td>
                  <td><button className="icon-btn-sm" onClick={() => deleteNegativeKeyword(nk.id)}><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="table-card">
          <p className="info-box">Products targeting allows you to show ads on specific product detail pages.</p>
          <table className="ads-table">
            <thead><tr><th>ASIN</th><th>Product name</th><th>Bid</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td colSpan={4} className="empty-row">No product targets. Add products to target competitor or complementary listings.</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'search-terms' && (
        <SearchTermsTab keywords={agKeywords} />
      )}
    </div>
  );
}

function SearchTermsTab({ keywords }) {
  const [terms] = useState(() => getSearchTerms(keywords));

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <span>Search term report ({terms.length} terms)</span>
      </div>
      <table className="ads-table">
        <thead>
          <tr>
            <th>Search term</th><th>Targeting keyword</th><th>Match type</th>
            <th>Impressions</th><th>Clicks</th><th>CTR</th><th>Spend</th><th>Orders</th><th>ACOS</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((t, i) => (
            <tr key={i}>
              <td>{t.searchTerm}</td>
              <td>{t.keyword}</td>
              <td><span className="match-badge">{t.matchType}</span></td>
              <td>{formatNumber(t.impressions)}</td>
              <td>{formatNumber(t.clicks)}</td>
              <td>{formatPercent(t.ctr)}</td>
              <td>{formatCurrency(t.spend)}</td>
              <td>{t.orders}</td>
              <td className={t.acos > 30 ? 'bad-metric' : t.acos < 15 ? 'good-metric' : ''}>{formatPercent(t.acos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
