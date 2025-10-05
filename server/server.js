// BookBuddy Server Entry Point
// Handles server startup, database connection, and error handling

// server/server.js  🚀
// ES modules (package.json has "type":"module")

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// --- Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g., https://your-frontend.onrender.com
    credentials: true,
  })
);

// --- Health check (works even if DB fails)
app.get('/api/health', (_req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting', 'unauthorized', 'unknown'];
  res.status(200).json({
    ok: true,
    env: process.env.NODE_ENV || 'development',
    db: dbStates[mongoose.connection.readyState] ?? mongoose.connection.readyState,
    time: new Date().toISOString(),
  });
});

// TODO: mount your real API routes here
// import apiRouter from './routes/index.js';
// app.use('/api', apiRouter);

const PORT = process.env.PORT || 5000;

async function start() {
  // 1) Try DB (don’t crash if it fails)
  try {
    console.log('🛰️  Connecting to MongoDB…');
    // Use your full Atlas SRV string in process.env.MONGO_URI
    await mongoose.connect(process.env.MONGO_URI, {
      // options optional with Mongoose v7+, keep empty unless needed
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err?.message || err);
    // NOTE: We do NOT exit here so the server still starts on Render.
  }

  // 2) Start server
  app.listen(PORT, () => {
    console.log(`🚀 API listening on :${PORT}`);
  });
}

start();
export default app;