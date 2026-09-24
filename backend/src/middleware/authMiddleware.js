import { verifyToken, sanitizeUser } from '../utils/auth.js';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * protect — authentication middleware for protected routes.
 * Expects: Authorization: Bearer <token>
 * On success attaches the sanitized user to req.user (never the password).
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';

  if (!header) {
    throw new ApiError(401, 'Authentication required');
  }
  if (!header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Invalid authorization header format');
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    // Configuration errors (ApiError, e.g. missing JWT_SECRET) pass through untouched
    if (error instanceof ApiError) throw error;
    // Clean 401s — JWT library internals are never exposed
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired');
    }
    throw new ApiError(401, 'Invalid authentication token');
  }

  // Re-check the user still exists, is not soft-deleted, and is active
  // (deleted/inactive accounts must NOT keep access through an old token)
  const user = await User.findOne({ _id: payload.id, deletedAt: null });
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }
  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated');
  }

  req.user = sanitizeUser(user);
  return next();
});

/**
 * optionalAuth — populates req.user when a VALID Bearer token is supplied,
 * but NEVER blocks. Used on public routes that personalize when a token is
 * present (e.g. POST /api/enquiries works from the public Contact page
 * anonymously AND from the member dashboard with a token — in the latter
 * case the submission is attributed to the authenticated member).
 * Missing / invalid / expired tokens are silently ignored and the request
 * continues as anonymous. Deleted or deactivated accounts are treated as
 * anonymous (same fresh-user re-check as `protect`).
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();

  const token = header.slice(7).trim();
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    const user = await User.findOne({ _id: payload.id, deletedAt: null });
    if (user && user.isActive) req.user = sanitizeUser(user);
  } catch {
    // Invalid or expired token → continue as anonymous
  }
  return next();
});

/**
 * requireRole — reusable ROLE-AUTHORIZATION middleware (foundation).
 *
 * Separation of concerns:
 *   protect     -> "Is this a valid authenticated user?"      (authentication)
 *   requireRole -> "Is this authenticated user allowed here?" (authorization)
 *
 * requireRole NEVER authenticates — it only reads req.user.role, which is set
 * exclusively by `protect` from the verified JWT + fresh server-side user
 * record. Client-supplied roles (body/query/params/headers) are never trusted.
 *
 * Usage: router.get('/x', protect, requireRole('OWNER'), handler)
 * Roles must match the User model enum (OWNER / MEMBER) — case-insensitive.
 * An empty allow-list denies everyone (safe default).
 */
export const requireRole = (...roles) => (req, _res, next) => {
  // Safety net: requireRole must always run AFTER protect
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  const allowed = roles.map((role) => String(role).toUpperCase());
  if (!allowed.includes(String(req.user.role).toUpperCase())) {
    return next(new ApiError(403, 'You do not have permission to access this resource'));
  }
  return next();
};