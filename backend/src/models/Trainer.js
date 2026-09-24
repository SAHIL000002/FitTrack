import mongoose from 'mongoose';

/**
 * Trainer — public gym trainer profile.
 * `user` reference is optional: trainer accounts are not forced to be
 * authentication users. Public profile data stays separate from auth concerns.
 */
const trainerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: '' },
    specialty: { type: String, trim: true, default: '' },
    // Free-form on purpose (e.g. "12+ years"), matching the public site data
    experience: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    certifications: { type: [String], default: [] },
    trainingStyles: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

trainerSchema.index({ isActive: 1, featured: 1 });

const Trainer = mongoose.models.Trainer || mongoose.model('Trainer', trainerSchema);

export default Trainer;