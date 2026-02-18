import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
