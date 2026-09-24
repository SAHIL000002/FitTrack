import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login, getMe } from '../services/authService';

const AUTH_TOKEN_KEY = 'fit_track_token';

const AuthContext = createContext(null);

/** Human-readable error messages mapped from backend status codes. */
function getFriendlyError(status, err) {
  if (status === 400) {
    const detail = err?.response?.data?.message || err?.response?.data?.error || err?.message || '';
    if (detail.toLowerCase().includes('already exists') || detail.toLowerCase().includes('duplicate')) {
      return 'An account with this email already exists.';
    }
    if (detail.toLowerCase().includes('password')) return 'Password does not meet requirements.';
    if (detail.toLowerCase().includes('email')) return 'Email is invalid or already in use.';
    return 'Registration data is invalid. Please check your inputs.';
  }
  if (status === 401) return 'Invalid email or password.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 409) return 'An account with this email already exists.';
  if (status === 422) return 'Registration data is invalid. Please check your inputs.';
  if (status >= 500) return 'Server error. Please try again later.';
  if (!err) return 'Something went wrong. Please try again.';
  return err?.message || 'An unexpected error occurred.';
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext, useAuth };

/**
 * AuthProvider — central authentication state.
 *
 * On mount:
 *   1. Check whether a token exists in localStorage.
 *   2. If it does, call GET /api/auth/me to validate it.
 *   3. If valid → restore user + role.
 *   4. If invalid/expired → clear token + clear auth state.
 *   5. Set loading = false so protected routes can render correctly.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Startup restore ---
  useEffect(() => {
    let cancelled = false;

    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        if (cancelled) return;
        // Backend returns { user } inside { success, data } — unwrap safely.
        const u = res?.data?.user || res?.user || null;
        if (!u) {
          clearAuth();
          return;
        }
        setUser(u);
        setToken(storedToken);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        // 401/500/etc → token is stale; clear everything
        clearAuth();
      });

    function clearAuth() {
      try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch { /* ignore */ }
      setUser(null);
      setToken(null);
      setError(null);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  // --- Login ---
  const doLogin = useCallback(
    async (email, password) => {
      setError(null);
      try {
        const res = await login({ email, password });
        const u = res?.data?.user || res?.user || null;
        const t = res?.data?.token || res?.token || null;
        if (!u || !t) {
          setError('Login failed — unexpected response');
          return false;
        }
        try { localStorage.setItem(AUTH_TOKEN_KEY, t); } catch { /* ignore */ }
        setUser(u);
        setToken(t);
        return true;
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          getFriendlyError(status, err);
        setError(msg);
        return false;
      }
    },
    []
  );

  // --- Register ---
  const doRegister = useCallback(
    async (name, email, password) => {
      setError(null);
      try {
        const res = await register({ name, email, password });
        const u = res?.data?.user || res?.user || null;
        const t = res?.data?.token || res?.token || null;
        if (!u || !t) {
          setError('Registration failed — unexpected response');
          return false;
        }
        try { localStorage.setItem(AUTH_TOKEN_KEY, t); } catch { /* ignore */ }
        setUser(u);
        setToken(t);
        return true;
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          getFriendlyError(status, err);
        setError(msg);
        return false;
      }
    },
    []
  );

  // --- Logout ---
  const doLogout = useCallback(() => {
    try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    setError(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      error,
      login: doLogin,
      register: doRegister,
      logout: doLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
