import axios from 'axios';

const API_URL = 'https://stock-managmenta5x.onrender.com/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
};

// Get all subscriptions
export const getAllSubscriptions = async (status, planType) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (planType) params.append('plan_type', planType);
  
  const response = await axios.get(`${API_URL}/admin/subscriptions?${params}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get pending payments
export const getPendingPayments = async () => {
  const response = await axios.get(`${API_URL}/admin/payments/pending`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Verify payment
export const verifyPayment = async (paymentId, status, notes) => {
  const response = await axios.post(
    `${API_URL}/admin/payments/verify`,
    { payment_id: paymentId, status, notes },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Suspend shop
export const suspendShop = async (shopId, reason) => {
  const response = await axios.post(
    `${API_URL}/admin/shops/suspend`,
    { shop_id: shopId, reason },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Activate shop
export const activateShop = async (shopId) => {
  const response = await axios.post(
    `${API_URL}/admin/shops/activate`,
    { shop_id: shopId },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Process refund
export const processRefund = async (shopId, amount, notes) => {
  const response = await axios.post(
    `${API_URL}/admin/refunds/process`,
    { shop_id: shopId, amount, notes },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Get admin settings
export const getAdminSettings = async () => {
  const response = await axios.get(`${API_URL}/admin/settings/subscription`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update admin settings
export const updateAdminSettings = async (upiId, qrCode) => {
  const response = await axios.post(
    `${API_URL}/admin/settings/subscription`,
    { upi_id: upiId, qr_code: qrCode },
    { headers: getAuthHeader() }
  );
  return response.data;
};
