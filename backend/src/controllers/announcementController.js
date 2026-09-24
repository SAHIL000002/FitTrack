import Announcement from '../models/Announcement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';

const VALID_AUDIENCES = ['ALL', 'MEMBERS'];
const VALID_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const UPDATE_FIELDS = ['title', 'message', 'audience', 'priority', 'isActive', 'publishAt', 'expiresAt'];

const extractFields = (body) => {
  const data = {};
  for (const field of UPDATE_FIELDS) {
    if (field in body) data[field] = body[field];
  }
  return data;
};

const validateFields = (data, isUpdate = false) => {
  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new ApiError(400, 'Title is required');
    }
    if (!data.message || typeof data.message !== 'string' || !data.message.trim()) {
      throw new ApiError(400, 'Message is required');
    }
  }
  if (data.audience !== undefined && !VALID_AUDIENCES.includes(data.audience)) {
    throw new ApiError(400, `Audience must be one of: ${VALID_AUDIENCES.join(', ')}`);
  }
  if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
    throw new ApiError(400, `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  if (data.publishAt !== undefined && data.publishAt !== null) {
    const d = new Date(data.publishAt);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid publishAt date');
    data.publishAt = d;
  }
  if (data.expiresAt !== undefined && data.expiresAt !== null) {
    const d = new Date(data.expiresAt);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid expiresAt date');
    data.expiresAt = d;
  }
  if (data.title && typeof data.title === 'string') data.title = data.title.trim();
  if (data.message && typeof data.message === 'string') data.message = data.message.trim();
};

/** GET /api/announcements — OWNER only */
export const getAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
  if (req.query.audience) query.audience = req.query.audience;
  if (req.query.priority) query.priority = req.query.priority;
  const total = await Announcement.countDocuments(query);
  const data = await Announcement.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Announcements fetched successfully' });
});

/** GET /api/announcements/:id — OWNER only */
export const getAnnouncementById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const announcement = await Announcement.findById(req.params.id)
    .populate('createdBy', 'name email').lean();
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  successResponse(res, announcement, 'Announcement fetched successfully');
});

/** POST /api/announcements — OWNER only */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const data = extractFields(req.body);
  validateFields(data, false);
  data.createdBy = req.user._id;
  const announcement = await Announcement.create(data);
  const saved = await Announcement.findById(announcement._id).populate('createdBy', 'name email').lean();
  successResponse(res, saved, 'Announcement created successfully', 201);
});

/** PATCH /api/announcements/:id — OWNER only */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const data = extractFields(req.body);
  validateFields(data, true);
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  for (const key of Object.keys(data)) announcement[key] = data[key];
  await announcement.save();
  const saved = await Announcement.findById(announcement._id).populate('createdBy', 'name email').lean();
  successResponse(res, saved, 'Announcement updated successfully');
});

/** PATCH /api/announcements/:id/status — OWNER only */
export const patchAnnouncementStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (typeof req.body.isActive !== 'boolean') throw new ApiError(400, 'isActive must be a boolean');
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  announcement.isActive = req.body.isActive;
  await announcement.save();
  const saved = await Announcement.findById(announcement._id).populate('createdBy', 'name email').lean();
  successResponse(res, saved, `Announcement ${req.body.isActive ? 'activated' : 'deactivated'} successfully`);
});

/** DELETE /api/announcements/:id — OWNER only (hard delete) */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  await Announcement.deleteOne({ _id: req.params.id });
  successResponse(res, null, 'Announcement deleted successfully');
});
