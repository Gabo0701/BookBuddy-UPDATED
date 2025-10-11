// src/api/auth.js
// Authentication API Client

// Read base from env (supports both names)
const API_BASE = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
if (!API_BASE) console.error('Missing VITE_API_BASE. Create a root .env and rebuild.');

// Final base for all auth routes
// If API_BASE = .../api        -> BASE = .../api/auth
// If API_BASE = .../api/v1     -> BASE = .../api/v1/auth
const BASE = `${API_BASE}/auth`;

// Generic request helper
async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // keep if you set cookies on the API; otherwise safe
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {
    throw new Error(`Expected JSON, got: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

// ---- Auth functions ----
export function register({ username, email, password }) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function login({ emailOrUsername, password }) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ emailOrUsername, password }),
  });
}

export function whoAmI(accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  return request('/me', { headers });
}

export function logout(accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  localStorage.removeItem('savedBooks');
  localStorage.removeItem('favoriteBooks');
  localStorage.removeItem('readingLog');
  return request('/logout', { method: 'POST', headers });
}

export function refresh() {
  return request('/refresh-token', { method: 'POST' });
}

export function requestEmailVerification(accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  return request('/request-email-verification', { method: 'POST', headers });
}

export function verifyEmail(token) {
  return request(`/verify-email?token=${encodeURIComponent(token)}`, { method: 'GET' });
}

export function requestPasswordReset(email) {
  return request('/request-password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, password) {
  return request('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export function requestEmailReminder(username) {
  return request('/request-email-reminder', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function sendLoginVerification(email) {
  return request('/send-login-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyLoginCode(email, code) {
  return request('/verify-login-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export function requestAccountDeletion(reason, accessToken) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  return request('/delete-request', {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
}