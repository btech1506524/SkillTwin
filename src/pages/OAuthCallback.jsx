import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const { completeOAuthLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const code = params.get('code');
    window.history.replaceState({}, document.title, '/oauth/callback');
    if (!code) {
      setError('The sign-in link is missing or expired. Please start again.');
      return;
    }
    completeOAuthLogin(code).then(result => {
      if (result.success) navigate('/dashboard', { replace: true });
      else setError(result.message || 'Unable to complete sign-in. Please try again.');
    }).catch(() => setError('Unable to complete sign-in. Please try again.'));
  }, [completeOAuthLogin, navigate]);

  return (
    <main className="oauth-callback-page" aria-live="polite">
      <div className="oauth-callback-card">
        {error ? <>
          <h1>Sign-in could not be completed</h1>
          <p>{error}</p>
          <Link className="oauth-return-link" to="/login">Return to sign in</Link>
        </> : <>
          <div className="oauth-loading-indicator" />
          <h1>Signing you in…</h1>
          <p>Finishing your secure SkillTwin session.</p>
        </>}
      </div>
    </main>
  );
}
