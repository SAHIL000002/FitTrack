import api from './api';

/**
 * Gym Settings service — Owner Settings management.
 */
const BASE = '/settings';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: get full settings. */
export function getSettings() {
  return unwrap(api.get(`${BASE}/manage`));
}

/** Update settings (singleton). */
export function updateSettings(payload) {
  return unwrap(api.put(BASE, payload));
}

// ── Public read (Phase 5, member Gym Timings — read-only) ────────────────
// GET /api/settings — public sanitized settings. 404 when not configured.
export function getPublicSettings() {
  return unwrap(api.get(BASE));
}
