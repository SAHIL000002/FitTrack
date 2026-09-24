import mongoose from 'mongoose';

/**
 * Progress — member fitness progress tracking over time.
 * All measurements are optional. No medical claims or health diagnoses.
 */

const measurementSchema = new mongoose.Schema(
  {
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    arms: { type: Number, min: 0 },
    thighs: { type: Number, min: 0 },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    weight: { type: Number, min: 0 },
    bodyFat: { type: Number, min: 0, max: 100 },
    measurements: { type: measurementSchema, default: {} },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, date: -1 });

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

export default Progress;