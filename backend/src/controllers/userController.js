import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { sanitizeUser } from '../utils/auth.js';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const ALLOWED_LIST_ROLES = ['OWNER', 'MEMBER'];

/**
 * User controller — OWNER-only member management.
 * All routes are protected: protect + requireRole('OWNER') (see userRoutes).
 * Passwords are never exposed (sanitizeUser).
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { deletedAt: null };

  if (req.query.role) {
    const role = String(req.query.role).trim().toUpperCase();
    if (!ALLOWED_LIST_ROLES.includes(role)) {
      throw new ApiError(400, 'Role must be one of: OWNER, MEMBER');
    }
    query.role = role;
  }

  if (req.query.status) {
    const status = String(req.query.status).trim().toLowerCase();
    if (!['active', 'inactive'].includes(status)) {
      throw new ApiError(400, 'Status must be one of: active, inactive');
    }
    query.isActive = status === 'active';
  }

  if (req.query.search) {
    const pattern = new RegExp(
      String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
    query.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  listResponse(res, {
    data: users.map(sanitizeUser),
    page,
    limit,
    total,
    pages: getPages(total, limit),
    message: 'Users fetched successfully',
  });
});

/**
 * GET /api/users/:id — OWNER only. Single non-deleted user (sanitized).
 */
export const getUserById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const user = await User.findOne({ _id: req.params.id, deletedAt: null }).lean();
  if (!user) throw new ApiError(404, 'User not found');
  successResponse(res, sanitizeUser(user), 'User fetched successfully');
});

/**
 * POST /api/users — OWNER only. Creates a MEMBER account.
 * SECURITY: role is forced to MEMBER — OWNER creation is rejected,
 * so an owner can never create another OWNER through this route.
 */
export const createUser = asyncHandler(async (req, res) => {
  if (req.body && 'role' in req.body && String(req.body.role).trim().toUpperCase() === 'OWNER') {
    throw new ApiError(403, 'Owner accounts cannot be created through this route');
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

  if (!name || name.length < 2) {
    throw new ApiError(400, 'Name is required (minimum 2 characters)');
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'A valid email address is required');
  }
  if (typeof req.body?.password !== 'string' || req.body.password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password: req.body.password,
    phone,
    role: 'MEMBER',
  });

  successResponse(res, sanitizeUser(user), 'Member created successfully', 201);
});

/**
 * PATCH /api/users/:id — OWNER only. Edit name/phone only.
 * Role and password changes are NOT allowed here (no escalation path).
 */
export const updateUser = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');

  if (req.body && ('role' in req.body || 'password' in req.body)) {
    throw new ApiError(400, 'Only name and phone can be updated through this route');
  }

  if (req.body?.name !== undefined) {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name || name.length < 2) {
      throw new ApiError(400, 'Name is required (minimum 2 characters)');
    }
    user.name = name;
  }

  if (req.body?.phone !== undefined) {
    if (typeof req.body.phone !== 'string') {
      throw new ApiError(400, 'Phone must be a string');
    }
    user.phone = req.body.phone.trim();
  }

  await user.save();
  successResponse(res, sanitizeUser(user), 'Member updated successfully');
});

/**
 * PATCH /api/users/me — MEMBER self-profile. Edit name/phone only.
 * Same contract as PATCH /users/:id — role/password/isActive are rejected.
 * The record is loaded fresh (req.user is the sanitized lean object).
 */
export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id, deletedAt: null });
  if (!user) throw new ApiError(401, 'User no longer exists');

  if (req.body && ('role' in req.body || 'password' in req.body || 'isActive' in req.body)) {
    throw new ApiError(400, 'Only name and phone can be updated through this route');
  }

  if (req.body?.name !== undefined) {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name || name.length < 2) {
      throw new ApiError(400, 'Name is required (minimum 2 characters)');
    }
    user.name = name;
  }

  if (req.body?.phone !== undefined) {
    if (typeof req.body.phone !== 'string') {
      throw new ApiError(400, 'Phone must be a string');
    }
    user.phone = req.body.phone.trim();
  }

  await user.save();
  successResponse(res, sanitizeUser(user), 'Profile updated successfully');
});

/**
 * PATCH /api/users/:id/status — OWNER only. Activate/deactivate via isActive.
 */
export const patchUserStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (typeof req.body?.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean');
  }

  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');

  if (user._id.toString() === req.user._id.toString() && req.body.isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  user.isActive = req.body.isActive;
  await user.save();
  successResponse(
    res,
    sanitizeUser(user),
    `Member ${req.body.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

/**
 * DELETE /api/users/:id — OWNER only. Soft-delete via deletedAt + isActive=false.
 * Historical records (memberships, payments, attendance) are preserved.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  if (user.role === 'OWNER') {
    throw new ApiError(403, 'Owner accounts cannot be deleted through this route');
  }

  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();
  successResponse(res, null, 'Member deleted successfully');
});