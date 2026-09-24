import mongoose from 'mongoose';

/**
 * MembershipPlan — a configurable gym membership package.
 * Mirrors the structure used by the frontend Membership page and data layer.
 */
const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true, default: '' },
    durationMonths: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    billingLabel: { type: String, trim: true, default: '' },
    billingNote: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    features: { type: [String], default: [] },
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    badge: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MembershipPlan =
  mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', membershipPlanSchema);

export default MembershipPlan;