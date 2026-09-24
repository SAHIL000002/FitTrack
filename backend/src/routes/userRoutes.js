import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateMe,
  patchUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

/**
 * User routes — OWNER only member management + MEMBER self-profile.
 *   GET    /api/users              — list (search/filter/paginate)
 *   POST   /api/users              — create MEMBER
 *   PATCH  /api/users/me           — MEMBER self-profile (name/phone only, before /:id)
 *   GET    /api/users/:id          — detail
 *   PATCH  /api/users/:id/status   — activate/deactivate (before /:id)
 *   PATCH  /api/users/:id          — edit name/phone
 *   DELETE /api/users/:id          — soft-delete
 */
const router = Router();

router.get('/', protect, requireRole('OWNER'), getUsers);
router.post('/', protect, requireRole('OWNER'), createUser);
router.patch('/me', protect, updateMe);
router.get('/:id', protect, requireRole('OWNER'), getUserById);
router.patch('/:id/status', protect, requireRole('OWNER'), patchUserStatus);
router.patch('/:id', protect, requireRole('OWNER'), updateUser);
router.delete('/:id', protect, requireRole('OWNER'), deleteUser);

export default router;
