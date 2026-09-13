import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx';

if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  } else {
    document.documentElement.dataset.theme = 'light';
  }
}

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  let response = await originalFetch(...args);

  if (
    (response.status === 401 || response.status === 403) &&
    localStorage.getItem('refreshToken')
  ) {
    try {
      const refreshRes = await originalFetch(
        (import.meta.env.VITE_API_URL) + '/auth/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: localStorage.getItem('refreshToken'),
          }),
        }
      );

      if (refreshRes.ok) {
        const data = await refreshRes.json();

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        let [resource, config] = args;

        if (config && config.headers) {
          const headers = new Headers(config.headers);

          if (headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${data.accessToken}`);
            config.headers = Object.fromEntries(headers.entries());
          }
        }

        return originalFetch(resource, config);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } catch (e) {
      console.error('Refresh token error', e);
    }
  }

  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);