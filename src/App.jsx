import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import CampaignManager from './pages/campaigns/CampaignManager';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import AdGroupDetail from './pages/adgroups/AdGroupDetail';
import Reports from './pages/reports/Reports';
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
import { useStore } from './store/useStore';

export default function App() {
  const simulateTick = useStore(s => s.simulateTick);

  useEffect(() => {
    const interval = setInterval(simulateTick, 5000);
    return () => clearInterval(interval);
  }, [simulateTick]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CampaignManager />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/campaigns/:campaignId/adgroups/:adGroupId" element={<AdGroupDetail />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/bulk-operations" element={<BulkOperations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/search-terms" element={<SearchTerms />} />
          <Route path="/bid-recommendations" element={<BidRecommendations />} />
          <Route path="/auction-insights" element={<AuctionInsights />} />
          <Route path="/brand-metrics" element={<BrandMetrics />} />
          <Route path="/history" element={<ChangeHistory />} />
          <Route path="/rules" element={<AutomationRules />} />
          <Route path="/learn" element={<LearningCenter />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/create-campaign/:type" element={<CreateCampaignSetup />} />
          <Route path="/campaigns/:campaignId/create-ad-group" element={<CreateCampaignSetup />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
