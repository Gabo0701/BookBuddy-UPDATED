// Main BookBuddy Application Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context and Components
import { AuthProvider } from './context/AuthContext.jsx';
import NavBar from './components/NavBar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

// Page Components
import HomePage from './Pages/HomePage.jsx';
import SearchPage from './Pages/SearchPage.jsx';
import LearnMorePage from './Pages/LearnMorePage.jsx';
import SignInPage from './Pages/SignInPage.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import LibraryPage from './Pages/LibraryPage.jsx';
import UserPage from './Pages/UserPage.jsx';

// Authentication Pages
import VerifyEmailPage from './Pages/VerifyEmailPage';
import RequestPasswordResetPage from './Pages/RequestPasswordResetPage';
import ForgotEmailPage from './Pages/ForgotEmailPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import LoginVerificationPage from './Pages/LoginVerificationPage';

/**
 * Main App component that sets up routing and authentication context
 * Provides navigation structure and route protection for the entire application
 */
export default function App() {
  return (
    // Authentication context provider for user state management
    <AuthProvider>
      <Router>
        {/* Navigation bar displayed on all pages */}
        <NavBar />

        {/* Application routes configuration */}
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/learn-more" element={<LearnMorePage />} />
          
          {/* Authentication routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/login-verification" element={<LoginVerificationPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          {/* Password reset routes */}
          <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
          <Route path="/forgot-email" element={<ForgotEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/library"
            element={
              <PrivateRoute>
                <LibraryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/me"
            element={
              <PrivateRoute>
                <UserPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}