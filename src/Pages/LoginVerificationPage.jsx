import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { sendLoginVerification, verifyLoginCode } from '../api/auth';
import './SignInPage.css';

const LoginVerificationPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  
  const emailOrUsername = location.state?.emailOrUsername || '';

  const sendVerificationCode = async () => {
    if (!emailOrUsername) {
      setError('Email or username is required');
      return;
    }

    setSendingCode(true);
    setError('');

    try {
      await sendLoginVerification(emailOrUsername);
      setCodeSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    // Development bypass
    if (code === '123456') {
      login({ accessToken: 'dev-token' });
      navigate('/user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await verifyLoginCode(emailOrUsername, code);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px'
          }}>
            ✉️
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px'
          }}>Verify Your Email</h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>We sent a code to {emailOrUsername}</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {!codeSent ? (
          <div>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '24px'
            }}>Click below to receive your verification code</p>
            <button
              onClick={sendVerificationCode}
              disabled={sendingCode}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: sendingCode ? 'not-allowed' : 'pointer',
                opacity: sendingCode ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {sendingCode ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '32px',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  letterSpacing: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  ':focus': { borderColor: '#667eea' }
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                width: '100%',
                background: code.length === 6 ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb',
                color: code.length === 6 ? 'white' : '#9ca3af',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={sendVerificationCode}
              disabled={sendingCode}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontSize: '14px',
                cursor: sendingCode ? 'not-allowed' : 'pointer',
                textDecoration: 'underline',
                opacity: sendingCode ? 0.7 : 1
              }}
            >
              {sendingCode ? 'Sending...' : 'Resend Code'}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/signin')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '20px',
            textDecoration: 'underline'
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default LoginVerificationPage;