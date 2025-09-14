// Authentication Controllers for BookBuddy Application
// Handles user registration, login, password reset, email verification, and account management

// Core dependencies
import bcrypt from 'bcrypt';           // Password hashing
import jwt from 'jsonwebtoken';        // JWT token generation and verification
import crypto from 'crypto';           // Cryptographic functions for tokens

// Audit logging utilities
import { audit, auditWarn, auditError } from '../utils/audit.js';

// Database models
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import AuthEvent from '../models/AuthEvent.js';
import AccountDeletionRequest from '../models/AccountDeletionRequest.js';
import Book from '../models/Book.js';
import VerificationCode from '../models/VerificationCode.js';

// Email service
import sendMail from '../utils/mailer.js';

// JWT configuration
import {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
  issuer,
  audience,
  refreshTokenSeconds
} from '../config/jwt.js';

// ────────────────────────────────────────────────────────────────────────────
// Configuration Constants
// ────────────────────────────────────────────────────────────────────────────

// Environment configuration
const isProd = process.env.NODE_ENV === 'production';
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Cookie configuration for refresh tokens
const cookieOpts = {
  httpOnly: true,                        // Prevent XSS access to cookies
  sameSite: 'strict',                    // CSRF protection
  secure: isProd,                        // HTTPS only in production
  path: '/',                             // Cookie path (must match when clearing)
  maxAge: 7 * 24 * 60 * 60 * 1000       // 7 days expiration
};

// Token expiration configuration
const EMAIL_VERIFY_TTL_HOURS = Number(process.env.EMAIL_VERIFY_TTL_HOURS || 24);
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);

// ────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────────────────

// Generate unique JWT ID for refresh token tracking
const newJti = () => crypto.randomUUID();

/**
 * Creates a signed JWT access token for user authentication
 * @param {string} userId - User ID to include in token subject
 * @returns {string} Signed JWT access token
 */
function signAccess(userId) {
  return jwt.sign({}, accessTokenSecret, {
    subject: userId,                    // User ID in token subject
    expiresIn: accessTokenExpiresIn,    // Token expiration time
    issuer,                             // Token issuer for validation
    audience                            // Token audience for validation
  });
}

/**
 * Creates a signed JWT refresh token with unique JTI
 * @param {string} userId - User ID to include in token subject
 * @param {string} jti - Unique JWT ID for token tracking
 * @returns {string} Signed JWT refresh token
 */
function signRefresh(userId, jti) {
  return jwt.sign({ jti }, refreshTokenSecret, {
    subject: userId,                    // User ID in token subject
    expiresIn: refreshTokenExpiresIn,   // Token expiration time
    issuer,                             // Token issuer for validation
    audience                            // Token audience for validation
  });
}

/**
 * Stores refresh token in database for tracking and revocation
 * @param {string} userId - User ID associated with token
 * @param {string} jti - Unique JWT ID for token identification
 */
async function persistRefresh(userId, jti) {
  const expiresAt = new Date(Date.now() + refreshTokenSeconds * 1000);
  await RefreshToken.create({ user: userId, jti, expiresAt });
}

/**
 * Revokes all active refresh tokens for a user (logout everywhere)
 * @param {string} userId - User ID whose tokens should be revoked
 */
async function revokeAllUserRefreshTokens(userId) {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

// Token utilities for email verification and password reset

/**
 * Generates a cryptographically secure random token
 * @returns {string} Random hex token
 */
function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates SHA256 hash of input string
 * @param {string} s - String to hash
 * @returns {string} SHA256 hash in hex format
 */
function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

/**
 * Converts hours to milliseconds
 * @param {number} n - Number of hours
 * @returns {number} Milliseconds
 */
function hours(n) {
  return n * 60 * 60 * 1000;
}

/**
 * Converts minutes to milliseconds
 * @param {number} n - Number of minutes
 * @returns {number} Milliseconds
 */
function minutes(n) {
  return n * 60 * 1000;
}

/**
 * Creates a single-use token for email verification or password reset
 * Ensures only one active token exists per user for the given model
 * @param {Object} Model - Mongoose model for token storage
 * @param {string} userId - User ID for token association
 * @param {number} ttlMs - Token time-to-live in milliseconds
 * @returns {string} Plain text token to send to user
 */
async function upsertSingleUseToken(Model, userId, ttlMs) {
  // Remove any existing unused tokens for this user
  await Model.deleteMany({ user: userId, usedAt: null });
  
  // Generate new token and hash it for storage
  const token = randomToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + ttlMs);
  
  // Store hashed token in database
  await Model.create({ user: userId, tokenHash, expiresAt });
  
  return token; // Return plaintext token to email to user
}

// ────────────────────────────────────────────────────────────────────────────
/*  Auth Core  */
// ────────────────────────────────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      username: username.toLowerCase(),
      email: email.toLowerCase(), 
      password: hashed 
    });

    // AUDIT 
    audit('auth.register.success', { userId: user.id, username, email }, req);

    // Log auth event to MongoDB
    await AuthEvent.create({ user: user.id, action: 'register' });

    const jti = newJti();
    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id, jti);
    await persistRefresh(user.id, jti);

    return res
      .cookie('refreshToken', refreshToken, cookieOpts)
      .status(201)
      .json({ accessToken });
  } catch (err) {
    if (err.code === 11000) {
      // Handle duplicate key errors more specifically
      if (err.keyPattern?.email) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      if (err.keyPattern?.username) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      return res.status(409).json({ error: 'User already exists' });
    }
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { emailOrUsername, password } = req.body;

    // Check if input is email or username
    const isEmail = emailOrUsername.includes('@');
    const query = isEmail 
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername.toLowerCase() };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      auditWarn('auth.login.failed', { emailOrUsername }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Optional gate: require verified email
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({ error: 'Please verify your email before logging in' });
    // }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      auditWarn('auth.login.failed', { emailOrUsername }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clean up old refresh tokens for this user (logout everywhere)
    await revokeAllUserRefreshTokens(user.id);

    const jti = newJti();
    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id, jti);
    await persistRefresh(user.id, jti);

    // AUDIT
    audit('auth.login.success', { userId: user.id }, req);

    // Log auth event to MongoDB
    await AuthEvent.create({ user: user.id, action: 'login' });

    return res.cookie('refreshToken', refreshToken, cookieOpts).json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

export async function refreshToken(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
        auditWarn('auth.refresh.denied', { reason: 'missing' }, req);
        return res.status(401).json({ error: 'Refresh token missing' });
    }

    const payload = jwt.verify(token, refreshTokenSecret, { issuer, audience });

    const current = await RefreshToken.findOne({ jti: payload.jti, revokedAt: null });
    if (!current) {
        auditWarn('auth.refresh.denied', { reason: 'revoked or unknown' }, req);
        auditError('auth.refresh.error', { jti: payload.jti, userId: payload.sub }, req);
        return res.status(401).json({ error: 'Refresh revoked or unknown' });
    }

    current.revokedAt = new Date();
    await current.save();

    const jti = newJti();
    await persistRefresh(payload.sub, jti);

    const newRefresh = signRefresh(payload.sub, jti);
    const newAccess = signAccess(payload.sub);

    // AUDIT 
    audit('auth.refresh.rotate', { userId: payload.sub, oldJti: payload.jti, newJti: jti }, req);

    // Log auth event to MongoDB
    await AuthEvent.create({ user: payload.sub, action: 'refresh_token' });

    return res.cookie('refreshToken', newRefresh, cookieOpts).json({ accessToken: newAccess });
  } catch (err) {
    auditWarn('auth.refresh.denied', { reason: 'invalid_jwt' }, req);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  // best effort: revoke the current refresh token if present
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, refreshTokenSecret, { issuer, audience });
      await RefreshToken.updateOne({ jti: payload.jti }, { $set: { revokedAt: new Date() } });
    } catch {
      // ignore during logout
    }
  }
  audit('auth.logout', {}, req);

  // Log auth event to MongoDB if we have user info
  if (token) {
    try {
      const payload = jwt.verify(token, refreshTokenSecret, { issuer, audience });
      await AuthEvent.create({ user: payload.sub, action: 'logout' });
    } catch {
      // ignore during logout
    }
  }

  return res
    .clearCookie('refreshToken', { ...cookieOpts, maxAge: undefined })
    .json({ message: 'Logged out' });
}

export async function logoutAll(req, res, next) {
  try {
    await revokeAllUserRefreshTokens(req.user.id);

    audit('auth.logout_all', {}, req);

    // Log auth event to MongoDB
    await AuthEvent.create({ user: req.user.id, action: 'logout' });

    return res
      .clearCookie('refreshToken', { ...cookieOpts, maxAge: undefined })
      .json({ message: 'Logged out everywhere' });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

// ────────────────────────────────────────────────────────────────────────────
/*  Email Verification  */
// ────────────────────────────────────────────────────────────────────────────
export async function requestEmailVerification(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isEmailVerified) return res.json({ message: 'Email already verified' });

    const token = await upsertSingleUseToken(
      EmailVerificationToken,
      user.id,
      hours(EMAIL_VERIFY_TTL_HOURS)
    );

    const verifyLink = `${API_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;

    audit('email.verify.requested', { userId: user.id }, req);

    await sendMail({
      to: user.email,
      subject: 'Verify your BookBuddy email',
      text: `Click to verify: ${verifyLink}`,
      html: `<p>Click to verify your email:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`
    });

    return res.json({ message: 'Verification email sent' });
  } catch (err) {
    return next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const token = req.query.token || req.body.token;
    if (!token) return res.status(400).json({ error: 'Token missing' });

    const tokenHash = sha256(token);
    const doc = await EmailVerificationToken.findOne({ tokenHash, usedAt: null });
    if (!doc) return res.status(400).json({ error: 'Invalid or used token' });
    if (doc.expiresAt < new Date()) return res.status(400).json({ error: 'Token expired' });

    const user = await User.findById(doc.user);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isEmailVerified = true;
    await user.save();

    doc.usedAt = new Date();
    await doc.save();
    await EmailVerificationToken.deleteMany({ user: user.id, usedAt: null });

    audit('email.verify.success', { userId: user.id }, req);

    // Log auth event to MongoDB
    await AuthEvent.create({ user: user.id, action: 'email_verified' });

    return res.json({ message: 'Email verified' });
  } catch (err) {
    return next(err);
  }
}

// ────────────────────────────────────────────────────────────────────────────
/*  Password Reset  */
// ────────────────────────────────────────────────────────────────────────────
export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({ errors: [{ msg: 'Email is required', path: 'email' }] });
    }

    const user = await User.findOne({ email });
    audit('password.reset.requested', { email, userId: user?.id }, req);
    // always succeed to avoid account enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent' });

    const token = await upsertSingleUseToken(
      PasswordResetToken,
      user.id,
      minutes(PASSWORD_RESET_TTL_MINUTES)
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
    // Your frontend should read ?token= and POST it to /api/v1/auth/reset-password
    audit('password.reset.success', { userId: user.id }, req);
    await sendMail({
      to: user.email,
      subject: 'Reset your BookBuddy password',
      text: `Reset your password: ${resetLink}`,
      html: `<p>Reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`
    });

    return res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(422).json({ errors: [{ msg: 'Token and password are required' }] });
    }

    const tokenHash = sha256(token);
    const doc = await PasswordResetToken.findOne({ tokenHash, usedAt: null });
    if (!doc) return res.status(400).json({ error: 'Invalid or used token' });
    if (doc.expiresAt < new Date()) return res.status(400).json({ error: 'Token expired' });

    const user = await User.findById(doc.user).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    await user.save();

    // revoke all refresh tokens so old sessions die
    await revokeAllUserRefreshTokens(user.id);

    doc.usedAt = new Date();
    await doc.save();

    // Log auth event to MongoDB
    await AuthEvent.create({ user: user.id, action: 'password_reset' });

    return res.json({ message: 'Password updated. Please log in again.' });
  } catch (err) {
    return next(err);
  }
}

export async function requestEmailReminder(req, res, next) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(422).json({ errors: [{ msg: 'Username is required', path: 'username' }] });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    audit('email.reminder.requested', { username, userId: user?.id }, req);
    
    // Always succeed to avoid account enumeration
    if (!user) return res.json({ message: 'If that username exists, the associated email has been sent to you' });

    await sendMail({
      to: user.email,
      subject: 'Your BookBuddy email address',
      text: `Your email address for BookBuddy is: ${user.email}`,
      html: `<p>Your email address for BookBuddy is:</p><p><strong>${user.email}</strong></p>`
    });

    return res.json({ message: 'If that username exists, the associated email has been sent to you' });
  } catch (err) {
    return next(err);
  }
}

// POST /api/v1/auth/delete-request
export async function requestAccountDeletion(req, res, next) {
  try {
    const { reason } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for existing pending request
    const existingRequest = await AccountDeletionRequest.findOne({
      userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Deletion request already pending' });
    }

    // Create deletion request
    const deletionRequest = new AccountDeletionRequest({
      userId,
      email: user.email,
      reason
    });

    await deletionRequest.save();

    // Process deletion immediately
    await processAccountDeletion(userId);

    res.json({ message: 'Account deletion request submitted successfully' });
  } catch (error) {
    console.error('Account deletion request error:', error);
    return next(error);
  }
}

// Helper function to process account deletion
const processAccountDeletion = async (userId) => {
  try {
    // Delete user's books
    await Book.deleteMany({ user: userId });
    
    // Delete refresh tokens
    await RefreshToken.deleteMany({ user: userId });
    
    // Delete email verification tokens
    await EmailVerificationToken.deleteMany({ user: userId });
    
    // Delete password reset tokens
    await PasswordResetToken.deleteMany({ user: userId });
    
    // Delete auth events
    await AuthEvent.deleteMany({ user: userId });
    
    // Mark deletion request as processed
    await AccountDeletionRequest.updateOne(
      { userId, status: 'pending' },
      { status: 'processed', processedAt: new Date() }
    );
    
    // Finally delete the user
    await User.findByIdAndDelete(userId);
    
    console.log(`Account ${userId} successfully deleted`);
  } catch (error) {
    console.error('Error processing account deletion:', error);
    throw error;
  }
};

// POST /api/v1/auth/send-login-verification
export async function sendLoginVerification(req, res, next) {
  try {
    const { email: emailOrUsername } = req.body;
    
    // Determine if input is email or username
    const isEmail = emailOrUsername.includes('@');
    const query = isEmail 
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete existing codes for this email
    await VerificationCode.deleteMany({ email: user.email, type: 'login' });
    
    // Save new code
    await VerificationCode.create({
      email: user.email,
      code,
      type: 'login'
    });

    // Send email
    await sendMail({
      to: user.email,
      subject: 'BookBuddy Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">BookBuddy Login Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Send verification error:', error);
    return next(error);
  }
}

// POST /api/v1/auth/verify-login-code
export async function verifyLoginCode(req, res, next) {
  try {
    const { email: emailOrUsername, code } = req.body;
    
    // Resolve to actual email
    const isEmail = emailOrUsername.includes('@');
    const query = isEmail 
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find valid code
    const verificationCode = await VerificationCode.findOne({
      email: user.email,
      code,
      type: 'login',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Mark code as used
    verificationCode.used = true;
    await verificationCode.save();

    // Mark user as verified
    user.isEmailVerified = true;
    await user.save();

    // Generate tokens
    await revokeAllUserRefreshTokens(user.id);
    const jti = newJti();
    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id, jti);
    await persistRefresh(user.id, jti);

    // Log auth event
    await AuthEvent.create({ user: user.id, action: 'login' });
    audit('auth.verify.success', { userId: user.id }, req);

    return res.cookie('refreshToken', refreshToken, cookieOpts).json({ accessToken });
  } catch (error) {
    console.error('Verify code error:', error);
    return next(error);
  }
}