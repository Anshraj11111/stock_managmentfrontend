import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // ✅ Handle suspended account (403 with suspended flag)
    if (error.response?.status === 403 && error.response?.data?.suspended) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show error message
      const message = error.response.data.message || 'Your account has been suspended.';
      
      // Redirect to login with error message
      window.location.href = '/login';
      
      // Store message to show on login page
      sessionStorage.setItem('loginError', message);
    }
    
    // ✅ Handle trial expiry (403 with trialExpired flag)
    if (error.response?.status === 403 && error.response?.data?.trialExpired) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show error message
      const message = error.response.data.message || 'Trial expired. Please purchase subscription.';
      
      // Redirect to login with error message
      window.location.href = '/login';
      
      // Store message to show on login page
      sessionStorage.setItem('loginError', message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
