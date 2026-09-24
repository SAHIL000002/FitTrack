import Program from '../models/Program.js';
import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

// ── Public read-only endpoints ────────────────────────────────────────────

/** GET /api/programs — public, read-only, active programs with pagination. */
export const getPrograms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (req.query.all !== 'true' && req.query.includeInactive !== 'true') {
    query.isActive = true;
  }

  if (req.query.category) query.category = req.query.category.toUpperCase();
  if (req.query.difficulty) query.difficulty = req.query.difficulty.toUpperCase();
  if (req.query.featured === 'true') query.featured = true;

  const total = await Program.countDocuments(query);
  const data = await Program.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Programs fetched successfully',
  });
});

/** GET /api/programs/:id — public, read-only, single active program (or inactive if all=true). */
export const getProgramById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const query = { _id: req.params.id };
  if (req.query.all !== 'true' && req.query.includeInactive !== 'true') {
    query.isActive = true;
  }
  const program = await Program.findOne(query)
    .populate('equipment', 'name category image')
    .lean();
  if (!program) throw new ApiError(404, 'Program not found');
  successResponse(res, program, 'Program fetched successfully');
});

// ── Slug helpers ──────────────────────────────────────────────────────────

const slugify = (name) =>
  name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

const generateUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name) || 'program';
  let candidate = base;
  let suffix = 1;
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Program.findOne(query).lean();
    if (!existing) return candidate;
    candidate = `${base}-${suffix++}`;
  }
};

// ── Validation helpers ─────────────────────────────────────────────────────

const validateEquipmentReferences = async (ids) => {
  const validIds = ids.map(id => validateId(id, true));
  const existing = await Equipment.find({
    _id: { $in: validIds },
    isActive: true,
  }).lean();
  if (existing.length !== validIds.length) {
    throw new ApiError(400, 'One or more equipment references are invalid or inactive');
  }
};

// ── Owner program management ────────────────────────────────────────────────
const PROGRAM_UPDATE_FIELDS = [
  'name', 'slug', 'description', 'category', 'difficulty',
  'duration', 'focus', 'equipment', 'sessions', 'image', 'featured',
];

const extractProgramFields = (body) => {
  const program = {};
  for (const field of PROGRAM_UPDATE_FIELDS) {
    if (field in body) program[field] = body[field];
  }
  return program;
};

const validateProgramFields = (program, isUpdate = false) => {
  if (!isUpdate && !program.name) throw new ApiError(400, 'Program name is required');
  if (program.category != null && typeof program.category !== 'string') {
    throw new ApiError(400, 'Category must be a string');
  }
  if (program.difficulty != null && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(program.difficulty.toUpperCase())) {
    throw new ApiError(400, 'Difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED');
  }
  if (program.duration != null && (typeof program.duration !== 'string' || !program.duration.trim())) {
    throw new ApiError(400, 'Duration must be a non-empty string');
  }
  if (program.equipment != null) {
    if (!Array.isArray(program.equipment)) throw new ApiError(400, 'Equipment must be an array');
    program.equipment = program.equipment.map(String);
    if (program.equipment.length === 0) throw new ApiError(400, 'Equipment array cannot be empty');
  }
  if (program.sessions != null) {
    if (!Array.isArray(program.sessions)) throw new ApiError(400, 'Sessions must be an array');
    for (let i = 0; i < program.sessions.length; i++) {
      const s = program.sessions[i];
      if (!s || typeof s !== 'object') throw new ApiError(400, `Session ${i + 1} must be an object`);
      if (!s.label || typeof s.label !== 'string') throw new ApiError(400, `Session ${i + 1} label is required`);
      if (s.duration == null || typeof s.duration !== 'string') throw new ApiError(400, `Session ${i + 1} duration is required`);
      if (s.work !== undefined && typeof s.work !== 'string') throw new ApiError(400, `Session ${i + 1} work must be a string`);
    }
  }
  if (program.featured != null && typeof program.featured !== 'boolean') {
    throw new ApiError(400, 'Featured must be a boolean');
  }
  if (program.description != null && typeof program.description !== 'string') {
    throw new ApiError(400, 'Description must be a string');
  }
  if (program.focus != null && typeof program.focus !== 'string') {
    throw new ApiError(400, 'Focus must be a string');
  }
};

/** POST /api/programs — OWNER only */
export const createProgram = asyncHandler(async (req, res) => {
  const programData = extractProgramFields(req.body);
  validateProgramFields(programData, false);

  let slug = programData.slug ? slugify(programData.slug) : null;
  if (!slug) slug = await generateUniqueSlug(programData.name);

  if (programData.equipment && programData.equipment.length > 0) {
    await validateEquipmentReferences(programData.equipment);
    programData.equipment = programData.equipment.map(id => validateId(id, true));
  }

  const program = await Program.create({
    ...programData,
    slug,
    equipment: programData.equipment || [],
  });

  const saved = await Program.findById(program._id)
    .populate('equipment', 'name category image')
    .lean();
  successResponse(res, saved, 'Program created successfully', 201);
});

/** PATCH /api/programs/:id — OWNER only */
export const updateProgram = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const programData = extractProgramFields(req.body);
  validateProgramFields(programData, true);

  const program = await Program.findById(req.params.id);
  if (!program) throw new ApiError(404, 'Program not found');

  if (programData.slug && slugify(programData.slug) !== program.slug) {
    const newSlug = await generateUniqueSlug(programData.slug, program._id);
    program.slug = newSlug;
  }

  if (programData.equipment && programData.equipment.length > 0) {
    await validateEquipmentReferences(programData.equipment);
    programData.equipment = programData.equipment.map(id => validateId(id, true));
  }

  for (const key of Object.keys(programData)) {
    program[key] = programData[key];
  }
  await program.save();

  const saved = await Program.findById(program._id)
    .populate('equipment', 'name category image')
    .lean();
  successResponse(res, saved, 'Program updated successfully');
});

/** PATCH /api/programs/:id/status — OWNER only */
export const patchProgramStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (typeof req.body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }
  const program = await Program.findById(req.params.id);
  if (!program) throw new ApiError(404, 'Program not found');
  program.isActive = req.body.isActive;
  await program.save();
  successResponse(
    res,
    program,
    `Program ${req.body.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

/** DELETE /api/programs/:id — OWNER only (soft-delete via isActive) */
export const deleteProgram = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const program = await Program.findById(req.params.id);
  if (!program) throw new ApiError(404, 'Program not found');
  program.isActive = false;
  await program.save();
  successResponse(res, null, 'Program deleted successfully');
});
