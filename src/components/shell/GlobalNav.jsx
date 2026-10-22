import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CirclePlus, Megaphone, LayoutGrid, ShieldCheck, Images, ChartLine,
  ChartColumn, Network, Grip, Briefcase, Settings, ChevronRight, ChevronDown, SquareArrowOutUpRight,
} from 'lucide-react';
import { GLOBAL_NAV } from './navConfig';

const ICONS = {
  create: CirclePlus,
  campaigns: Megaphone,
  recommendations: LayoutGrid,
  brand: ShieldCheck,
  creative: Images,
  insights: ChartLine,
  measurement: ChartColumn,
  data: Network,
  tools: Grip,
  allTools: Briefcase,
  admin: Settings,
};

const ICON_SIZE = 20;

function isItemActive(item, pathname) {
  const prefixes = item.matches || (item.to ? [item.to] : []);
  const childHit = (item.children || []).some(c => c.to && pathname.startsWith(c.to));
  return childHit || prefixes.some(p => pathname.startsWith(p));
}

export default function GlobalNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  // One section open at a time, like the console.
  const [openKey, setOpenKey] = useState(null);

  const go = (to) => {
    if (!to) return;
    navigate(to);
    setIsExpanded(false);
  };

  const handleItemClick = (item) => {
    if (item.children && isExpanded) {
      setOpenKey(k => (k === item.key ? null : item.key));
      return;
    }
    go(item.to || item.children?.find(c => c.to)?.to);
  };

  return (
    <nav
      className={`gnav ${isExpanded ? 'is-expanded' : ''}`}
      aria-label="Amazon Ads navigation"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <ul className="gnav-list">
        {GLOBAL_NAV.map(item => {
          const Icon = ICONS[item.icon];
          const isActive = isItemActive(item, pathname);
          const isOpen = openKey === item.key;
          return (
            <li key={item.key}>
              <button
                type="button"
                className={`gnav-item ${isActive ? 'is-active' : ''} ${isOpen && isExpanded ? 'is-open' : ''}`}
                onClick={() => handleItemClick(item)}
                aria-expanded={item.children ? isOpen : undefined}
                title={isExpanded ? undefined : item.label}
              >
                <span className="gnav-icon"><Icon size={ICON_SIZE} strokeWidth={1.75} /></span>
                <span className="gnav-label">{item.label}</span>
                {item.children && (
                  <span className="gnav-chevron">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                )}
              </button>
              {item.children && isExpanded && isOpen && (
                <ul className="gnav-sublist">
                  {item.children.map((child, i) => {
                    if (child.divider) return <li key={`d${i}`} className="gnav-divider" role="separator" />;
                    if (child.heading) return <li key={`h${i}`} className="gnav-subheading">{child.heading}</li>;
                    return (
                    <li key={child.label}>
                      <button
                        type="button"
                        className={`gnav-subitem ${pathname.startsWith(child.to) ? 'is-active' : ''}`}
                        onClick={() => go(child.to)}
                      >
                        {child.label}
                        {child.badge && <span className="gnav-badge">{child.badge}</span>}
                        {child.isExternal && <SquareArrowOutUpRight size={14} className="gnav-external" aria-label="Opens in a new tab" />}
                      </button>
                    </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
