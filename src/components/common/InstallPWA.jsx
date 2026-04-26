import { useState } from 'react'
import { Download } from 'lucide-react'
import { usePWA } from '../../store/PWAContext'
import toast from 'react-hot-toast'

export default function InstallPWA() {
  const { isInstallable, isInstalled, handleInstall } = usePWA()
  const [isLoading, setIsLoading] = useState(false)

  // ✅ Hide button if app is already installed
  if (isInstalled) {
    return null
  }

  // Always show button for better UX
  const onInstallClick = async () => {
    if (!isInstallable) {
      // Show helpful message for non-installable state
      toast.error(
        'App installation not available. Please:\n' +
        '1. Access via HTTPS (deploy to production), or\n' +
        '2. Use Chrome menu → Install StockSaaS',
        { duration: 5000 }
      )
      return
    }
    
    setIsLoading(true)
    try {
      await handleInstall()
      toast.success('App Installed Successfully!')
    } catch (error) {
      console.error('Installation failed:', error)
      toast.error('Installation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={onInstallClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Install app"
      title={!isInstallable ? 'Click for installation instructions' : 'Install app'}
    >
      <Download size={20} />
      <span>{isLoading ? 'Installing...' : 'Install App'}</span>
    </button>
  )
}
