import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // site-wide
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // increased for development
  message: { error: 'Too many auth requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // increased for development
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true, legacyHeaders: false
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: 'Too many registrations from this IP. Try later.' },
  standardHeaders: true, legacyHeaders: false
});

export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // increased for development
  message: { error: 'Too many verification requests. Please wait a minute.' },
  standardHeaders: true, legacyHeaders: false
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // increased for development
  message: { error: 'Too many reset requests. Please wait a minute.' },
  standardHeaders: true, legacyHeaders: false
});