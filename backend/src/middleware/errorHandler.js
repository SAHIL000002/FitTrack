/**
 * 404 handler for unknown API routes.
 * Returns JSON so it never interferes with the Vite frontend.
 */
export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
};

/**
 * Map common mongoose/Express error shapes to clean HTTP responses.
 * Never leaks raw MongoDB internals or stack traces to clients.
 */
const toHttp = (err) => {
  // ApiError / custom status
  if (Number.isInteger(err.statusCode)) return err.statusCode;
  if (Number.isInteger(err.status)) return err.status;

  // Mongoose validation failure -> 400
  if (err.name === 'ValidationError') return 400;

  // Mongoose invalid ObjectId cast -> 400
  if (err.name === 'CastError') return 400;

  // MongoDB duplicate key (E11000) -> 409
  if (err.code === 11000 || err.code === 11001) return 409;

  return 500;
};

/**
 * Build a public-safe message. Sensitive internals stay out of production.
 */
const toMessage = (err, status) => {
  // Express JSON body-parser errors — return a clean message, not the raw parser detail
  if (err.type === 'entity.parse.failed') return 'Invalid JSON payload';

  // Intentionally thrown ApiErrors carry public-safe messages by design
  if (err.isOperational && err.message) return err.message;

  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return first?.message || 'Validation failed';
  }
  if (err.code === 11000 || err.code === 11001) {
    return 'A record with this value already exists';
  }
  // For client errors the thrown message is intentional and safe.
  if (status < 500) return err.message || 'Something went wrong';
  return 'Something went wrong';
};

/**
 * Centralized error middleware.
 * Catches unexpected errors, returns JSON, and avoids exposing stack traces
 * in production.
 */
export const errorHandler = (err, _req, res, _next) => {
  const status = toHttp(err);
  const isProduction = process.env.NODE_ENV === 'production';

  if (status >= 500) {
    console.error(`[ERROR] ${err.message}`);
  }

  const body = {
    success: false,
    message: toMessage(err, status),
  };
  // Non-production debug detail only (never stack traces / credentials)
  if (!isProduction && status >= 500) {
    body.error = err.message;
  }

  res.status(status).json(body);
};