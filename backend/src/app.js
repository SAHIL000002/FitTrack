import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

/**
 * Express application — kept separate from server startup (src/server.js).
 * Responsibilities:
 *  - JSON parsing
 *  - CORS (configurable CLIENT_URL)
 *  - API route mounting (/api root)
 *  - 404 handler for unknown API routes
 *  - centralized error middleware
 */
const app = express();

// CORS — allow the configured frontend origin(s). Comma-separated list supported.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (origin === undefined)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Disallow: no ACAO header is set, browser blocks the response
      return callback(null, false);
    },
  })
);

// JSON request parsing with a reasonable payload limit
app.use(express.json({ limit: '1mb' }));

// Simple request logger (development friendly)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// API root — feature route groups (auth, members, memberships, ...) mount here later
app.use('/api', apiRoutes);

// 404 for unknown /api routes
app.use('/api', notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;