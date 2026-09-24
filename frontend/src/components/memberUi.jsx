import { Link } from 'react-router-dom';

export function StatCard({ label, value, sub }) {
  return (
    <div className="ft-stat-card">
      <div className="ft-stat-value" style={{ fontSize: 30 }}>{value}</div>
      <div className="ft-stat-label">{label}</div>
      {sub ? <div className="ft-mono" style={{ color: 'var(--text-faint)', fontSize: 11, marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
}

export function Skeleton({ rows }) {
  return (
    <div className="ft-members-skeleton" aria-label="Loading">
      {Array.from({ length: rows || 5 }).map((_, i) => (
        <div key={i} className="ft-skeleton-row" />
      ))}
    </div>
  );
}

export function EmptyBox({ kicker, text, action }) {
  return (
    <div className="ft-empty">
      <div className="ft-kicker">{kicker}</div>
      <p>{text}</p>
      {action || null}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="ft-empty">
      <div className="ft-kicker">UNABLE TO LOAD DATA</div>
      <p>{message || 'Something went wrong'}</p>
      <button type="button" className="ft-btn ft-btn-ghost" onClick={onRetry}>RETRY</button>
    </div>
  );
}

export function Notice({ text, ok }) {
  if (!text) return null;
  return (
    <div className={ok === false ? 'ft-banner ft-banner-err' : 'ft-banner ft-banner-ok'} role="status">
      {text}
    </div>
  );
}

export function BackLink({ to, label }) {
  return <Link to={to} className="ft-btn ft-btn-ghost">{label}</Link>;
}
