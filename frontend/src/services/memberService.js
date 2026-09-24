import api from './api';

/**
 * Member service — Owner Members management (Phase 4 Step 2).
 * Wraps the OWNER-only /api/users endpoints with the shared axios client.
 * Every function resolves to the response body: { success, message, data, [meta] }.
 */

const BASE = '/users';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/**
 * List members with query params.
 * @param {{ search?: string, role?: 'OWNER'|'MEMBER', status?: 'active'|'inactive', page?: number, limit?: number }} params
 */
export function listMembers(params = {}) {
  const { search, role, status, page = 1, limit = 10 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        page,
        limit,
      },
    })
  );
}

/** Single member detail (sanitized server-side). */
export function getMember(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/**
 * Create a MEMBER account. The backend forces role=MEMBER and rejects OWNER.
 * @param {{ name: string, email: string, password: string, phone?: string }} payload
 */
export function createMember(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit name/phone only (backend rejects role/password here). */
export function updateMember(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Activate/deactivate a member via the dedicated status endpoint. */
export function setMemberStatus(id, isActive) {
  return unwrap(api.patch(`${BASE}/${id}/status`, { isActive }));
}

/** Soft-delete a member (backend sets deletedAt + isActive=false). */
export function deleteMember(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}
