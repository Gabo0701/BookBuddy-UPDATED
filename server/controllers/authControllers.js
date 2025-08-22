import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { audit, auditWarn, auditError } from '../utils/audit.js';

import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import AuthEvent from '../models/AuthEvent.js';
import sendMail from '../utils/mailer.js';

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
// Config
// ────────────────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';
const API_URL = process.env.API_URL || 'http://localhost:5000';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'strict',
  secure: isProd,
  path: '/', // must match when clearing cookie
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const EMAIL_VERIFY_TTL_HOURS = Number(process.env.EMAIL_VERIFY_TTL_HOURS || 24);
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const newJti = () => crypto.randomUUID();

function signAccess(userId) {
  return jwt.sign({}, accessTokenSecret, {
    subject: userId,
    expiresIn: accessTokenExpiresIn,
    issuer,
    audience
  });
}

function signRefresh(userId, jti) {
  return jwt.sign({ jti }, refreshTokenSecret, {
    subject: userId,
    expiresIn: refreshTokenExpiresIn,
    issuer,
    audience
  });
}

async function persistRefresh(userId, jti) {
  const expiresAt = new Date(Date.now() + refreshTokenSeconds * 1000);
  await RefreshToken.create({ user: userId, jti, expiresAt });
}

async function revokeAllUserRefreshTokens(userId) {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

// token utilities for email verification & password reset
function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}
function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
function hours(n) {
  return n * 60 * 60 * 1000;
}
function minutes(n) {
  return n * 60 * 1000;
}

// always keep a single active token per user for a given model
async function upsertSingleUseToken(Model, userId, ttlMs) {
  await Model.deleteMany({ user: userId, usedAt: null });
  const token = randomToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + ttlMs);
  await Model.create({ user: userId, tokenHash, expiresAt });
  return token; // plaintext to email to user
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