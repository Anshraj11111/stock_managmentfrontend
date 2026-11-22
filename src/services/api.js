import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://stock-managmenta5x.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach access token ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Track whether a refresh is in progress to prevent loops ─────────────
let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  pendingRequests = [];
};

const forceLogout = (message) => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  if (message) sessionStorage.setItem('loginError', message);
  window.location.href = '/login';
};

// ── Response interceptor — handle errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Handle suspended account
    if (error.response?.status === 403 && error.response?.data?.suspended) {
      forceLogout(error.response.data.message || 'Your account has been suspended.');
      return Promise.reject(error);
    }

    // ✅ Handle trial expiry
    if (error.response?.status === 403 && error.response?.data?.trialExpired) {
      forceLogout(error.response.data.message || 'Trial expired. Please purchase subscription.');
      return Promise.reject(error);
    }

    // ✅ 401 — attempt silent token refresh before force-logout
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', newToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
