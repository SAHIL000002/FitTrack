import api from './api';

/**
 * Attendance service — Owner Attendance management.
 * Wraps OWNER-only /api/attendance endpoints with the shared axios client.
 */
const BASE = '/attendance';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** List attendance records with backend-supported filters. */
export function listAttendance(params = {}) {
  const { user, date, status, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(user ? { user } : {}),
        ...(date ? { date } : {}),
        ...(status ? { status } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single attendance record. */
export function getAttendance(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Record attendance (owner create). */
export function createAttendance(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit attendance. */
export function updateAttendance(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Change attendance status (uses the existing PATCH /attendance/:id endpoint). */
export function patchAttendanceStatus(id, status) {
  return unwrap(api.patch(`${BASE}/${id}`, { status }));
}

/** Delete/clear attendance record. */
export function deleteAttendance(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

// ── Member self-attendance (Phase 5) ─────────────────────────────────────
// GET /api/attendance/me — MEMBER only, own records (list shape + meta).
export function getMyAttendance(params = {}) {
  const { status, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(`${BASE}/me`, {
      params: {
        ...(status ? { status } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

// GET /api/attendance/me/:id — MEMBER only, own record (IDOR-safe).
export function getMyAttendanceById(id) {
  return unwrap(api.get(`${BASE}/me/${id}`));
}

// POST /api/attendance/check-in — MEMBER only. 409 if already checked in today.
export function checkIn(payload = {}) {
  return unwrap(api.post(`${BASE}/check-in`, payload));
}

// PATCH /api/attendance/me/today/check-out — MEMBER only.
export function checkOut() {
  return unwrap(api.patch(`${BASE}/me/today/check-out`, {}));
}
