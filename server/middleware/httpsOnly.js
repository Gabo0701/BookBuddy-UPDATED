export default function httpsOnly(req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return next();
  // if behind proxy/load balancer
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
  return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
}