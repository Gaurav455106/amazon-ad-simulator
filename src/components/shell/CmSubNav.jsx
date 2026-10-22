import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeftFromLine, ArrowRightFromLine, ChevronDown } from 'lucide-react';
import { CM_SUBNAV } from './navConfig';

const isLinkActive = (link, pathname) =>
  (link.matches || [link.to]).some(p => pathname.startsWith(p));

/** Campaign manager secondary nav: country selector + grouped links. */
export default function CmSubNav({ isCollapsed, onToggle }) {
  const { pathname } = useLocation();

  if (isCollapsed) {
    return (
      <aside className="cmnav is-collapsed">
        <button type="button" className="cmnav-toggle" onClick={onToggle} aria-label="Expand navigation">
          <ArrowRightFromLine size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="cmnav">
      <button type="button" className="cmnav-country">
        India <ChevronDown size={16} />
      </button>
      <div className="cmnav-toggle-row">
        <button type="button" className="cmnav-toggle" onClick={onToggle} aria-label="Collapse navigation">
          <ArrowLeftFromLine size={16} />
        </button>
      </div>
      <nav aria-label="Campaign manager">
        {CM_SUBNAV.map((group, gi) => (
          <ul key={gi} className="cmnav-group">
            {group.map(link => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  className={() => `cmnav-link ${isLinkActive(link, pathname) ? 'is-active' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </nav>
    </aside>
  );
}
