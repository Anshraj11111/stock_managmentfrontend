import { createContext, useContext, useState, useEffect } from 'react'

const PWAContext = createContext(null)

export function PWAProvider({ children }) {
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      console.log('beforeinstallprompt event fired')
      setInstallPromptEvent(e)
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('App installed successfully')
      setIsInstalled(true)
      setInstallPromptEvent(null)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('Network status: online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('Network status: offline')
      setIsOnline(false)
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode')
      setIsInstalled(true)
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
