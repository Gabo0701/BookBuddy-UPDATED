import { useState } from 'react';
import { requestPasswordReset } from '../api/auth';
import './RequestPasswordResetPage.css';

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMsg('');
    try {
      const data = await requestPasswordReset(email.trim());
      setMsg(data.message || data.error || 'If that email exists, a reset link has been sent.');
    } catch {
      setMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fp-container">
      <form className="fp-form" onSubmit={onSubmit} noValidate>
        <h2>Forgot your password?</h2>
        <p className="fp-subtitle">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {msg && <div className="fp-msg">{msg}</div>}

        <button className="fp-btn" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}