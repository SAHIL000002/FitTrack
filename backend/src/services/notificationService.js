import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import { NotificationTypes } from './notificationConstants.js';

const extractNotificationFields = (body) => {
  const allowed = ['user', 'title', 'message', 'type', 'isRead'];
  const notification = {};
  for (const key of allowed) {
    if (key in body) notification[key] = body[key];
  }
  return notification;
};

const validateNotificationFields = (notification, isCreate = false) => {
  if (isCreate) {
    if (!notification.user || typeof notification.user !== 'string') {
      throw new ApiError(400, 'User is required');
    }
    if (!notification.title || typeof notification.title !== 'string' || notification.title.trim().length === 0) {
      throw new ApiError(400, 'Title is required');
    }
    if (notification.message !== undefined && typeof notification.message !== 'string') {
      throw new ApiError(400, 'Message must be a string');
    }
  }
  if (notification.type && !NotificationTypes.includes(notification.type)) {
    throw new ApiError(400, `Invalid notification type. Allowed: ${NotificationTypes.join(', ')}`);
  }
  if (notification.isRead !== undefined && typeof notification.isRead !== 'boolean') {
    throw new ApiError(400, 'isRead must be a boolean');
  }
  if (notification.title && typeof notification.title === 'string' && notification.title.length > 200) {
    throw new ApiError(400, 'Title is too long');
  }
  if (notification.message && typeof notification.message === 'string' && notification.message.length > 2000) {
    throw new ApiError(400, 'Message is too long');
  }
};

const ensureUserExists = async (userId) => {
  const { User } = await import('../models/index.js');
  const user = await User.findById(userId).lean();
  return user || null;
};

const populateNotification = async (notification) => {
  if (!notification) return null;
  return Notification.findById(notification._id)
    .populate('user', 'name email role phone avatar isActive')
    .lean();
};

const buildOwnerQuery = (query) => {
  const q = { isActive: true };
  if (query.user) {
    if (!mongoose.Types.ObjectId.isValid(query.user)) throw new ApiError(400, 'Invalid user filter');
    q.user = query.user;
  }
  if (query.isRead !== undefined) {
    q.isRead = query.isRead === 'true' || query.isRead === true;
  }
  if (query.type) {
    if (!NotificationTypes.includes(query.type)) throw new ApiError(400, 'Invalid type filter');
    q.type = query.type;
  }
  if (query.search) {
    const s = String(query.search).trim();
    if (s) {
      q.$or = [
        { title: { $regex: s, $options: 'i' } },
        { message: { $regex: s, $options: 'i' } },
      ];
    }
  }
  if (query.from || query.to) {
    const fd = query.from ? new Date(query.from) : null;
    const td = query.to ? new Date(query.to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, 'from date must be before to date');
    q.createdAt = { ...q.createdAt };
    if (fd) q.createdAt.$gte = fd;
    if (td) q.createdAt.$lte = td;
  }
  return q;
};

const buildMemberQuery = (user, query) => {
  const q = { user, isActive: true };
  if (query.isRead !== undefined) {
    q.isRead = query.isRead === 'true' || query.isRead === true;
  }
  if (query.type) {
    if (!NotificationTypes.includes(query.type)) throw new ApiError(400, 'Invalid type filter');
    q.type = query.type;
  }
  return q;
};

export const notificationService = {
  NotificationTypes,

  extractNotificationFields,
  validateNotificationFields,
  ensureUserExists,
  populateNotification,
  buildOwnerQuery,
  buildMemberQuery,
};