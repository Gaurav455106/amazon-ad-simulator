import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import StatusBadge from '../../components/StatusBadge';
import DateRangePicker from '../../components/DateRangePicker';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Plus, Trash2, Download, Search, Play, Pause,
  ChevronDown, Settings, Info, Zap
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, getBidRecommendations } from '../../utils/simulation';

const CHART_METRICS = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'spend', label: 'Spend' },
  { key: 'orders', label: 'Orders' },
  { key: 'sales', label: 'Sales' },
];

const PLACEMENT_DATA = [
  { placement: 'Top of search (first page)', impressions: 28400, clicks: 920, ctr: 3.24, spend: 32.40, cpc: 0.035, orders: 52, sales: 1480.00, acos: 2.19, roas: 45.68, adjustment: 0 },
  { placement: 'Rest of search', impressions: 19600, clicks: 540, ctr: 2.76, spend: 18.20, cpc: 0.034, orders: 28, sales: 798.00, acos: 2.28, roas: 43.85, adjustment: 0 },
  { placement: 'Product pages', impressions: 11200, clicks: 220, ctr: 1.96, spend: 8.90, cpc: 0.040, orders: 11, sales: 313.50, acos: 2.84, roas: 35.22, adjustment: 0 },
];

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaigns = useStore(s => s.campaigns);
  const adGroups = useStore(s => s.adGroups);
  const keywords = useStore(s => s.keywords);
  const negativeKeywords = useStore(s => s.negativeKeywords);
  const chartData = useStore(s => s.chartData);
  const addAdGroup = useStore(s => s.addAdGroup);
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const deleteAdGroup = useStore(s => s.deleteAdGroup);
  const updateCampaign = useStore(s => s.updateCampaign);
  const toggleCampaignStatus = useStore(s => s.toggleCampaignStatus);
  const addNegativeKeywords = useStore(s => s.addNegativeKeywords);
  const deleteNegativeKeyword = useStore(s => s.deleteNegativeKeyword);
  const addKeywords = useStore(s => s.addKeywords);
  const updateKeyword = useStore(s => s.updateKeyword);
  const deleteKeyword = useStore(s => s.deleteKeyword);
  const sbAds = useStore(s => s.sbAds || []);

  const campaign = campaigns.find(c => c.id === id);
  const campaignAdGroups = adGroups.filter(ag => ag.campaignId === id);
  const campaignKeywords = keywords.filter(k => k.campaignId === id);
  const campaignNKs = negativeKeywords.filter(nk => nk.campaignId === id);

  const [activeTab, setActiveTab] = useState('adgroups');
  const [chartMetric, setChartMetric] = useState('spend');
  const [chartType, setChartType] = useState('line');

  // Ad groups tab state
  const [agSearch, setAgSearch] = useState('');
  const [agSelected, setAgSelected] = useState([]);
  const [showAddAG, setShowAddAG] = useState(false);
  const [agForm, setAgForm] = useState({ name: '', defaultBid: '25' });
  const [editingAgBid, setEditingAgBid] = useState(null);
  const [agBidValue, setAgBidValue] = useState('');

  // Targeting tab state
  const [kwSearch, setKwSearch] = useState('');
  const [kwSelected, setKwSelected] = useState([]);
  const [showAddKw, setShowAddKw] = useState(false);
  const [kwText, setKwText] = useState('');
  const [kwMatchType, setKwMatchType] = useState('Exact');
  const [kwBid, setKwBid] = useState('25');
  const [kwAdGroup, setKwAdGroup] = useState('');
  const [editingKwBid, setEditingKwBid] = useState(null);
  const [kwBidValue, setKwBidValue] = useState('');

  // Neg kw state
  const [nkText, setNkText] = useState('');
  const [nkMatch, setNkMatch] = useState('Exact');
  const [nkAdGroup, setNkAdGroup] = useState('campaign');
  const [showAddNK, setShowAddNK] = useState(false);
  const [nkSearch, setNkSearch] = useState('');

  // Bidding strategy / placements state
  const [placements, setPlacements] = useState(PLACEMENT_DATA);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  if (!campaign) return (
    <div className="page">
      <div className="empty-state">Campaign not found. <button className="link-btn" onClick={() => navigate('/')}>← Back to Campaign Manager</button></div>
    </div>
  );

  // ── Ad group helpers ──
  const filteredAGs = useMemo(() => {
    let list = campaignAdGroups;
    if (agSearch) list = list.filter(ag => ag.name.toLowerCase().includes(agSearch.toLowerCase()));
    return list;
  }, [campaignAdGroups, agSearch]);

  const toggleAgSelect = (id) => setAgSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllAGs = () => setAgSelected(agSelected.length === filteredAGs.length ? [] : filteredAGs.map(ag => ag.id));

  const handleAddAG = () => {
    if (!agForm.name) return;
    addAdGroup({ campaignId: id, name: agForm.name, status: 'Enabled', defaultBid: parseFloat(agForm.defaultBid) });
    setAgForm({ name: '', defaultBid: '25' });
    setShowAddAG(false);
  };

  const saveAgBid = (agId) => {
    const val = parseFloat(agBidValue);
    if (!isNaN(val) && val > 0) updateAdGroup(agId, { defaultBid: val });
    setEditingAgBid(null);
  };

  // ── Keyword helpers ──
  const filteredKws = useMemo(() => {
    let list = campaignKeywords;
    if (kwSearch) list = list.filter(k => k.keyword.toLowerCase().includes(kwSearch.toLowerCase()));
    return list;
  }, [campaignKeywords, kwSearch]);

  const toggleKwSelect = (id) => setKwSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAllKws = () => setKwSelected(kwSelected.length === filteredKws.length ? [] : filteredKws.map(k => k.id));

  const handleAddKws = () => {
    const lines = kwText.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const targetAG = kwAdGroup || campaignAdGroups[0]?.id;
    if (!targetAG) return alert('Please add an ad group first.');
    addKeywords(lines.map(kw => ({ adGroupId: targetAG, campaignId: id, keyword: kw, matchType: kwMatchType, bid: parseFloat(kwBid), status: 'Enabled' })));
    setKwText(''); setShowAddKw(false);
  };

  const saveKwBid = (kwId) => {
    const val = parseFloat(kwBidValue);
    if (!isNaN(val) && val > 0) updateKeyword(kwId, { bid: val });
    setEditingKwBid(null);
  };

  // ── Negative kw helpers ──
  const filteredNKs = useMemo(() => {
    let list = campaignNKs;
    if (nkSearch) list = list.filter(nk => nk.keyword.toLowerCase().includes(nkSearch.toLowerCase()));
    return list;
  }, [campaignNKs, nkSearch]);

  const handleAddNKs = () => {
    const lines = nkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const isAGLevel = nkAdGroup !== 'campaign';
    addNegativeKeywords(lines.map(kw => ({
      keyword: kw, matchType: nkMatch, campaignId: id,
      adGroupId: isAGLevel ? nkAdGroup : null,
      level: isAGLevel ? 'Ad Group' : 'Campaign'
    })));
    setNkText(''); setShowAddNK(false);
  };

  // ── Placement helpers ──
  const updatePlacement = (idx, adj) => {
    setPlacements(p => p.map((pl, i) => i === idx ? { ...pl, adjustment: Math.min(900, Math.max(0, adj)) } : pl));
  };

  const isSB = campaign?.type === 'Sponsored Brands';
  const resolvedTab = isSB && activeTab === 'adgroups' ? 'ads' : activeTab;
  const campaignSbAds = sbAds.filter(a => a.campaignId === id);

  const tabs = isSB
    ? [
        { key: 'ads', label: 'Ads' },
        { key: 'targeting', label: 'Targeting' },
        { key: 'negatives', label: 'Negative targeting' },
        { key: 'bidding', label: 'Campaign bidding strategy' },
        { key: 'settings', label: 'Settings' },
        { key: 'history', label: 'History' },
      ]
    : [
        { key: 'adgroups', label: 'Ad groups' },
        { key: 'targeting', label: 'Targeting' },
        { key: 'negatives', label: 'Negative targeting' },
        { key: 'bidding', label: 'Campaign bidding strategy' },
        { key: 'placements', label: 'Placements' },
        { key: 'settings', label: 'Settings' },
        { key: 'history', label: 'History' },
      ];

  const agCtr = (ag) => ag.metrics.impressions ? (ag.metrics.clicks / ag.metrics.impressions * 100) : 0;
  const agCpc = (ag) => ag.metrics.clicks ? (ag.metrics.spend / ag.metrics.clicks) : 0;
  const agAcos = (ag) => ag.metrics.sales ? (ag.metrics.spend / ag.metrics.sales * 100) : 0;
  const agRoas = (ag) => ag.metrics.spend ? (ag.metrics.sales / ag.metrics.spend) : 0;

  const kwCtr = (k) => k.metrics.impressions ? (k.metrics.clicks / k.metrics.impressions * 100) : 0;
  const kwCpc = (k) => k.metrics.clicks ? (k.metrics.spend / k.metrics.clicks) : 0;
  const kwAcos = (k) => k.metrics.sales ? (k.metrics.spend / k.metrics.sales * 100) : 0;
  const kwRoas = (k) => k.metrics.spend ? (k.metrics.sales / k.metrics.spend) : 0;

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="link-btn" onClick={() => navigate('/')}>All campaigns</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{campaign.name}</span>
      </div>

      {/* Page header */}
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-title-row">
            {editingName ? (
              <div className="inline-edit">
                <input autoFocus className="cd-name-input" value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { updateCampaign(id, { name: nameValue }); setEditingName(false); } if (e.key === 'Escape') setEditingName(false); }} />
                <button className="btn btn-xs btn-primary" onClick={() => { updateCampaign(id, { name: nameValue }); setEditingName(false); }}>Save</button>
                <button className="btn btn-xs btn-secondary" onClick={() => setEditingName(false)}>Cancel</button>
              </div>
            ) : (
              <h1 className="page-title cd-campaign-name" onDoubleClick={() => { setNameValue(campaign.name); setEditingName(true); }}>
                {campaign.name}
              </h1>
            )}
          </div>
          <div className="cd-meta-row">
            <button
              className={`status-pill ${campaign.status === 'Enabled' ? 'status-pill-green' : 'status-pill-yellow'}`}
              onClick={() => toggleCampaignStatus(id)}
              title="Click to toggle status"
            >
              <span className="status-pill-dot" />
              {campaign.status}
            </button>
            <span className="cd-meta-sep">|</span>
            <span className="cd-meta-item">{campaign.type}</span>
            <span className="cd-meta-sep">|</span>
            <span className="cd-meta-item">{campaign.targetingType} targeting</span>
            <span className="cd-meta-sep">|</span>
            <span className="cd-meta-item">Portfolio: {campaign.portfolioId ? 'Main Products Portfolio' : 'None'}</span>
          </div>
        </div>
        <div className="cd-header-right">
          <DateRangePicker />
          <button className="btn btn-secondary"><Download size={13} /> Download</button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('settings')}><Settings size={13} /> Settings</button>
        </div>
      </div>

      {/* Summary metric tiles */}
      <div className="summary-tiles" style={{ marginBottom: 12 }}>
        {[
          { l: 'Impressions', v: formatNumber(campaign.metrics.impressions) },
          { l: 'Clicks', v: formatNumber(campaign.metrics.clicks) },
          { l: 'CTR', v: formatPercent(campaign.metrics.ctr) },
          { l: 'Spend', v: formatCurrency(campaign.metrics.spend) },
          { l: 'CPC', v: formatCurrency(campaign.metrics.cpc) },
          { l: 'Orders', v: formatNumber(campaign.metrics.orders) },
          { l: 'Sales', v: formatCurrency(campaign.metrics.sales) },
          { l: 'ACOS', v: formatPercent(campaign.metrics.acos) },
          { l: 'ROAS', v: `${Number(campaign.metrics.roas || 0).toFixed(2)}x` },
          { l: 'CVR', v: formatPercent(campaign.metrics.cvr) },
        ].map(m => (
          <div key={m.l} className="summary-tile">
            <div className="tile-label">{m.l}</div>
            <div className="tile-value">{m.v}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="chart-header">
          <div className="chart-metric-tabs">
            {CHART_METRICS.map(m => (
              <button key={m.key} className={`chart-tab ${chartMetric === m.key ? 'active' : ''}`} onClick={() => setChartMetric(m.key)}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="chart-type-tabs">
            <button className={`chart-tab ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>Line</button>
            <button className={`chart-tab ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>Bar</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip formatter={(v) => [chartMetric === 'spend' || chartMetric === 'sales' ? formatCurrency(v) : formatNumber(v), CHART_METRICS.find(m => m.key === chartMetric)?.label]} />
              <Line type="monotone" dataKey={chartMetric} stroke="#e47911" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} width={50} />
              <Tooltip formatter={(v) => [chartMetric === 'spend' || chartMetric === 'sales' ? formatCurrency(v) : formatNumber(v), CHART_METRICS.find(m => m.key === chartMetric)?.label]} />
              <Bar dataKey={chartMetric} fill="#e47911" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} className={`tab ${resolvedTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ADS TAB (Sponsored Brands only) ── */}
      {resolvedTab === 'ads' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
          <div className="table-toolbar">
            <div className="toolbar-left">
              <span style={{ fontSize: 14, fontWeight: 600 }}>{campaignSbAds.length} ad{campaignSbAds.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {campaignSbAds.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              No ads found for this campaign. Launch the campaign to create ads.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ad name</th>
                  <th>Status</th>
                  <th>Format</th>
                  <th>Headline</th>
                  <th>Landing page</th>
                  <th>Products</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Spend</th>
                  <th>Orders</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {campaignSbAds.map(ad => (
                  <tr key={ad.id}>
                    <td style={{ fontWeight: 500 }}>{ad.name || ad.brandName + ' — ' + (ad.headline?.slice(0, 30) || 'Ad')}</td>
                    <td><StatusBadge status={ad.status} /></td>
                    <td style={{ textTransform: 'capitalize' }}>{(ad.adFormat || '').replace(/-/g, ' ')}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.headline}</td>
                    <td style={{ textTransform: 'capitalize' }}>{(ad.landingPage || '').replace(/-/g, ' ')}</td>
                    <td>{(ad.products || []).length} product{(ad.products || []).length !== 1 ? 's' : ''}</td>
                    <td>{formatNumber(ad.metrics?.impressions ?? 0)}</td>
                    <td>{formatNumber(ad.metrics?.clicks ?? 0)}</td>
                    <td>{formatCurrency(ad.metrics?.spend ?? 0)}</td>
                    <td>{formatNumber(ad.metrics?.orders ?? 0)}</td>
                    <td>{formatCurrency(ad.metrics?.sales ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── AD GROUPS TAB ── */}
      {resolvedTab === 'adgroups' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
          <div className="table-toolbar">
            <div className="toolbar-left">
              <div className="search-input-wrap">
                <Search size={13} />
                <input className="search-input" placeholder="Search ad groups" value={agSearch} onChange={e => setAgSearch(e.target.value)} />
              </div>
              {agSelected.length > 0 && (
                <div className="bulk-actions">
                  <span className="selected-count">{agSelected.length} selected</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => agSelected.forEach(aid => updateAdGroup(aid, { status: 'Enabled' }))}><Play size={11} /> Enable</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => agSelected.forEach(aid => updateAdGroup(aid, { status: 'Paused' }))}><Pause size={11} /> Pause</button>
                  <button className="btn btn-sm btn-danger" onClick={() => { agSelected.forEach(aid => deleteAdGroup(aid)); setAgSelected([]); }}><Trash2 size={11} /> Delete</button>
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={() => navigate(`/campaigns/${id}/create-ad-group`)}><Plus size={13} /> Create ad group</button>
          </div>

          <div className="table-wrap">
            <table className="ads-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}><input type="checkbox" checked={agSelected.length === filteredAGs.length && filteredAGs.length > 0} onChange={toggleAllAGs} /></th>
                  <th style={{ width: 36 }}>Status</th>
                  <th>Ad group name</th>
                  <th>Default bid</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>CTR</th>
                  <th>Spend</th>
                  <th>CPC</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>ACOS</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAGs.map(ag => (
                  <tr key={ag.id} className={agSelected.includes(ag.id) ? 'selected-row' : ''}>
                    <td><input type="checkbox" checked={agSelected.includes(ag.id)} onChange={() => toggleAgSelect(ag.id)} /></td>
                    <td>
                      <button
                        className={`status-toggle ${ag.status === 'Enabled' ? 'on' : 'off'}`}
                        onClick={() => updateAdGroup(ag.id, { status: ag.status === 'Enabled' ? 'Paused' : 'Enabled' })}
                        title={ag.status}
                      />
                    </td>
                    <td>
                      <button className="link-btn" onClick={() => navigate(`/campaigns/${id}/adgroups/${ag.id}`)}>
                        {ag.name}
                      </button>
                    </td>
                    <td>
                      {editingAgBid === ag.id ? (
                        <div className="inline-edit">
                          <span>₹</span>
                          <input autoFocus className="inline-input" value={agBidValue} onChange={e => setAgBidValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveAgBid(ag.id)} style={{ width: 70 }} />
                          <button className="btn btn-xs btn-primary" onClick={() => saveAgBid(ag.id)}>✓</button>
                          <button className="btn btn-xs btn-secondary" onClick={() => setEditingAgBid(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="editable-cell" onClick={() => { setEditingAgBid(ag.id); setAgBidValue(ag.defaultBid); }}>
                          ₹{ag.defaultBid}
                        </button>
                      )}
                    </td>
                    <td>{formatNumber(ag.metrics.impressions)}</td>
                    <td>{formatNumber(ag.metrics.clicks)}</td>
                    <td>{formatPercent(agCtr(ag))}</td>
                    <td>{formatCurrency(ag.metrics.spend)}</td>
                    <td>{formatCurrency(agCpc(ag))}</td>
                    <td>{formatNumber(ag.metrics.orders)}</td>
                    <td>{formatCurrency(ag.metrics.sales)}</td>
                    <td className={agAcos(ag) > 30 ? 'bad-metric' : agAcos(ag) > 0 && agAcos(ag) < 15 ? 'good-metric' : ''}>
                      {formatPercent(agAcos(ag))}
                    </td>
                    <td className={agRoas(ag) < 5 && agRoas(ag) > 0 ? 'bad-metric' : agRoas(ag) > 20 ? 'good-metric' : ''}>
                      {Number(agRoas(ag)).toFixed(2)}x
                    </td>
                  </tr>
                ))}
                {filteredAGs.length === 0 && (
                  <tr>
                    <td colSpan={13} className="empty-row">
                      No ad groups found.{' '}
                      <button className="link-btn" onClick={() => navigate(`/campaigns/${id}/create-ad-group`)}>Create your first ad group</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            Showing {filteredAGs.length} of {campaignAdGroups.length} ad groups
          </div>
        </div>
      )}

      {/* ── TARGETING TAB ── */}
      {resolvedTab === 'targeting' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
          <div className="table-toolbar">
            <div className="toolbar-left">
              <div className="search-input-wrap">
                <Search size={13} />
                <input className="search-input" placeholder="Search keywords" value={kwSearch} onChange={e => setKwSearch(e.target.value)} />
              </div>
              {kwSelected.length > 0 && (
                <div className="bulk-actions">
                  <span className="selected-count">{kwSelected.length} selected</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => { kwSelected.forEach(kid => updateKeyword(kid, { status: 'Enabled' })); setKwSelected([]); }}><Play size={11} /> Enable</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => { kwSelected.forEach(kid => updateKeyword(kid, { status: 'Paused' })); setKwSelected([]); }}><Pause size={11} /> Pause</button>
                  <button className="btn btn-sm btn-danger" onClick={() => { kwSelected.forEach(kid => deleteKeyword(kid)); setKwSelected([]); }}><Trash2 size={11} /> Delete</button>
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddKw(true)}><Plus size={13} /> Add keywords</button>
          </div>

          {showAddKw && (
            <div className="add-kw-panel">
              <div className="add-kw-left">
                <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Enter keywords (one per line)</label>
                <textarea className="form-textarea" rows={5} value={kwText} onChange={e => setKwText(e.target.value)} placeholder="wireless headphones&#10;bluetooth earbuds&#10;noise cancelling" />
                <div className="kw-options" style={{ marginTop: 12 }}>
                  <div className="form-group">
                    <label>Match type</label>
                    <div className="btn-group">
                      {['Exact', 'Phrase', 'Broad'].map(m => (
                        <button key={m} className={`btn btn-sm ${kwMatchType === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setKwMatchType(m)}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Bid (₹)</label>
                    <input type="number" className="form-input" value={kwBid} onChange={e => setKwBid(e.target.value)} style={{ width: 100 }} />
                  </div>
                  {campaignAdGroups.length > 0 && (
                    <div className="form-group">
                      <label>Ad group</label>
                      <select className="form-input" value={kwAdGroup} onChange={e => setKwAdGroup(e.target.value)}>
                        {campaignAdGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={handleAddKws}>Add keywords</button>
                  <button className="btn btn-secondary" onClick={() => setShowAddKw(false)}>Cancel</button>
                </div>
              </div>
              <div className="add-kw-right">
                <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>
                  <Zap size={13} color="#e47911" style={{ marginRight: 4 }} />
                  Suggested keywords
                </label>
                <div className="suggested-list">
                  {['wireless headphones', 'bluetooth headphones', 'noise cancelling headphones', 'over ear headphones', 'gaming headphones', 'sports headphones'].map(s => (
                    <div key={s} className="suggested-item">
                      <span>{s}</span>
                      <button className="btn btn-xs btn-secondary" onClick={() => {
                        const targetAG = kwAdGroup || campaignAdGroups[0]?.id;
                        if (targetAG) addKeywords([{ adGroupId: targetAG, campaignId: id, keyword: s, matchType: kwMatchType, bid: parseFloat(kwBid), status: 'Enabled' }]);
                      }}>Add</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table className="ads-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}><input type="checkbox" checked={kwSelected.length === filteredKws.length && filteredKws.length > 0} onChange={toggleAllKws} /></th>
                  <th style={{ width: 36 }}>Status</th>
                  <th>Keyword</th>
                  <th>Ad group</th>
                  <th>Match type</th>
                  <th>Bid</th>
                  <th>Suggested bid</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>CTR</th>
                  <th>Spend</th>
                  <th>CPC</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>ACOS</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filteredKws.map(k => {
                  const ag = adGroups.find(ag => ag.id === k.adGroupId);
                  return (
                    <tr key={k.id} className={kwSelected.includes(k.id) ? 'selected-row' : ''}>
                      <td><input type="checkbox" checked={kwSelected.includes(k.id)} onChange={() => toggleKwSelect(k.id)} /></td>
                      <td>
                        <button className={`status-toggle ${k.status === 'Enabled' ? 'on' : 'off'}`}
                          onClick={() => updateKeyword(k.id, { status: k.status === 'Enabled' ? 'Paused' : 'Enabled' })} />
                      </td>
                      <td><span className="kw-text">{k.keyword}</span></td>
                      <td className="text-muted-sm">{ag?.name || '—'}</td>
                      <td><span className={`match-badge match-${k.matchType.toLowerCase()}`}>{k.matchType}</span></td>
                      <td>
                        {editingKwBid === k.id ? (
                          <div className="inline-edit">
                            <span>₹</span>
                            <input autoFocus className="inline-input" value={kwBidValue} onChange={e => setKwBidValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveKwBid(k.id)} style={{ width: 70 }} />
                            <button className="btn btn-xs btn-primary" onClick={() => saveKwBid(k.id)}>✓</button>
                            <button className="btn btn-xs btn-secondary" onClick={() => setEditingKwBid(null)}>✕</button>
                          </div>
                        ) : (
                          <button className="editable-cell" onClick={() => { setEditingKwBid(k.id); setKwBidValue(k.bid); }}>₹{k.bid}</button>
                        )}
                      </td>
                      <td>
                        <div className="suggested-bid-display">
                          <span>₹{k.suggestedBid}</span>
                          {k.suggestedBid > k.bid && (
                            <button className="btn btn-xs btn-orange" onClick={() => updateKeyword(k.id, { bid: k.suggestedBid })}>Apply</button>
                          )}
                        </div>
                      </td>
                      <td>{formatNumber(k.metrics.impressions)}</td>
                      <td>{formatNumber(k.metrics.clicks)}</td>
                      <td>{formatPercent(kwCtr(k))}</td>
                      <td>{formatCurrency(k.metrics.spend)}</td>
                      <td>{formatCurrency(kwCpc(k))}</td>
                      <td>{formatNumber(k.metrics.orders)}</td>
                      <td>{formatCurrency(k.metrics.sales)}</td>
                      <td className={kwAcos(k) > 30 ? 'bad-metric' : kwAcos(k) > 0 && kwAcos(k) < 15 ? 'good-metric' : ''}>{formatPercent(kwAcos(k))}</td>
                      <td>{Number(kwRoas(k)).toFixed(2)}x</td>
                    </tr>
                  );
                })}
                {filteredKws.length === 0 && (
                  <tr><td colSpan={16} className="empty-row">No keywords found. <button className="link-btn" onClick={() => setShowAddKw(true)}>Add keywords</button></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">{filteredKws.length} keywords</div>
        </div>
      )}

      {/* ── NEGATIVE TARGETING TAB ── */}
      {resolvedTab === 'negatives' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
          <div className="neg-kw-tabs-row">
            <span className="neg-kw-label">Negative keywords</span>
            <span className="neg-kw-count">({filteredNKs.length})</span>
          </div>
          <div className="table-toolbar">
            <div className="toolbar-left">
              <div className="search-input-wrap">
                <Search size={13} />
                <input className="search-input" placeholder="Search negative keywords" value={nkSearch} onChange={e => setNkSearch(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddNK(true)}><Plus size={13} /> Add negative keywords</button>
          </div>

          {showAddNK && (
            <div className="add-kw-panel" style={{ flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="add-kw-left">
                  <label style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Enter negative keywords (one per line)</label>
                  <textarea className="form-textarea" rows={5} value={nkText} onChange={e => setNkText(e.target.value)} placeholder="cheap&#10;free&#10;used" />
                  <div className="kw-options" style={{ marginTop: 12 }}>
                    <div className="form-group">
                      <label>Match type</label>
                      <div className="btn-group">
                        {['Exact', 'Phrase'].map(m => (
                          <button key={m} className={`btn btn-sm ${nkMatch === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setNkMatch(m)}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Apply to</label>
                      <select className="form-input" value={nkAdGroup} onChange={e => setNkAdGroup(e.target.value)}>
                        <option value="campaign">Campaign level</option>
                        {campaignAdGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name} (Ad group)</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={handleAddNKs}>Add negative keywords</button>
                    <button className="btn btn-secondary" onClick={() => setShowAddNK(false)}>Cancel</button>
                  </div>
                </div>
                <div className="add-kw-right">
                  <div className="info-box" style={{ margin: 0 }}>
                    <strong>Negative exact</strong> — your ad won't show when the search contains the exact phrase.<br /><br />
                    <strong>Negative phrase</strong> — your ad won't show when the search contains all the words in that exact order.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table className="ads-table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Match type</th>
                  <th>Level</th>
                  <th>Ad group</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNKs.map(nk => {
                  const ag = adGroups.find(ag => ag.id === nk.adGroupId);
                  return (
                    <tr key={nk.id}>
                      <td>{nk.keyword}</td>
                      <td><span className="match-badge">{nk.matchType}</span></td>
                      <td><span className={`level-badge ${nk.level === 'Campaign' ? 'level-campaign' : 'level-adgroup'}`}>{nk.level}</span></td>
                      <td>{ag?.name || '—'}</td>
                      <td className="text-muted-sm">Manual</td>
                      <td><button className="icon-btn-sm" onClick={() => deleteNegativeKeyword(nk.id)}><Trash2 size={12} /></button></td>
                    </tr>
                  );
                })}
                {filteredNKs.length === 0 && (
                  <tr><td colSpan={6} className="empty-row">No negative keywords. <button className="link-btn" onClick={() => setShowAddNK(true)}>Add negative keywords</button></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">{filteredNKs.length} negative keywords</div>
        </div>
      )}

      {/* ── CAMPAIGN BIDDING STRATEGY TAB ── */}
      {resolvedTab === 'bidding' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Campaign bidding strategy</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
            Choose how you want Amazon to optimize your bids.
          </p>

          <div className="bidding-strategy-options">
            {[
              {
                key: 'Dynamic bids - down only',
                label: 'Dynamic bids — down only',
                desc: 'Amazon lowers your bids in real time when your ad may be less likely to convert to a sale. Your bid will not exceed your set bid.'
              },
              {
                key: 'Dynamic bids - up and down',
                label: 'Dynamic bids — up and down',
                desc: "Amazon raises your bids (by up to 100%) for placements where your ad may be more likely to convert to a sale, and lowers your bids for placements where it's less likely."
              },
              {
                key: 'Fixed bid',
                label: 'Fixed bids',
                desc: 'Amazon uses your exact bid and any manual adjustments you set. Amazon will not change your bids based on likelihood of a sale.'
              },
            ].map(opt => (
              <label key={opt.key} className={`bidding-option ${campaign.biddingStrategy === opt.key ? 'selected' : ''}`}>
                <input type="radio" name="biddingStrategy" checked={campaign.biddingStrategy === opt.key}
                  onChange={() => updateCampaign(id, { biddingStrategy: opt.key })} />
                <div>
                  <strong>{opt.label}</strong>
                  <p>{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Adjust bids by placement</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Increase your bids by a percentage for specific placements. This adjustment applies on top of any dynamic bidding adjustments.
            </p>
            <table className="ads-table">
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>Bid adjustment (%)</th>
                  <th>Example bid at ₹1.00</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((pl, i) => (
                  <tr key={pl.placement}>
                    <td>
                      <strong>{pl.placement}</strong>
                    </td>
                    <td>
                      <div className="inline-edit" style={{ width: 160 }}>
                        <input
                          type="number"
                          className="form-input"
                          value={pl.adjustment}
                          min={0} max={900}
                          onChange={e => updatePlacement(i, parseInt(e.target.value) || 0)}
                          style={{ width: 80 }}
                        />
                        <span>%</span>
                      </div>
                    </td>
                    <td>₹{(1 * (1 + pl.adjustment / 100)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PLACEMENTS TAB ── */}
      {resolvedTab === 'placements' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
          <div className="table-toolbar">
            <span className="toolbar-title">Placements performance</span>
            <DateRangePicker />
          </div>
          <div className="info-box" style={{ margin: '0 16px 0' }}>
            <Info size={13} style={{ marginRight: 6 }} />
            Performance data by placement helps you understand where your ads show and how they perform across different placements.
          </div>
          <div className="table-wrap">
            <table className="ads-table">
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>Bid adjustment</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>CTR</th>
                  <th>Spend</th>
                  <th>CPC</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>ACOS</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((pl, i) => (
                  <tr key={pl.placement}>
                    <td><strong>{pl.placement}</strong></td>
                    <td>{pl.adjustment > 0 ? `+${pl.adjustment}%` : '—'}</td>
                    <td>{formatNumber(pl.impressions)}</td>
                    <td>{formatNumber(pl.clicks)}</td>
                    <td>{formatPercent(pl.ctr)}</td>
                    <td>{formatCurrency(pl.spend)}</td>
                    <td>{formatCurrency(pl.cpc)}</td>
                    <td>{pl.orders}</td>
                    <td>{formatCurrency(pl.sales)}</td>
                    <td className={pl.acos > 25 ? 'bad-metric' : pl.acos < 15 ? 'good-metric' : ''}>{formatPercent(pl.acos)}</td>
                    <td>{pl.roas.toFixed(2)}x</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td>—</td>
                  <td><strong>{formatNumber(placements.reduce((s, p) => s + p.impressions, 0))}</strong></td>
                  <td><strong>{formatNumber(placements.reduce((s, p) => s + p.clicks, 0))}</strong></td>
                  <td><strong>{formatPercent(placements.reduce((s, p) => s + p.clicks, 0) / placements.reduce((s, p) => s + p.impressions, 0) * 100)}</strong></td>
                  <td><strong>{formatCurrency(placements.reduce((s, p) => s + p.spend, 0))}</strong></td>
                  <td><strong>{formatCurrency(placements.reduce((s, p) => s + p.spend, 0) / placements.reduce((s, p) => s + p.clicks, 0))}</strong></td>
                  <td><strong>{placements.reduce((s, p) => s + p.orders, 0)}</strong></td>
                  <td><strong>{formatCurrency(placements.reduce((s, p) => s + p.sales, 0))}</strong></td>
                  <td><strong>{formatPercent(placements.reduce((s, p) => s + p.spend, 0) / placements.reduce((s, p) => s + p.sales, 0) * 100)}</strong></td>
                  <td><strong>{(placements.reduce((s, p) => s + p.sales, 0) / placements.reduce((s, p) => s + p.spend, 0)).toFixed(2)}x</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {resolvedTab === 'settings' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Campaign settings</h3>
          <div className="settings-grid">
            <div className="setting-row">
              <label>Campaign name</label>
              <input className="form-input" defaultValue={campaign.name}
                onBlur={e => updateCampaign(id, { name: e.target.value })} style={{ width: 320 }} />
            </div>
            <div className="setting-row">
              <label>Status</label>
              <button
                className={`status-pill ${campaign.status === 'Enabled' ? 'status-pill-green' : 'status-pill-yellow'}`}
                onClick={() => toggleCampaignStatus(id)}
              >
                <span className="status-pill-dot" />
                {campaign.status}
              </button>
            </div>
            <div className="setting-row">
              <label>Campaign type</label>
              <span>{campaign.type}</span>
            </div>
            <div className="setting-row">
              <label>Targeting type</label>
              <span>{campaign.targetingType}</span>
            </div>
            <div className="setting-row">
              <label>Bidding strategy</label>
              <select className="form-input" value={campaign.biddingStrategy}
                onChange={e => updateCampaign(id, { biddingStrategy: e.target.value })} style={{ width: 260 }}>
                <option>Dynamic bids - down only</option>
                <option>Dynamic bids - up and down</option>
                <option>Fixed bid</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Daily budget (₹)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>₹</span>
                <input type="number" className="form-input" style={{ width: 120 }} defaultValue={campaign.budget}
                  onBlur={e => updateCampaign(id, { budget: parseFloat(e.target.value) })} />
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>per day</span>
              </div>
            </div>
            <div className="setting-row">
              <label>Start date</label>
              <input type="date" className="form-input" defaultValue={campaign.startDate}
                onBlur={e => updateCampaign(id, { startDate: e.target.value })} style={{ width: 160 }} />
            </div>
            <div className="setting-row">
              <label>End date</label>
              <input type="date" className="form-input" defaultValue={campaign.endDate}
                onBlur={e => updateCampaign(id, { endDate: e.target.value })} style={{ width: 160 }} placeholder="No end date" />
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {resolvedTab === 'history' && (
        <div className="table-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' }}>
          <div className="table-toolbar">
            <span className="toolbar-title">Change history</span>
            <DateRangePicker />
          </div>
          <table className="ads-table">
            <thead>
              <tr>
                <th>Date & time</th>
                <th>Entity type</th>
                <th>Entity name</th>
                <th>Field changed</th>
                <th>Previous value</th>
                <th>New value</th>
                <th>Changed by</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-01-15 14:32', entity: 'Keyword', name: 'wireless headphones', field: 'Bid', old: '₹0.75', new: '₹0.85', by: 'You' },
                { date: '2024-01-15 11:20', entity: 'Campaign', name: campaign.name, field: 'Status', old: 'Paused', new: 'Enabled', by: 'You' },
                { date: '2024-01-14 16:45', entity: 'Campaign', name: campaign.name, field: 'Daily budget', old: '₹40.00', new: '₹50.00', by: 'You' },
                { date: '2024-01-14 09:10', entity: 'Keyword', name: 'bluetooth headphones', field: 'Status', old: 'Enabled', new: 'Paused', by: 'Automation Rule' },
                { date: '2024-01-13 15:30', entity: 'Ad Group', name: 'Core Keywords', field: 'Default bid', old: '₹0.65', new: '₹0.75', by: 'You' },
              ].map((h, i) => (
                <tr key={i}>
                  <td className="text-mono">{h.date}</td>
                  <td><span className="entity-badge">{h.entity}</span></td>
                  <td>{h.name}</td>
                  <td>{h.field}</td>
                  <td className="old-value">{h.old}</td>
                  <td className="new-value">{h.new}</td>
                  <td>{h.by === 'Automation Rule' ? <span className="auto-badge">{h.by}</span> : h.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
