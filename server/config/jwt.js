// JWT (JSON Web Token) Configuration
// Defines token secrets, expiration times, and security settings

// JWT signing secrets from environment variables
export const accessTokenSecret   = process.env.JWT_ACCESS_SECRET;  // Secret for access tokens
export const refreshTokenSecret  = process.env.JWT_REFRESH_SECRET; // Secret for refresh tokens

// JWT token expiration times (string format for jsonwebtoken library)
export const accessTokenExpiresIn  = '15m'; // Access tokens expire in 15 minutes
export const refreshTokenExpiresIn = '7d';  // Refresh tokens expire in 7 days

// Token expiration times in seconds (useful for database TTL indexes)
export const accessTokenSeconds  = 15 * 60;        // 900 seconds (15 minutes)
export const refreshTokenSeconds = 7 * 24 * 60 * 60; // 604800 seconds (7 days)

// JWT claims for additional security (issuer and audience validation)
export const issuer   = 'bookbuddy-api';    // Token issuer identifier
export const audience = 'bookbuddy-client'; // Token audience identifier