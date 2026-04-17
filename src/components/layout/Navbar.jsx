import { Menu, LogOut, User, Search, Moon, Sun, MapPin, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useTheme } from "../../store/ThemeContext";
import { productService } from "../../services/productService";
import LanguageSelector from "../common/LanguageSelector";
import InstallPWA from "../common/InstallPWA";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const searchRef = useRef(null);

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setAllProducts(data || []);
      } catch (error) {
        console.error('Failed to fetch products for search:', error);
      }
    };
    fetchProducts();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter products based on query
    if (query.trim().length > 0) {
      const filtered = allProducts.filter(product => 
        product.product_name.toLowerCase().includes(query.toLowerCase()) ||
        (product.storage_location && product.storage_location.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5); // Limit to 5 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.product_name);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(product.product_name)}`);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between px-3 sm:px-4 lg:px-6 z-40 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
        </button>

        {/* Search bar */}
        <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md">
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-secondary-100 dark:bg-secondary-900 rounded-xl px-3 sm:px-4 py-2 w-full transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500">
            <Search className="w-4 h-4 text-secondary-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-secondary-700 dark:text-secondary-300 placeholder-secondary-500 min-w-0"
            />
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-xl shadow-xl z-50 overflow-hidden">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full px-4 py-3 text-left hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors border-b border-secondary-100 dark:border-secondary-800 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                        {product.product_name}
                      </p>
                      {product.storage_location && (
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {product.storage_location}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400 whitespace-nowrap">
                      ₹{product.selling_price}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* PWA Install Button - Hidden on small mobile */}
        <div className="hidden sm:block">
          <InstallPWA />
        </div>

        {/* Language Selector - Hidden on small mobile */}
        <div className="hidden sm:block">
          <LanguageSelector />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-300 group flex-shrink-0"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Settings Icon - Hidden on small mobile */}
        <button
          onClick={() => navigate('/settings')}
          className="hidden sm:block p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 group flex-shrink-0"
          title="Settings"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 truncate max-w-[100px]">
                {user?.name}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-600 dark:text-secondary-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 group flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
