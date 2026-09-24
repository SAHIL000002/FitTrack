import { Router } from 'express';
import {
  getMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  patchMembershipStatus,
  getMyMemberships,
  getMyActiveMembership,
} from '../controllers/membershipController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// ── Membership APIs are all role-protected. No public read endpoints. ──────

// ── Member self-membership (must precede /:id to avoid shadowing) ──────────

router.get('/me/active', protect, requireRole('MEMBER'), getMyActiveMembership);
router.get('/me', protect, requireRole('MEMBER'), getMyMemberships);

// ── Owner membership management ────────────────────────────────────────────

router.get('/', protect, requireRole('OWNER'), getMemberships);
router.get('/:id', protect, requireRole('OWNER'), getMembershipById);
router.post('/', protect, requireRole('OWNER'), createMembership);
router.patch('/:id/status', protect, requireRole('OWNER'), patchMembershipStatus);
router.patch('/:id', protect, requireRole('OWNER'), updateMembership);

export default router;