import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/member', label: 'OVERVIEW', end: true },
  { to: '/member/profile', label: 'MY PROFILE', end: true },
  { to: '/member/membership', label: 'MY MEMBERSHIP', end: false },
  { to: '/member/plans', label: 'MEMBERSHIP PLANS', end: true },
  { to: '/member/payments', label: 'PAYMENTS', end: false },
  { to: '/member/attendance', label: 'ATTENDANCE', end: true },
  { to: '/member/workouts', label: 'WORKOUTS', end: false },
  { to: '/member/progress', label: 'PROGRESS', end: false },
  { to: '/member/trainer', label: 'MY TRAINER', end: true },
  { to: '/member/notifications', label: 'NOTIFICATIONS', end: false },
  { to: '/member/enquiries', label: 'ENQUIRIES', end: false },
  { to: '/member/settings', label: 'GYM TIMINGS', end: true },
];

export default function MemberLayout({ title, subtitle, kicker, children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="ft-owner">
      <header className="ft-owner-top">
        <div className="ft-owner-top-brand">
          <button type="button" className="ft-burger ft-member-burger" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">☰</button>
          <span className="ft-kicker">{kicker || 'MEMBER AREA'}</span>
          <span className="ft-owner-top-user">{user?.email || ''}</span>
        </div>
        <button type="button" className="ft-btn ft-btn-ghost ft-owner-logout" onClick={logout}>LOGOUT</button>
      </header>
      <div className="ft-owner-body">
        <aside className="ft-owner-side">
          <nav className={`ft-owner-nav${open ? ' open' : ''}`} aria-label="Member area">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => `ft-owner-nav-link${isActive ? ' is-active' : ''}`}>{item.label}</NavLink>
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
