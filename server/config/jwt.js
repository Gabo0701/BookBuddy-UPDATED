export const accessTokenSecret   = process.env.JWT_ACCESS_SECRET;
export const refreshTokenSecret  = process.env.JWT_REFRESH_SECRET;

// JWT lifetimes
export const accessTokenExpiresIn  = '15m';
export const refreshTokenExpiresIn = '7d';

// numeric seconds (useful for DB TTL)
export const accessTokenSeconds  = 15 * 60;
export const refreshTokenSeconds = 7 * 24 * 60 * 60;

// harden tokens with issuer/audience
export const issuer   = 'bookbuddy-api';
export const audience = 'bookbuddy-client';