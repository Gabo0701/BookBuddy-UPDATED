import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });
import app from './app.js';
import connectDB from './config/db-robust.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Start server regardless of database connection status
const startServer = () => {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Attempt database connection but don't block server startup
connectDB()
  .then(() => {
    console.log('✅ Database connection established');
    startServer();
  })
  .catch(err => {
    console.warn('⚠️  Database connection failed, starting server anyway');
    logger.warn({ err }, 'DB connection failed - server starting without DB');
    startServer();
  });