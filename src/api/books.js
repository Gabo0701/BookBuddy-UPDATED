// Books API Client
// Handles all book library management API requests

// API endpoint for book library operations
const BOOKS_ENDPOINT = '/api/v1/library';

/**
 * Get authentication headers with access token from localStorage
 * @returns {Object} Headers object with Content-Type and Authorization
 */
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Save a book to user's library
 * @param {Object} bookData - Book information from OpenLibrary
 * @param {string} bookData.title - Book title
 * @param {string} bookData.author - Book author
 * @param {string} bookData.key - OpenLibrary key identifier
 * @param {string} bookData.coverId - OpenLibrary cover ID (optional)
 * @param {string} bookData.olid - OpenLibrary ID (optional)
 * @returns {Promise<Object>} Saved book data
 * @throws {Error} On API errors
 */
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

/**
 * Toggle favorite status of a book
 * @param {string} key - OpenLibrary key identifier
 * @param {Object} bookData - Book data to save if not already in library (optional)
 * @returns {Promise<Object>} Updated book data
 * @throws {Error} On API errors
 */
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

/**
 * Delete a book from user's library by OpenLibrary key
 * @param {string} key - OpenLibrary key identifier
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} On API errors
 */
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

/**
 * Get all books in user's library
 * @returns {Promise<Array>} Array of user's saved books
 * @throws {Error} On API errors
 */
export async function getMyBooks() {
  const res = await fetch(`${BOOKS_ENDPOINT}/books`, { 
    credentials: 'include',
    headers: getAuthHeaders()
  });
  
  if (!res.ok) throw new Error(`Error ${res.status}`);
  
  return res.json();
}

/**
 * Delete a book from user's library by database ID
 * @param {string} id - Database ID of the book
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} On API errors
 */
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