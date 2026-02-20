import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Download, X, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../store/ThemeContext";
import LanguageSelector from "../../components/common/LanguageSelector";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      setShowInstallPopup(true);
    }, 2000);

    // Capture install prompt event
    const handleBeforeInstall = (e) => {
      console.log('✅ beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('✅ Install prompt captured and stored');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('ℹ️ App is already installed');
    } else {
      console.log('ℹ️ App is not installed yet');
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Browser supports install - show native dialog
      try {
        // Show the browser's native install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
          toast.success('🎉 App is installing...', { duration: 3000 });
          setShowInstallPopup(false);
        } else {
          toast('You can install later from browser menu', { duration: 3000 });
        }
        
        // Clear the deferred prompt
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error showing install prompt:', error);
        toast.error('Installation failed. Please try again.');
      }
    } else {
      // Fallback - show instructions for manual installation
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        toast('Tap Share button, then "Add to Home Screen"', { 
          duration: 6000,
          icon: '📱'
        });
      } else if (isAndroid) {
        toast('Tap menu (⋮) then "Add to Home Screen"', { 
          duration: 6000,
          icon: '📱'
        });
      } else {
        toast('Click menu (⋮) then "Install app"', { 
          duration: 6000,
          icon: '💻'
        });
      }
      
      setShowInstallPopup(false);
    }
  };

  const goToTrial = () => navigate("/signup?plan=trial");

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-black dark:via-indigo-950 dark:to-purple-950 text-gray-900 dark:text-white overflow-hidden transition-colors duration-500">

      {/* Top Right Controls - Language & Dark Mode */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <LanguageSelector />
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 hover:scale-110 transition-all duration-300 shadow-xl"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6 text-yellow-400 animate-spin-slow" />
          ) : (
            <Moon className="w-6 h-6 text-indigo-600" />
          )}
        </motion.button>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">

        {/* Animated Background Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-[600px] h-[600px] bg-purple-600/30 dark:bg-purple-600/20 blur-[200px] rounded-full -top-40 -left-40"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-[600px] h-[600px] bg-indigo-600/30 dark:bg-indigo-600/20 blur-[200px] rounded-full -bottom-40 -right-40"
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-500/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            {t('landing.heroTitle')}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-full border border-indigo-500/20 mb-6"
          >
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              🚀 {t('landing.heroTagline')}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mb-6 leading-relaxed"
          >
            {t('landing.heroDescription')} <span className="font-bold text-indigo-600 dark:text-indigo-400">{t('landing.heroHighlight')}</span>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-600 dark:text-gray-400 italic mb-10 max-w-2xl mx-auto text-lg"
          >
            "{t('landing.heroQuote')}"
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.08, boxShadow: "0 20px 60px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={goToTrial}
            className="px-12 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl text-lg font-bold shadow-2xl text-white relative overflow-hidden group"
          >
            <span className="relative z-10">{t('landing.startFreeTrial')} 🚀</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-sm text-gray-500 dark:text-gray-500"
          >
            {t('landing.noCreditCard')}{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{t('landing.companyName')}</span>
          </motion.p>
        </motion.div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="py-28 px-6 max-w-6xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('landing.whyWeBuilt')}
          </h2>

          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto mb-16">
            {t('landing.whyDescription1')}
            <br /><br />
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{t('landing.whyDescription2')}</span>
            <br />
            {t('landing.whyDescription3')}
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: "📦", title: t('landing.completeInventory'), desc: t('landing.completeInventoryDesc') },
              { icon: "💳", title: t('landing.smartBilling'), desc: t('landing.smartBillingDesc') },
              { icon: "📊", title: t('landing.growthAnalytics'), desc: t('landing.growthAnalyticsDesc') }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, boxShadow: "0 20px 60px rgba(99, 102, 241, 0.2)" }}
                className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-indigo-200/50 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= VISION SECTION ================= */}
      <section className="py-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 text-center relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white">
            {t('landing.ourVision')}
          </h2>

          <p className="text-white/90 text-lg max-w-4xl mx-auto leading-relaxed">
            {t('landing.visionDescription1')}
            <br /><br />
            <span className="font-bold text-2xl">{t('landing.visionDescription2')}</span>
            <br />
            <span className="text-xl">{t('landing.visionDescription3')}</span>
          </p>
        </motion.div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-28 px-6 max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          {t('landing.powerfulFeatures')}
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            t('landing.unlimitedProducts'),
            t('landing.multiUserAccess'),
            t('landing.advancedReporting'),
            t('landing.cloudBased'),
            t('landing.secureEncrypted'),
            t('landing.scalableArchitecture')
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-white/5 dark:to-white/10 p-8 rounded-2xl border border-indigo-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature}</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="py-28 bg-gray-900 dark:bg-black text-center px-6 relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {t('landing.readyToTransform')}
          </h2>

          <p className="text-gray-400 max-w-3xl mx-auto mb-10 text-lg">
            {t('landing.transformDescription')}
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToTrial}
            className="px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl text-lg font-bold text-white shadow-2xl"
          >
            {t('landing.startTrialToday')}
          </motion.button>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 text-center text-gray-600 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-transparent backdrop-blur-sm">
        © {new Date().getFullYear()} {t('landing.heroTitle')}
        <br />
        {t('landing.footerText')} <span className="font-bold text-indigo-600 dark:text-indigo-400">{t('landing.companyName')}</span> — {t('landing.footerTagline')}
      </footer>

      {/* ================= INSTALL PWA POPUP ================= */}
      {showInstallPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setShowInstallPopup(false)}
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 pointer-events-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInstallPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Smartphone size={40} className="text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
                📱 Install StockSaaS App
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Get instant access! Install our app for faster loading, offline access, and a native app experience.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  </div>
                  <span>⚡ Lightning fast - Works offline</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  </div>
                  <span>📱 Native app feel - No app store needed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  </div>
                  <span>🔔 Instant updates - Always latest version</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstallPopup(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Install Now
                </button>
              </div>

              {/* Footer Note */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
                ⚡ Free • Takes 2 seconds • No credit card required
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Landing;
