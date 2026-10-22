import { Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { AD_GROUP_TABS, ROUTES, adGroupPath, campaignPath, typeSlug } from '../../routes';
import { useConsoleRange } from '../../hooks/useConsoleRange';
import { rangeMetrics, dailySeries, withParentStart } from '../../utils/performance';
import { deliveryStatus } from '../../utils/campaignStatus';
import { EntityHeader, EntityTabs } from '../../components/console/EntityLayout';
import PerformanceChart from '../../components/console/PerformanceChart';
import NegativeTargetingTab from '../campaigns/tabs/NegativeTargetingTab';
import HistoryTab from '../campaigns/tabs/HistoryTab';
import AdsTab from './tabs/AdsTab';
import TargetingTab from './tabs/TargetingTab';
import SearchTermsTab from './tabs/SearchTermsTab';
import AdGroupSettingsTab from './tabs/AdGroupSettingsTab';
import CreativeTab from './tabs/CreativeTab';

const TAB_CONTENT = {
  ads: AdsTab,
  targeting: TargetingTab,
  'negative-targeting': NegativeTargetingTab,
  'search-terms': SearchTermsTab,
  settings: AdGroupSettingsTab,
  history: HistoryTab,
  creative: CreativeTab,
};
const TABS_WITH_CHART = ['ads', 'targeting'];
const CHART_METRICS = {
  ads: ['spend', 'sales', 'roas', 'orders'],
  targeting: ['spend', 'sales', 'roas', 'impressions'],
};
const SD_OPTIMISATION = { reach: 'Reach', conversion: 'Conversions', consideration: 'Page visits' };

export default function AdGroupDetail() {
  const { campaignId, adGroupId, tab } = useParams();
  const campaign = useStore(s => s.campaigns.find(c => c.id === campaignId));
  const adGroup = useStore(s => s.adGroups.find(ag => ag.id === adGroupId));
  const updateAdGroup = useStore(s => s.updateAdGroup);
  const range = useConsoleRange();

  if (!campaign) return <Navigate to={ROUTES.allCampaigns} replace />;
  if (!adGroup || adGroup.campaignId !== campaign.id) return <Navigate to={campaignPath(campaign)} replace />;

  const tabs = AD_GROUP_TABS[typeSlug(campaign.type)];
  if (!tab || !tabs.some(t => t.key === tab)) return <Navigate to={adGroupPath(campaign, adGroup.id, tabs[0].key)} replace />;

  const Content = TAB_CONTENT[tab];
  const basePath = adGroupPath(campaign, adGroup.id, '').replace(/\/$/, '');
  const campaignState = deliveryStatus(campaign);
  const chips = [{ label: 'Status', value: campaignState !== 'Delivering' ? `Campaign: ${campaignState}` : adGroup.status === 'Enabled' ? 'Delivering' : adGroup.status }];
  if (campaign.type === 'Sponsored Display') chips.push({ label: 'Bid optimisation', value: SD_OPTIMISATION[campaign.goal] || 'Page visits' });
  const entity = withParentStart(adGroup, campaign);

  return (
    <div className="ent">
      <EntityHeader
        kind="Ad group"
        name={adGroup.name}
        isOn={adGroup.status === 'Enabled'}
        isToggleDisabled={adGroup.status === 'Archived'}
        onToggle={() => updateAdGroup(adGroup.id, { status: adGroup.status === 'Enabled' ? 'Paused' : 'Enabled' })}
        chips={chips}
      />
      <div className="ent-body">
        <EntityTabs tabs={tabs} basePath={basePath} />
        <section className="ent-content">
          {TABS_WITH_CHART.includes(tab) && (
            <PerformanceChart key={`${adGroup.id}-${tab}`} title="" series={dailySeries([entity], range)} totals={rangeMetrics(entity, range)} initialMetrics={CHART_METRICS[tab]} />
          )}
          <Content campaign={campaign} adGroup={adGroup} />
        </section>
      </div>
    </div>
  );
}
