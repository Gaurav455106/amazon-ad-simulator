import { useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Bell, CircleHelp, CircleUser, House, ChevronRight, ShoppingBag, LogOut, User } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ROUTES, campaignPath } from '../../routes';

const SECTION_LABELS = [
  { prefix: '/cb', label: 'Create campaign' },
  { prefix: '/campaign-manager', label: 'Campaigns' },
  { prefix: '/cm', label: 'Campaigns' },
  { prefix: '/recommendations', label: 'Recommendations' },
  { prefix: '/reports', label: 'Sponsored ads reports' },
  { prefix: '/bb/bm', label: 'Brand metrics' },
  { prefix: '/learn', label: 'Amazon Ads Academy' },
];

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const campaigns = useStore(s => s.campaigns);
  const adGroups = useStore(s => s.adGroups);

  const agMatch = matchPath('/cm/:slug/campaigns/:campaignId/ad-groups/:adGroupId/*', pathname);
  const cMatch = agMatch || matchPath('/cm/:slug/campaigns/:campaignId/*', pathname);
  if (!cMatch) return [];

  const campaign = campaigns.find(c => c.id === cMatch.params.campaignId);
  if (!campaign) return [];

  const crumbs = [
    { label: 'All campaigns', to: ROUTES.allCampaigns },
    { label: `Campaign: ${campaign.name}`, to: agMatch ? campaignPath(campaign) : null },
  ];
  if (agMatch) {
    const adGroup = adGroups.find(ag => ag.id === agMatch.params.adGroupId);
    if (adGroup) crumbs.push({ label: `Ad group: ${adGroup.name}`, to: null });
  }
  return crumbs;
}

export default function TopBar({ onSwitchAccount }) {
  const { pathname } = useLocation();
  const crumbs = useBreadcrumbs();
  const notifications = useStore(s => s.notifications);
  const markAllRead = useStore(s => s.markAllNotificationsRead);
  const currentUserName = useStore(s => s.currentUserName);
  const [openMenu, setOpenMenu] = useState(null);

  const unread = notifications.filter(n => !n.read).length;
  const section = SECTION_LABELS.find(s => pathname.startsWith(s.prefix))?.label || 'Campaigns';
  const toggle = (menu) => setOpenMenu(m => (m === menu ? null : menu));

  return (
    <header className="tbar">
      <div className="tbar-left">
        <Link to={ROUTES.allCampaigns} className="tbar-logo" aria-label="Amazon Ads home">
          <span className="tbar-logo-word">amazon ads</span>
          <svg className="tbar-logo-smile" viewBox="0 0 60 10" aria-hidden="true">
            <path d="M2 2 Q30 12 56 3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M51 1 L57 3 L53 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="tbar-section">{section}</span>
        <Link to={ROUTES.allCampaigns} className="tbar-home" title={`Set ${section} as your homepage`}>
          <House size={16} />
        </Link>
        {crumbs.length > 0 && (
          <ol className="tbar-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {i > 0 && <ChevronRight size={12} className="tbar-crumb-sep" />}
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="tbar-right">
        {openMenu && <div className="tbar-scrim" onClick={() => setOpenMenu(null)} />}
        <div className="tbar-account">
          <span className="tbar-account-name">{currentUserName}</span>
          <span className="tbar-account-sub">Sponsored ads, India</span>
        </div>

        <div className="tbar-menu-wrap">
          <button type="button" className="tbar-icon" aria-label="See my notifications" onClick={() => toggle('notif')}>
            <Bell size={22} strokeWidth={1.75} />
            {unread > 0 && <span className="tbar-dot" />}
          </button>
          {openMenu === 'notif' && (
            <div className="tbar-dropdown tbar-notifs">
              <div className="tbar-dropdown-head">
                <strong>Notifications</strong>
                <button type="button" className="link-btn" onClick={markAllRead}>Mark all as read</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`tbar-notif ${n.read ? '' : 'is-unread'}`}>
                  <p>{n.message}</p>
                  <small>{n.time}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="tbar-icon" aria-label="Open the help panel">
          <CircleHelp size={22} strokeWidth={1.75} />
        </button>

        <div className="tbar-menu-wrap">
          <button type="button" className="tbar-icon" aria-label="Your preferences" onClick={() => toggle('profile')}>
            <CircleUser size={22} strokeWidth={1.75} />
          </button>
          {openMenu === 'profile' && (
            <div className="tbar-dropdown tbar-profile">
              <div className="tbar-dropdown-head">
                <strong>{currentUserName}</strong>
                <small>Sponsored ads, India</small>
              </div>
              <button type="button" className="tbar-dropdown-item"><User size={14} /> Your preferences</button>
              <button type="button" className="tbar-dropdown-item" onClick={() => { setOpenMenu(null); onSwitchAccount(); }}>
                <ShoppingBag size={14} /> Switch account
              </button>
              <hr />
              <button type="button" className="tbar-dropdown-item"><LogOut size={14} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
