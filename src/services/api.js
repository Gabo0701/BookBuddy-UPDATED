// API Service Layer for BookBuddy

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  if (MOCK_MODE) {
    // Return mock response in mock mode
    return { ok: true, status: 200, data: null };
  }

  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'API request failed',
        response.status,
        data
      );
    }

    return { ...response, data };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0, error);
  }
};

// HTTP Methods
export const api = {
  get: (endpoint, options = {}) => 
    apiFetch(endpoint, { method: 'GET', ...options }),
  
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),
  
  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),
  
  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    }),
  
  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: 'DELETE', ...options }),
};

// Open Library API helpers
export const openLibraryApi = {
  search: async (query, limit = 10) => {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Open Library search error:', error);
      return { docs: [] };
    }
  },

  getWork: async (workId) => {
    try {
      const response = await fetch(`https://openlibrary.org/works/${workId}.json`);
      return await response.json();
    } catch (error) {
      console.error('Open Library work error:', error);
      return null;
    }
  },

  getAuthor: async (authorId) => {
    try {
      const response = await fetch(`https://openlibrary.org/authors/${authorId}.json`);
      return await response.json();
    } catch (error) {
      console.error('Open Library author error:', error);
      return null;
    }
  },

  getCover: (coverId, size = 'M') => {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  },
};

export { ApiError, MOCK_MODE };