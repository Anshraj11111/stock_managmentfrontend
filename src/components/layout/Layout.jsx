import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Content area */}
      <div className="flex-1">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="pt-16 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
