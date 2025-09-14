// Private Route Component
// Protects routes that require user authentication
// Redirects unauthenticated users to the sign-in page

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Private Route wrapper component
 * Renders children only if user is authenticated, otherwise redirects to sign-in
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} Either the children or a redirect to sign-in
 */
export default function PrivateRoute({ children }) {
  // Get current user from authentication context
  const { user } = useContext(AuthContext);
  
  // Render children if user is authenticated, otherwise redirect to sign-in page
  return user ? children : <Navigate to="/signin" />;
}