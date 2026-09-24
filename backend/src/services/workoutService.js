import Workout from '../models/Workout.js';
import User from '../models/User.js';
import Trainer from '../models/Trainer.js';
import Program from '../models/Program.js';
import ApiError from '../utils/ApiError.js';
import { validateId } from '../utils/validateId.js';

// Allowed status values (must match schema enum)
const VALID_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];

// Fields owner can set/update on a workout
const WORKOUT_CREATE_FIELDS = ['user', 'trainer', 'program', 'title', 'date', 'exercises', 'notes', 'status'];
const WORKOUT_UPDATE_FIELDS = ['trainer', 'program', 'title', 'date', 'exercises', 'notes', 'status'];

const extractWorkoutFields = (body, allowed) => {
  const data = {};
  for (const field of allowed) {
    if (field in body) data[field] = body[field];
  }
  return data;
};

const validateExercises = (exercises) => {
  if (!Array.isArray(exercises)) throw new ApiError(400, 'Exercises must be an array');
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    if (ex.name != null && typeof ex.name !== 'string') throw new ApiError(400, `Exercise ${i + 1} name must be a string`);
    if (ex.sets != null && (!Number.isInteger(ex.sets) || ex.sets < 0)) throw new ApiError(400, `Exercise ${i + 1} sets must be a non-negative integer`);
    if (ex.reps != null && (!Number.isInteger(ex.reps) || ex.reps < 0)) throw new ApiError(400, `Exercise ${i + 1} reps must be a non-negative integer`);
    if (ex.weight != null && (typeof ex.weight !== 'number' || ex.weight < 0 || !isFinite(ex.weight))) throw new ApiError(400, `Exercise ${i + 1} weight must be a non-negative number`);
    if (ex.duration != null && (typeof ex.duration !== 'number' || ex.duration < 0 || !isFinite(ex.duration))) throw new ApiError(400, `Exercise ${i + 1} duration must be a non-negative number`);
    if (ex.rest != null && (typeof ex.rest !== 'number' || ex.rest < 0 || !isFinite(ex.rest))) throw new ApiError(400, `Exercise ${i + 1} rest must be a non-negative number`);
    if (ex.notes != null && typeof ex.notes !== 'string') throw new ApiError(400, `Exercise ${i + 1} notes must be a string`);
  }
};

const validateWorkoutFields = (data, isUpdate = false) => {
  if (!isUpdate && !data.user) throw new ApiError(400, 'User is required');
  if (!isUpdate && !data.date) throw new ApiError(400, 'Date is required');

  if (data.date != null) {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid date');
    data.date = d;
  }

  if (data.status != null) {
    if (!VALID_STATUSES.includes(data.status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (data.exercises != null) validateExercises(data.exercises);
  if (data.notes != null && typeof data.notes !== 'string') throw new ApiError(400, 'Notes must be a string');
  if (data.title != null && typeof data.title !== 'string') throw new ApiError(400, 'Title must be a string');
};

const ensureUserExists = async (userId) => {
  validateId(userId);
  const user = await User.findOne({ _id: userId, deletedAt: null, isActive: true });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const ensureTrainerExists = async (trainerId) => {
  validateId(trainerId);
  const trainer = await Trainer.findOne({ _id: trainerId, isActive: true });
  if (!trainer) throw new ApiError(404, 'Trainer not found');
};

const ensureProgramExists = async (programId) => {
  validateId(programId);
  const program = await Program.findOne({ _id: programId, isActive: true });
  if (!program) throw new ApiError(404, 'Program not found');
};

const populateWorkout = async (workout) => {
  return Workout.findById(workout._id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('trainer', 'name role specialty')
    .populate('program', 'name slug category')
    .lean();
};

const buildOwnerQuery = (filters) => {
  const query = {};
  const { user, trainer, program, status, date, from, to } = filters;

  if (user) { validateId(user); query.user = user; }
  if (trainer) { validateId(trainer); query.trainer = trainer; }
  if (program) { validateId(program); query.program = program; }
  if (status) {
    if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status filter');
    query.status = status;
  }
  if (date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid date filter');
    query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  } else if (from && to) {
    const fd = new Date(from);
    const td = new Date(to);
    if (isNaN(fd.getTime()) || isNaN(td.getTime())) throw new ApiError(400, 'Invalid date range');
    if (fd > td) throw new ApiError(400, '`from` must be before `to`');
    query.date = { $gte: fd, $lt: new Date(td.getTime() + 86400000) };
  } else if (from) {
    const fd = new Date(from);
    if (isNaN(fd.getTime())) throw new ApiError(400, 'Invalid from date');
    query.date = { $gte: fd };
  } else if (to) {
    const td = new Date(to);
    if (isNaN(td.getTime())) throw new ApiError(400, 'Invalid to date');
    query.date = { $lt: new Date(td.getTime() + 86400000) };
  }
  return query;
};

export const workoutService = {
  VALID_STATUSES,
  WORKOUT_CREATE_FIELDS,
  WORKOUT_UPDATE_FIELDS,
  extractWorkoutFields,
  validateWorkoutFields,
  ensureUserExists,
  ensureTrainerExists,
  ensureProgramExists,
  populateWorkout,
  buildOwnerQuery,
};
