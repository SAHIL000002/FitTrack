import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const SALT_ROUNDS = 10;

/**
 * User — central identity model for both Owner and Member roles.
 * Password security:
 *  - stored hashed (bcrypt, pre-save hook)
 *  - excluded from queries by default (select: false)
 *  - hashed only when the password field is actually modified
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    // Stored as a bcrypt hash; validation runs on the raw password before hashing
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['OWNER', 'MEMBER'], default: 'MEMBER' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Soft-delete timestamp — preserves historical records (memberships,
    // payments, attendance). Deleted users are excluded from all queries.
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash the password only when it is set/modified — never re-hash an existing
// hash. (Note: update queries bypass this hook; use save() for password changes.)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;