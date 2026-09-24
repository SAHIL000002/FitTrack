import mongoose from 'mongoose';

/**
 * Announcement — gym-wide announcements.
 * createdBy references a User (owner/operator).
 */
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, enum: ['ALL', 'MEMBERS'], default: 'ALL' },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    isActive: { type: Boolean, default: true },
    publishAt: { type: Date },
    expiresAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

announcementSchema.index({ isActive: 1, publishAt: 1 });

const Announcement =
  mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

export default Announcement;