import MembershipPlan from '../models/MembershipPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';

/**
 * GET /api/membership-plans — public, read-only, active plans with pagination.
 */
export const getMembershipPlans = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { isActive: true };

  const total = await MembershipPlan.countDocuments(query);
  const data = await MembershipPlan.find(query)
    .sort({ durationMonths: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Membership plans fetched successfully',
  });
});

/**
 * GET /api/membership-plans/:id — public, read-only, single active plan.
 */
export const getMembershipPlanById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const plan = await MembershipPlan.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!plan) throw new ApiError(404, 'Membership plan not found');
  successResponse(res, plan, 'Membership plan fetched successfully');
});

// ── Owner plan management ─────────────────────────────────────────────────

const PLAN_UPDATE_FIELDS = [
  'name', 'shortName', 'durationMonths', 'price', 'billingLabel',
  'billingNote', 'description', 'features', 'popular', 'featured', 'badge',
];

const extractPlanFields = (body) => {
  const plan = {};
  for (const field of PLAN_UPDATE_FIELDS) {
    if (field in body) plan[field] = body[field];
  }
  return plan;
};

const validatePlanFields = (plan, isUpdate = false) => {
  if (!isUpdate && !plan.name) throw new ApiError(400, 'Plan name is required');
  if (plan.durationMonths != null &&
      (!Number.isInteger(plan.durationMonths) || plan.durationMonths < 1)) {
    throw new ApiError(400, 'Duration must be a positive integer');
  }
  if (plan.price != null &&
      (typeof plan.price !== 'number' || plan.price < 0 || !isFinite(plan.price))) {
    throw new ApiError(400, 'Price must be a non-negative number');
  }
  if (plan.features != null) {
    if (!Array.isArray(plan.features)) throw new ApiError(400, 'Features must be an array');
    plan.features = plan.features.map(String).filter(s => s.trim() !== '');
  }
  if (plan.badge != null && typeof plan.badge !== 'string') {
    throw new ApiError(400, 'Badge must be a string');
  }
  if (plan.popular != null && typeof plan.popular !== 'boolean') {
    throw new ApiError(400, 'Popular must be a boolean');
  }
  if (plan.featured != null && typeof plan.featured !== 'boolean') {
    throw new ApiError(400, 'Featured must be a boolean');
  }
};

/** POST /api/membership-plans — OWNER only */
export const createMembershipPlan = asyncHandler(async (req, res) => {
  const planData = extractPlanFields(req.body);
  validatePlanFields(planData, false);
  const plan = await MembershipPlan.create(planData);
  successResponse(res, plan, 'Membership plan created successfully', 201);
});

/** PATCH /api/membership-plans/:id — OWNER only */
export const updateMembershipPlan = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const planData = extractPlanFields(req.body);
  validatePlanFields(planData, true);

  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Membership plan not found');

  for (const key of Object.keys(planData)) {
    plan[key] = planData[key];
  }
  await plan.save();
  successResponse(res, plan, 'Membership plan updated successfully');
});

/** PATCH /api/membership-plans/:id/status — OWNER only */
export const patchPlanStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (typeof req.body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }
  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Membership plan not found');
  plan.isActive = req.body.isActive;
  await plan.save();
  successResponse(
    res,
    plan,
    `Membership plan ${req.body.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

/** DELETE /api/membership-plans/:id — OWNER only (soft-delete via isActive) */
export const deleteMembershipPlan = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Membership plan not found');
  plan.isActive = false;
  await plan.save();
  successResponse(res, null, 'Membership plan deleted successfully');
});

/**
 * GET /api/membership-plans/manage - OWNER only.
 * Lists ALL plans (active + inactive) so the Owner plans table can show and
 * toggle every plan. Due to the shared router, this is mounted BEFORE /:id
 * in membershipPlanRoutes to avoid being captured as an object id.
 */
export const getAllMembershipPlans = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};

  if (req.query.status) {
    const status = String(req.query.status).trim().toLowerCase();
    if (!['active', 'inactive'].includes(status)) {
      throw new ApiError(400, 'Status must be one of: active, inactive');
    }
    query.isActive = status === 'active';
  }

  const total = await MembershipPlan.countDocuments(query);
  const data = await MembershipPlan.find(query)
    .sort({ durationMonths: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  listResponse(res, {
    data,
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'All membership plans fetched successfully',
  });
});
