import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import { AuthContext } from '../context/AuthContext.jsx';
import './NavBar.css';

export default function NavBar() {
  const { user, setUser, accessToken, setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(accessToken);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setAccessToken(null);
    navigate('/signin');
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        BookBuddy
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/me">My Library</Link>
      </div>

      <div className="nav-actions">
        <input
          type="text"
          placeholder="Search books..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate(`/search?q=${e.target.value}`);
          }}
        />

        {user ? (
          <button
            onClick={handleLogout}
            className="signout-btn nav-btn"
          >
            Sign Out
          </button>
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="login-btn nav-btn"
            >
              Log in
            </button>
            <button
              onClick={handleGetStarted}
              className="get-started-btn nav-btn"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}