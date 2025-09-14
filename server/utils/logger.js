// Application Logger Configuration using Pino
// Provides structured logging with security-focused redaction and environment-specific formatting

import pino from 'pino';

// Determine environment for conditional configuration
const isProd = process.env.NODE_ENV === 'production';

/**
 * Pino logger instance with security and performance optimizations
 * - Redacts sensitive information from logs
 * - Uses appropriate log levels for each environment
 * - Pretty printing in development, JSON in production
 */
const logger = pino({
  // Set log level based on environment (debug in dev, info in prod)
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  
  // Security: Redact sensitive information from logs
  redact: {
    paths: [
      'password', '*.password',                    // Password fields
      'headers.authorization', 'req.headers.authorization', // Auth headers
      'cookies', 'req.cookies',                    // Cookie data
      'refreshToken', 'accessToken',               // JWT tokens
      'body.password', 'req.body.password'        // Password in request body
    ],
    remove: true  // Completely remove redacted fields instead of replacing with [Redacted]
  },
  
  // Transport configuration: pretty printing in development only
  transport: isProd ? undefined : {
    target: 'pino-pretty',
    options: { 
      colorize: true,              // Colorized output for better readability
      translateTime: 'SYS:standard' // Human-readable timestamps
    }
  }
});

export default logger;