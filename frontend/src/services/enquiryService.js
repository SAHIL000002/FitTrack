import api from './api';

/**
 * Enquiry service — Owner Enquiry management.
 */
const BASE = '/enquiries';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: list enquiries with filters. */
export function listEnquiries(params = {}) {
  const { status, enquiryType, preferredContact, search, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(status ? { status } : {}),
        ...(enquiryType ? { enquiryType } : {}),
        ...(preferredContact ? { preferredContact } : {}),
        ...(search ? { search } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single enquiry detail. */
export function getEnquiry(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Update enquiry. */
export function updateEnquiry(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Change enquiry status. */
export function patchEnquiryStatus(id, status) {
  return unwrap(api.patch(`${BASE}/${id}/status`, { status }));
}

/** Delete enquiry (soft). */
export function deleteEnquiry(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

// ── Member self-enquiries (Phase 5) ──────────────────────────────────────
// POST /api/enquiries — public create. Member passes user id so it shows in /me.
export function createEnquiry(payload) {
  return unwrap(api.post(BASE, payload));
}

// GET /api/enquiries/me — MEMBER only, own enquiries (list + meta).
export function getMyEnquiries(params = {}) {
  const { status, enquiryType, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(`${BASE}/me`, {
      params: {
        ...(status ? { status } : {}),
        ...(enquiryType ? { enquiryType } : {}),
        page,
        limit,
      },
    })
  );
}

// GET /api/enquiries/me/:id — MEMBER only, own enquiry (IDOR-safe).
export function getMyEnquiryById(id) {
  return unwrap(api.get(`${BASE}/me/${id}`));
}
