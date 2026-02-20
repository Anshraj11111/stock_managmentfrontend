import { useState, useEffect } from 'react'
import { WifiOff, X } from 'lucide-react'
import { usePWA } from '../../store/PWAContext'

export default function OfflineIndicator() {
  const { isOnline } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)

  // Reset dismissed state when back online
  useEffect(() => {
    if (isOnline) {
      setIsDismissed(false)
    }
  }, [isOnline])

  // Don't render if online or dismissed
  if (isOnline || isDismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff size={24} className="flex-shrink-0" />
          <span className="font-medium">
            You are offline. Some features may not be available.
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-yellow-600 rounded transition-colors"
          aria-label="Dismiss offline notification"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
