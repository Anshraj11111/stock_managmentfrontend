import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from '../common/Footer';
import { useTheme } from '../../store/ThemeContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location  = useLocation();
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const showFooter = location.pathname === '/dashboard';

  const pageBg = isDark ? '#0d1117' : '#f0f4ff';

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: pageBg }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="pt-16 lg:ml-64 flex-1 flex flex-col">
          <main className="flex-1 transition-colors duration-300" style={{ backgroundColor: pageBg }}>
            <div className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
              {children}
            </div>
          </main>
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
};

export default Layout;
