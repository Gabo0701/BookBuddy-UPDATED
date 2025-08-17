import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { resetPassword } from '../api/auth';
import './ResetPasswordPage.css';

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

export default function ResetPasswordPage() {
  const [search] = useSearchParams();
  const token = search.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [strength, setStrength] = useState({ percent: 0, color: '#e74c3c' });
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setStrength(calculateStrength(value));
  };

  const reqStatus = passwordRequirements.map((r) => ({
    ...r,
    ok: r.test(password)
  }));
  const confirmOk = password && password === confirmPassword;
  const isFormValid = reqStatus.every((r) => r.ok) && confirmOk;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !isFormValid) return;
    setSubmitting(true);
    setMsg('');
    try {
      if (!token) throw new Error('Missing token');
      const data = await resetPassword(token, password);
      setMsg(data.message || data.error || 'Password updated. You may sign in now.');
    } catch (e) {
      setMsg(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rp-container">
      <form className="rp-form" onSubmit={onSubmit} noValidate>
        <h2>Set a new password</h2>
        <p className="rp-subtitle">Choose a strong password you haven't used before.</p>

        <label htmlFor="password">New password</label>
        <div className="rp-password">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={handlePasswordChange}
          />
          <span
            className="rp-toggle"
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="rp-password">
          <input
            id="confirmPassword"
            type={showConfirmPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="rp-toggle"
            onClick={() => setShowConfirmPw(v => !v)}
            aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
          >
            {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="rp-strength-bar-wrapper">
          <div
            className="rp-strength-bar"
            style={{
              width: `${strength.percent}%`,
              backgroundColor: strength.color
            }}
          />
        </div>

        <ul className="rp-password-checklist">
          {reqStatus.map((r, i) => (
            <li key={i} className={r.ok ? 'valid' : ''}>
              {r.label}
            </li>
          ))}
          <li className={confirmOk ? 'valid' : ''}>
            Passwords match
          </li>
        </ul>

        {msg && <div className="rp-msg">{msg}</div>}

        <button className="rp-btn" type="submit" disabled={submitting || !isFormValid}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>

        <div className="rp-links">
          <Link to="/signin">Back to sign in</Link>
        </div>
      </form>
    </div>
  );
}