import api from './api';

export const customerService = {
  // Get all customers
  getCustomers: async () => {
    const response = await api.get('/customers');
    return response.data;
  },

  // Search customer by phone
  searchByPhone: async (phone) => {
    const response = await api.get(`/customers/search?phone=${phone}`);
    return response.data;
  },

  // Get single customer with ledger
  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Create or update customer
  createOrUpdateCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  // Record payment
  recordPayment: async (customerId, paymentData) => {
    const response = await api.post(`/customers/${customerId}/payment`, paymentData);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Delete ledger entry
  deleteLedgerEntry: async (customerId, entryId) => {
    const response = await api.delete(`/customers/${customerId}/ledger/${entryId}`);
    return response.data;
  },
};
