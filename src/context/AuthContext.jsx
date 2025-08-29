import React, { createContext, useState, useEffect } from 'react';
import { whoAmI } from '../api/auth';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  accessToken: null,
  setAccessToken: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken');
  });

  // Store token in localStorage when it changes
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      whoAmI(accessToken)
        .then(async (data) => {
          setUser(data.user);
          // Load user's books from MongoDB and sync to localStorage
          try {
            const response = await fetch('/api/v1/library/books', {
              credentials: 'include',
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
              const books = await response.json();
              const savedBooks = books.filter(book => !book.isFavorite);
              const favoriteBooks = books.filter(book => book.isFavorite);
              localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
              localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
            }
          } catch (error) {
            console.error('Failed to load user books:', error);
          }
        })
        .catch(() => {
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem('accessToken');
          // Clear user-specific data on auth failure
          localStorage.removeItem('savedBooks');
          localStorage.removeItem('favoriteBooks');
          localStorage.removeItem('readingLog');
        });
    } else {
      localStorage.removeItem('accessToken');
      // Clear user-specific data when no token
      localStorage.removeItem('savedBooks');
      localStorage.removeItem('favoriteBooks');
      localStorage.removeItem('readingLog');
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}