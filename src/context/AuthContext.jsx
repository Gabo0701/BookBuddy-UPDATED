// Authentication Context Provider
// Manages user authentication state and token persistence across the application

import React, { createContext, useState, useEffect } from 'react';
import { whoAmI } from '../api/auth';

// Create authentication context with default values
export const AuthContext = createContext({
  user: null,                    // Current authenticated user data
  setUser: () => {},            // Function to update user state
  accessToken: null,            // JWT access token for API requests
  setAccessToken: () => {},     // Function to update access token
  login: () => {}               // Function to handle user login
});

/**
 * Authentication Provider Component
 * Provides authentication state and methods to child components
 * Handles token persistence and automatic user data loading
 */
export function AuthProvider({ children }) {
  // User state - stores current authenticated user information
  const [user, setUser] = useState(null);
  
  // Access token state - initialized from localStorage for persistence
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken');
  });

  // Effect to handle token changes and user data loading
  useEffect(() => {
    if (accessToken) {
      // Store token in localStorage for persistence across sessions
      localStorage.setItem('accessToken', accessToken);
      
      // Fetch user data using the access token
      whoAmI(accessToken)
        .then(async (data) => {
          setUser(data.user);
          
          // Load user's books from MongoDB and sync to localStorage
          // This ensures offline access to user's book library
          try {
            const response = await fetch('/api/v1/library/books', {
              credentials: 'include',
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (response.ok) {
              const books = await response.json();
              // Separate books into saved and favorite categories
              const savedBooks = books.filter(book => !book.isFavorite);
              const favoriteBooks = books.filter(book => book.isFavorite);
              
              // Store in localStorage for offline access
              localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
              localStorage.setItem('favoriteBooks', JSON.stringify(favoriteBooks));
            }
          } catch (error) {
            console.error('Failed to load user books:', error);
          }
        })
        .catch(() => {
          // Handle authentication failure - clear all user data
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem('accessToken');
          
          // Clear user-specific data on auth failure
          localStorage.removeItem('savedBooks');
          localStorage.removeItem('favoriteBooks');
          localStorage.removeItem('readingLog');
        });
    } else {
      // No token - clear all stored data
      localStorage.removeItem('accessToken');
      
      // Clear user-specific data when no token
      localStorage.removeItem('savedBooks');
      localStorage.removeItem('favoriteBooks');
      localStorage.removeItem('readingLog');
    }
  }, [accessToken]);

  /**
   * Login function to handle authentication data
   * @param {Object} authData - Authentication data containing access token
   */
  const login = (authData) => {
    if (authData.accessToken) {
      setAccessToken(authData.accessToken);
    }
  };

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, login }}>
      {children}
    </AuthContext.Provider>
  );
}