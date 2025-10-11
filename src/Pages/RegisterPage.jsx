// src/services/api/api.js
const API_BASE = import.meta.env.VITE_API_BASE;
const MOCK_MODE = String(import.meta.env.VITE_MOCK_MODE).toLowerCase() === 'true';
import React, { useState } from 'react';
import { register } from '../api/auth';


if (!API_BASE) {
  console.error('VITE_API_BASE is missing. Create .env at project root and rebuild.');
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.data = data;
  }
}

const getAuthToken = () => localStorage.getItem('accessToken');

const apiFetch = async (endpoint, options = {}) => {
  if (MOCK_MODE) return { ok: true, status: 200, data: null };

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
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data);
    return { ...res, data };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error', 0, err);
  }
};

export const api = {
  get:    (e, o = {}) => apiFetch(e, { method: 'GET',  ...o }),
  post:   (e, b, o={}) => apiFetch(e, { method: 'POST', body: JSON.stringify(b), ...o }),
  patch:  (e, b, o={}) => apiFetch(e, { method: 'PATCH', body: JSON.stringify(b), ...o }),
  put:    (e, b, o={}) => apiFetch(e, { method: 'PUT',   body: JSON.stringify(b), ...o }),
  delete: (e, o = {}) => apiFetch(e, { method: 'DELETE', ...o }),
};

export const wakeServer = () => apiFetch('/health').catch(() => {});

export default function RegisterPage() {         
  
}