import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import * as membershipPlanController from '../controllers/membershipPlanController.js';
import * as membershipController from '../controllers/membershipController.js';

const router = Router();

// ── Membership Plans ───────────────────────────────────────────────────────

router.get('/', membershipPlanController.getMembershipPlans);
// OWNER-only: ALL plans (active + inactive) — registered before /:id so it is
// never captured as an object-id route.
router.get('/manage', protect, requireRole('OWNER'), membershipPlanController.getAllMembershipPlans);
router.get('/:id', membershipPlanController.getMembershipPlanById);

router.post('/', protect, requireRole('OWNER'), membershipPlanController.createMembershipPlan);
router.patch('/:id', protect, requireRole('OWNER'), membershipPlanController.updateMembershipPlan);
router.patch('/:id/status', protect, requireRole('OWNER'), membershipPlanController.patchPlanStatus);
router.delete('/:id', protect, requireRole('OWNER'), membershipPlanController.deleteMembershipPlan);

// ── Memberships ───────────────────────────────────────────────────────────

router.get('/memberships', protect, requireRole('OWNER'), membershipController.getMemberships);
router.get('/memberships/:id', protect, requireRole('OWNER'), membershipController.getMembershipById);
router.post('/memberships', protect, requireRole('OWNER'), membershipController.createMembership);
router.patch('/memberships/:id', protect, requireRole('OWNER'), membershipController.updateMembership);
router.patch('/memberships/:id/status', protect, requireRole('OWNER'), membershipController.patchMembershipStatus);

router.get('/memberships/me', protect, requireRole('MEMBER'), membershipController.getMyMemberships);
router.get('/memberships/me/active', protect, requireRole('MEMBER'), membershipController.getMyActiveMembership);

export default router;