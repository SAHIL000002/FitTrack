import { Router } from 'express';
import {
  getTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  patchTrainerStatus,
  deleteTrainer,
} from '../controllers/trainerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public read-only trainer routes
router.get('/', getTrainers);
router.get('/:id', getTrainerById);

// Owner-only trainer management routes
router.post('/', protect, requireRole('owner'), createTrainer);
router.patch('/:id', protect, requireRole('owner'), updateTrainer);
router.patch('/:id/status', protect, requireRole('owner'), patchTrainerStatus);
router.delete('/:id', protect, requireRole('owner'), deleteTrainer);

export default router;