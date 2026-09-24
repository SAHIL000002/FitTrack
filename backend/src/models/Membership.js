import mongoose from 'mongoose';

/**
 * Membership — a member's actual active/previous membership.
 * Relationship: User → Membership → MembershipPlan
 */
const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
    },
    amount: { type: Number, min: 0, default: 0 },
    autoRenew: { type: Boolean, default: false },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

membershipSchema.index({ user: 1, status: 1 });
membershipSchema.index({ endDate: 1 });

const Membership =
  mongoose.models.Membership || mongoose.model('Membership', membershipSchema);

export default Membership;