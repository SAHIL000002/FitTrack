import mongoose from 'mongoose';

/**
 * GymSettings — gym-wide configurable business information.
 * Intended to be editable via Owner settings later.
 * No real-world business data is baked in.
 */

const dayHoursSchema = new mongoose.Schema(
  {
    open: { type: String, trim: true, default: '' },
    close: { type: String, trim: true, default: '' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const gymSettingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, lowercase: true, trim: true, default: '' },
    hours: {
      monday: { type: dayHoursSchema, default: () => ({}) },
      tuesday: { type: dayHoursSchema, default: () => ({}) },
      wednesday: { type: dayHoursSchema, default: () => ({}) },
      thursday: { type: dayHoursSchema, default: () => ({}) },
      friday: { type: dayHoursSchema, default: () => ({}) },
      saturday: { type: dayHoursSchema, default: () => ({}) },
      sunday: { type: dayHoursSchema, default: () => ({}) },
    },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },
    socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const GymSettings =
  mongoose.models.GymSettings || mongoose.model('GymSettings', gymSettingsSchema);

export default GymSettings;