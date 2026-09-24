import mongoose from 'mongoose';

/**
 * Workout — member-specific or program-based workout assignment.
 * Exercises are embedded to keep tracking flexible without extra models.
 */

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    sets: { type: Number, min: 0 },
    reps: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    duration: { type: Number, min: 0 },
    rest: { type: Number, min: 0 },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    title: { type: String, trim: true, default: '' },
    date: { type: Date, required: true },
    exercises: { type: [exerciseSchema], default: [] },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
      default: 'PLANNED',
    },
  },
  { timestamps: true }
);

workoutSchema.index({ user: 1, date: -1 });

const Workout = mongoose.models.Workout || mongoose.model('Workout', workoutSchema);

export default Workout;