import api from './api';

/**
 * Payment service — Owner Payment management.
 * Wraps OWNER-only /api/payments endpoints with the shared axios client.
 * Resolves to response body: { success, message, data, [meta] }.
 */
const BASE = '/payments';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** List payments with backend-supported filters. */
export function listPayments(params = {}) {
  const { user, membership, status, method, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(user ? { user } : {}),
        ...(membership ? { membership } : {}),
        ...(status ? { status } : {}),
        ...(method ? { method } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single payment detail. */
export function getPayment(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Record a payment. */
export function createPayment(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit payment. */
export function updatePayment(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Change payment status. */
export function patchPaymentStatus(id, status) {
  return unwrap(api.patch(`${BASE}/${id}/status`, { status }));
}

/** Delete payment. */
export function deletePayment(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

// ── Member self-payment access (Phase 5) ─────────────────────────────────
// GET /api/payments/me — MEMBER only, own payments (list shape + meta).
export function getMyPayments(params = {}) {
  const { status, method, from, to, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(`${BASE}/me`, {
      params: {
        ...(status ? { status } : {}),
        ...(method ? { method } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        page,
        limit,
      },
    })
  );
}

// GET /api/payments/me/:id — MEMBER only, own payment (IDOR-safe, 404 otherwise).
export function getMyPaymentById(id) {
  return unwrap(api.get(`${BASE}/me/${id}`));
}
