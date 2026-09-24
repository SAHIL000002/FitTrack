import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * FIT TRACK attendance date strategy
 * ─────────────────────────────────────────────────────────────
 * Consistent gym "application date" is derived from Asia/Kolkata (IST).
 * This keeps check-in / date filtering stable regardless of the server's
 * system timezone. The application date starts and ends at midnight IST.
 *
 * Why not new Date() throughout?
 *   A member checking in at 23:30 IST vs a member checking in at 00:10 IST
 *   could land on different Date objects if UTC midnight is used as the
 *   boundary. IST-based daily boundaries avoid that for this gym's context.
 *
 * This is intentionally a single helper so every route derives dates the
 * same way. Timezone is NOT hardcoded per-route.
 */

const TZ = 'Asia/Kolkata';

const gymDateISO = (dateOrNow = 'today') => {
  const now = dateOrNow === 'today' ? new Date() : new Date(dateOrNow);
  if (isNaN(now.getTime())) throw new ApiError(400, 'Invalid date');

  const iso = now.toLocaleString('en-CA', { timeZone: TZ }); // YYYY-MM-DD[, ]HH:mm:ss
  // en-CA in Node may render "YYYY-MM-DD, HH:mm:ss" — strip any comma so the
  // date part always parses cleanly (an unstripped comma made Date.UTC invalid).
  const [datePartRaw] = iso.split(' ');
  const datePart = datePartRaw.replace(/,/g, '');
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};

const parseGymDate = (raw) => {
  if (!raw || typeof raw !== 'string') throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD.');
  const m = raw.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD.');
  const d = new Date(raw + 'T00:00:00+05:30');
  if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid date');
  return d;
};

const todayGymDate = () => gymDateISO();

const resolveDate = (raw) => {
  if (!raw || raw === 'today') return todayGymDate();
  return parseGymDate(raw);
};

const findAttendanceByUserAndDate = async (user, date) =>
  Attendance.findOne({ user, date }).lean();

const ensureNotExists = async (user, date) => {
  const existing = await findAttendanceByUserAndDate(user, date);
  if (existing) throw new ApiError(409, 'Attendance for this user and date already exists');
};

const ensureExists = (record) => {
  if (!record) throw new ApiError(404, 'Attendance record not found');
  return record;
};

const validateDateFilter = (date) => {
  if (date) resolveDate(date);
};

const validateDateRange = (from, to) => {
  if (from) resolveDate(from);
  if (to) resolveDate(to);
  if (from && to && resolveDate(from) > resolveDate(to)) {
    throw new ApiError(400, '`from` date must be on or before `to` date');
  }
};

const membershipStillActive = async (userId) => {
  const { Membership } = await import('../models/Membership.js');
  const now = new Date();
  const active = await Membership.findOne({
    user: userId,
    status: { $in: ['PENDING', 'ACTIVE'] },
    endDate: { $gte: now },
  }).lean();
  return !!active;
};

export const attendanceService = {
  gymDateISO,
  resolveDate,
  todayGymDate,
  parseGymDate,
  findAttendanceByUserAndDate,
  ensureNotExists,
  ensureExists,
  validateDateFilter,
  validateDateRange,
  membershipStillActive,
};
