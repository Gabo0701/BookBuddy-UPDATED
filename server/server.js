// BookBuddy Server Entry Point
// Handles server startup, database connection, and error handling

import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

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