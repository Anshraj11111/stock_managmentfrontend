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
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 backdrop-blur-md flex items-center justify-between px-3 sm:px-4 lg:px-6 z-40 transition-colors duration-300"
      style={
        theme === 'dark'
          ? { backgroundColor: 'rgba(13,17,23,0.92)', borderBottom: '1px solid #21262d' }
          : { backgroundColor: 'rgba(255,255,255,0.90)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }
      }
    >
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl transition-colors flex-shrink-0 lg:hidden"
          style={{ color: theme === 'dark' ? '#8b949e' : '#64748b' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#21262d' : '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md">
          <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 w-full transition-all duration-300 focus-within:ring-1 focus-within:ring-primary-500"
            style={
              theme === 'dark'
                ? { backgroundColor: '#161b22', border: '1px solid #21262d' }
                : { backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }
            }
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: theme === 'dark' ? '#6e7681' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
              className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
              style={{ color: theme === 'dark' ? '#e6edf3' : '#0f172a' }}
            />
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden"
              style={
                theme === 'dark'
                  ? { backgroundColor: '#161b22', border: '1px solid #21262d' }
                  : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
              }
            >
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full px-4 py-3 text-left transition-colors"
                  style={{ borderBottom: `1px solid ${theme === 'dark' ? '#21262d' : '#f1f5f9'}`, color: theme === 'dark' ? '#e6edf3' : '#0f172a' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#21262d' : '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: theme === 'dark' ? '#e6edf3' : '#0f172a' }}>
                        {product.product_name}
                      </p>
                      {product.storage_location && (
                        <p className="text-xs truncate flex items-center gap-1" style={{ color: theme === 'dark' ? '#6e7681' : '#94a3b8' }}>
                          <MapPin className="w-3 h-3" />
                          {product.storage_location}
                        </p>
                      )}
                    </div>
                    <div className="text-xs whitespace-nowrap font-semibold" style={{ color: '#3b82f6' }}>
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
          className="p-2 rounded-xl transition-all duration-300 group flex-shrink-0"
          style={{ color: theme === 'dark' ? '#8b949e' : '#64748b' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#21262d' : '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
          ) : (
            <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" style={{ color: '#3b82f6' }} />
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="hidden sm:block p-2 rounded-xl transition-all duration-300 group flex-shrink-0"
          style={{ color: theme === 'dark' ? '#8b949e' : '#64748b' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme === 'dark' ? '#21262d' : '#f1f5f9'; e.currentTarget.style.color = '#3b82f6'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#8b949e' : '#64748b'; }}
          title="Settings"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3"
          style={{ borderLeft: `1px solid ${theme === 'dark' ? '#21262d' : '#e2e8f0'}` }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ backgroundColor: '#22c55e', borderColor: theme === 'dark' ? '#0d1117' : '#ffffff' }} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold truncate max-w-[100px]"
                style={{ color: theme === 'dark' ? '#e6edf3' : '#0f172a' }}>
                {user?.name}
              </p>
              <p className="text-xs capitalize"
                style={{ color: theme === 'dark' ? '#8b949e' : '#64748b' }}>
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl transition-all duration-300 group flex-shrink-0"
            style={{ color: theme === 'dark' ? '#8b949e' : '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(248,81,73,0.1)' : '#fee2e2'; e.currentTarget.style.color = '#f85149'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme === 'dark' ? '#8b949e' : '#64748b'; }}
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
