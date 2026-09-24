import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  // Already signed in → straight to the member area
  if (isAuthenticated) {
    return <Navigate to="/member" replace />;
  }

  const validate = () => {
    setFieldError('');
    if (!name.trim()) return 'NAME_REQUIRED';
    if (name.trim().length < 2) return 'NAME_TOO_SHORT';
    if (name.trim().length > 60) return 'NAME_TOO_LONG';
    if (!email.trim()) return 'EMAIL_REQUIRED';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'INVALID_EMAIL';
    if (!password) return 'PASSWORD_REQUIRED';
    if (password.length < 8) return 'PASSWORD_TOO_SHORT';
    if (password.length > 128) return 'PASSWORD_TOO_LONG';
    if (password !== confirm) return 'PASSWORDS_DO_NOT_MATCH';
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

    const ok = await register(name.trim(), email.trim(), password);
    setLoading(false);

    if (ok) {
      navigate('/member', { replace: true });
    }
    // register() sets error state in context — we reflect it below
  };

  // Field-level errors take priority; fall back to the context (API) error.
  const errorMessage =
    fieldError === 'NAME_REQUIRED' ? 'Name is required.' :
    fieldError === 'NAME_TOO_SHORT' ? 'Name must be at least 2 characters.' :
    fieldError === 'NAME_TOO_LONG' ? 'Name is too long.' :
    fieldError === 'EMAIL_REQUIRED' ? 'Email is required.' :
    fieldError === 'INVALID_EMAIL' ? 'Enter a valid email address.' :
    fieldError === 'PASSWORD_REQUIRED' ? 'Password is required.' :
    fieldError === 'PASSWORD_TOO_SHORT' ? 'Password must be at least 8 characters.' :
    fieldError === 'PASSWORD_TOO_LONG' ? 'Password is too long.' :
    fieldError === 'PASSWORDS_DO_NOT_MATCH' ? 'Passwords do not match.' :
    (error || '');

  return (
    <div className="ft-section alt" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 24px' }}>
      <div className="ft-container" style={{ width: '100%', maxWidth: 460 }}>
        <div className="ft-kicker" style={{ color: 'var(--lime)' }}>FIT TRACK</div>
        <h1 className="ft-title" style={{ fontSize: 36, marginBottom: 8 }}>REGISTER</h1>
        <p className="ft-lead" style={{ marginBottom: 32 }}>Create your member account.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ft-field">
            <label htmlFor="reg-name">NAME</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          <div className="ft-field">
            <label htmlFor="reg-email">EMAIL</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fittrack.test"
              disabled={loading}
            />
          </div>

          <div className="ft-field">
            <label htmlFor="reg-password">PASSWORD</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              disabled={loading}
            />
          </div>

          <div className="ft-field">
            <label htmlFor="reg-confirm">CONFIRM PASSWORD</label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <p className="ft-field-error" role="alert">{errorMessage}</p>
          )}

          <button type="submit" className="ft-btn ft-btn-primary ft-form-btn" disabled={loading}>
            {loading ? 'REGISTERING…' : 'REGISTER'}
          </button>
        </form>

        <p className="ft-form-note" style={{ marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login">Login here</Link>
        </p>

        <p className="ft-form-note" style={{ marginTop: 8, textAlign: 'center', color: 'var(--text-faint)' }}>
          By registering you create a MEMBER account. Owner accounts are not available through self-registration.
        </p>
      </div>
    </div>
  );
}
