import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import NavBar from './components/NavBar.jsx';
import HomePage from './Pages/HomePage.jsx';
import SearchPage from './Pages/SearchPage.jsx';
import LearnMorePage from './Pages/LearnMorePage.jsx';
import SignInPage from './Pages/SignInPage.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import LibraryPage from './Pages/LibraryPage.jsx';
import UserPage from './Pages/UserPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import VerifyEmailPage from './Pages/VerifyEmailPage';
import RequestPasswordResetPage from './Pages/RequestPasswordResetPage';
import ForgotEmailPage from './Pages/ForgotEmailPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/learn-more" element={<LearnMorePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
          <Route path="/forgot-email" element={<ForgotEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* protected */}
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