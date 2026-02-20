import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-update enabled, this won't be called
    console.log('New content available, updating...')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  onRegistered(registration) {
    console.log('Service Worker registered:', registration)
  },
  onRegisterError(error) {
    console.error('Service Worker registration failed:', error)
  }
})

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>,
)
