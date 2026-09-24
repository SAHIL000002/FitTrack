import { Router } from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  patchNotificationRead,
  deleteNotification,
  getMyNotifications,
  getMyNotificationById,
  markMyNotificationRead,
} from '../controllers/notificationController.js';

const router = Router();

/* ── Member self-access ──────────────────────────────────────────────────── */
// MUST be registered BEFORE /:id routes, or "me" gets treated as an ObjectId

/** GET /api/notifications/me — member: list own notifications */
router.get('/me', protect, requireRole('MEMBER'), getMyNotifications);

/** GET /api/notifications/me/:id — member: view own notification (IDOR-safe) */
router.get('/me/:id', protect, requireRole('MEMBER'), getMyNotificationById);

/** PATCH /api/notifications/me/:id/read — member: mark own notification read */
router.patch('/me/:id/read', protect, requireRole('MEMBER'), markMyNotificationRead);

/* ── Owner CRUD ──────────────────────────────────────────────────────────── */

/** GET /api/notifications — OWNER only */
router.get('/', protect, requireRole('OWNER'), getNotifications);

/** GET /api/notifications/:id — OWNER only */
router.get('/:id', protect, requireRole('OWNER'), getNotificationById);

/** POST /api/notifications — OWNER only */
router.post('/', protect, requireRole('OWNER'), createNotification);

/** PATCH /api/notifications/:id — OWNER only */
router.patch('/:id', protect, requireRole('OWNER'), updateNotification);

/** PATCH /api/notifications/:id/read — OWNER only */
router.patch('/:id/read', protect, requireRole('OWNER'), patchNotificationRead);

/** DELETE /api/notifications/:id — OWNER only (soft-delete) */
router.delete('/:id', protect, requireRole('OWNER'), deleteNotification);

export default router;