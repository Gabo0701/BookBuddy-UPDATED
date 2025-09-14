// Global Error Handler Middleware
// Catches and handles all unhandled errors in the application
// Must be the last middleware in the Express app

/**
 * Global error handling middleware for Express application
 * Logs errors and sends appropriate HTTP responses to clients
 * 
 * @param {Error} err - Error object thrown by previous middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (unused in error handlers)
 */
export default function errorHandler(err, req, res, next) {
  // Log the error for debugging and monitoring
  console.error(err);
  
  // Use error status if provided, otherwise default to 500 (Internal Server Error)
  const status = err.status || 500;
  
  // Send error response with appropriate status code and message
  res.status(status).json({ 
    error: err.message || 'Internal Server Error' 
  });
}
