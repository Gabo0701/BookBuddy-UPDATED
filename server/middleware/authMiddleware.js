// JWT Authentication Middleware
// Validates access tokens and extracts user information for protected routes

import jwt from 'jsonwebtoken';
import { accessTokenSecret, issuer, audience } from '../config/jwt.js';

/**
 * Middleware to authenticate JWT access tokens
 * Supports both Authorization header (Bearer token) and cookie-based authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default function authenticateToken(req, res, next) {
  // Check for token in Authorization header (preferred method)
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token;

  // Extract token from Bearer authorization header
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // Fallback to cookie-based authentication
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // Return 401 if no token is provided
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  try {
    // Verify token with secret and validate issuer/audience claims
    const payload = jwt.verify(token, accessTokenSecret, { issuer, audience });
    
    // Extract user ID from token payload (supports multiple field names for compatibility)
    req.user = { id: payload.sub || payload.id || payload.userId };
    
    // Continue to next middleware
    return next();
  } catch (e) {
    // Handle specific JWT errors with appropriate responses
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}