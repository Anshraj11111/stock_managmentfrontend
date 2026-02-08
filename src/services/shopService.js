import api from './api';

export const shopService = {
  // Get shop details
  getShopDetails: async () => {
    const response = await api.get('/shop');
    return response.data;
  },

  // Update shop details
  updateShopDetails: async (shopData) => {
    const response = await api.put('/shop', shopData);
    return response.data;
  },
};
