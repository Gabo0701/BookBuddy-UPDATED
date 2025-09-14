// BookBuddy Server Entry Point
// Handles server startup, database connection, and error handling

import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server after successful database connection
connectDB()
  .then(() => {
    // Start Express server on specified port
    app.listen(PORT, () => logger.info(`🚀 Server on ${PORT}`));
  })
  .catch(err => {
    // Log database connection error and exit process
    logger.error({ err }, 'DB connection failed');
    process.exit(1); // Exit with error code
  });