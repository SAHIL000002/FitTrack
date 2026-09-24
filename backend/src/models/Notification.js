import mongoose from 'mongoose';

/**
 * Notification — member-specific notifications.
 * Delivery mechanics are intentionally out of scope at this stage.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['GENERAL', 'MEMBERSHIP', 'PAYMENT', 'ATTENDANCE', 'WORKOUT', 'ANNOUNCEMENT'],
      default: 'GENERAL',
    },
    isRead: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, isActive: 1 });

const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;