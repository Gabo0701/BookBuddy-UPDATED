// Rate Limiting Middleware Configuration
// Protects API endpoints from abuse and brute force attacks
// Uses express-rate-limit to implement sliding window rate limiting

import rateLimit from 'express-rate-limit';

// Global rate limiter for all API endpoints
// Prevents general API abuse and ensures fair usage
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute sliding window
  max: 300, // Allow 300 requests per window per IP
  standardHeaders: true, // Include rate limit info in response headers
  legacyHeaders: false // Don't include legacy X-RateLimit headers
});

// Authentication endpoints rate limiter
// More restrictive than global limiter for security-sensitive operations
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute sliding window
  max: 100, // Allow 100 auth requests per window per IP
  message: { error: 'Too many auth requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Login attempts rate limiter
// Prevents brute force password attacks
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute sliding window
  max: 100, // Allow 100 login attempts per window per IP
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false
});

// User registration rate limiter
// Prevents spam account creation
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour sliding window
  max: 30, // Allow 30 registrations per hour per IP
  message: { error: 'Too many registrations from this IP. Try later.' },
  standardHeaders: true, 
  legacyHeaders: false
});

// Email verification rate limiter
// Prevents spam verification requests
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute sliding window
  max: 10, // Allow 10 verification requests per minute per IP
  message: { error: 'Too many verification requests. Please wait a minute.' },
  standardHeaders: true, 
  legacyHeaders: false
});

// Password reset rate limiter
// Prevents abuse of password reset functionality
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute sliding window
  max: 10, // Allow 10 reset requests per minute per IP
  message: { error: 'Too many reset requests. Please wait a minute.' },
  standardHeaders: true, 
  legacyHeaders: false
});