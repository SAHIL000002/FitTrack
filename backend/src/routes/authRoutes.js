import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  testOwnerAuth,
  testMemberAuth,
} from '../controllers/authController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

/**
 * Authentication routes:
 *   POST /api/auth/register     — public (always creates MEMBER)
 *   POST /api/auth/login        — public
 *   GET  /api/auth/me           — protected (Bearer token)
 *
 * TEMPORARY authorization verification endpoints (Phase 3 Step 6) — these
 * prove the protect + requireRole pipeline and will be REMOVED once real
 * role-protected feature routes exist:
 *   GET  /api/auth/test-owner   — protect + requireRole('OWNER')
 *   GET  /api/auth/test-member  — protect + requireRole('MEMBER')
 *
 * Middleware order is required: authentication (protect) FIRST, then
 * authorization (requireRole) — authorization depends on authentication.
 */
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);

router.get('/test-owner', protect, requireRole('OWNER'), testOwnerAuth);
router.get('/test-member', protect, requireRole('MEMBER'), testMemberAuth);

export default router;