import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../../store/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className="
        fixed top-0 right-0
        left-0 lg:left-64
        h-16
        bg-white dark:bg-secondary-900
        border-b border-secondary-200 dark:border-secondary-700
        flex items-center justify-between
        px-4 lg:px-6
        z-40
      "
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* User info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
              {user?.name}
            </p>
            <p className="text-xs text-secondary-600 dark:text-secondary-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
