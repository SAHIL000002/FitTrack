import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// 1) Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

// 2) Connect MongoDB (graceful: never crashes, /api/health works without it)
await connectDB();

// 3) Start HTTP server
app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`[SERVER] FIT TRACK API running on http://localhost:${PORT} (${env})`);
});