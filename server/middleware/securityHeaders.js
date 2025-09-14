// Security Headers Middleware using Helmet
// Configures various HTTP security headers to protect against common vulnerabilities

import helmet from 'helmet';

/**
 * Configures security headers using Helmet middleware
 * Applies different security policies based on environment (development vs production)
 */
export default function securityHeaders() {
  const isProd = process.env.NODE_ENV === 'production';

  return helmet({
    // Content Security Policy (CSP) - prevents XSS attacks
    contentSecurityPolicy: {
      useDefaults: true, // Use Helmet's secure defaults
      directives: {
        "default-src": ["'self'"],                    // Only allow resources from same origin
        "script-src": ["'self'"],                     // Only allow scripts from same origin
        "style-src":  ["'self'", "'unsafe-inline'"],  // Allow inline styles (needed for React/Vite)
        "img-src":    ["'self'", "data:"],            // Allow images from same origin and data URLs
        "connect-src":["'self'", process.env.CLIENT_URL], // Allow API connections
        "frame-ancestors": ["'none'"]                 // Prevent embedding in frames
      }
    },
    
    // Privacy and security policies
    referrerPolicy: { policy: 'no-referrer' },        // Don't send referrer information
    frameguard: { action: 'deny' },                   // Prevent clickjacking attacks
    crossOriginResourcePolicy: { policy: 'same-origin' }, // Restrict cross-origin resource access
    crossOriginOpenerPolicy: { policy: 'same-origin' },   // Prevent cross-origin window access
    
    // HTTP Strict Transport Security (HSTS) - enforce HTTPS
    // Only enable in production with HTTPS
    hsts: isProd ? { 
      maxAge: 15552000,        // 180 days in seconds
      includeSubDomains: true, // Apply to all subdomains
      preload: true           // Allow inclusion in browser preload lists
    } : false,
    
    // Additional security headers
    noSniff: true,    // Prevent MIME type sniffing
    xssFilter: true   // Enable XSS filtering in older browsers
  });
}