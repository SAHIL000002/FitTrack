import mongoose from 'mongoose';
import ApiError from './ApiError.js';

/**
 * validateId — throws a clean 400 ApiError for malformed MongoDB ObjectIds.
 * Prevents raw Mongoose CastError responses from leaking to clients.
 *
 *   validateId(req.params.id);
 */
export const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid resource ID');
  }
};