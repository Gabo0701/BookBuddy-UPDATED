// src/Pages/SignInPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login, requestEmailVerification } from '../api/auth.js';
import { AuthContext } from '../context/AuthContext.jsx';
import './SignInPage.css';

export default function SignInPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { setUser, accessToken, setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    
    if (!emailOrUsername.trim() || !password) {
      setErr('Please fill in all fields');
      return;
    }

    // Navigate to verification page
    navigate('/login-verification', { 
      state: { emailOrUsername: emailOrUsername.trim() } 
    });
  }

  async function onResendVerification() {
    try {
      setSending(true);
      if (!accessToken) { setErr('Please sign in after registering to resend verification.'); return; }
      const out = await requestEmailVerification(accessToken);
      setErr(out.message || out.error || 'Verification link sent. Check your email (or console in dev).');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={onSubmit} noValidate>
        <h2>Sign In</h2>

        <label htmlFor="emailOrUsername">Email or Username</label>
        <input
          id="emailOrUsername" 
          type="text" 
          autoComplete="username" 
          required
          placeholder="Enter your email or username"
          value={emailOrUsername} 
          onChange={e => setEmailOrUsername(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            title={showPw ? 'Hide' : 'Show'}
          >
            {showPw ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {err && <div className="error">{err}</div>}

        <button className="signin-btn" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        {needsVerify && (
          <div className="verify-cta">
            <p>Please verify your email.</p>
            <button
              type="button"
              className="signin-btn outline"
              onClick={onResendVerification}
              disabled={sending}
            >
              {sending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        )}

        <div className="muted-links">
          <span>Forgot your password? <Link to="/forgot-password">Reset it</Link></span>
          <span>Forgot your email? <Link to="/forgot-email">Find it</Link></span>
          <span>Don’t have an account? <Link to="/register">Register</Link></span>
        </div>
      </form>
    </div>
  );
}