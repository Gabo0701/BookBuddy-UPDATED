import express from 'express';
import { body } from 'express-validator';
import validateRequest   from '../middleware/validateRequest.js';
import authenticateToken from '../middleware/authMiddleware.js';
import csrfCheck         from '../middleware/csrfCheck.js';
import {
  loginLimiter,
  registerLimiter,
  emailVerificationLimiter,
  passwordResetLimiter
} from '../middleware/rateLimiters.js';

import {
  register, login, refreshToken, logout, getMe, logoutAll,
  requestEmailVerification, verifyEmail,
  requestPasswordReset, resetPassword, requestEmailReminder
} from '../controllers/authControllers.js';

const router = express.Router();

// Public
router.post('/register',
  registerLimiter,
  [ 
    body('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
  ],
  validateRequest,
  register
);

router.post('/login',
  loginLimiter,
  [ 
    body('emailOrUsername').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty()
  ],
  validateRequest,
  login
);

// Refresh (POST + CSRF)
router.post('/refresh-token', csrfCheck, refreshToken);

// Protected
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);

// Email verification (protected request)
router.post('/request-email-verification',
  authenticateToken,
  emailVerificationLimiter,
  requestEmailVerification
);
router.get('/verify-email', verifyEmail);

// Password reset (public)
router.post('/request-password-reset',
  passwordResetLimiter,
  [ body('email').isEmail() ],
  validateRequest,
  requestPasswordReset
);
router.post('/reset-password',
  [ body('token').notEmpty(), body('password').isLength({ min: 8 }) ],
  validateRequest,
  resetPassword
);

// Email reminder (public)
router.post('/request-email-reminder',
  passwordResetLimiter,
  [ body('username').notEmpty().withMessage('Username is required') ],
  validateRequest,
  requestEmailReminder
);

export default router;