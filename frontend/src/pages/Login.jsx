import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/member';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  // Already signed in → go straight to the intended destination
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validate = () => {
    setFieldError('');
    if (!email.trim()) return 'EMAIL_REQUIRED';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'INVALID_EMAIL';
    if (!password) return 'PASSWORD_REQUIRED';
    if (password.length < 8) return 'PASSWORD_TOO_SHORT';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldError('');

    const v = validate();
    if (v) {
      setFieldError(v);
      setLoading(false);
      return;
    }

    const ok = await login(email.trim(), password);
    setLoading(false);

    if (ok) {
      navigate(from, { replace: true });
    }
    // login() sets error state in context — we reflect it below
  };

  // Field-level errors take priority; fall back to the context (API) error.
  const errorMessage =
    fieldError === 'EMAIL_REQUIRED' ? 'Email is required.' :
    fieldError === 'INVALID_EMAIL' ? 'Enter a valid email address.' :
    fieldError === 'PASSWORD_REQUIRED' ? 'Password is required.' :
    fieldError === 'PASSWORD_TOO_SHORT' ? 'Password must be at least 8 characters.' :
    (error || '');

  return (
    <div className="ft-section alt" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 24px' }}>
      <div className="ft-container" style={{ width: '100%', maxWidth: 460 }}>
        <div className="ft-kicker" style={{ color: 'var(--lime)' }}>FIT TRACK</div>
        <h1 className="ft-title" style={{ fontSize: 36, marginBottom: 8 }}>LOGIN</h1>
        <p className="ft-lead" style={{ marginBottom: 32 }}>Access your training account.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ft-field">
            <label htmlFor="login-email">EMAIL</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fittrack.test"
              disabled={loading}
            />
          </div>

          <div className="ft-field">
            <label htmlFor="login-password">PASSWORD</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <p className="ft-field-error" role="alert">{errorMessage}</p>
          )}

          <button type="submit" className="ft-btn ft-btn-primary ft-form-btn" disabled={loading}>
            {loading ? 'SIGNING IN…' : 'LOGIN'}
          </button>
        </form>

        <p className="ft-form-note" style={{ marginTop: 24 }}>
          No account yet?{' '}
          <Link to="/register">Register here</Link>
        </p>

        <p className="ft-form-note" style={{ marginTop: 8, textAlign: 'center' }}>
          OWNER area →{' '}
          <Link to="/owner">/owner</Link>
          {' · '}
          MEMBER area →{' '}
          <Link to="/member">/member</Link>
        </p>
      </div>
    </div>
  );
}
