// Uses the central api instance so the 401→refresh interceptor works
import api from './api';

/**
 * Upload and parse file
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/import/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Confirm and import products
 */
export const confirmImport = async (products, options = {}) => {
  const response = await api.post('/import/confirm', { products, options });
  return response.data;
};

/**
 * Download sample template
 */
export const downloadTemplate = (format = 'csv') => {
  const token = localStorage.getItem('token');
  const base  = import.meta.env.VITE_API_BASE_URL || 'https://stock-managmenta5x.onrender.com/api';
  // Open with token in query param since it's a file download
  window.open(`${base}/import/template?format=${format}&token=${token}`, '_blank');
};
