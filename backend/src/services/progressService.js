import Progress from '../models/Progress.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { validateId } from '../utils/validateId.js';

// Allowed fields for member create
const PROGRESS_CREATE_FIELDS = ['date', 'weight', 'bodyFat', 'measurements', 'notes'];

const extractProgressFields = (body, allowed) => {
  const data = {};
  for (const field of allowed) {
    if (field in body) data[field] = body[field];
  }
  return data;
};

const validateProgressFields = (data, isUpdate = false) => {
  // Date
  if (data.date != null) {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid date');
    data.date = d;
  }

  // Weight
  if (data.weight != null) {
    if (typeof data.weight !== 'number' || !isFinite(data.weight) || data.weight <= 0) {
      throw new ApiError(400, 'Weight must be a positive number');
    }
  }

  // Body fat
  if (data.bodyFat != null) {
    if (typeof data.bodyFat !== 'number' || !isFinite(data.bodyFat) || data.bodyFat < 0 || data.bodyFat > 100) {
      throw new ApiError(400, 'Body fat must be a number between 0 and 100');
    }
  }

  // Measurements — only validate keys actually present
  if (data.measurements != null) {
    if (typeof data.measurements !== 'object' || data.measurements === null || Array.isArray(data.measurements)) {
      throw new ApiError(400, 'Measurements must be an object');
    }
    const allowedKeys = ['chest', 'waist', 'hips', 'arms', 'thighs'];
    for (const key of Object.keys(data.measurements)) {
      if (!allowedKeys.includes(key)) {
        throw new ApiError(400, `Unknown measurement field: ${key}`);
      }
      const val = data.measurements[key];
      if (val != null) {
        if (typeof val !== 'number' || !isFinite(val) || val < 0) {
          throw new ApiError(400, `Measurement ${key} must be a non-negative number`);
        }
      }
    }
  }

  // Notes
  if (data.notes != null) {
    if (typeof data.notes !== 'string') throw new ApiError(400, 'Notes must be a string');
  }
};

const ensureUserExists = async (userId) => {
  validateId(userId);
  const user = await User.findOne({ _id: userId, deletedAt: null, isActive: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const buildOwnerQuery = (filters) => {
  const query = {};
  if (filters.user) {
    validateId(filters.user);
    query.user = filters.user;
  }
  if (filters.from || filters.to) {
    const fd = filters.from ? new Date(filters.from) : null;
    const td = filters.to ? new Date(filters.to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, 'from must be before to');
    query.date = {};
    if (fd) query.date.$gte = fd;
    if (td) query.date.$lte = td;
  } else if (filters.date) {
    const d = new Date(filters.date);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid date filter');
    query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }
  return query;
};

const buildMemberQuery = (user, filters) => {
  const query = { user };
  if (filters.from || filters.to) {
    const fd = filters.from ? new Date(filters.from) : null;
    const td = filters.to ? new Date(filters.to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, 'from must be before to');
    query.date = {};
    if (fd) query.date.$gte = fd;
    if (td) query.date.$lte = td;
  }
  return query;
};

const populateProgress = async (progress) => {
  if (!progress) return null;
  return Progress.findById(progress._id).populate('user', 'name email role phone avatar isActive').lean();
};

export const progressService = {
  PROGRESS_CREATE_FIELDS,
  extractProgressFields,
  validateProgressFields,
  ensureUserExists,
  buildOwnerQuery,
  buildMemberQuery,
  populateProgress,
};
