import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { PWAProvider } from './store/PWAContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import OfflineIndicator from './components/common/OfflineIndicator';
import ScrollToTop from './components/common/ScrollToTop';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PWAProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
              <OfflineIndicator />
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                  className: 'dark:!bg-secondary-800 dark:!text-secondary-100 dark:!border-secondary-700 !bg-white !text-secondary-900 !border-secondary-200',
                }}
              />
            </div>
          </Router>
        </PWAProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
