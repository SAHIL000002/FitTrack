import mongoose from 'mongoose';

/**
 * Program — structured training program catalog entry.
 * No medical claims are made or intended by these fields.
 */

// Embedded sessions allow structured program breakdown without extra models
const programSessionSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    detail: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      required: true,
      enum: ['STRENGTH', 'HYPERTROPHY', 'CONDITIONING', 'FUNCTIONAL', 'ATHLETIC', 'WEIGHT_MANAGEMENT'],
    },
    difficulty: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    focus: { type: String, trim: true, default: '' },
    // Reference equipment documents when appropriate
    equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
    sessions: { type: [programSessionSchema], default: [] },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

programSchema.index({ isActive: 1, featured: 1 });
programSchema.index({ category: 1 });

const Program = mongoose.models.Program || mongoose.model('Program', programSchema);

export default Program;