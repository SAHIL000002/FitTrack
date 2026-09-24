import Enquiry from '../models/Enquiry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { enquiryService } from '../services/enquiryService.js';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// ── Public ────────────────────────────────────────────────────────────────────

export const createEnquiry = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const enquiry = enquiryService.extractEnquiryFields(body);
  enquiryService.validateEnquiryFields(enquiry, true);

  if (enquiry.email && !EMAIL_PATTERN.test(enquiry.email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  // SECURITY: enquiry ownership is never client-controlled.
  // - Authenticated member submitting from their dashboard → attributed to req.user.
  // - Anonymous public submission (Contact page) → left unlinked; a client-supplied
  //   `user` id is IGNORED so an attacker cannot forge attribution to any member.
  if (req.user) {
    enquiry.user = req.user._id;
  }

  const created = await Enquiry.create(enquiry);
  const populated = await enquiryService.populateEnquiry(created);
  successResponse(res, populated, 'Enquiry submitted successfully', 201);
});

// ── Owner CRUD ────────────────────────────────────────────────────────────────

export const getEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = enquiryService.buildOwnerQuery(req.query);
  const total = await Enquiry.countDocuments(query);
  const data = await Enquiry.find(query)
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
    message: 'Enquiries fetched successfully',
  });
});

export const getEnquiryById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const enquiry = await Enquiry.findById(req.params.id).lean();
  if (!enquiry || !enquiry.isActive) throw new ApiError(404, 'Enquiry not found');
  successResponse(res, enquiry, 'Enquiry fetched successfully');
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry || !enquiry.isActive) throw new ApiError(404, 'Enquiry not found');

  const data = enquiryService.extractEnquiryFields(req.body);
  enquiryService.validateEnquiryFields(data, false);

  // Prevent arbitrary ownership change
  const { user, ...rest } = data;
  Object.assign(enquiry, rest);
  await enquiry.save();

  const populated = await enquiryService.populateEnquiry(enquiry);
  successResponse(res, populated, 'Enquiry updated successfully');
});

export const patchEnquiryStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry || !enquiry.isActive) throw new ApiError(404, 'Enquiry not found');

  const { status } = req.body || {};
  if (!status || !enquiryService.EnquiryStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${enquiryService.EnquiryStatuses.join(', ')}`);
  }

  enquiry.status = status;
  await enquiry.save();

  const populated = await enquiryService.populateEnquiry(enquiry);
  successResponse(res, populated, 'Enquiry status updated successfully');
});

export const deleteEnquiry = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const result = await enquiryService.softDelete(req.params.id);
  if (!result) throw new ApiError(404, 'Enquiry not found');
  successResponse(res, null, 'Enquiry deleted successfully');
});

// ── Member self-access ────────────────────────────────────────────────────────

export const getMyEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = enquiryService.buildMemberQuery(req.user._id, req.query);
  const total = await Enquiry.countDocuments(query);
  const data = await Enquiry.find(query)
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
    message: 'Your enquiries fetched successfully',
  });
});

export const getMyEnquiryById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const enquiry = await Enquiry.findOne({
    _id: req.params.id,
    user: req.user._id,
    isActive: true,
  }).lean();
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  successResponse(res, enquiry, 'Enquiry fetched successfully');
});
