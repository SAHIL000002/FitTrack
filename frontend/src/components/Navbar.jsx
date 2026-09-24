import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/programs', label: 'Programs' },
  { to: '/equipment', label: 'Equipment' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/membership', label: 'Membership' },
  { to: '/home-workout', label: 'Home Workout' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const navClass = ({ isActive }) => (isActive ? 'ft-nav-link active' : 'ft-nav-link');

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const dashboardTo = user?.role === 'OWNER' ? '/owner' : '/member';

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <header className="ft-nav">
      <div className="ft-nav-inner">
        <Link to="/" className="ft-brand" aria-label="FIT TRACK home">
          <img className="ft-brand-logo" src="/logo.png" alt="FIT TRACK" width="1376" height="768" />
        </Link>
        <nav className="ft-nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="ft-nav-actions">
          {isAuthenticated && user ? (
            <>
              <Link to={dashboardTo} className="ft-login">DASHBOARD</Link>
              <button type="button" onClick={handleLogout} className="ft-btn ft-btn-primary ft-join">LOGOUT</button>
            </>
          ) : (
            <>
              <Link to="/login" className="ft-login">LOGIN</Link>
              <Link to="/register" className="ft-btn ft-btn-primary ft-join">JOIN NOW →</Link>
            </>
          )}
          <button
            className="ft-burger"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >☰</button>
        </div>
      </div>
      <nav className={`ft-mobile-menu ${open ? 'open' : ''}`} aria-label="Mobile">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setOpen(false)}>{l.label}</NavLink>
        ))}
        {isAuthenticated && user ? (
          <>
            <Link to={dashboardTo} onClick={() => setOpen(false)}>Dashboard</Link>
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

