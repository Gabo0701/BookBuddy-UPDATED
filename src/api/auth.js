// Uses Vite env for the API host (or falls back to same-origin + Vite proxy)
const API  = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API}/api/v1/auth`;

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });

  // Read text first so we can throw a helpful error if HTML came back
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; }
  catch {
    throw new Error(`Expected JSON, got: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

// ---- Auth API ----
export function register({username, email, password}) {
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
  // Clear user-specific localStorage data
  localStorage.removeItem('savedBooks');
  localStorage.removeItem('favoriteBooks');
  localStorage.removeItem('readingLog');
  return request('/logout', { method: 'POST', headers });
}

export function refresh() {
  return request('/refresh-token', { method: 'POST' });
}

// ---- Email verification ----
export function requestEmailVerification(accessToken) {
  return request('/request-email-verification', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function verifyEmail(token) {
  return request(`/verify-email?token=${encodeURIComponent(token)}`, { method: 'GET' });
}

// ---- Password reset ----
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