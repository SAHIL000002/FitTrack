import { Router } from 'express';
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  patchProgramStatus,
  deleteProgram,
} from '../controllers/programController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public read-only program routes
router.get('/', getPrograms);
router.get('/:id', getProgramById);

// Owner-only program management routes
router.post('/', protect, requireRole('owner'), createProgram);
router.patch('/:id', protect, requireRole('owner'), updateProgram);
router.patch('/:id/status', protect, requireRole('owner'), patchProgramStatus);
router.delete('/:id', protect, requireRole('owner'), deleteProgram);

export default router;