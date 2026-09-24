/**
 * ApiError — custom error class carrying an HTTP status code.
 * Controllers throw these to produce clean, predictable client errors.
 *
 *   throw new ApiError(404, 'Member not found');
 */
export default class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code (defaults to 500)
   * @param {string} message    Public-safe error message
   * @param {*}       details   Optional non-sensitive extra detail (dev only)
   */
  constructor(statusCode = 500, message = 'Something went wrong', details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}