import Enquiry from '../models/Enquiry.js';
import { EnquiryTypes, EnquiryStatuses, PreferredContact } from './enquiryConstants.js';
import ApiError from '../utils/ApiError.js';

const extractEnquiryFields = (body) => {
  const allowed = [
    'name', 'email', 'phone', 'enquiryType', 'preferredContact', 'message', 'status', 'notes',
  ];
  const enquiry = {};
  for (const key of allowed) {
    if (key in body) enquiry[key] = body[key];
  }
  return enquiry;
};

const validateEnquiryFields = (enquiry, isCreate = false) => {
  if (isCreate) {
    if (!enquiry.name || typeof enquiry.name !== 'string' || enquiry.name.trim().length === 0) throw new ApiError(400, 'Name is required');
    if (!enquiry.email || typeof enquiry.email !== 'string') throw new ApiError(400, 'Email is required');
    if (!enquiry.message || typeof enquiry.message !== 'string' || enquiry.message.trim().length < 10) throw new ApiError(400, 'Message must be at least 10 characters');
  }
  if (enquiry.enquiryType && !EnquiryTypes.includes(enquiry.enquiryType)) throw new ApiError(400, 'Invalid enquiry type');
  if (enquiry.preferredContact && !PreferredContact.includes(enquiry.preferredContact)) throw new ApiError(400, 'Invalid preferred contact');
  if (enquiry.status && !EnquiryStatuses.includes(enquiry.status)) throw new ApiError(400, 'Invalid status');
  if (enquiry.name && typeof enquiry.name === 'string' && enquiry.name.length > 120) throw new ApiError(400, 'Name is too long');
  if (enquiry.phone && typeof enquiry.phone !== 'string') throw new ApiError(400, 'Phone must be a string');
  if (enquiry.message && typeof enquiry.message === 'string' && enquiry.message.length > 5000) throw new ApiError(400, 'Message is too long');
};

const ensureUserExists = async (userId) => {
  const { User } = await import('../models/index.js');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const populateEnquiry = async (enquiry) => {
  if (!enquiry) return null;
  return Enquiry.findById(enquiry._id).lean();
};

const buildOwnerQuery = (query) => {
  const q = { isActive: true };
  if (query.status) {
    if (!EnquiryStatuses.includes(query.status)) throw new ApiError(400, 'Invalid status filter');
    q.status = query.status;
  }
  if (query.enquiryType) {
    if (!EnquiryTypes.includes(query.enquiryType)) throw new ApiError(400, 'Invalid enquiry type filter');
    q.enquiryType = query.enquiryType;
  }
  if (query.preferredContact) {
    if (!PreferredContact.includes(query.preferredContact)) throw new ApiError(400, 'Invalid preferredContact filter');
    q.preferredContact = query.preferredContact;
  }
  if (query.search) {
    const s = String(query.search).trim();
    if (s) {
      q.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ];
    }
  }
  if (query.from || query.to) {
    const fd = query.from ? new Date(query.from) : null;
    const td = query.to ? new Date(query.to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, 'from must be before to');
    q.createdAt = { ...q.createdAt };
    if (fd) q.createdAt.$gte = fd;
    if (td) q.createdAt.$lte = td;
  }
  if (query.user) {
    q.user = query.user;
  }
  return q;
};

const buildMemberQuery = (user, query) => {
  const q = { user, isActive: true };
  if (query.status) {
    if (!EnquiryStatuses.includes(query.status)) throw new ApiError(400, 'Invalid status filter');
    q.status = query.status;
  }
  if (query.enquiryType) {
    if (!EnquiryTypes.includes(query.enquiryType)) throw new ApiError(400, 'Invalid enquiry type filter');
    q.enquiryType = query.enquiryType;
  }
  if (query.search) {
    const s = String(query.search).trim();
    if (s) {
      q.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ];
    }
  }
  if (query.from || query.to) {
    const fd = query.from ? new Date(query.from) : null;
    const td = query.to ? new Date(query.to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, 'from must be before to');
    q.createdAt = { ...q.createdAt };
    if (fd) q.createdAt.$gte = fd;
    if (td) q.createdAt.$lte = td;
  }
  return q;
};

const softDelete = async (id) => {
  const enquiry = await Enquiry.findById(id);
  if (!enquiry || !enquiry.isActive) return null;
  enquiry.isActive = false;
  await enquiry.save();
  return enquiry;
};

export const enquiryService = {
  EnquiryTypes,
  EnquiryStatuses,
  PreferredContact,

  extractEnquiryFields,
  validateEnquiryFields,
  ensureUserExists,
  populateEnquiry,
  buildOwnerQuery,
  buildMemberQuery,
  softDelete,
};
