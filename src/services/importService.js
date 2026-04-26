import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Upload and parse file
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  
  const response = await axios.post(`${API_URL}/import/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Confirm and import products
 */
export const confirmImport = async (products, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/import/confirm`,
    { products, options },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

/**
 * Download sample template
 */
export const downloadTemplate = (format = 'csv') => {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/import/template?format=${format}`;
  
  window.open(url, '_blank');
};
