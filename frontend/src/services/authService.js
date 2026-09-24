import api from './api';

const AUTH_BASE = '/auth';

/**
 * Register a new MEMBER account.
 * SECURITY: the backend always creates a MEMBER — any role sent by the client is ignored.
 */
export async function register({ name, email, password }) {
  const { data } = await api.post(`${AUTH_BASE}/register`, { name, email, password });
  return data;
}

/**
 * Login with email + password.
 * Returns { user, token } on success.
 */
export async function login({ email, password }) {
  const { data } = await api.post(`${AUTH_BASE}/login`, { email, password });
  return data;
}

/**
 * Fetch the current authenticated user.
 * The token is attached automatically by the api interceptor.
 */
export async function getMe() {
  const { data } = await api.get(`${AUTH_BASE}/me`);
  return data;
}

/**
 * Verify role-based access against the temporary verification endpoints.
 * These endpoints exist only to prove the protect + requireRole pipeline (Phase 3 Step 6).
 * They will be removed once real role-protected feature routes exist.
 */
export async function testOwnerAuth() {
  const { data } = await api.get(`${AUTH_BASE}/test-owner`);
  return data;
}

export async function testMemberAuth() {
  const { data } = await api.get(`${AUTH_BASE}/test-member`);
  return data;
}
