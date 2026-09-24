import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { attendanceService } from '../services/attendanceService.js';

const VALID_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'CLEARED'];

/** GET /api/attendance — OWNER only */
export const getAttendance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { user, date, status, from, to } = req.query;
  const query = {};
  if (user) { validateId(user); query.user = user; }
  if (date) {
    attendanceService.validateDateFilter(date);
    const d = attendanceService.resolveDate(date);
    query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  } else if (from && to) {
    attendanceService.validateDateRange(from, to);
    const fd = attendanceService.resolveDate(from);
    const td = attendanceService.resolveDate(to);
    query.date = { $gte: fd, $lt: new Date(td.getTime() + 86400000) };
  }
  if (status) {
    if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status');
    query.status = status;
  }
  const total = await Attendance.countDocuments(query);
  const data = await Attendance.find(query)
    .populate('user', 'name email role phone avatar isActive')
    .sort({ date: -1, checkIn: -1, createdAt: -1 })
    .skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Attendance records fetched successfully' });
});

/** GET /api/attendance/:id — OWNER only */
export const getAttendanceById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const attendance = await Attendance.findById(req.params.id)
    .populate('user', 'name email role phone avatar isActive').lean();
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  successResponse(res, attendance, 'Attendance record fetched successfully');
});

/** POST /api/attendance — OWNER only */
export const createAttendance = asyncHandler(async (req, res) => {
  validateId(req.body.user);
  const user = await User.findOne({ _id: req.body.user, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');
  const officeDate = attendanceService.resolveDate(req.body.date || 'today');
  if (req.body.status != null && !VALID_STATUSES.includes(req.body.status))
    throw new ApiError(400, 'Invalid status');
  if (req.body.checkIn != null) {
    const ci = new Date(req.body.checkIn);
    if (isNaN(ci.getTime())) throw new ApiError(400, 'Invalid checkIn');
  }
  if (req.body.checkOut != null) {
    const co = new Date(req.body.checkOut);
    if (isNaN(co.getTime())) throw new ApiError(400, 'Invalid checkOut');
    if (req.body.checkIn != null && co < new Date(req.body.checkIn))
      throw new ApiError(400, 'checkOut must be after checkIn');
  }
  await attendanceService.ensureNotExists(req.body.user, officeDate);
  const record = await Attendance.create({
    user: req.body.user,
    date: officeDate,
    checkIn: req.body.checkIn ? new Date(req.body.checkIn) : undefined,
    checkOut: req.body.checkOut ? new Date(req.body.checkOut) : undefined,
    status: req.body.status || 'PRESENT',
    notes: req.body.notes != null ? String(req.body.notes).trim() : '',
  });
  const saved = await Attendance.findById(record._id)
    .populate('user', 'name email role phone avatar isActive').lean();
  successResponse(res, saved, 'Attendance record created successfully', 201);
});

/** PATCH /api/attendance/:id — OWNER only */
export const updateAttendance = asyncHandler(async (req, res) => {
  if (req.body.date != null) throw new ApiError(400, 'Date cannot be modified');
  validateId(req.params.id);
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  if (req.body.status != null) {
    if (!VALID_STATUSES.includes(req.body.status)) throw new ApiError(400, 'Invalid status');
    attendance.status = req.body.status;
  }
  if (req.body.checkIn != null) {
    const ci = new Date(req.body.checkIn);
    if (isNaN(ci.getTime())) throw new ApiError(400, 'Invalid checkIn');
    attendance.checkIn = ci;
  }
  if (req.body.checkOut != null) {
    const co = new Date(req.body.checkOut);
    if (isNaN(co.getTime())) throw new ApiError(400, 'Invalid checkOut');
    if (attendance.checkIn && co < attendance.checkIn)
      throw new ApiError(400, 'checkOut must be after checkIn');
    attendance.checkOut = co;
  }
  if (req.body.notes != null) attendance.notes = String(req.body.notes).trim();
  await attendance.save();
  const saved = await Attendance.findById(attendance._id)
    .populate('user', 'name email role phone avatar isActive').lean();
  successResponse(res, saved, 'Attendance record updated successfully');
});

/** DELETE /api/attendance/:id — OWNER only (soft-delete) */
export const deleteAttendance = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  // Soft-delete: keep `date` (required by the model) — clear the punch data only.
  attendance.checkIn = null;
  attendance.checkOut = null;
  attendance.status = 'CLEARED';
  attendance.notes = 'Record cleared';
  await attendance.save();
  const saved = await Attendance.findById(attendance._id)
    .populate('user', 'name email role phone avatar isActive').lean();
  successResponse(res, saved, 'Attendance record cleared successfully');
});

/** GET /api/attendance/me — MEMBER only, own attendance */
export const getMyAttendance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, from, to } = req.query;
  const query = { user: req.user._id };
  if (status) {
    if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status');
    query.status = status;
  }
  if (from || to) {
    attendanceService.validateDateRange(from || '2000-01-01', to || '2100-01-01');
    const fd = attendanceService.resolveDate(from || '2000-01-01');
    const td = attendanceService.resolveDate(to || '2100-01-01');
    query.date = { $gte: fd, $lt: new Date(td.getTime() + 86400000) };
  }
  const total = await Attendance.countDocuments(query);
  const data = await Attendance.find(query)
    .sort({ date: -1, checkIn: -1, createdAt: -1 })
    .skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Your attendance fetched successfully' });
});

/** GET /api/attendance/me/:id — MEMBER only, own record */
export const getMyAttendanceById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const attendance = await Attendance.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  successResponse(res, attendance, 'Attendance record fetched successfully');
});

/** POST /api/attendance/check-in — MEMBER only */
export const checkIn = asyncHandler(async (req, res) => {
  if (req.body.user) throw new ApiError(400, 'User is determined automatically');
  const officeDate = attendanceService.todayGymDate();

  // The compound unique index (user + date) means at most ONE record exists
  // per member per day. An existing record WITHOUT a punch (owner-cleared or
  // owner-created ABSENT) must be REACTIVATED here — creating a second
  // record would throw E11000, and blocking on the existing one would leave
  // the member unable to ever check in that day.
  const existing = await Attendance.findOne({ user: req.user._id, date: officeDate });
  if (existing) {
    if (existing.checkIn) throw new ApiError(409, 'Already checked in for today');
    existing.checkIn = new Date();
    existing.checkOut = null;
    existing.status = 'PRESENT';
    existing.notes = req.body.notes != null ? String(req.body.notes).trim() : '';
    await existing.save();
    const saved = await Attendance.findById(existing._id).lean();
    return successResponse(res, saved, 'Checked in successfully', 201);
  }

  const record = await Attendance.create({
    user: req.user._id,
    date: officeDate,
    checkIn: new Date(),
    status: 'PRESENT',
    notes: req.body.notes != null ? String(req.body.notes).trim() : '',
  });
  const saved = await Attendance.findById(record._id).lean();
  successResponse(res, saved, 'Checked in successfully', 201);
});

/** PATCH /api/attendance/me/today/check-out — MEMBER only */
export const checkOut = asyncHandler(async (req, res) => {
  const officeDate = attendanceService.todayGymDate();
  const attendance = await Attendance.findOne({
    user: req.user._id,
    date: officeDate,
  });
  attendanceService.ensureExists(attendance);
  if (!attendance.checkIn)
    throw new ApiError(400, 'Cannot check out without check-in');
  if (attendance.checkOut)
    throw new ApiError(409, 'Already checked out for today');
  attendance.checkOut = new Date();
  await attendance.save();
  const saved = await Attendance.findById(attendance._id).lean();
  successResponse(res, saved, 'Checked out successfully');
});

