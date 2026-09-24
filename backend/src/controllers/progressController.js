import Progress from '../models/Progress.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { progressService } from '../services/progressService.js';

// -- Member self-access ------------------------------------------------------

export const getMyProgress = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = progressService.buildMemberQuery(req.user._id, req.query);
  const total = await Progress.countDocuments(query);
  const data = await Progress.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  listResponse(res, {
    data, page, limit, total,
    pages: getPages(total, limit),
    message: 'Your progress records fetched successfully',
  });
});

export const getMyProgressById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const progress = await Progress.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();
  if (!progress) throw new ApiError(404, 'Progress record not found');
  successResponse(res, progress, 'Progress record fetched successfully');
});

export const createMyProgress = asyncHandler(async (req, res) => {
  // Reject client-supplied user - identity is derived from the JWT
  if (req.body.user) throw new ApiError(400, 'User is determined automatically');
  const data = progressService.extractProgressFields(req.body, progressService.PROGRESS_CREATE_FIELDS);
  progressService.validateProgressFields(data, false);
  data.user = req.user._id;
  const progress = await Progress.create(data);
  const saved = await progressService.populateProgress(progress);
  successResponse(res, saved, 'Progress record created successfully', 201);
});

export const updateMyProgress = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const progress = await Progress.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!progress) throw new ApiError(404, 'Progress record not found');
  const data = progressService.extractProgressFields(req.body, progressService.PROGRESS_CREATE_FIELDS);
  progressService.validateProgressFields(data, true);
  for (const key of Object.keys(data)) { progress[key] = data[key]; }
  await progress.save();
  const saved = await progressService.populateProgress(progress);
  successResponse(res, saved, 'Progress record updated successfully');
});

export const deleteMyProgress = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const progress = await Progress.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!progress) throw new ApiError(404, 'Progress record not found');
  await Progress.deleteOne({ _id: req.params.id });
  successResponse(res, null, 'Progress record deleted successfully');
});

// -- Owner progress management -----------------------------------------------

export const getProgress = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = progressService.buildOwnerQuery(req.query);
  const total = await Progress.countDocuments(query);
  const data = await Progress.find(query)
    .populate('user', 'name email role phone avatar isActive')
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  listResponse(res, {
    data, page, limit, total,
    pages: getPages(total, limit),
    message: 'Progress records fetched successfully',
  });
});

export const getProgressById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const progress = await Progress.findById(req.params.id)
    .populate('user', 'name email role phone avatar isActive')
    .lean();
  if (!progress) throw new ApiError(404, 'Progress record not found');
  successResponse(res, progress, 'Progress record fetched successfully');
});

export const createProgress = asyncHandler(async (req, res) => {
  const user = await progressService.ensureUserExists(req.body.user);
  if (user.role !== 'MEMBER') throw new ApiError(400, 'Progress records can only be created for members');
  const data = progressService.extractProgressFields(req.body, progressService.PROGRESS_CREATE_FIELDS);
  progressService.validateProgressFields(data, false);
  data.user = user._id;
  const progress = await Progress.create(data);
  const saved = await progressService.populateProgress(progress);
  successResponse(res, saved, 'Progress record created successfully', 201);
});

export const updateProgress = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const progress = await Progress.findById(req.params.id);
  if (!progress) throw new ApiError(404, 'Progress record not found');
  const data = progressService.extractProgressFields(req.body, progressService.PROGRESS_CREATE_FIELDS);
  progressService.validateProgressFields(data, true);
  for (const key of Object.keys(data)) { progress[key] = data[key]; }
  await progress.save();
  const saved = await progressService.populateProgress(progress);
  successResponse(res, saved, 'Progress record updated successfully');
});

export const deleteProgress = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const progress = await Progress.findById(req.params.id);
  if (!progress) throw new ApiError(404, 'Progress record not found');
  await Progress.deleteOne({ _id: req.params.id });
  successResponse(res, null, 'Progress record deleted successfully');
});
