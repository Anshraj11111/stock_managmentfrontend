import api from './api';

export const billService = {
  // Preview bill
  previewBill: async (requestData) => {
    const response = await api.post('/bills/preview', requestData);
    return response.data;
  },

  // Create bill
  createBill: async (billData) => {
    const response = await api.post('/bills', billData);
    return response.data;
  },

  // Pay due amount
  payDue: async (billId, paymentData) => {
    const response = await api.post(`/bills/${billId}/pay`, paymentData);
    return response.data;
  },

  // Get bill by ID
  getBillById: async (billId) => {
    const response = await api.get(`/bills/${billId}`);
    return response.data;
  },

  // Get all bills (recent)
  getBills: async () => {
    const response = await api.get('/bills/recent');
    return response.data;
  },
};
