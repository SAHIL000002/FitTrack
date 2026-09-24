import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import {
  getProgress, getProgressById, createProgress, updateProgress, deleteProgress,
  getMyProgress, getMyProgressById, createMyProgress, updateMyProgress, deleteMyProgress,
} from '../controllers/progressController.js';

const router = Router();

// Member self-access — MUST be registered BEFORE /:id to prevent "me" being parsed as an ObjectId
router.get('/me', protect, requireRole('MEMBER'), getMyProgress);
router.get('/me/:id', protect, requireRole('MEMBER'), getMyProgressById);
router.post('/me', protect, requireRole('MEMBER'), createMyProgress);
router.patch('/me/:id', protect, requireRole('MEMBER'), updateMyProgress);
router.delete('/me/:id', protect, requireRole('MEMBER'), deleteMyProgress);

// Owner progress management
router.get('/', protect, requireRole('OWNER'), getProgress);
router.get('/:id', protect, requireRole('OWNER'), getProgressById);
router.post('/', protect, requireRole('OWNER'), createProgress);
router.patch('/:id', protect, requireRole('OWNER'), updateProgress);
router.delete('/:id', protect, requireRole('OWNER'), deleteProgress);

export default router;
