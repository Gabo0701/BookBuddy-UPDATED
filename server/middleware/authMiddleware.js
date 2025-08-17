import jwt from 'jsonwebtoken';
import { accessTokenSecret, issuer, audience } from '../config/jwt.js';

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken; // optional fallback
  }

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  try {
    const payload = jwt.verify(token, accessTokenSecret, { issuer, audience });
    req.user = { id: payload.sub || payload.id || payload.userId };
    return next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    return res.status(403).json({ error: 'Invalid token' });
  }
}