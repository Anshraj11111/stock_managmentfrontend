import api from './api';

export const productService = {
  // Get all products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
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
