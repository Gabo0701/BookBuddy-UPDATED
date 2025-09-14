import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import './RegisterPage.css';

const passwordRequirements = [
  { label: 'At least 8 characters',           test: (pwd) => pwd.length >= 8 },
  { label: 'One uppercase letter (A–Z)',      test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'One lowercase letter (a–z)',      test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'One number (0–9)',                test: (pwd) => /\d/.test(pwd) },
  { label: 'One special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*]/.test(pwd) },
];

function calculateStrength(pwd) {
  let score = 0;
  passwordRequirements.forEach(({ test }) => test(pwd) && score++);
  const percent = (score / passwordRequirements.length) * 100;
  let color = '#e74c3c';
  if (percent > 40 && percent < 80) color = '#f1c40f';
  if (percent >= 80) color = '#2ecc71';
  return { percent, color };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState({ percent: 0, color: '#e74c3c' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((d) => ({ ...d, [name]: value }));
    if (name === 'password') setStrength(calculateStrength(value));
    if (errors.api) setErrors((e) => ({ ...e, api: '' }));
  };

  const reqStatus = passwordRequirements.map((r) => ({
    ...r,
    ok: r.test(data.password)
  }));
  const confirmOk = data.password && data.password === data.confirmPassword;
  const usernameValid = data.username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(data.username);
  const isFormValid =
    data.username.trim() &&
    usernameValid &&
    data.email.trim() &&
    reqStatus.every((r) => r.ok) &&
    confirmOk;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!data.username.trim())         newErrors.username       = 'Username is required';
    if (!usernameValid)                newErrors.username       = 'Username must be 3-20 characters, letters/numbers/underscores only';
    if (!data.email.includes('@'))     newErrors.email          = 'Valid email required';
    if (!reqStatus.every((r) => r.ok)) newErrors.password       = 'Password too weak';
    if (!confirmOk)                    newErrors.confirmPassword = 'Passwords must match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      await register({
        username: data.username,
        email:    data.email,
        password: data.password
      });
      // Navigate to verification page with email
      navigate('/login-verification', { 
        state: { emailOrUsername: data.email } 
      });
    } catch (err) {
      setErrors({ api: err.message });
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <Link to="/" className="home-button">← Home</Link>
        <h2>Create an Account</h2>
        {errors.api && <p className="error">{errors.api}</p>}

        <label>Username</label>
        <input
          name="username"
          type="text"
          value={data.username}
          onChange={handleChange}
          placeholder="Enter username (3-20 characters)"
        />
        {errors.username && <p className="error">{errors.username}</p>}

        <label>Email</label>
        <input
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Password</label>
        <div className="password-wrapper">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={handleChange}
          />
          <span
            className="toggle-visibility"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}

        <label style={{ marginTop: '0.8rem' }}>Confirm Password</label>
        <div className="password-wrapper">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={data.confirmPassword}
            onChange={handleChange}
          />
          <span
            className="toggle-visibility"
            onClick={() => setShowConfirmPassword((v) => !v)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

        <div className="strength-bar-wrapper">
          <div
            className="strength-bar"
            style={{
              width:          `${strength.percent}%`,
              backgroundColor: strength.color
            }}
          />
        </div>

        <ul className="password-checklist">
          {reqStatus.map((r, i) => (
            <li key={i} className={r.ok ? 'valid' : ''}>
              {r.label}
            </li>
          ))}
          <li className={confirmOk ? 'valid' : ''}>
            Passwords match
          </li>
        </ul>

        <button
          type="submit"
          className="register-btn"
          disabled={!isFormValid}
        >
          Register
        </button>
      </form>
    </div>
);
}