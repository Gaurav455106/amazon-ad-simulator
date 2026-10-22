import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleHelp, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, sumMetrics, dailySeries, withParentStart } from '../../utils/performance';
import { deliveryStatus } from '../../utils/campaignStatus';
import { formatDayLabel } from '../../utils/dateRanges';
import SummaryStrip from '../../components/console/SummaryStrip';
import PerformanceChart from '../../components/console/PerformanceChart';
import CampaignsTable from './CampaignsTable';
import { AdGroupsView, TargetsView } from './EntityViews';

const VIEWS = [
  { key: 'campaigns', label: 'Campaigns', to: ROUTES.allCampaigns },
  { key: 'ad-groups', label: 'Ad groups', to: ROUTES.adGroupsView },
  { key: 'targets', label: 'Targets', to: ROUTES.targetsView },
];

const TYPE_TABS = [
  { key: 'all', label: 'All', types: null },
  { key: 'sp', label: 'Sponsored Products', types: ['Sponsored Products'] },
  { key: 'sb', label: 'Sponsored Brands', types: ['Sponsored Brands'] },
  { key: 'sd', label: 'Display, Video & Audio', types: ['Sponsored Display'] },
];

// Quick filters change with the type tab, as on the console.
const QUICK_FILTERS = {
  spendNoOrders: { label: 'Campaigns with spend and no orders', test: (r) => r.m.spend > 0 && r.m.orders === 0 },
  topOfSearch: { label: 'Campaigns with top-of-search impressions', test: (r) => r.m.impressions > 0 && r.campaign.type !== 'Sponsored Display' },
  impressionsNoClicks: { label: 'Campaigns with impressions and no clicks', test: (r) => r.m.impressions > 0 && r.m.clicks === 0 },
  outOfBudget: { label: 'Out of budget campaigns', test: (r) => deliveryStatus(r.campaign) === 'Out of budget' },
};
const QUICK_FILTERS_BY_TAB = {
  all: ['spendNoOrders', 'topOfSearch', 'outOfBudget'],
  sp: ['spendNoOrders', 'topOfSearch', 'outOfBudget'],
  sb: ['spendNoOrders', 'impressionsNoClicks', 'outOfBudget'],
  sd: ['spendNoOrders', 'impressionsNoClicks', 'outOfBudget'],
};

const CHART_MODES = ['Show all', 'View chart only', 'Hide all'];

function ViewSwitcher({ view }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = VIEWS.find(v => v.key === view);
  return (
    <div className="cx-pop-anchor">
      <button type="button" className="cm-title" onClick={() => setIsOpen(o => !o)}>
        {current.label} <ChevronDown size={20} />
      </button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="cx-pop" style={{ top: 40, left: 0 }}>
            {VIEWS.map(v => (
              <Link key={v.key} to={v.to} className={`cx-pop-item ${v.key === view ? 'is-active' : ''}`} onClick={() => setIsOpen(false)}>
                {v.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CampaignManager({ view = 'campaigns' }) {
  const navigate = useNavigate();
  const campaigns = useStore(s => s.campaigns);
  const adGroups = useStore(s => s.adGroups);
  const keywords = useStore(s => s.keywords);
  const range = useConsoleRange();

  const [typeTab, setTypeTab] = useState('all');
  const [chartMode, setChartMode] = useState('Show all');
  const [aiQuery, setAiQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState(null);
  const [chartKey, setChartKey] = useState(0);

  const tabTypes = TYPE_TABS.find(t => t.key === typeTab).types;
  const query = aiQuery.trim().toLowerCase();

  const campaignRows = useMemo(() => campaigns
    .filter(c => !tabTypes || tabTypes.includes(c.type))
    .map(c => ({ campaign: c, m: rangeMetrics(c, range) }))
    .filter(r => !quickFilter || QUICK_FILTERS[quickFilter].test(r))
    .filter(r => !query || r.campaign.name.toLowerCase().includes(query)),
  // range.from/to are recomputed each render; their timestamps are the real dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [campaigns, tabTypes, quickFilter, query, range.from.getTime(), range.to.getTime()]);

  const campaignById = useMemo(() => Object.fromEntries(campaignRows.map(r => [r.campaign.id, r.campaign])), [campaignRows]);

  const adGroupRows = useMemo(() => adGroups
    .filter(ag => campaignById[ag.campaignId])
    .map(ag => {
      const c = campaignById[ag.campaignId];
      return { adGroup: ag, campaign: c, m: rangeMetrics(withParentStart(ag, c), range) };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [adGroups, campaignById, range.from.getTime(), range.to.getTime()]);

  const targetRows = useMemo(() => keywords
    .filter(k => campaignById[k.campaignId])
    .map(k => {
      const c = campaignById[k.campaignId];
      return { keyword: k, campaign: c, adGroup: adGroups.find(ag => ag.id === k.adGroupId), m: rangeMetrics(withParentStart(k, c), range) };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [keywords, adGroups, campaignById, range.from.getTime(), range.to.getTime()]);

  const totals = useMemo(() => sumMetrics(campaignRows.map(r => r.m)), [campaignRows]);
  const series = useMemo(() => dailySeries(campaignRows.map(r => r.campaign), range),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [campaignRows, range.from.getTime(), range.to.getTime()]);

  const showStrip = chartMode === 'Show all';
  const showChart = chartMode !== 'Hide all';

  return (
    <div className="cm">
      <div className="cm-head">
        <div className="cm-head-row">
          <ViewSwitcher view={view} />
          <div className="cm-head-links">
            <a className="cx-link" href="#learn" onClick={e => { e.preventDefault(); navigate(ROUTES.learn); }}>
              <CircleHelp size={14} /> Learn about Campaign manager
            </a>
            <span className="cm-head-sep" />
            <button type="button" className="cx-link">Share Feedback</button>
          </div>
        </div>
        <div className="cm-type-tabs" role="tablist">
          {TYPE_TABS.map(t => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={typeTab === t.key}
              className={`cm-type-tab ${typeTab === t.key ? 'is-active' : ''}`}
              onClick={() => { setTypeTab(t.key); setQuickFilter(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cx-page cm-body">
        {showStrip && <SummaryStrip totals={totals} onViewDetails={() => setChartKey(k => k + 1)} />}
        <div className="cm-chart-modes">
          {CHART_MODES.map((mode, i) => (
            <span key={mode}>
              {i > 0 && <span className="cm-mode-sep" />}
              <button type="button" className={`cx-link ${chartMode === mode ? 'is-current' : ''}`} onClick={() => setChartMode(mode)}>{mode}</button>
            </span>
          ))}
        </div>
        {showChart && (
          <PerformanceChart key={chartKey} series={series} totals={totals} subtitle={formatDayLabel(range.to)} />
        )}

        <label className="cm-ai-search">
          <Sparkles size={18} />
          <input placeholder="Search with metrics or settings" value={aiQuery} onChange={e => setAiQuery(e.target.value)} />
        </label>
        <div className="cm-quick">
          {QUICK_FILTERS_BY_TAB[typeTab].map(key => (
            <button
              key={key}
              type="button"
              className={`cm-quick-chip ${quickFilter === key ? 'is-active' : ''}`}
              onClick={() => setQuickFilter(q => (q === key ? null : key))}
            >
              {QUICK_FILTERS[key].label}
            </button>
          ))}
        </div>

        {view === 'campaigns' && (
          <CampaignsTable key={typeTab} rows={campaignRows}
            extraFilterPills={quickFilter ? [{ label: QUICK_FILTERS[quickFilter].label, onRemove: () => setQuickFilter(null) }] : []} />
        )}
        {view === 'ad-groups' && <AdGroupsView rows={adGroupRows} />}
        {view === 'targets' && <TargetsView rows={targetRows} />}
      </div>
    </div>
  );
}
