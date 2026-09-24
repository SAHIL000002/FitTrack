import Workout from '../models/Workout.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listResponse, successResponse } from '../utils/apiResponse.js';
import { getPagination, getPages } from '../utils/pagination.js';
import { validateId } from '../utils/validateId.js';
import ApiError from '../utils/ApiError.js';
import { workoutService } from '../services/workoutService.js';

export const getWorkouts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = workoutService.buildOwnerQuery(req.query);
  const total = await Workout.countDocuments(query);
  const data = await Workout.find(query)
    .populate('user', 'name email role phone avatar isActive')
    .populate('trainer', 'name role specialty')
    .populate('program', 'name slug category')
    .sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Workouts fetched successfully' });
});

export const getWorkoutById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const workout = await Workout.findById(req.params.id)
    .populate('user', 'name email role phone avatar isActive')
    .populate('trainer', 'name role specialty')
    .populate('program', 'name slug category').lean();
  if (!workout) throw new ApiError(404, 'Workout not found');
  successResponse(res, workout, 'Workout fetched successfully');
});

export const createWorkout = asyncHandler(async (req, res) => {
  const data = workoutService.extractWorkoutFields(req.body, workoutService.WORKOUT_CREATE_FIELDS);
  workoutService.validateWorkoutFields(data, false);
  const user = await workoutService.ensureUserExists(data.user);
  if (user.role !== 'MEMBER') throw new ApiError(400, 'Workouts can only be assigned to members');
  if (data.trainer) await workoutService.ensureTrainerExists(data.trainer);
  if (data.program) await workoutService.ensureProgramExists(data.program);
  const workout = await Workout.create({
    user: data.user, trainer: data.trainer || undefined, program: data.program || undefined,
    title: data.title || '', date: data.date, exercises: data.exercises || [],
    notes: data.notes || '', status: data.status || 'PLANNED',
  });
  const saved = await workoutService.populateWorkout(workout);
  successResponse(res, saved, 'Workout created successfully', 201);
});

export const updateWorkout = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const data = workoutService.extractWorkoutFields(req.body, workoutService.WORKOUT_UPDATE_FIELDS);
  workoutService.validateWorkoutFields(data, true);
  const workout = await Workout.findById(req.params.id);
  if (!workout) throw new ApiError(404, 'Workout not found');
  if (data.trainer) await workoutService.ensureTrainerExists(data.trainer);
  if (data.program) await workoutService.ensureProgramExists(data.program);
  for (const key of Object.keys(data)) workout[key] = data[key];
  await workout.save();
  const saved = await workoutService.populateWorkout(workout);
  successResponse(res, saved, 'Workout updated successfully');
});

export const patchWorkoutStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  if (!req.body.status || !workoutService.VALID_STATUSES.includes(req.body.status))
    throw new ApiError(400, 'Valid status is required: ' + workoutService.VALID_STATUSES.join(', '));
  const workout = await Workout.findById(req.params.id);
  if (!workout) throw new ApiError(404, 'Workout not found');
  workout.status = req.body.status;
  await workout.save();
  const saved = await workoutService.populateWorkout(workout);
  successResponse(res, saved, 'Workout status updated successfully');
});

export const deleteWorkout = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const workout = await Workout.findById(req.params.id);
  if (!workout) throw new ApiError(404, 'Workout not found');
  await Workout.deleteOne({ _id: req.params.id });
  successResponse(res, null, 'Workout deleted successfully');
});

export const getMyWorkouts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { user: req.user._id };
  if (req.query.status) {
    if (!workoutService.VALID_STATUSES.includes(req.query.status)) throw new ApiError(400, 'Invalid status filter');
    query.status = req.query.status;
  }
  const total = await Workout.countDocuments(query);
  const data = await Workout.find(query)
    .populate('trainer', 'name role specialty')
    .populate('program', 'name slug category')
    .sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean();
  listResponse(res, { data, page, limit, total, pages: getPages(total, limit), message: 'Your workouts fetched successfully' });
});

export const getMyWorkoutById = asyncHandler(async (req, res) => {
  validateId(req.params.id);
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id })
    .populate('trainer', 'name role specialty')
    .populate('program', 'name slug category').lean();
  if (!workout) throw new ApiError(404, 'Workout not found');
  successResponse(res, workout, 'Workout fetched successfully');
});
