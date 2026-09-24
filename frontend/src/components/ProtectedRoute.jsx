import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Wraps a route element and guards access based on authentication + optional role.
 *
 * behaviour:
 *  - While auth is still loading (token → /me call in flight) we render a loader
 *    so protected pages never flash before the session is verified.
 *  - If not authenticated → redirect to /login (preserving the attempted location).
 *  - If authenticated but missing the required role → redirect to the user's own
 *    dashboard area (/owner or /member).
 */
export function ProtectedRoute({ children, roles }) {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="ft-section alt" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="ft-dot" style={{ margin: '0 auto 16px' }} />
          <div className="ft-kicker" style={{ color: 'var(--text-faint)' }}>VERIFYING SESSION</div>
          <div className="ft-title" style={{ fontSize: 28 }}>AUTHENTICATING</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    const dest = user.role === 'OWNER' ? '/owner' : '/member';
    return <Navigate to={dest} replace />;
  }

  return children;
}
export default ProtectedRoute;

