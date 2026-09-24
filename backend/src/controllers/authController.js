import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/ApiError.js';
import { comparePassword, signToken, sanitizeUser } from '../utils/auth.js';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
// Generic credential error — never reveals whether the email or password failed
const INVALID_CREDENTIALS = 'Invalid email or password';

/**
 * POST /api/auth/register
 * Public registration. SECURITY: always creates a MEMBER — any `role` sent by
 * the client is ignored. Owner accounts are never created through this route.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body || {};

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!trimmedName || trimmedName.length < 2) {
    throw new ApiError(400, 'Name is required (minimum 2 characters)');
  }
  if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
    throw new ApiError(400, 'A valid email address is required');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  // Explicit duplicate check for a clean 409 (unique index is the safety net)
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // role is intentionally NOT taken from the request body
  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    password,
    phone: trimmedPhone,
    role: 'MEMBER',
  });

  const token = signToken({ id: user._id.toString(), role: user.role });
  return successResponse(res, { user: sanitizeUser(user), token }, 'Registration successful', 201);
});

/**
 * POST /api/auth/login
 * Generic failures for: wrong password, unknown email, inactive account.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
    throw new ApiError(400, 'A valid email address is required');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Password is required');
  }

  // password is excluded by default — load it explicitly for comparison
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new ApiError(401, INVALID_CREDENTIALS);
  }
  const matched = await comparePassword(password, user.password);
  if (!matched) {
    throw new ApiError(401, INVALID_CREDENTIALS);
  }
  if (!user.isActive) {
    throw new ApiError(401, INVALID_CREDENTIALS);
  }

  const token = signToken({ id: user._id.toString(), role: user.role });
  return successResponse(res, { user: sanitizeUser(user), token }, 'Login successful');
});

/**
 * GET /api/auth/me — protected. Returns the authenticated user's safe profile.
 * The user is loaded fresh by the auth middleware (handles deleted/inactive).
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current user retrieved successfully');
});

/**
 * ------------------------------------------------------------------
 * TEMPORARY AUTHORIZATION VERIFICATION ENDPOINTS (Phase 3 Step 6).
 * These exist ONLY to prove the protect + requireRole pipeline works.
 * They will be REMOVED when real role-protected feature routes exist.
 * No business functionality lives here.
 * ------------------------------------------------------------------
 */

/** GET /api/auth/test-owner — requires protect + requireRole('OWNER'). */
export const testOwnerAuth = asyncHandler(async (req, res) => {
  return successResponse(res, { role: req.user.role }, 'Owner authorization passed');
});

/** GET /api/auth/test-member — requires protect + requireRole('MEMBER'). */
export const testMemberAuth = asyncHandler(async (req, res) => {
  return successResponse(res, { role: req.user.role }, 'Member authorization passed');
});