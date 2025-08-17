// src/api/books.js

const API_BASE = import.meta.env.VITE_API_URL || '';
const BOOKS_ENDPOINT = `${API_BASE}/api/books`;

export async function saveBook({ title, author }) {
  const res = await fetch(BOOKS_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export async function getMyBooks() {
  const res = await fetch(BOOKS_ENDPOINT, { credentials: 'include' });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function deleteBook(id) {
  const res = await fetch(`${BOOKS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}