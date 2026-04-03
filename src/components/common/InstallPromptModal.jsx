import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '../../store/PWAContext'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function InstallPromptModal() {
  const { isInstallable, handleInstall, dismissInstallPrompt } = usePWA()
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // COMPLETELY DISABLED - Users can install from navbar button
    // This prevents the annoying popup from showing repeatedly
    return
  }, [isInstallable, location.pathname])

  // Never show modal - completely disabled
  return null
}
