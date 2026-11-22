import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import './i18n/config'

// Loading component for i18n
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0f172a',
    color: '#fff',
    fontSize: '18px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    Loading...
  </div>
)

// Get Google Client ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google login will not work.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
