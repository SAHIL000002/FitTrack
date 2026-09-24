import { Router } from 'express';
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  patchEquipmentStatus,
  deleteEquipment,
} from '../controllers/equipmentController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public read-only equipment routes (active items only)
router.get('/', getEquipment);
router.get('/:id', getEquipmentById);

// Owner-only equipment management routes.
// NOTE: '/:id/status' is registered BEFORE '/:id' so it can never be swallowed
// by the single-segment PATCH /:id route.
router.post('/', protect, requireRole('OWNER'), createEquipment);
router.patch('/:id/status', protect, requireRole('OWNER'), patchEquipmentStatus);
router.patch('/:id', protect, requireRole('OWNER'), updateEquipment);
router.delete('/:id', protect, requireRole('OWNER'), deleteEquipment);

export default router;
