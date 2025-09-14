// Input Sanitization Middleware
// Protects against NoSQL injection attacks and HTTP parameter pollution

import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Creates middleware array for input sanitization
 * Sanitizes request body, parameters, and query strings to prevent injection attacks
 * 
 * @returns {Array} Array of middleware functions
 */
export default function sanitize() {
  return [
    // MongoDB injection protection middleware
    (req, _res, next) => {
      // Sanitize request body (POST/PUT data)
      if (req.body)   mongoSanitize.sanitize(req.body,   { replaceWith: '_' });
      
      // Sanitize URL parameters (/users/:id)
      if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
      
      // Sanitize query string parameters (?search=value)
      // Note: Express 5 makes req.query a getter, so we sanitize in place
      if (req.query)  mongoSanitize.sanitize(req.query,  { replaceWith: '_' });
      
      next();
    },
    
    // HTTP Parameter Pollution (HPP) protection
    // Prevents attacks that send duplicate parameters
    hpp()
  ];
}