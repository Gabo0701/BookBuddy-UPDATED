import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestEmailReminder } from '../api/auth';
import './ForgotEmailPage.css';

export default function ForgotEmailPage() {
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMsg('');
    try {
      const data = await requestEmailReminder(username.trim());
      setMsg(data.message || 'If that username exists, the associated email has been sent to you.');
    } catch (e) {
      setMsg(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fe-container">
      <form className="fe-form" onSubmit={onSubmit} noValidate>
        <h2>Forgot your email?</h2>
        <p className="fe-subtitle">
          Enter your username and we'll send your email address to the associated email.
        </p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {msg && <div className="fe-msg">{msg}</div>}

        <button className="fe-btn" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send email address'}
        </button>

        <div className="fe-links">
          <Link to="/signin">Back to sign in</Link>
        </div>
      </form>
    </div>
  );
}