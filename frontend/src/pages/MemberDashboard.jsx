import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MemberDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return null; // ProtectedRoute handles the loading state
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'MEMBER') {
    return <Navigate to="/owner" replace />;
  }

  return (
    <div className="ft-section alt" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 24px' }}>
      <div className="ft-container" style={{ maxWidth: 720, textAlign: 'center' }}>
        <div className="ft-kicker" style={{ color: 'var(--lime)' }}>MEMBER AREA</div>
        <h1 className="ft-title" style={{ fontSize: 36, marginBottom: 16 }}>MEMBER DASHBOARD</h1>
        <div className="ft-tag" style={{ marginBottom: 24 }}>{user.role} · {user.email}</div>
        <p className="ft-lead" style={{ marginBottom: 32 }}>
          Member Dashboard Coming Next.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 24 }}>
          This is a protected route. Only users with the MEMBER role can access this page.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/owner" className="ft-btn ft-btn-ghost">GO TO OWNER AREA</Link>
          <Link to="/" className="ft-btn ft-btn-ghost">BACK TO HOME</Link>
          <button type="button" className="ft-btn ft-btn-ghost" onClick={logout}>LOGOUT</button>
        </div>
      </div>
    </div>
  );
}
