import api from './api';

export const invoiceService = {
  // Generate invoice PDF
  generateInvoice: async (billId) => {
    const response = await api.get(`/invoices/${billId}`, {
      responseType: 'blob', // For PDF download
    });
    return response.data;
  },
};
