import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { notificationService } from '../services/notificationService.js';

// ── Owner notification CRUD ─────────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = notificationService.buildOwnerQuery(req.query);
  const total = await Notification.countDocuments(query);
  const data = await Notification.find(query)
    .populate('user', 'name email role phone avatar isActive')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Notifications fetched successfully',
  });
});

export const getNotificationById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const notification = await Notification.findById(req.params.id)
    .populate('user', 'name email role phone avatar isActive')
    .lean();
  if (!notification || !notification.isActive) throw new ApiError(404, 'Notification not found');
  successResponse(res, notification, 'Notification fetched successfully');
});

export const createNotification = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.user) throw new ApiError(400, 'User is required');
  validateId(body.user);

  const targetUser = await notificationService.ensureUserExists(body.user);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const notification = notificationService.extractNotificationFields(body);
  notificationService.validateNotificationFields(notification, true);
  notification.user = body.user;

  const created = await Notification.create(notification);
  const populated = await notificationService.populateNotification(created);
  successResponse(res, populated, 'Notification created successfully', 201);
});

export const updateNotification = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const notification = await Notification.findById(req.params.id);
  if (!notification || !notification.isActive) throw new ApiError(404, 'Notification not found');

  const data = notificationService.extractNotificationFields(req.body);
  notificationService.validateNotificationFields(data, false);

  // Strip user from update payload to prevent arbitrary ownership change
  const { user, ...rest } = data;
  Object.assign(notification, rest);
  await notification.save();

  const populated = await notificationService.populateNotification(notification);
  successResponse(res, populated, 'Notification updated successfully');
});

export const patchNotificationRead = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const notification = await Notification.findById(req.params.id);
  if (!notification || !notification.isActive) throw new ApiError(404, 'Notification not found');

  notification.isRead = req.body.isRead !== undefined ? Boolean(req.body.isRead) : true;
  await notification.save();

  const populated = await notificationService.populateNotification(notification);
  successResponse(res, populated, 'Notification read status updated successfully');
});

export const deleteNotification = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  successResponse(res, null, 'Notification deleted successfully');
});

// ── Member notification self-access ─────────────────────────────────────────

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = notificationService.buildMemberQuery(req.user._id, req.query);
  const total = await Notification.countDocuments(query);
  const data = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Your notifications fetched successfully',
  });
});

export const getMyNotificationById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
    isActive: true,
  }).lean();
  if (!notification) throw new ApiError(404, 'Notification not found');
  successResponse(res, notification, 'Notification fetched successfully');
});

export const markMyNotificationRead = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, isActive: true },
    { isRead: true },
    { new: true },
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  successResponse(res, notification, 'Notification marked as read successfully');
});