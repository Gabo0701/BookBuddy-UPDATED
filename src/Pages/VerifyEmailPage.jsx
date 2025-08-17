import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';

export default function VerifyEmailPage() {
  const [search] = useSearchParams();
  const [status, setStatus] = useState('Verifying…');
  useEffect(() => {
    const token = search.get('token');
    if (!token) { setStatus('Missing token'); return; }
    (async () => {
      try {
        const data = await verifyEmail(token);
        setStatus(data.message || data.error || JSON.stringify(data));
      } catch (e) {
        setStatus('Verification failed');
      }
    })();
  }, [search]);
  return <div style={{ padding: 24 }}><h1>Email Verification</h1><p>{status}</p></div>;
}