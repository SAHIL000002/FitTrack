import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getMyAttendance,
  getMyAttendanceById,
  checkIn,
  checkOut,
} from '../controllers/attendanceController.js';

const router = Router();

// Public → none. Every attendance endpoint requires auth.

// Member self-attendance — MUST be registered before the OWNER '/:id' routes,
// otherwise GET /attendance/me is captured by GET /attendance/:id ('me' is
// not a valid ObjectId → 400 for owners, 403 for members).
router.get('/me', protect, requireRole('MEMBER'), getMyAttendance);
router.get('/me/:id', protect, requireRole('MEMBER'), getMyAttendanceById);
router.post('/check-in', protect, requireRole('MEMBER'), checkIn);
router.patch('/me/today/check-out', protect, requireRole('MEMBER'), checkOut);

// Owner attendance management
router.get('/', protect, requireRole('OWNER'), getAttendance);
router.get('/:id', protect, requireRole('OWNER'), getAttendanceById);
router.post('/', protect, requireRole('OWNER'), createAttendance);
router.patch('/:id', protect, requireRole('OWNER'), updateAttendance);
router.delete('/:id', protect, requireRole('OWNER'), deleteAttendance);

export default router;
