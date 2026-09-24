import { Router } from 'express';
import Enquiry from '../models/Enquiry.js';
import { protect, requireRole, optionalAuth } from '../middleware/authMiddleware.js';
import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiry,
  patchEnquiryStatus,
  deleteEnquiry,
  getMyEnquiries,
  getMyEnquiryById,
} from '../controllers/enquiryController.js';

const router = Router();

/* ── Public ───────────────────────────────────────────────────────────────── */

/** POST /api/enquiries — public create. optionalAuth attributes the
 * submission to the authenticated member when a valid token is present
 * (member dashboard) and stays anonymous otherwise (Contact page). */
router.post('/', optionalAuth, createEnquiry);

/* ── Member self-access ──────────────────────────────────────────────────── */

/** GET /api/enquiries/me — member: list own enquiries */
router.get('/me', protect, requireRole('MEMBER'), getMyEnquiries);

/** GET /api/enquiries/me/:id — member: view own enquiry (IDOR-protected) */
router.get('/me/:id', protect, requireRole('MEMBER'), getMyEnquiryById);

/* ── Owner CRUD ──────────────────────────────────────────────────────────── */

/** GET /api/enquiries — OWNER only */
router.get('/', protect, requireRole('OWNER'), getEnquiries);

/** GET /api/enquiries/:id — OWNER only */
router.get('/:id', protect, requireRole('OWNER'), getEnquiryById);

/** PATCH /api/enquiries/:id — OWNER only */
router.patch('/:id', protect, requireRole('OWNER'), updateEnquiry);

/** PATCH /api/enquiries/:id/status — OWNER only */
router.patch('/:id/status', protect, requireRole('OWNER'), patchEnquiryStatus);

/** DELETE /api/enquiries/:id — OWNER only (soft-delete) */
router.delete('/:id', protect, requireRole('OWNER'), deleteEnquiry);

export default router;