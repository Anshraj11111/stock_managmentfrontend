import { Menu, LogOut, User } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ setSidebarOpen }) => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Title */}
        <h1 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 hidden lg:block">
          Admin Panel
        </h1>

        {/* Admin Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <User className="w-5 h-5 text-indigo-600" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {admin?.name || admin?.email}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {admin?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
