import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info(`🚀 Server on ${PORT}`));
  })
  .catch(err => {
    logger.error({ err }, 'DB connection failed');
    process.exit(1);
  });