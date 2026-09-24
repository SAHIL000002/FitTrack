import api from './api';

/**
 * Owner Program management.
 */
const BASE = '/programs';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: ALL programs (active + inactive) for the management table. */
export function managePrograms(params = {}) {
  const { category, difficulty, featured, page = 1, limit = 100 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(category ? { category } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(featured !== undefined ? { featured: String(featured) } : {}),
        all: 'true',
        page,
        limit,
      },
    })
  );
}

/** Single program detail. */
export function getProgram(id) {
  return unwrap(api.get(`${BASE}/${id}`, { params: { all: 'true' } }));
}

/** Create program. */
export function createProgram(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit program. */
export function updateProgram(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Activate/deactivate program. */
export function patchProgramStatus(id, isActive) {
  const active = typeof isActive === 'boolean' ? isActive : isActive === 'ACTIVE' || isActive === true;
  return unwrap(api.patch(`${BASE}/${id}/status`, { isActive: active }));
}

/** Delete program (soft). */
export function deleteProgram(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

/** Alias for managePrograms — list all programs (active + inactive). */
export const listPrograms = managePrograms;
