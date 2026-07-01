import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider, useTheme } from './store/ThemeContext';
import { PWAProvider } from './store/PWAContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import OfflineIndicator from './components/common/OfflineIndicator';
import ScrollToTop from './components/common/ScrollToTop';
import { initGA } from './utils/analytics';
import './index.css';

// Inner component so it can access ThemeContext
const AppInner = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Sync html class with theme
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.body.style.backgroundColor = isDark ? '#0d1117' : '#f0f4ff';
    document.body.style.color           = isDark ? '#e6edf3' : '#0f172a';
  }, [isDark]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#0d1117' : '#f0f4ff' }}>
      <OfflineIndicator />
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#161b22' : '#ffffff',
            color:      isDark ? '#e6edf3' : '#0f172a',
            border:     `1px solid ${isDark ? '#21262d' : '#e2e8f0'}`,
            borderRadius: '12px',
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.5)'
              : '0 4px 16px rgba(0,0,0,0.1)',
          },
        }}
      />
    </div>
  );
};

function App() {
  useEffect(() => { initGA(); }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <PWAProvider>
          <Router>
            <ScrollToTop />
            <AppInner />
          </Router>
        </PWAProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
