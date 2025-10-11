// src/Pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { register } from '../api/auth.js';
import './RegisterPage.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Password strength validation
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^\w\s]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#00cc44'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!username.trim() || !email.trim() || !password) {
      setErr('Please fill in all fields');
      return;
    }

    if (passwordStrength < 3) {
      setErr('Password must be stronger (at least 8 characters with uppercase, lowercase, and numbers)');
      return;
    }

    try {
      setSubmitting(true);
      setErr('');
      
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password
      });

      // Registration successful - redirect to verify email page
      navigate('/verify-email', { 
        state: { 
          email: email.trim(),
          message: result.message || 'Registration successful! Please check your email to verify your account.'
        }
      });
    } catch (error) {
      setErr(error.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={onSubmit} noValidate>
        <h2>Create Account</h2>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          placeholder="Choose a username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {password && (
          <>
            <div className="strength-bar-wrapper">
              <div 
                className="strength-bar"
                style={{
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: strengthColors[passwordStrength - 1] || '#ddd'
                }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px', color: strengthColors[passwordStrength - 1] || '#666' }}>
              Strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
            </div>
            <ul className="password-checklist">
              <li className={password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
              <li className={/[A-Z]/.test(password) ? 'valid' : ''}>Uppercase letter</li>
              <li className={/[a-z]/.test(password) ? 'valid' : ''}>Lowercase letter</li>
              <li className={/\d/.test(password) ? 'valid' : ''}>Number</li>
              <li className={/[^\w\s]/.test(password) ? 'valid' : ''}>Special character</li>
            </ul>
          </>
        )}

        {err && <div className="error">{err}</div>}

        <button className="register-btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="muted-links" style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span>Already have an account? <Link to="/signin">Sign In</Link></span>
        </div>
      </form>
    </div>
  );
}