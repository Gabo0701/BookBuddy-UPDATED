const BOOKS_ENDPOINT = '/api/v1/library';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function saveBook({ title, author, key, coverId, olid }) {
  const res = await fetch(`${BOOKS_ENDPOINT}/books`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, author, key, coverId, olid }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export async function toggleBookFavorite(key, bookData = null) {
  const res = await fetch(`${BOOKS_ENDPOINT}/books/favorite/${encodeURIComponent(key)}`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: bookData ? JSON.stringify(bookData) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export async function deleteBookByKey(key) {
  const res = await fetch(`${BOOKS_ENDPOINT}/books/key/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}

export async function getMyBooks() {
  const res = await fetch(`${BOOKS_ENDPOINT}/books`, { 
    credentials: 'include',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function deleteBook(id) {
  const res = await fetch(`${BOOKS_ENDPOINT}/books/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return res.json();
}