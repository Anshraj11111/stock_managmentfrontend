import api from './api';

export const productService = {
  // Get all products
  getProducts: async (search = '') => {
    const params = new URLSearchParams({ limit: 1000, page: 1 });
    if (search) params.append('search', search);
    const response = await api.get(`/products?${params}`);
    // Backend returns { products: [...], pagination: {...} }
    // Return full response so caller can access pagination.totalCount
    if (response.data.products) {
      return response.data.products;
    }
    // Fallback for old API format (plain array)
    return Array.isArray(response.data) ? response.data : [];
  },

  // Add new product
  addProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
