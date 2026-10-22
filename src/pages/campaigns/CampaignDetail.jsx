import { Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { CAMPAIGN_TABS, ROUTES, campaignPath, typeSlug } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, dailySeries } from '../../utils/performance';
import { formatCurrency } from '../../utils/simulation';
import { deliveryStatus } from '../../utils/campaignStatus';
import { parseLocalDate } from '../../utils/dateRanges';
import { EntityHeader, EntityTabs } from '../../components/console/EntityLayout';
import PerformanceChart from '../../components/console/PerformanceChart';
import AdGroupsTab from './tabs/AdGroupsTab';
import BidAdjustmentsTab from './tabs/BidAdjustmentsTab';
import NegativeTargetingTab from './tabs/NegativeTargetingTab';
import BudgetRulesTab from './tabs/BudgetRulesTab';
import CampaignSettingsTab from './tabs/CampaignSettingsTab';
import HistoryTab from './tabs/HistoryTab';

const TYPE_LABEL = {
  'Sponsored Products': (c) => `Sponsored Products - ${c.targetingType === 'Auto' ? 'Automatic' : 'Manual'} targeting`,
  'Sponsored Brands': () => 'Sponsored Brands',
  'Sponsored Display': (c) => `Sponsored Display - ${c.targetingType?.includes('Audience') ? 'Audiences' : 'Manual targeting'}`,
};
const SB_GOAL_LABEL = { 'drive-visits': 'Drive page visits', 'impression-share': 'Grow brand impression share', 'share-of-voice': 'Reserve share of voice' };
const CHART_METRICS_BY_TYPE = {
  sp: ['spend', 'sales', 'roas', 'orders'],
  sb: ['spend', 'sales', 'acos', 'impressions'],
  sd: ['spend', 'sales', 'roas', 'impressions'],
};

const fmtDate = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null);

function headerChips(c) {
  const chips = [
    { label: 'Status', value: deliveryStatus(c) },
    { label: 'Type', value: (TYPE_LABEL[c.type] || (() => c.type))(c) },
    { label: 'Country', value: 'India' },
    { label: 'Schedule', value: `${fmtDate(c.startDate) || 'Today'} - ${fmtDate(c.endDate) || 'No end date'}` },
    { label: 'Budget', value: `${formatCurrency(c.budget)} - ${c.budgetType || 'Daily'}` },
  ];
  if (c.type === 'Sponsored Brands') {
    chips.push({ label: 'Goal', value: SB_GOAL_LABEL[c.sbGoal] || 'Drive page visits' });
    chips.push({ label: 'Cost type', value: c.costType || 'CPC' });
  }
  if (c.type === 'Sponsored Display') chips.push({ label: 'Cost type', value: c.costType || 'CPC' });
  return chips;
}

const TAB_CONTENT = {
  'ad-groups': AdGroupsTab,
  'bid-adjustments': BidAdjustmentsTab,
  'negative-targeting': NegativeTargetingTab,
  'budget-rules': BudgetRulesTab,
  settings: CampaignSettingsTab,
  history: HistoryTab,
};

// Tabs with their own performance view don't repeat the campaign chart above.
const TABS_WITH_CHART = ['ad-groups'];

export default function CampaignDetail() {
  const { campaignId, tab } = useParams();
  const campaign = useStore(s => s.campaigns.find(c => c.id === campaignId));
  const toggleCampaignStatus = useStore(s => s.toggleCampaignStatus);
  const range = useConsoleRange();

  if (!campaign) return <Navigate to={ROUTES.allCampaigns} replace />;

  const slug = typeSlug(campaign.type);
  const tabs = CAMPAIGN_TABS[slug];
  if (!tab || !tabs.some(t => t.key === tab)) return <Navigate to={campaignPath(campaign, tabs[0].key)} replace />;

  const Content = TAB_CONTENT[tab];
  const basePath = campaignPath(campaign, '').replace(/\/$/, '');

  return (
    <div className="ent">
      <EntityHeader
        kind="Campaign"
        name={campaign.name}
        isOn={campaign.status === 'Enabled'}
        isToggleDisabled={campaign.status === 'Archived'}
        onToggle={() => toggleCampaignStatus(campaign.id)}
        chips={headerChips(campaign)}
      />
      <div className="ent-body">
        <EntityTabs tabs={tabs} basePath={basePath} />
        <section className="ent-content">
          {TABS_WITH_CHART.includes(tab) && (
            <PerformanceChart
              key={campaign.id}
              title=""
              series={dailySeries([campaign], range)}
              totals={rangeMetrics(campaign, range)}
              initialMetrics={CHART_METRICS_BY_TYPE[slug]}
            />
          )}
          <Content campaign={campaign} />
        </section>
      </div>
    </div>
  );
}
