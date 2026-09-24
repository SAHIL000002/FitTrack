import Payment from '../models/Payment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { paymentService } from '../services/paymentService.js';

// ── Owner payment management ──────────────────────────────────────────────

export const getPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = paymentService.buildOwnerQuery(req.query);
  const total = await Payment.countDocuments(query);
  const data = await Payment.find(query)
    .populate('user', 'name email role phone avatar isActive')
    .populate('membership', 'plan status startDate endDate amount')
    .populate('membership.plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Payments fetched successfully' });
});

export const getPaymentById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('membership', 'plan status startDate endDate amount')
    .populate('membership.plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .lean();
  if (!payment) throw new ApiError(404, 'Payment not found');
  successResponse(res, payment, 'Payment fetched successfully');
});

export const createPayment = asyncHandler(async (req, res) => {
  if (req.body.user) { validateId(req.body.user); await paymentService.ensureUserExists(req.body.user); }
  if (req.body.membership) {
    validateId(req.body.membership);
    const membership = await paymentService.ensureMembershipExists(req.body.membership, req.body.user);
    if (!req.body.user) req.body.user = membership.user;
  }
  const data = paymentService.extractPaymentFields(req.body, paymentService.PAYMENT_UPDATE_FIELDS);
  data.user = req.body.user; data.membership = req.body.membership;
  paymentService.validatePaymentFields(data, false);
  if (data.transactionId) {
    const existing = await Payment.findOne({ transactionId: data.transactionId });
    if (existing) throw new ApiError(409, 'Transaction ID already exists');
  }
  const payment = await Payment.create({
    user: data.user, membership: data.membership, amount: data.amount,
    currency: data.currency || 'INR', method: data.method || 'ONLINE',
    status: data.status || 'PENDING', transactionId: data.transactionId || '',
    paymentDate: data.paymentDate || new Date(), notes: data.notes || '',
  });
  const saved = await paymentService.populatePayment(payment);
  successResponse(res, saved, 'Payment created successfully', 201);
});

// ── Owner update / status / delete ────────────────────────────────────────

export const updatePayment = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  const data = paymentService.extractPaymentFields(req.body, paymentService.PAYMENT_UPDATE_FIELDS);
  paymentService.validatePaymentFields(data, true);
  for (const key of Object.keys(data)) { payment[key] = data[key]; }
  await payment.save();
  const saved = await paymentService.populatePayment(payment);
  successResponse(res, saved, 'Payment updated successfully');
});

export const patchPaymentStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (!req.body.status || !paymentService.VALID_STATUSES.includes(req.body.status)) {
    throw new ApiError(400, `Valid status is required: ${paymentService.VALID_STATUSES.join(', ')}`);
  }
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  payment.status = req.body.status;
  await payment.save();
  const saved = await paymentService.populatePayment(payment);
  successResponse(res, saved, 'Payment status updated successfully');
});

export const deletePayment = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, 'Payment not found');
  await Payment.deleteOne({ _id: req.params.id });
  successResponse(res, null, 'Payment deleted successfully');
});

// ── Member self-payment access ────────────────────────────────────────────

export const getMyPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { user: req.user._id };
  if (req.query.status) {
    if (!paymentService.VALID_STATUSES.includes(req.query.status)) throw new ApiError(400, 'Invalid status filter');
    query.status = req.query.status;
  }
  if (req.query.method) {
    if (!paymentService.VALID_METHODS.includes(req.query.method)) throw new ApiError(400, 'Invalid method filter');
    query.method = req.query.method;
  }
  if (req.query.from || req.query.to) {
    const fd = req.query.from ? new Date(req.query.from) : null;
    const td = req.query.to ? new Date(req.query.to) : null;
    if (fd && isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    if (td && isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    if (fd && td && fd > td) throw new ApiError(400, '`from` must be before `to`');
    query.paymentDate = query.paymentDate || {};
    if (fd) query.paymentDate.$gte = fd;
    if (td) query.paymentDate.$lte = td;
  }
  const total = await Payment.countDocuments(query);
  const data = await Payment.find(query)
    .populate('membership', 'plan status startDate endDate amount')
    .populate('membership.plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Your payments fetched successfully' });
});

export const getMyPaymentById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const payment = await Payment.findOne({ _id: req.params.id, user: req.user._id })
    .populate('membership', 'plan status startDate endDate amount')
    .populate('membership.plan', 'name shortName durationMonths price billingLabel featured popular isActive')
    .lean();
  if (!payment) throw new ApiError(404, 'Payment not found');
  successResponse(res, payment, 'Payment fetched successfully');
});