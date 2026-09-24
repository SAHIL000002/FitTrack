import Trainer from '../models/Trainer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

// ── Public read-only endpoints ────────────────────────────────────────────

/** GET /api/trainers — public, read-only, active trainers with pagination. */
export const getTrainers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (req.query.all !== 'true' && req.query.includeInactive !== 'true') {
    query.isActive = true;
  }

  if (req.query.featured === 'true') query.featured = true;
  if (req.query.trainingStyle) {
    query.trainingStyles = { $in: [req.query.trainingStyle.toUpperCase()] };
  }

  const total = await Trainer.countDocuments(query);
  const data = await Trainer.find(query)
    .select('-user -__v')
    .sort({ featured: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Trainers fetched successfully',
  });
});

/** GET /api/trainers/:id — public, read-only, single active trainer (or inactive if all=true). */
export const getTrainerById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const query = { _id: req.params.id };
  if (req.query.all !== 'true' && req.query.includeInactive !== 'true') {
    query.isActive = true;
  }
  const trainer = await Trainer.findOne(query)
    .select('-user -__v')
    .lean();
  if (!trainer) throw new ApiError(404, 'Trainer not found');
  successResponse(res, trainer, 'Trainer fetched successfully');
});

// ── Owner trainer management ──────────────────────────────────────────────

const TRAINER_UPDATE_FIELDS = [
  'name', 'role', 'specialty', 'experience', 'bio', 'image',
  'certifications', 'trainingStyles', 'featured',
];

const extractTrainerFields = (body) => {
  const trainer = {};
  for (const field of TRAINER_UPDATE_FIELDS) {
    if (field in body) trainer[field] = body[field];
  }
  return trainer;
};

const validateTrainerFields = (trainer, isUpdate = false) => {
  if (!isUpdate && !trainer.name) throw new ApiError(400, 'Trainer name is required');
  if (trainer.experience != null && typeof trainer.experience !== 'string') {
    throw new ApiError(400, 'Experience must be a string');
  }
  if (trainer.certifications != null) {
    if (!Array.isArray(trainer.certifications)) {
      throw new ApiError(400, 'Certifications must be an array');
    }
    trainer.certifications = trainer.certifications.map(String).filter(s => s.trim());
  }
  if (trainer.trainingStyles != null) {
    if (!Array.isArray(trainer.trainingStyles)) {
      throw new ApiError(400, 'Training styles must be an array');
    }
    trainer.trainingStyles = trainer.trainingStyles.map(String).filter(s => s.trim());
  }
  if (trainer.featured != null && typeof trainer.featured !== 'boolean') {
    throw new ApiError(400, 'Featured must be a boolean');
  }
};

/** POST /api/trainers — OWNER only */
export const createTrainer = asyncHandler(async (req, res) => {
  const trainerData = extractTrainerFields(req.body);
  validateTrainerFields(trainerData, false);
  const trainer = await Trainer.create(trainerData);
  successResponse(res, trainer, 'Trainer created successfully', 201);
});

/** PATCH /api/trainers/:id — OWNER only */
export const updateTrainer = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const trainerData = extractTrainerFields(req.body);
  validateTrainerFields(trainerData, true);

  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) throw new ApiError(404, 'Trainer not found');

  for (const key of Object.keys(trainerData)) {
    trainer[key] = trainerData[key];
  }
  await trainer.save();
  successResponse(res, trainer, 'Trainer updated successfully');
});

/** PATCH /api/trainers/:id/status — OWNER only */
export const patchTrainerStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (typeof req.body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }
  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) throw new ApiError(404, 'Trainer not found');
  trainer.isActive = req.body.isActive;
  await trainer.save();
  successResponse(
    res,
    trainer,
    `Trainer ${req.body.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

/** DELETE /api/trainers/:id — OWNER only (soft-delete via isActive) */
export const deleteTrainer = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const trainer = await Trainer.findById(req.params.id);
  if (!trainer) throw new ApiError(404, 'Trainer not found');
  trainer.isActive = false;
  await trainer.save();
  successResponse(res, null, 'Trainer deleted successfully');
});