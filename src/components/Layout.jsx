import { useEffect, useRef, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import TopBar from './shell/TopBar';
import GlobalNav from './shell/GlobalNav';
import CmSubNav from './shell/CmSubNav';
import UserSwitchModal from './shell/UserSwitchModal';

// Campaign builder pages take over the whole window, like the real "× New campaign" screen.
const FULLSCREEN_PATTERNS = ['/cb/:slug', '/cb/:slug/campaigns/:campaignId/adGroups', '/cm/:slug/campaigns/:campaignId/create-ad-group', '/cb/sb/adGroups/:adGroupId/ads'];

// Pages that sit under the campaign manager sub-nav. The all-campaigns view
// starts with it collapsed (as on the console); the /cm list pages show it open.
const SUBNAV_COLLAPSED_BY_DEFAULT = ['/campaign-manager'];
const SUBNAV_PAGES = ['/campaign-manager', '/cm/portfolios', '/cm/drafts', '/cm/products', '/cm/targeting',
  '/cm/budgets', '/cm/history', '/cm/bulk-operations', '/cm/rules', '/cm/settings'];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [subnavOverride, setSubnavOverride] = useState({});
  const contentRef = useRef(null);

  // Each page opens at the top, as a full page load would on the console.
  useEffect(() => { contentRef.current?.scrollTo(0, 0); }, [pathname]);

  const isFullscreen = FULLSCREEN_PATTERNS.some(p => matchPath(p, pathname));
  if (isFullscreen) {
    return <main ref={contentRef} className="wizard-content">{children}</main>;
  }

  const subnavKey = SUBNAV_PAGES.find(p => pathname.startsWith(p));
  const isSubnavCollapsed = subnavKey
    ? (subnavOverride[subnavKey] ?? SUBNAV_COLLAPSED_BY_DEFAULT.includes(subnavKey))
    : false;

  return (
    <div className="shell">
      <TopBar onSwitchAccount={() => setIsSwitchOpen(true)} />
      <div className="shell-body">
        <GlobalNav />
        <div className="shell-main">
          {subnavKey && (
            <CmSubNav
              isCollapsed={isSubnavCollapsed}
              onToggle={() => setSubnavOverride(o => ({ ...o, [subnavKey]: !isSubnavCollapsed }))}
            />
          )}
          <main ref={contentRef} className="shell-content">{children}</main>
        </div>
      </div>
      {isSwitchOpen && <UserSwitchModal onClose={() => setIsSwitchOpen(false)} />}
    </div>
  );
}
