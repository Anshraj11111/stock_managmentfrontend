import api from './api';

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Signup
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
};
