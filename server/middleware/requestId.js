import { randomUUID } from 'crypto';

export default function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = String(id);
  res.setHeader('x-request-id', req.id);
  next();
}