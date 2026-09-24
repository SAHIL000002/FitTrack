import { Router } from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  patchAnnouncementStatus,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = Router();

// All announcement routes are OWNER-only
router.get('/', protect, requireRole('OWNER'), getAnnouncements);
router.get('/:id', protect, requireRole('OWNER'), getAnnouncementById);
router.post('/', protect, requireRole('OWNER'), createAnnouncement);
router.patch('/:id', protect, requireRole('OWNER'), updateAnnouncement);
router.patch('/:id/status', protect, requireRole('OWNER'), patchAnnouncementStatus);
router.delete('/:id', protect, requireRole('OWNER'), deleteAnnouncement);

export default router;
