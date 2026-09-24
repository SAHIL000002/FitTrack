import api from './api';

/**
 * Membership service — Owner Membership + Plan management (Phase 4 Step 3).
 * Wraps the OWNER-only /api/memberships and /api/membership-plans endpoints.
 * Resolves to response body: { success, message, data, [meta] }.
 */
const M = '/memberships';
const PLANS = '/membership-plans';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

// ── Memberships ──────────────────────────────────────────────────────────

/** List memberships with backend-supported filters (status/user/plan). */
export function listMemberships(params = {}) {
  const { status, user, plan, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(M, {
      params: {
        ...(status ? { status } : {}),
        ...(user ? { user } : {}),
        ...(plan ? { plan } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single membership detail. */
export function getMembership(id) {
  return unwrap(api.get(`${M}/${id}`));
}

/**
 * Assign a new membership (owner create).
 * Backend computes endDate from plan duration, forces status ACTIVE,
 * rejects duplicate active/pending with 409.
 * @param {{ user: string, plan: string, startDate?: string, amount?: number, notes?: string }} payload
 */
export function createMembership(payload) {
  return unwrap(api.post(M, payload));
}

/** Edit membership: status / notes / endDate / amount (backend-validated). */
export function updateMembership(id, payload) {
  return unwrap(api.patch(`${M}/${id}`, payload));
}

/** Change membership status via the dedicated endpoint. */
export function patchMembershipStatus(id, status) {
  return unwrap(api.patch(`${M}/${id}/status`, { status }));
}

// ── Membership Plans ────────────────────────────────────────────────────

/** Public list — ACTIVE plans only (plan selector + available count). */
export function listMembershipPlans(params = {}) {
  const { page = 1, limit = 100 } = { ...params };
  return unwrap(api.get(PLANS, { params: { page, limit } }));
}

/** OWNER-only: ALL plans (active + inactive) for the management table. */
export function manageMembershipPlans(params = {}) {
  const { status, page = 1, limit = 100 } = { ...params };
  return unwrap(
    api.get(`${PLANS}/manage`, {
      params: { ...(status ? { status } : {}), page, limit },
    })
  );
}

export function getMembershipPlan(id) {
  return unwrap(api.get(`${PLANS}/${id}`));
}

export function createMembershipPlan(payload) {
  return unwrap(api.post(PLANS, payload));
}

export function updateMembershipPlan(id, payload) {
  return unwrap(api.patch(`${PLANS}/${id}`, payload));
}

export function patchMembershipPlanStatus(id, isActive) {
  return unwrap(api.patch(`${PLANS}/${id}/status`, { isActive }));
}

export function deleteMembershipPlan(id) {
  return unwrap(api.delete(`${PLANS}/${id}`));
}

// ── Member self-membership (Phase 5) ─────────────────────────────────────
// GET /api/memberships/me — MEMBER only, own membership history (list shape).
export function getMyMemberships() {
  return unwrap(api.get(`${M}/me`));
}

// GET /api/memberships/me/active — MEMBER only, current PENDING/ACTIVE record.
// Resolves to { success, message, data } where data may be null (no active).
export function getMyActiveMembership() {
  return unwrap(api.get(`${M}/me/active`));
}