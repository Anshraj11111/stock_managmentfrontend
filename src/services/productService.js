import api from './api';

export const productService = {
  // Get all products
  getProducts: async () => {
    const response = await api.get('/products');
    // Backend now returns { products: [...], pagination: {...} }
    // Extract just the products array for backward compatibility
    return response.data.products || response.data;
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
