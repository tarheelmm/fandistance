import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import './nav.css';

/** Global navigation is exactly HOME | GAME DAY | PASSPORT. */
const TABS: { to: string; label: string; icon: IconName; match: RegExp }[] = [
  { to: '/', label: 'Home', icon: 'home', match: /^\/$/ },
  { to: '/gameday', label: 'Game Day', icon: 'gameday', match: /^\/(gameday|ticket)/ },
  { to: '/passport', label: 'Passport', icon: 'passport', match: /^\/passport/ },
];

export function BottomNav({ tone }: { tone: 'light' | 'dark' }) {
  const { pathname } = useLocation();
  return (
    <nav className={`bottom-nav ${tone}`} aria-label="Primary">
      {TABS.map((t) => {
        const active = t.match.test(pathname);
        return (
          <NavLink key={t.to} to={t.to} className={`bn-tab ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} end={t.to === '/'}>
            <Icon name={t.icon} size={24} />
            <span>{t.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
