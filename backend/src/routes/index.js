import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import authRoutes from './authRoutes.js';
import programRoutes from './programRoutes.js';
import equipmentRoutes from './equipmentRoutes.js';
import trainerRoutes from './trainerRoutes.js';
import membershipPlanRoutes from './membershipPlanRoutes.js';
import membershipRoutes from './membershipRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import workoutRoutes from './workoutRoutes.js';
import paymentRoutes from './paymentRoutes.js';

import enquiryRoutes from './enquiryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import progressRoutes from './progressRoutes.js';
import gymSettingsRoutes from './gymSettingsRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// API root
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FIT TRACK API',
  });
});

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FIT TRACK API is running',
    environment: process.env.NODE_ENV || 'development',
    database: getDBStatus(),
  });
});

// Authentication
router.use('/auth', authRoutes);

// Public read-only feature routes
router.use('/programs', programRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/trainers', trainerRoutes);
router.use('/membership-plans', membershipPlanRoutes);

// Membership management (owner + member self)
router.use('/memberships', membershipRoutes);

// Attendance (owner management + member self check-in/out)
router.use('/attendance', attendanceRoutes);

// Workouts (owner management + member self access)
router.use('/workouts', workoutRoutes);

// Payments (owner management + member self access)
router.use('/payments', paymentRoutes);

// Enquiries (public create, owner CRUD, member self-access)
router.use('/enquiries', enquiryRoutes);

// Notifications (owner CRUD, member self-access)
router.use('/notifications', notificationRoutes);

// Progress tracking (owner CRUD, member self-access)
router.use('/progress', progressRoutes);

// Announcements (owner-only CRUD)
router.use('/announcements', announcementRoutes);

// Gym settings (public read of sanitized settings, owner-only mutation, singleton)
router.use('/settings', gymSettingsRoutes);

// Owner-only member management
router.use('/users', userRoutes);

export default router;