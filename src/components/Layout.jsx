import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getUsers, saveUserToList } from '../store/useStore';
import {
  BarChart2, Target, Search, FileText, Settings, Bell, ChevronDown,
  Menu, X, TrendingUp, Package, ShoppingBag, Layers, HelpCircle,
  User, LogOut, Grid, Zap, BookOpen
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Campaign Manager', icon: <Grid size={16} /> },
  { path: '/portfolios', label: 'Portfolios', icon: <Layers size={16} /> },
  { path: '/bulk-operations', label: 'Bulk Operations', icon: <Package size={16} /> },
  { path: '/reports', label: 'Measurement & Reporting', icon: <BarChart2 size={16} /> },
  { path: '/search-terms', label: 'Search Terms', icon: <Search size={16} /> },
  { path: '/bid-recommendations', label: 'Bid Recommendations', icon: <Zap size={16} /> },
  { path: '/auction-insights', label: 'Auction Insights', icon: <TrendingUp size={16} /> },
  { path: '/brand-metrics', label: 'Brand Metrics', icon: <Target size={16} /> },
  { path: '/history', label: 'Change History', icon: <FileText size={16} /> },
  { path: '/rules', label: 'Automation Rules', icon: <Settings size={16} /> },
  { path: '/learn', label: 'Learning Center', icon: <BookOpen size={16} /> },
];

export default function Layout({ children }) {
  const location = useLocation();
  const isCreateCampaign = location.pathname.startsWith('/create-campaign');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userSwitchOpen, setUserSwitchOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const notifications = useStore(s => s.notifications);
  const markAllRead = useStore(s => s.markAllNotificationsRead);
  const switchUser = useStore(s => s.switchUser);
  const currentUserName = useStore(s => s.currentUserName);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="app-shell">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="logo-area">
            <span className="logo-amazon">amazon</span>
            <span className="logo-ads">Ads</span>
          </div>
          <div className="header-divider" />
          <span className="header-account">{currentUserName} Brand Store</span>
          <ChevronDown size={14} color="#ccc" />
        </div>
        <div className="header-right">
          <button className="icon-btn" title="Help"><HelpCircle size={18} /></button>
          <div className="notif-wrapper">
            <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
              <Bell size={18} />
              {unread > 0 && <span className="badge">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="dropdown notif-dropdown">
                <div className="dropdown-header">
                  <span>Notifications</span>
                  <button onClick={markAllRead} className="link-btn">Mark all read</button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                    <div className={`notif-dot ${n.type}`} />
                    <div>
                      <p>{n.message}</p>
                      <small>{n.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="profile-wrapper">
            <button className="profile-btn" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
              <div className="avatar">{(currentUserName || 'S')[0].toUpperCase()}</div>
              <span>{currentUserName || 'SoundMax'}</span>
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <div className="dropdown profile-dropdown">
                <div className="dropdown-header">
                  <span>{currentUserName} Brand Store</span>
                  <small>alumni@kraftshala.com</small>
                </div>
                <button className="dropdown-item"><User size={14} /> Account Settings</button>
                <button className="dropdown-item" onClick={() => { setUserSwitchOpen(true); setProfileOpen(false); }}>
                  <ShoppingBag size={14} /> Switch Account
                </button>
                <hr />
                <button className="dropdown-item"><LogOut size={14} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar — hidden during campaign creation */}
        {!isCreateCampaign && (
          <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <nav>
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        {/* Page Content */}
        <main className={`page-content ${isCreateCampaign ? 'no-sidebar' : ''}`} onClick={() => { setNotifOpen(false); setProfileOpen(false); }}>
          {children}
        </main>
      </div>

      {userSwitchOpen && (
        <div className="user-switch-overlay" onClick={() => setUserSwitchOpen(false)}>
          <div className="user-switch-modal" onClick={e => e.stopPropagation()}>
            <div className="user-switch-header">
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Switch Account</h3>
                <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Each account has its own campaigns, products and settings.</p>
              </div>
              <button style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#777', lineHeight: 1 }} onClick={() => setUserSwitchOpen(false)}>×</button>
            </div>
            <div className="user-switch-body">
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Accounts</p>
              <div className="user-switch-list">
                {getUsers().map(user => (
                  <button key={user}
                    className={`user-switch-item ${currentUserName === user ? 'active' : ''}`}
                    onClick={() => { if (currentUserName !== user) switchUser(user); setUserSwitchOpen(false); }}>
                    <div className="user-switch-avatar">{user[0].toUpperCase()}</div>
                    <span style={{ fontSize: 14 }}>{user}</span>
                    {currentUserName === user && <span className="user-switch-badge">Active</span>}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Add New Account</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="user-switch-inp"
                    placeholder="Account name (e.g. Trainee B)"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newUserName.trim()) {
                        switchUser(newUserName.trim());
                        setNewUserName('');
                        setUserSwitchOpen(false);
                      }
                    }}
                  />
                  <button
                    className="user-switch-create-btn"
                    disabled={!newUserName.trim()}
                    onClick={() => {
                      if (newUserName.trim()) {
                        switchUser(newUserName.trim());
                        setNewUserName('');
                        setUserSwitchOpen(false);
                      }
                    }}
                  >
                    Create &amp; Switch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
