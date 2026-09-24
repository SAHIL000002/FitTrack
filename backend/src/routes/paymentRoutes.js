import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import {
  getPayments, getPaymentById, createPayment, updatePayment,
  patchPaymentStatus, deletePayment, getMyPayments, getMyPaymentById,
} from '../controllers/paymentController.js';

const router = Router();

// Member self-payment access (MUST come before /:id)
router.get('/me', protect, requireRole('MEMBER'), getMyPayments);
router.get('/me/:id', protect, requireRole('MEMBER'), getMyPaymentById);

// Owner payment management
router.get('/', protect, requireRole('OWNER'), getPayments);
router.get('/:id', protect, requireRole('OWNER'), getPaymentById);
router.post('/', protect, requireRole('OWNER'), createPayment);
router.patch('/:id', protect, requireRole('OWNER'), updatePayment);
router.patch('/:id/status', protect, requireRole('OWNER'), patchPaymentStatus);
router.delete('/:id', protect, requireRole('OWNER'), deletePayment);

export default router;
