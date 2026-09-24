import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { equipmentService } from '../services/equipmentService.js';

// ── Public read-only endpoints ────────────────────────────────────────────

/**
 * GET /api/equipment — public, read-only, ACTIVE equipment only.
 * Filters: category, condition, type, search (+ page/limit pagination).
 */
export const getEquipment = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = equipmentService.buildPublicQuery(req.query);

  const total = await Equipment.countDocuments(query);
  const data = await Equipment.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Equipment fetched successfully',
  });
});

/**
 * GET /api/equipment/:id — public, read-only, single ACTIVE equipment item.
 * invalid ID → 400 · missing/inactive → 404 · valid active → 200
 */
export const getEquipmentById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const query = { _id: req.params.id };
  if (req.query.all !== 'true' && req.query.includeInactive !== 'true') {
    query.isActive = true;
  }
  const equipment = await Equipment.findOne(query).lean();
  if (!equipment) throw new ApiError(404, 'Equipment not found');
  successResponse(res, equipment, 'Equipment fetched successfully');
});

// ── Owner equipment management ────────────────────────────────────────────

/** POST /api/equipment — OWNER only. Only known model fields are accepted. */
export const createEquipment = asyncHandler(async (req, res) => {
  const data = equipmentService.extractEquipmentFields(req.body);
  equipmentService.validateEquipmentFields(data, false);

  const equipment = await Equipment.create(data);
  successResponse(res, equipment, 'Equipment created successfully', 201);
});

/** PATCH /api/equipment/:id — OWNER only. Validates provided fields, preserves the rest. */
export const updateEquipment = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const data = equipmentService.extractEquipmentFields(req.body);
  equipmentService.validateEquipmentFields(data, true);

  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) throw new ApiError(404, 'Equipment not found');

  for (const key of Object.keys(data)) {
    equipment[key] = data[key];
  }
  await equipment.save();
  successResponse(res, equipment, 'Equipment updated successfully');
});

/** PATCH /api/equipment/:id/status — OWNER only (existing project status convention). */
export const patchEquipmentStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (typeof req.body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) throw new ApiError(404, 'Equipment not found');

  equipment.isActive = req.body.isActive;
  await equipment.save();
  successResponse(
    res,
    equipment,
    `Equipment ${req.body.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

/** DELETE /api/equipment/:id — OWNER only. Soft-delete via isActive (data is preserved). */
export const deleteEquipment = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) throw new ApiError(404, 'Equipment not found');

  equipment.isActive = false;
  await equipment.save();
  successResponse(res, null, 'Equipment deleted successfully');
});
