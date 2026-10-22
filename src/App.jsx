import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import CampaignManager from './pages/campaigns/CampaignManager';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import AdGroupDetail from './pages/adgroups/AdGroupDetail';
import Reports from './pages/reports/Reports';
import SbNewAdPage from './pages/adgroups/sb/SbNewAdPage';
import SearchTerms from './pages/SearchTerms';
import BidRecommendations from './pages/BidRecommendations';
import AuctionInsights from './pages/AuctionInsights';
import BrandMetrics from './pages/BrandMetrics';
import ChangeHistory from './pages/ChangeHistory';
import AutomationRules from './pages/AutomationRules';
import Portfolios from './pages/Portfolios';
import BulkOperations from './pages/BulkOperations';
import LearningCenter from './pages/LearningCenter';
import CreateCampaign from './pages/CreateCampaign';
import CreateCampaignSetup from './pages/CreateCampaignSetup';
import Drafts from './pages/cm/Drafts';
import Products from './pages/cm/Products';
import Targeting from './pages/cm/Targeting';
import Budgets from './pages/cm/Budgets';
import CmSettings from './pages/cm/CmSettings';
import Unavailable from './pages/Unavailable';
import { useStore } from './store/useStore';
import { ROUTES, campaignPath, adGroupPath, createAdGroupPath, createCampaignPath } from './routes';

const TICK_MS = 5000;

const LEGACY_TYPE_SLUG = { 'sponsored-products': 'sp', 'sponsored-brands': 'sb', display: 'sd' };

/** Old simulator URLs (/campaigns/:id/...) forward to the console-style URLs. */
function LegacyCampaignRedirect({ to }) {
  const { id, campaignId, adGroupId } = useParams();
  const campaign = useStore(s => s.campaigns.find(c => c.id === (id || campaignId)));
  if (!campaign) return <Navigate to={ROUTES.allCampaigns} replace />;
  if (to === 'adGroup') return <Navigate to={adGroupPath(campaign, adGroupId)} replace />;
  if (to === 'createAdGroup') return <Navigate to={createAdGroupPath(campaign)} replace />;
  return <Navigate to={campaignPath(campaign)} replace />;
}

function LegacyCreateRedirect() {
  const { type } = useParams();
  return <Navigate to={createCampaignPath(LEGACY_TYPE_SLUG[type] || 'sp')} replace />;
}

export default function App() {
  const simulateTick = useStore(s => s.simulateTick);

  useEffect(() => {
    const interval = setInterval(simulateTick, TICK_MS);
    return () => clearInterval(interval);
  }, [simulateTick]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTES.allCampaigns} replace />} />

          {/* Campaign manager */}
          <Route path="/campaign-manager/all-campaigns" element={<CampaignManager view="campaigns" />} />
          <Route path="/campaign-manager/ad-groups" element={<CampaignManager view="ad-groups" />} />
          <Route path="/campaign-manager/targets" element={<CampaignManager view="targets" />} />
          <Route path="/cm/:slug/campaigns/:campaignId/create-ad-group" element={<CreateCampaignSetup />} />
          <Route path="/cm/:slug/campaigns/:campaignId/ad-groups/:adGroupId/:tab?" element={<AdGroupDetail />} />
          <Route path="/cm/:slug/campaigns/:campaignId/:tab?" element={<CampaignDetail />} />
          <Route path={ROUTES.portfolios} element={<Portfolios />} />
          <Route path={ROUTES.drafts} element={<Drafts />} />
          <Route path={ROUTES.products} element={<Products />} />
          <Route path={ROUTES.targeting} element={<Targeting />} />
          <Route path={ROUTES.budgets} element={<Budgets />} />
          <Route path={ROUTES.history} element={<ChangeHistory />} />
          <Route path={ROUTES.bulkOperations} element={<BulkOperations />} />
          <Route path={ROUTES.rules} element={<AutomationRules />} />
          <Route path={ROUTES.settings} element={<CmSettings />} />

          {/* Campaign builder */}
          <Route path="/cb" element={<CreateCampaign />} />
          <Route path="/cb/sb/adGroups/:adGroupId/ads" element={<SbNewAdPage />} />
          <Route path="/cb/:type" element={<CreateCampaignSetup />} />
          <Route path="/cb/:type/campaigns/:campaignId/adGroups" element={<CreateCampaignSetup />} />

          {/* Other console areas */}
          <Route path={ROUTES.recommendations} element={<BidRecommendations />} />
          <Route path={ROUTES.reports} element={<Reports />} />
          <Route path={ROUTES.brandMetrics} element={<BrandMetrics />} />
          <Route path="/auction-insights" element={<AuctionInsights />} />
          <Route path="/bid-recommendations" element={<BidRecommendations />} />
          <Route path="/search-terms" element={<SearchTerms />} />
          <Route path={ROUTES.learn} element={<LearningCenter />} />
          <Route path="/unavailable/:feature" element={<Unavailable />} />

          {/* Legacy simulator URLs */}
          <Route path="/campaigns/:id" element={<LegacyCampaignRedirect />} />
          <Route path="/campaigns/:campaignId/adgroups/:adGroupId" element={<LegacyCampaignRedirect to="adGroup" />} />
          <Route path="/campaigns/:campaignId/create-ad-group" element={<LegacyCampaignRedirect to="createAdGroup" />} />
          <Route path="/create-campaign" element={<Navigate to="/cb" replace />} />
          <Route path="/create-campaign/:type" element={<LegacyCreateRedirect />} />
          <Route path="/portfolios" element={<Navigate to={ROUTES.portfolios} replace />} />
          <Route path="/bulk-operations" element={<Navigate to={ROUTES.bulkOperations} replace />} />
          <Route path="/history" element={<Navigate to={ROUTES.history} replace />} />
          <Route path="/rules" element={<Navigate to={ROUTES.rules} replace />} />
          <Route path="/brand-metrics" element={<Navigate to={ROUTES.brandMetrics} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.allCampaigns} replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
