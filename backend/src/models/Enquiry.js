import mongoose from 'mongoose';

/**
 * Enquiry — contact page form submissions.
 * `user` is optional because visitors can enquire before registering.
 */
const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, trim: true, default: '' },
    enquiryType: {
      type: String,
      required: true,
      enum: ['MEMBERSHIP', 'PERSONAL_TRAINING', 'PROGRAMS', 'GENERAL_QUESTION'],
    },
    preferredContact: {
      type: String,
      enum: ['EMAIL', 'PHONE'],
      default: 'EMAIL',
    },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

enquirySchema.index({ status: 1, isActive: 1 });
enquirySchema.index({ createdAt: -1 });

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

export default Enquiry;