// Authentication API Client
// Handles all authentication-related API requests to the backend

// API configuration - uses Vite environment variable or falls back to proxy
const API  = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API}/api/v1/auth`;

/**
 * Generic request function for authentication API calls
 * Handles JSON parsing, error handling, and credential inclusion
 * 
 * @param {string} path - API endpoint path
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (default: 'GET')
 * @param {Object} options.headers - Additional headers
 * @param {string} options.body - Request body (JSON string)
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} On HTTP errors or invalid JSON
 */
async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',                                    // Include cookies for refresh tokens
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });

  // Read response as text first to handle non-JSON responses gracefully
  const text = await res.text();
  let data = null;
  
  try { 
    data = text ? JSON.parse(text) : null; 
  } catch {
    // Throw helpful error if server returned HTML instead of JSON
    throw new Error(`Expected JSON, got: ${text.slice(0, 200)}`);
  }

  // Handle HTTP error responses
  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg);
  }
  
  return data;
}

// ---- Core Authentication API Functions ----

/**
 * Register a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Unique username
 * @param {string} userData.email - User email address
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Registration response with access token
 */
export function register({username, email, password}) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * Authenticate user login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.emailOrUsername - Email or username
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with access token
 */
export function login({ emailOrUsername, password }) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrUsername, password }),
  });
}

/**
 * Get current authenticated user information
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} User profile data
 */
export function whoAmI(accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  return request('/me', { headers });
}

/**
 * Logout current user and clear local data
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} Logout confirmation
 */
export function logout(accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  
  // Clear user-specific localStorage data on logout
  localStorage.removeItem('savedBooks');
  localStorage.removeItem('favoriteBooks');
  localStorage.removeItem('readingLog');
  
  return request('/logout', { method: 'POST', headers });
}

/**
 * Refresh access token using refresh token cookie
 * @returns {Promise<Object>} New access token
 */
export function refresh() {
  return request('/refresh-token', { method: 'POST' });
}

// ---- Email Verification API Functions ----

/**
 * Request email verification for current user
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} Verification request confirmation
 */
export function requestEmailVerification(accessToken) {
  return request('/request-email-verification', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * Verify email address using token from email
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Verification confirmation
 */
export function verifyEmail(token) {
  return request(`/verify-email?token=${encodeURIComponent(token)}`, { method: 'GET' });
}

// ---- Password Reset API Functions ----

/**
 * Request password reset email
 * @param {string} email - User email address
 * @returns {Promise<Object>} Reset request confirmation
 */
export function requestPasswordReset(email) {
  return request('/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using token from email
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} Password reset confirmation
 */
export function resetPassword(token, password) {
  return request('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/**
 * Request email reminder for forgotten email
 * @param {string} username - Username to look up email for
 * @returns {Promise<Object>} Email reminder confirmation
 */
export function requestEmailReminder(username) {
  return request('/request-email-reminder', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

// ---- Login Verification API Functions ----

/**
 * Send login verification code to user's email
 * @param {string} email - Email or username to send code to
 * @returns {Promise<Object>} Verification code send confirmation
 */
export function sendLoginVerification(email) {
  return request('/send-login-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Verify login using email verification code
 * @param {string} email - Email or username
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Login response with access token
 */
export function verifyLoginCode(email, code) {
  return request('/verify-login-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

/**
 * Request account deletion
 * @param {string} reason - Reason for account deletion
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} Deletion request confirmation
 */
export function requestAccountDeletion(reason, accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  return request('/delete-request', {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
}