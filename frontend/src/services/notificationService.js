import api from './api';

/**
 * Notification service — Owner Notification management.
 */
const BASE = '/notifications';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: list notifications with filters. */
export function listNotifications(params = {}) {
  const { user, type, isRead, search, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(user ? { user } : {}),
        ...(type ? { type } : {}),
        ...(isRead !== undefined ? { isRead: String(isRead) } : {}),
        ...(search ? { search } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single notification detail. */
export function getNotification(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Create notification (owner send). */
export function createNotification(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Update notification. */
export function updateNotification(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Mark notification read/unread. */
export function patchNotificationRead(id, isRead) {
  return unwrap(api.patch(`${BASE}/${id}/read`, { isRead }));
}

/** Delete notification (soft). */
export function deleteNotification(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

// ── Member self-notifications (Phase 5) ──────────────────────────────────
// GET /api/notifications/me — MEMBER only, own notifications (list + meta).
export function getMyNotifications(params = {}) {
  const { type, isRead, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(`${BASE}/me`, {
      params: {
        ...(type ? { type } : {}),
        ...(isRead !== undefined && isRead !== '' ? { isRead: String(isRead) } : {}),
        page,
        limit,
      },
    })
  );
}

// GET /api/notifications/me/:id — MEMBER only, own notification (IDOR-safe).
export function getMyNotificationById(id) {
  return unwrap(api.get(`${BASE}/me/${id}`));
}

// PATCH /api/notifications/me/:id/read — MEMBER only, marks own notification read.
export function markMyNotificationRead(id) {
  return unwrap(api.patch(`${BASE}/me/${id}/read`, {}));
}
