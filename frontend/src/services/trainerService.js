import api from './api';

/**
 * Trainer service — Owner Trainer management.
 * Uses /api/trainers (public read + OWNER-only write).
 */
const BASE = '/trainers';

async function unwrap(request) {
  const { data } = await request;
  return data;
}

/** OWNER-only: ALL trainers (active + inactive) for the management table. */
export function manageTrainers(params = {}) {
  const { featured, trainingStyle, page = 1, limit = 100 } = params;
  return unwrap(
    api.get(BASE, {
      params: {
        ...(featured !== undefined ? { featured: String(featured) } : {}),
        ...(trainingStyle ? { trainingStyle } : {}),
        all: 'true',
        page,
        limit,
      },
    })
  );
}

export function getTrainer(id) {
  return unwrap(api.get(`${BASE}/${id}`, { params: { all: 'true' } }));
}

/** listTrainers alias for the Owner Trainers management page (active + inactive). */
export function listTrainers(params = {}) {
  return manageTrainers(params);
}

/** Create trainer. */
export function createTrainer(payload) {
  return unwrap(api.post(BASE, payload));
}

/** Edit trainer. */
export function updateTrainer(id, payload) {
  return unwrap(api.patch(`${BASE}/${id}`, payload));
}

/** Activate/deactivate trainer. */
export function patchTrainerStatus(id, isActive) {
  const active = typeof isActive === 'boolean' ? isActive : isActive === 'ACTIVE' || isActive === true;
  return unwrap(api.patch(`${BASE}/${id}/status`, { isActive: active }));
}

/** Delete trainer (soft). */
export function deleteTrainer(id) {
  return unwrap(api.delete(`${BASE}/${id}`));
}
