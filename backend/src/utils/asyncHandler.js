/**
 * asyncHandler — wraps an async Express controller so thrown errors are
 * forwarded to the centralized error middleware automatically.
 * Removes repetitive try/catch blocks from controllers.
 *
 *   const getX = asyncHandler(async (req, res) => { ... });
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);