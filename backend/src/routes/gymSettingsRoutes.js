import { Router } from 'express';
import {
  getPublicSettings,
  getSettingsForOwner,
  updateSettings,
} from '../controllers/gymSettingsController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

/**
 * Gym settings routes.
 *  GET  /api/settings         — public, sanitized current settings
 *  GET  /api/settings/manage  — OWNER only, full record (incl. updatedBy)
 *  PUT  /api/settings         — OWNER only, create-or-update singleton
 *
 * '/manage' is registered BEFORE the public '/' handlers matter — Express
 * matches exact paths, and '/manage' (single segment) is registered before
 * any parameterized route would exist. No conflicts with PUT '/'.
 */
const router = Router();

router.get('/', getPublicSettings);
router.get('/manage', protect, requireRole('OWNER'), getSettingsForOwner);
router.put('/', protect, requireRole('OWNER'), updateSettings);

export default router;
