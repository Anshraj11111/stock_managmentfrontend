import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '../../store/PWAContext'
import toast from 'react-hot-toast'

export default function InstallPromptModal() {
  const { isInstallable, handleInstall, dismissInstallPrompt } = usePWA()
  const [showModal, setShowModal] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Show modal after 2 seconds if installable
    if (isInstallable) {
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 2000) // 2 second delay

      return () => clearTimeout(timer)
    }
  }, [isInstallable])

  if (!showModal || !isInstallable) return null

  const handleInstallClick = async () => {
    setIsInstalling(true)
    try {
      await handleInstall()
      toast.success('🎉 App Installed Successfully!')
      setShowModal(false)
    } catch (error) {
      console.error('Installation failed:', error)
      toast.error('Installation failed. Please try again.')
    } finally {
      setIsInstalling(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    dismissInstallPrompt()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl max-w-md w-full p-8 pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-secondary-500" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Smartphone size={40} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-secondary-900 dark:text-white mb-3">
            Install StockSaaS App
          </h2>

          {/* Description */}
          <p className="text-center text-secondary-600 dark:text-secondary-400 mb-6">
            Install our app for a better experience! Access your inventory faster, work offline, and get instant updates.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-secondary-700 dark:text-secondary-300">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span>Works offline - Access your data anytime</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary-700 dark:text-secondary-300">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span>Faster loading - Native app experience</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary-700 dark:text-secondary-300">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span>No app store needed - Install directly</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {isInstalling ? 'Installing...' : 'Install Now'}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-secondary-500 dark:text-secondary-500 mt-4">
            Free • No credit card required • Takes 2 seconds
          </p>
        </div>
      </div>
    </>
  )
}
