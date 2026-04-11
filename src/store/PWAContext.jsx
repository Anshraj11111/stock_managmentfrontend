import { createContext, useContext, useState, useEffect } from 'react'

const PWAContext = createContext(null)

export function PWAProvider({ children }) {
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log('🔧 PWAContext: Initializing...')
    
    let promptCaptured = false
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      console.log('✅ PWAContext: beforeinstallprompt event fired!')
      setInstallPromptEvent(e)
      promptCaptured = true
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('✅ PWAContext: App installed successfully')
      setIsInstalled(true)
      setInstallPromptEvent(null)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🌐 PWAContext: Network status - online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('📴 PWAContext: Network status - offline')
      setIsOnline(false)
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = window.navigator.standalone === true
    
    if (isStandalone || isIOSStandalone) {
      console.log('ℹ️ PWAContext: App is running in standalone mode (already installed)')
      setIsInstalled(true)
    } else {
      console.log('ℹ️ PWAContext: App is NOT installed yet')
      
      // Force check after 3 seconds if event hasn't fired
      setTimeout(() => {
        if (!promptCaptured && !isStandalone && !isIOSStandalone) {
          console.warn('⚠️ PWAContext: beforeinstallprompt event did not fire after 3 seconds')
          console.log('💡 PWAContext: This is normal in some cases. User can still install from browser menu.')
        }
      }, 3000)
    }

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('✅ PWAContext: Service Worker is ready', registration)
      }).catch((error) => {
        console.error('❌ PWAContext: Service Worker error', error)
      })
    } else {
      console.warn('⚠️ PWAContext: Service Worker not supported')
    }

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPromptEvent) {
      console.warn('Install prompt event not available')
      return
    }

    try {
      // Show the install prompt
      await installPromptEvent.prompt()

      // Wait for the user's response
      const { outcome } = await installPromptEvent.userChoice
      console.log(`User response to install prompt: ${outcome}`)

      if (outcome === 'accepted') {
        // Clear the install prompt event
        setInstallPromptEvent(null)
      }
    } catch (error) {
      console.error('Error during installation:', error)
      throw error
    }
  }

  const dismissInstallPrompt = () => {
    console.log('Install prompt dismissed')
    setInstallPromptEvent(null)
  }

  const value = {
    installPromptEvent,
    isInstallable: !!installPromptEvent && !isInstalled,
    isOnline,
    isInstalled,
    handleInstall,
    dismissInstallPrompt
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider')
  }
  return context
}
