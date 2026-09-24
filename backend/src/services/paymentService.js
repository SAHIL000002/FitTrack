import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Membership from '../models/Membership.js';
import MembershipPlan from '../models/MembershipPlan.js';
import ApiError from '../utils/ApiError.js';
import { validateId } from '../utils/validateId.js';

// Allowed fields owner can set/update on a payment
const PAYMENT_UPDATE_FIELDS = ['membership', 'amount', 'currency', 'method', 'status', 'transactionId', 'paymentDate', 'notes'];

const VALID_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER'];
const VALID_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const extractPaymentFields = (body, allowed) => {
  const data = {};
  for (const field of allowed) {
    if (field in body) data[field] = body[field];
  }
  return data;
};

const validatePaymentFields = (data, isUpdate = false) => {
  if (!isUpdate && !data.user) throw new ApiError(400, 'User is required');
  if (!isUpdate && !data.membership) throw new ApiError(400, 'Membership is required');

  if (data.amount != null) {
    if (typeof data.amount !== 'number' || data.amount < 0 || !isFinite(data.amount)) {
      throw new ApiError(400, 'Amount must be a non-negative number');
    }
  }

  if (data.currency != null) {
    if (typeof data.currency !== 'string' || data.currency.trim() === '') {
      throw new ApiError(400, 'Currency must be a non-empty string');
    }
  }

  if (data.method != null) {
    if (!VALID_METHODS.includes(data.method)) {
      throw new ApiError(400, `Invalid method. Must be one of: ${VALID_METHODS.join(', ')}`);
    }
  }

  if (data.status != null) {
    if (!VALID_STATUSES.includes(data.status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (data.transactionId != null) {
    if (typeof data.transactionId !== 'string' || data.transactionId.trim() === '') {
      throw new ApiError(400, 'Transaction ID must be a non-empty string');
    }
  }

  if (data.paymentDate != null) {
    const d = new Date(data.paymentDate);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid paymentDate');
    data.paymentDate = d;
  }

  if (data.notes != null && typeof data.notes !== 'string') {
    throw new ApiError(400, 'Notes must be a string');
  }
};

const ensureUserExists = async (userId) => {
  validateId(userId);
  const user = await User.findOne({ _id: userId, deletedAt: null, isActive: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const ensureMembershipExists = async (membershipId, userId = null) => {
  validateId(membershipId);
  const membership = await Membership.findById(membershipId);
  if (!membership) throw new ApiError(404, 'Membership not found');

  if (userId && membership.user.toString() !== userId) {
    throw new ApiError(400, 'Membership does not belong to the specified user');
  }
  return membership;
};

const populatePayment = async (payment) => {
  return Payment.findById(payment._id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('membership', 'plan status startDate endDate amount')
    .populate('membership.plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .lean();
};

const buildOwnerQuery = (filters) => {
  const query = {};
  const { user, membership, status, method, from, to } = filters;

  if (user) {
    validateId(user);
    query.user = user;
  }
  if (membership) {
    validateId(membership);
    query.membership = membership;
  }
  if (status) {
    if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status filter');
    query.status = status;
  }
  if (method) {
    if (!VALID_METHODS.includes(method)) throw new ApiError(400, 'Invalid method filter');
    query.method = method;
  }
  if (from || to) {
    const fd = from ? new Date(from) : null;
    const td = to ? new Date(to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, '`from` must be before `to`');

    query.paymentDate = query.paymentDate || {};
    if (fd) query.paymentDate.$gte = fd;
    if (td) query.paymentDate.$lte = td;
  }

  return query;
};

export const paymentService = {
  VALID_METHODS,
  VALID_STATUSES,
  PAYMENT_UPDATE_FIELDS,
  extractPaymentFields,
  validatePaymentFields,
  ensureUserExists,
  ensureMembershipExists,
  populatePayment,
  buildOwnerQuery,
};
