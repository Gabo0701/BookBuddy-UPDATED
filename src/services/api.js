// src/services/api.js
// Production-safe API layer + Open Library helpers

const API_BASE = import.meta.env.VITE_API_BASE;
export const MOCK_MODE =
  String(import.meta.env.VITE_MOCK_MODE ?? '').toLowerCase() === 'true';

if (!API_BASE && !MOCK_MODE) {
  console.error('VITE_API_BASE is missing. Create a .env at project root and rebuild.');
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.data = data;
  }
}

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  if (MOCK_MODE) return { ok: true, status: 200, data: null };

  const cfg = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, cfg);

  // Try to parse JSON even on errors
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data);
  }

  return { ...res, data };
};

// HTTP methods used by the app
export const api = {
  get: (e, o = {})      => apiFetch(e, { method: 'GET',    ...o }),
  post: (e, b, o = {})  => apiFetch(e, { method: 'POST',   body: JSON.stringify(b), ...o }),
  patch: (e, b, o = {}) => apiFetch(e, { method: 'PATCH',  body: JSON.stringify(b), ...o }),
  put: (e, b, o = {})   => apiFetch(e, { method: 'PUT',    body: JSON.stringify(b), ...o }),
  delete: (e, o = {})   => apiFetch(e, { method: 'DELETE', ...o }),
};

// Open Library helpers (unchanged)
export const openLibraryApi = {
  search: async (q, limit = 10) => {
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`);
      return await res.json();
    } catch (e) { console.error('Open Library search error:', e); return { docs: [] }; }
  },
  getWork: async (id) => {
    try { const res = await fetch(`https://openlibrary.org/works/${id}.json`); return await res.json(); }
    catch (e) { console.error('Open Library work error:', e); return null; }
  },
  getAuthor: async (id) => {
    try { const res = await fetch(`https://openlibrary.org/authors/${id}.json`); return await res.json(); }
    catch (e) { console.error('Open Library author error:', e); return null; }
  },
  getCover: (coverId, size = 'M') => (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null),
};

export { ApiError }; // optional