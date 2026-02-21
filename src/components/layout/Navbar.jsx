import { Menu, LogOut, User, Search, Moon, Sun } from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import { useTheme } from "../../store/ThemeContext";
import LanguageSelector from "../common/LanguageSelector";
import InstallPWA from "../common/InstallPWA";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between px-4 lg:px-6 z-40 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-secondary-100 dark:bg-secondary-900 rounded-xl px-4 py-2 w-64 lg:w-96 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500">
          <Search className="w-4 h-4 text-secondary-500" />
          <input
            type="text"
            placeholder="Search anything..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-secondary-700 dark:text-secondary-300 placeholder-secondary-500"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* PWA Install Button */}
        <InstallPWA />

        {/* Language Selector */}
        <LanguageSelector />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-300 group"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-3 border-l border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {user?.name}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-600 dark:text-secondary-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
