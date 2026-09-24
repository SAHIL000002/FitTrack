import mongoose from 'mongoose';

/**
 * Equipment — gym equipment inventory.
 * Used by gym management (owner) tooling later.
 */
const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['STRENGTH', 'MACHINES', 'CONDITIONING', 'FUNCTIONAL'],
    },
    description: { type: String, trim: true, default: '' },
    type: { type: String, trim: true, default: '' },
    usage: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    tags: { type: [String], default: [] },
    quantity: { type: Number, min: 0, default: 1 },
    condition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'MAINTENANCE', 'OUT_OF_SERVICE'],
      default: 'GOOD',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

equipmentSchema.index({ category: 1 });

const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);

export default Equipment;