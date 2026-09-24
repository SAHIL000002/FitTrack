import Membership from '../models/Membership.js';
import MembershipPlan from '../models/MembershipPlan.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

const calcEndDate = (startDate, durationMonths) => {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + durationMonths);
  return d;
};

const computeMembershipData = (body, plan) => {
  const startDate = body.startDate ? new Date(body.startDate) : new Date();
  if (isNaN(startDate.getTime())) throw new ApiError(400, 'Invalid startDate');

  const endDate = body.endDate ? new Date(body.endDate) : calcEndDate(startDate, plan.durationMonths);
  if (isNaN(endDate.getTime())) throw new ApiError(400, 'Invalid endDate');
  if (endDate <= startDate) throw new ApiError(400, 'endDate must be after startDate');

  if (body.endDate) {
    const expected = calcEndDate(startDate, plan.durationMonths);
    const diffDays = Math.abs(expected.getTime() - endDate.getTime()) / 86400000;
    if (diffDays > 1) throw new ApiError(400, 'endDate does not match plan duration');
  }

  return { startDate, endDate, amount: body.amount != null ? Number(body.amount) : plan.price };
};

const POP_USER = 'name email role phone avatar isActive';
const POP_PLAN = 'name shortName durationMonths price billingLabel featured popular isActive';

/** GET /api/memberships — OWNER only, paginated, filterable */
export const getMemberships = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, user, plan } = req.query;

  const query = {};
  if (status) {
    if (!['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'].includes(status)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    query.status = status;
  }
  if (user) {
    validateId(user);
    query.user = user;
  }
  if (plan) {
    validateId(plan);
    query.plan = plan;
  }

  const total = await Membership.countDocuments(query);
  const data = await Membership.find(query)
    .populate('user', 'name email role phone avatar isActive')
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular')
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
    message: 'Memberships fetched successfully',
  });
});

/** GET /api/memberships/:id — OWNER only */
export const getMembershipById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const membership = await Membership.findById(req.params.id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular');
  if (!membership) throw new ApiError(404, 'Membership not found');
  successResponse(res, membership, 'Membership fetched successfully');
  successResponse(res, membership, 'Membership fetched successfully');
});

/** POST /api/memberships — OWNER only, create membership for a user */
export const createMembership = asyncHandler(async (req, res) => {
  validateId(req.body.user);
  validateId(req.body.plan);

  const user = await User.findOne({ _id: req.body.user, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');

  const plan = await MembershipPlan.findOne({ _id: req.body.plan, isActive: true });
  if (!plan) throw new ApiError(404, 'Membership plan not found');

  const { startDate, endDate, amount } = computeMembershipData(req.body, plan);

  // Prevent duplicate active membership for the same user unless explicitly intended
  const existingActive = await Membership.findOne({
    user: req.body.user,
    status: { $in: ['PENDING', 'ACTIVE'] },
  });
  if (existingActive) {
    throw new ApiError(409, 'User already has an active or pending membership');
  }

  const membership = await Membership.create({
    user: req.body.user,
    plan: req.body.plan,
    startDate,
    endDate,
    amount,
    status: 'ACTIVE',
    notes: req.body.notes || '',
  });

  const saved = await Membership.findById(membership._id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular');

  successResponse(res, saved, 'Membership created successfully', 201);
});

/** PATCH /api/memberships/:id — OWNER only, update status/notes/endDate */
export const updateMembership = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const membership = await Membership.findById(req.params.id);
  if (!membership) throw new ApiError(404, 'Membership not found');

  if (req.body.status) {
    if (!['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'].includes(req.body.status)) {
      throw new ApiError(400, 'Invalid status value');
    }
    membership.status = req.body.status;
  }
  if (req.body.notes != null) {
    membership.notes = String(req.body.notes).trim();
  }
  if (req.body.endDate != null) {
    const end = new Date(req.body.endDate);
    if (isNaN(end.getTime()) || end <= membership.startDate) {
      throw new ApiError(400, 'Invalid endDate');
    }
    membership.endDate = end;
  }
  if (req.body.amount != null) {
    const amt = Number(req.body.amount);
    if (!isFinite(amt) || amt < 0) throw new ApiError(400, 'Invalid amount');
    membership.amount = amt;
  }
  await membership.save();

  const saved = await Membership.findById(membership._id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular');

  successResponse(res, saved, 'Membership updated successfully');
});

/** PATCH /api/memberships/:id/status — OWNER only */
export const patchMembershipStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (!req.body.status || !['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'].includes(req.body.status)) {
    throw new ApiError(400, 'Valid status is required');
  }
  const membership = await Membership.findById(req.params.id);
  if (!membership) throw new ApiError(404, 'Membership not found');
  membership.status = req.body.status;
  await membership.save();

  const saved = await Membership.findById(membership._id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular');

  successResponse(res, saved, 'Membership status updated successfully');
});

//  Member self-membership endpoints 

/** GET /api/memberships/me — MEMBER only, own memberships */
export const getMyMemberships = asyncHandler(async (req, res) => {
  const data = await Membership.find({ user: req.user._id })
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .sort({ createdAt: -1 })
    .lean();

  listResponse(res, {
    data,
    page: 1,
    limit: data.length,
    total: data.length,
    pages: 1,
    message: 'Your memberships fetched successfully',
  });
});

/** GET /api/memberships/me/active — MEMBER only, current active/pending membership */
export const getMyActiveMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({
    user: req.user._id,
    status: { $in: ['PENDING', 'ACTIVE'] },
  })
    .populate('plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .lean();

  if (!membership) {
    return successResponse(res, null, 'No active membership found', 200);
  }

  // If endDate passed, treat as expired
  if (membership.status === 'ACTIVE' && new Date() > membership.endDate) {
    membership.status = 'EXPIRED';
  }

  successResponse(res, membership, 'Your active membership fetched successfully');
});