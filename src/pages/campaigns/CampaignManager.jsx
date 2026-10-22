import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleHelp, Search, ListFilter, Copy, Settings, X, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ROUTES } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, sumMetrics, dailySeries, withParentStart } from '../../utils/performance';
import { deliveryStatus } from '../../utils/campaignStatus';
import { consoleId } from '../../utils/consoleId';
import { formatDayLabel } from '../../utils/dateRanges';
import SummaryStrip from '../../components/console/SummaryStrip';
import PerformanceChart from '../../components/console/PerformanceChart';
import TableDateButton from '../../components/console/TableDateButton';
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

function BulkActions({ selected, onDone }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateCampaign = useStore(s => s.updateCampaign);
  const apply = (status) => { selected.forEach(id => updateCampaign(id, { status })); setIsOpen(false); onDone(); };
  if (selected.length === 0) return <span className="cm-bulk-hint">Select rows to enable bulk actions.</span>;
  return (
    <div className="cx-pop-anchor">
      <button type="button" className="cx-btn" onClick={() => setIsOpen(o => !o)}>
        Bulk actions ({selected.length}) <ChevronDown size={14} />
      </button>
      {isOpen && (
        <>
          <div className="drp-scrim" onClick={() => setIsOpen(false)} />
          <div className="cx-pop" style={{ top: 36, left: 0 }}>
            <button type="button" className="cx-pop-item" onClick={() => apply('Enabled')}>Enable</button>
            <button type="button" className="cx-pop-item" onClick={() => apply('Paused')}>Pause</button>
            <button type="button" className="cx-pop-item" onClick={() => apply('Archived')}>Archive</button>
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
  const [search, setSearch] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState(null);
  const [hideArchived, setHideArchived] = useState(true);
  const [selected, setSelected] = useState([]);
  const [chartKey, setChartKey] = useState(0);

  const tabTypes = TYPE_TABS.find(t => t.key === typeTab).types;
  const query = (search || aiQuery).trim().toLowerCase();

  const campaignRows = useMemo(() => campaigns
    .filter(c => !tabTypes || tabTypes.includes(c.type))
    .filter(c => !hideArchived || c.status !== 'Archived')
    .map(c => ({ campaign: c, m: rangeMetrics(c, range) }))
    .filter(r => !quickFilter || QUICK_FILTERS[quickFilter].test(r))
    .filter(r => !query || r.campaign.name.toLowerCase().includes(query) || consoleId(r.campaign.id).toLowerCase().includes(query)),
  // range.from/to are recomputed each render; their timestamps are the real dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [campaigns, tabTypes, hideArchived, quickFilter, query, range.from.getTime(), range.to.getTime()]);

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
              onClick={() => { setTypeTab(t.key); setQuickFilter(null); setSelected([]); }}
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

        <div className="cx-filter-row">
          <strong>Filter</strong>
          {hideArchived && (
            <span className="cx-filter-pill">
              <strong>Active status:</strong> All but archived
              <button type="button" aria-label="remove" onClick={() => setHideArchived(false)}><X size={14} /></button>
            </span>
          )}
          {quickFilter && (
            <span className="cx-filter-pill">
              {QUICK_FILTERS[quickFilter].label}
              <button type="button" aria-label="remove" onClick={() => setQuickFilter(null)}><X size={14} /></button>
            </span>
          )}
          {(hideArchived || quickFilter) && (
            <button type="button" className="cx-link" onClick={() => { setHideArchived(false); setQuickFilter(null); }}>Remove all</button>
          )}
        </div>

        <div className="cx-toolbar">
          <button type="button" className="cx-btn cx-btn-primary" onClick={() => navigate(ROUTES.createCampaign)}>Create campaign</button>
          <label className="cx-search" style={{ width: 240 }}>
            <Search size={16} />
            <input placeholder="Search by name or ID" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <button type="button" className="cx-tool-btn" aria-label="Filter by"><ListFilter size={16} /></button>
          <button type="button" className="cx-tool-btn" aria-label="Copy" disabled={selected.length === 0}><Copy size={16} /></button>
          {view === 'campaigns' && <BulkActions selected={selected} onDone={() => setSelected([])} />}
          <span className="cx-toolbar-spacer" />
          <button type="button" className="cx-tool-btn">View: Default <ChevronDown size={14} /></button>
          <button type="button" className="cx-tool-btn">Columns <ChevronDown size={14} /></button>
          <TableDateButton />
          <button type="button" className="cx-tool-btn" aria-label="Table settings"><Settings size={16} /></button>
          <button type="button" className="cx-tool-btn">Export <ChevronDown size={14} /></button>
        </div>

        {view === 'campaigns' && <CampaignsTable rows={campaignRows} selected={selected} onSelectedChange={setSelected} />}
        {view === 'ad-groups' && <AdGroupsView rows={adGroupRows} />}
        {view === 'targets' && <TargetsView rows={targetRows} />}
      </div>
    </div>
  );
}
