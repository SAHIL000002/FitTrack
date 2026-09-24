import api from './api';

/**
 * Announcement service — Owner Announcement management.
 */
const BASE = '/announcements';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: list announcements with filters. */
export function listAnnouncements(params = {}) {
  const { isActive, audience, priority, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(isActive !== undefined ? { isActive: String(isActive) } : {}),
        ...(audience ? { audience } : {}),
        ...(priority ? { priority } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single announcement detail. */
export function getAnnouncement(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Create announcement. */
export function createAnnouncement(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit announcement. */
export function updateAnnouncement(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Activate/deactivate announcement. */
export function patchAnnouncementStatus(id, isActive) {
  return unwrap(api.patch(`${BASE}/${id}/status`, { isActive }));
}

/** Delete announcement. */
export function deleteAnnouncement(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}
