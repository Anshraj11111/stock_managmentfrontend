import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('admin_token');
};

// Create axios instance with admin token
const adminApi = axios.create({
  baseURL: API_URL,
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Service
export const adminService = {
  // Authentication
  signup: async (name, email, password, adminCode) => {
    const response = await axios.post(`${API_URL}/admin/signup`, {
      name,
      email,
      password,
      admin_code: adminCode
    });
    return response.data;
  },

  login: async (email, password, adminCode) => {
    const response = await axios.post(`${API_URL}/admin/login`, {
      email,
      password,
      admin_code: adminCode
    });
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  getUsers: async (page = 1, limit = 10, search = '', status = '') => {
    const response = await adminApi.get('/admin/users', {
      params: { page, limit, search, status }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await adminApi.get(`/admin/users/${id}`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await adminApi.put(`/admin/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await adminApi.put(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await adminApi.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Shop Management
  getShops: async (page = 1, limit = 10, search = '', status = '') => {
    const response = await adminApi.get('/admin/shops', {
      params: { page, limit, search, status }
    });
    return response.data;
  },

  suspendShop: async (id) => {
    const response = await adminApi.put(`/admin/shops/${id}/suspend`);
    return response.data;
  },

  extendTrial: async (id, days) => {
    const response = await adminApi.put(`/admin/shops/${id}/extend-trial`, { days });
    return response.data;
  },

  updateSubscription: async (id, active) => {
    const response = await adminApi.put(`/admin/shops/${id}/subscription`, { active });
    return response.data;
  },

  getShopProducts: async (id) => {
    const response = await adminApi.get(`/admin/shops/${id}/products`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (type = 'overview', period = 'monthly') => {
    const response = await adminApi.get('/admin/analytics', {
      params: { type, period }
    });
    return response.data;
  }
};
