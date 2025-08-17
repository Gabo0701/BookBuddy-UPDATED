import helmet from 'helmet';

export default function securityHeaders() {
  const isProd = process.env.NODE_ENV === 'production';

  return helmet({
    // basic secure defaults
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],      // add your CDNs if any
        "style-src":  ["'self'", "'unsafe-inline'"], // if using inline styles (Vite/React often needs this)
        "img-src":    ["'self'", "data:"],
        "connect-src":["'self'", process.env.CLIENT_URL],
        "frame-ancestors": ["'none'"]
      }
    },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // HSTS only in prod (and only if you serve via HTTPS)
    hsts: isProd ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false,
    noSniff: true,
    xssFilter: true
  });
}