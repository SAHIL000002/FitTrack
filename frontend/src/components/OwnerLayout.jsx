import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/owner', label: 'OVERVIEW', end: true },
  { to: '/owner/members', label: 'MEMBERS', end: false },
  { to: '/owner/memberships', label: 'MEMBERSHIPS', end: false },
  { to: '/owner/payments', label: 'PAYMENTS', end: false },
  { to: '/owner/attendance', label: 'ATTENDANCE', end: false },
  { to: '/owner/trainers', label: 'TRAINERS', end: false },
  { to: '/owner/programs', label: 'PROGRAMS', end: false },
  { to: '/owner/workouts', label: 'WORKOUTS', end: false },
  { to: '/owner/progress', label: 'PROGRESS', end: false },
  { to: '/owner/enquiries', label: 'ENQUIRIES', end: false },
  { to: '/owner/announcements', label: 'ANNOUNCEMENTS', end: false },
  { to: '/owner/notifications', label: 'NOTIFICATIONS', end: false },
  { to: '/owner/equipment', label: 'EQUIPMENT', end: false },
  { to: '/owner/settings', label: 'SETTINGS', end: false },
];

/**
 * OwnerLayout — shared Owner-area shell.
 * Owner top bar + sidebar nav. Active nav state is highlighted via NavLink.
 * MEMBERS → /owner/members.
 */
export default function OwnerLayout({ title, subtitle, kicker = 'OWNER AREA', children }) {
  const { user, logout } = useAuth();

  return (
    <div className="ft-owner">
      <header className="ft-owner-top">
        <div className="ft-owner-top-brand">
          <span className="ft-kicker">{kicker}</span>
          <span className="ft-owner-top-user">{user?.email || ''}</span>
        </div>
        <button type="button" className="ft-btn ft-btn-ghost ft-owner-logout" onClick={logout}>
          LOGOUT
        </button>
      </header>

      <div className="ft-owner-body">
        <aside className="ft-owner-side">
          <nav className="ft-owner-nav" aria-label="Owner area">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `ft-owner-nav-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="ft-owner-main">
          <div className="ft-owner-head">
            <h1 className="ft-owner-title">{title}</h1>
            <p className="ft-owner-sub">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}