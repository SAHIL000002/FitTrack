import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from './ApiError.js';

const SALT_ROUNDS = 10;
const DEFAULT_TOKEN_EXPIRES_IN = '7d';

/**
 * Central authentication utilities.
 * All password + JWT logic lives here — controllers and middleware reuse these
 * functions instead of duplicating logic.
 */

/** Internal: the JWT secret must come from the environment, never from code. */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail safely — clear config error, never expose whether a secret exists
    throw new ApiError(503, 'Server authentication is not configured');
  }
  return secret;
};

/** Hash a plaintext password with bcrypt. */
export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

/** Compare a plaintext candidate against a stored bcrypt hash. */
export const comparePassword = (plainPassword, passwordHash) =>
  bcrypt.compare(plainPassword, passwordHash);

/**
 * Sign a minimal identity JWT.
 * Payload contains ONLY { id, role } — never password or personal data.
 * Expiration comes from JWT_EXPIRES_IN (default 7d).
 */
export const signToken = ({ id, role }) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_TOKEN_EXPIRES_IN;
  return jwt.sign({ id, role }, getJwtSecret(), { expiresIn });
};

/** Verify a JWT and return its payload. Throws on invalid/expired tokens. */
export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

/**
 * Safe public shape of a user — never includes password or hash.
 * Includes the harmless profile + membership-relevant fields the owner
 * members UI needs (avatar, isActive, createdAt, updatedAt).
 */
export const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});