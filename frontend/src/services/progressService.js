import api from './api';

/**
 * Progress service — Owner Progress management.
 */
const BASE = '/progress';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** List progress records with filters. */
export function listProgress(params = {}) {
  const { user, date, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(user ? { user } : {}),
        ...(date ? { date } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single progress detail. */
export function getProgress(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Add progress record for a member. */
export function createProgress(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit progress record. */
export function updateProgress(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Delete progress record. */
export function deleteProgress(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

// ── Member self-progress (Phase 5, full own CRUD) ────────────────────────
// GET /api/progress/me — MEMBER only, own records (list + meta).
export function getMyProgress(params = {}) {
  const { from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(`${BASE}/me`, {
      params: {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

// GET /api/progress/me/:id — MEMBER only, own record (IDOR-safe).
export function getMyProgressById(id) {
  return unwrap(api.get(`${BASE}/me/${id}`));
}

// POST /api/progress/me — MEMBER only. { date, weight, bodyFat, measurements, notes }
export function createMyProgress(payload) {
  return unwrap(api.post(`${BASE}/me`, payload));
}

// PATCH /api/progress/me/:id — MEMBER only, own record.
export function updateMyProgress(id, payload) {
  return unwrap(api.patch(`${BASE}/me/${id}`, payload));
}

// DELETE /api/progress/me/:id — MEMBER only, own record.
export function deleteMyProgress(id) {
  return unwrap(api.delete(`${BASE}/me/${id}`));
}
