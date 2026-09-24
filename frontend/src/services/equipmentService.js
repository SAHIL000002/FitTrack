import api from './api';

/**
 * Owner Equipment management.
 */
const BASE = '/equipment';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: ALL equipment (active + inactive) for management. */
export function manageEquipment(params = {}) {
  const { category, condition, type, search, page = 1, limit = 100 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(category ? { category } : {}),
        ...(condition ? { condition } : {}),
        ...(type ? { type } : {}),
        ...(search ? { search } : {}),
        all: 'true',
        page,
        limit,
      },
    })
  );
}

/** Single equipment detail. */
export function getEquipment(id) {
  return unwrap(api.get(`${BASE}/${id}`));
}

/** Create equipment. */
export function createEquipment(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit equipment. */
export function updateEquipment(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Activate/deactivate equipment. */
export function patchEquipmentStatus(id, isActive) {
  return unwrap(api.patch(`${BASE}/${id}/status`, { isActive }));
}

/** Delete equipment (soft). */
export function deleteEquipment(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}

/** Alias for manageEquipment — list all equipment (active + inactive). */
export const listEquipment = manageEquipment;
