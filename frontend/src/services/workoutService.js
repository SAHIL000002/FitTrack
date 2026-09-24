import api from './api';

/**
 * Workout service — Owner Workout management.
 */
const BASE = '/workouts';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** List workouts with backend-supported filters. */
export function listWorkouts(params = {}) {
  const { user, trainer, program, status, date, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(user ? { user } : {}),
        ...(trainer ? { trainer } : {}),
        ...(program ? { program } : {}),
        ...(status ? { status } : {}),
        ...(date ? { date } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single workout detail. */
export function getWorkout(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Create workout. */
export function createWorkout(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit workout. */
export function updateWorkout(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Change workout status. */
export function patchWorkoutStatus(id, status) {
  return unwrap(api.patch(`${BASE}/${id}/status`, { status }));
}

/** Delete workout. */
export function deleteWorkout(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

// ── Member self-workouts (Phase 5, read-only) ────────────────────────────
// GET /api/workouts/me — MEMBER only, own assigned workouts (list + meta).
export function getMyWorkouts(params = {}) {
  const { status, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(`${BASE}/me`, {
      params: {
        ...(status ? { status } : {}),
        page,
        limit,
      },
    })
  );
}

// GET /api/workouts/me/:id — MEMBER only, own workout (IDOR-safe, 404 otherwise).
export function getMyWorkoutById(id) {
  return unwrap(api.get(`${BASE}/me/${id}`));
}
