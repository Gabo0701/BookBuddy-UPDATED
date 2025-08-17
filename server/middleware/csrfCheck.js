export default function csrfCheck(req, res, next) {
  const client = process.env.CLIENT_URL;
  const origin  = req.get('origin');
  const referer = req.get('referer');

  // Allow non-browser clients (no Origin/Referer)
  if (!origin && !referer) return next();

  const okOrigin  = origin  && origin === client;
  const okReferer = referer && referer.startsWith(client);
  if (okOrigin || okReferer) return next();

  return res.status(403).json({ error: 'CSRF blocked' });
}