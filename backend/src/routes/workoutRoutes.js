import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import {
  getWorkouts, getWorkoutById, createWorkout, updateWorkout,
  patchWorkoutStatus, deleteWorkout, getMyWorkouts, getMyWorkoutById,
} from '../controllers/workoutController.js';

const router = Router();

// Member self-workout access (MUST come before /:id to avoid conflict)
router.get('/me', protect, requireRole('MEMBER'), getMyWorkouts);
router.get('/me/:id', protect, requireRole('MEMBER'), getMyWorkoutById);

// Owner workout management
router.get('/', protect, requireRole('OWNER'), getWorkouts);
router.get('/:id', protect, requireRole('OWNER'), getWorkoutById);
router.post('/', protect, requireRole('OWNER'), createWorkout);
router.patch('/:id', protect, requireRole('OWNER'), updateWorkout);
router.patch('/:id/status', protect, requireRole('OWNER'), patchWorkoutStatus);
router.delete('/:id', protect, requireRole('OWNER'), deleteWorkout);

export default router;
