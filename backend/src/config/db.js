import mongoose from 'mongoose';

/**
 * MongoDB connection state — kept non-sensitive so it can be safely exposed
 * via the health endpoint. Mirrors the live mongoose connection lifecycle:
 *   not_configured  -> MONGO_URI missing/empty (health works without DB)
 *   connecting      -> attempting to connect
 *   connected       -> mongoose connected
 *   error           -> connection failed or lost
 */
const STATE = {
  status: 'not_configured',
  detail: null,
};

export const getDBStatus = () => STATE.status;

const setState = (status, detail = null) => {
  STATE.status = status;
  STATE.detail = detail;
};

/**
 * Strip the connection string (which may contain credentials) from any
 * message before it is stored/logged. Defense in depth — no secrets in logs.
 */
const sanitize = (message, mongoUri) =>
  typeof message === 'string' ? message.replace(mongoUri, '[redacted]') : message;

/**
 * Connect to MongoDB using MONGO_URI from environment variables.
 * Graceful by design:
 *  - Missing URI   -> logs clearly, skips connection, status = not_configured
 *  - Failed URI    -> reports a clear error, status = error (never "connected")
 * The process never crashes and /api/health keeps working either way.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri === 'your_mongodb_connection_string') {
    setState('not_configured');
    console.log('[DB] MONGO_URI not set - skipping MongoDB connection.');
    return;
  }

  setState('connecting');

  // Track connection lifecycle after the initial connect
  mongoose.connection.on('error', (err) => {
    setState('error', sanitize(err.message, mongoUri));
  });
  mongoose.connection.on('disconnected', () => {
    if (STATE.status === 'connected') {
      setState('error', 'disconnected');
    }
  });

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    setState('connected');
    console.log('MongoDB connected');
  } catch (error) {
    const safeMessage = sanitize(error.message, mongoUri);
    setState('error', safeMessage);
    console.error(`[DB] MongoDB connection failed: ${safeMessage}`);
  }
};

export default connectDB;