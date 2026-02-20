import { useState } from 'react'
import { Download } from 'lucide-react'
import { usePWA } from '../../store/PWAContext'
import toast from 'react-hot-toast'

export default function InstallPWA() {
  const { isInstallable, handleInstall } = usePWA()
  const [isLoading, setIsLoading] = useState(false)

  // Don't render if not installable
  if (!isInstallable) return null

  const onInstallClick = async () => {
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
    >
      <Download size={20} />
      <span>{isLoading ? 'Installing...' : 'Install App'}</span>
    </button>
  )
}
