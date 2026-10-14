import { useState } from 'react';
import { apiService } from '../services/api';

const providers = [
  { id: 'google', label: 'Google', icon: <span className="oauth-google-mark" aria-hidden="true">G</span> },
  { id: 'microsoft', label: 'Microsoft', icon: <span className="oauth-microsoft-mark" aria-hidden="true"><i /><i /><i /><i /></span> }
];

const oauthErrorMessages = {
  provider_not_configured: 'This provider is not configured on the server yet.',
  oauth_unavailable: 'Sign-in is temporarily unavailable. Please try again.',
  provider_already_linked: 'That provider is connected to another SkillTwin account.',
  reauthentication_required: 'For account security, sign out and sign in again before connecting another provider.'
};

export default function OAuthButtons({ mode = 'start' }) {
  const [loadingProvider, setLoadingProvider] = useState('');
  const [error, setError] = useState('');

  const begin = async (provider) => {
    setError('');
    setLoadingProvider(provider);
    const result = await apiService.beginOAuth(provider, mode === 'link');
    if (result?.success && result.authorizationUrl) {
      window.location.assign(result.authorizationUrl);
      return;
    }
    setError(result?.message || oauthErrorMessages[result?.code] || 'Unable to start secure sign-in. Please try again.');
    setLoadingProvider('');
  };

  return (
    <div className={`oauth-options ${mode === 'link' ? 'oauth-options-link' : ''}`}>
      {mode === 'start' && <div className="auth-divider"><span>or continue with</span></div>}
      {mode === 'link' && <p className="oauth-link-description">Sign in again, then connect a provider to this account.</p>}
      <div className="oauth-button-row">
        {providers.map(provider => (
          <button
            className="oauth-provider-button"
            key={provider.id}
            type="button"
            onClick={() => begin(provider.id)}
            disabled={Boolean(loadingProvider)}
            aria-label={`${mode === 'link' ? 'Connect' : 'Continue with'} ${provider.label}`}
          >
            {provider.icon}
            <span>{loadingProvider === provider.id ? 'Opening…' : `${mode === 'link' ? 'Connect' : 'Continue with'} ${provider.label}`}</span>
          </button>
        ))}
      </div>
      {error && <p className="oauth-error" role="alert">{error}</p>}
    </div>
  );
}
