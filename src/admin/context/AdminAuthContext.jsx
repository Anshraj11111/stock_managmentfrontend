import { createContext, useState, useContext, useEffect } from 'react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists on mount
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Verify token by fetching dashboard stats
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      // Try to fetch dashboard stats to verify token
      await adminService.getDashboardStats();
      
      // If successful, get admin data from token
      const token = localStorage.getItem('admin_token');
      if (token) {
        // Decode JWT to get admin info (simple decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdmin({
          id: payload.admin_id,
          email: payload.email,
          role: payload.role
        });
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('admin_token');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, adminCode) => {
    try {
      const response = await adminService.login(email, password, adminCode);
      
      if (response.success) {
        localStorage.setItem('admin_token', response.token);
        setAdmin(response.admin);
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const signup = async (name, email, password, adminCode) => {
    try {
      const response = await adminService.signup(name, email, password, adminCode);
      
      if (response.success) {
        localStorage.setItem('admin_token', response.token);
        setAdmin(response.admin);
        toast.success('Admin account created successfully!');
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
    toast.success('Logged out successfully');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, signup, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
