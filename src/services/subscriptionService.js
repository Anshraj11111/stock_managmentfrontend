import axios from 'axios';

// Automatically detect environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
  ? 'http://localhost:5000/api' 
  : 'https://stock-managmenta5x.onrender.com/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Get available plans
export const getPlans = async () => {
  const response = await axios.get(`${API_URL}/subscription/plans`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get current subscription
export const getCurrentSubscription = async () => {
  const response = await axios.get(`${API_URL}/subscription/current`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Initiate payment
export const initiatePayment = async (planType, duration) => {
  const response = await axios.post(
    `${API_URL}/subscription/initiate-payment`,
    { plan_type: planType, duration },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Submit payment proof
export const submitPaymentProof = async (paymentId, screenshot, transactionId, upiRef) => {
  const response = await axios.post(
    `${API_URL}/subscription/submit-payment`,
    {
      payment_id: paymentId,
      screenshot,
      transaction_id: transactionId,
      upi_ref: upiRef
    },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Check feature access
export const checkFeatureAccess = async (feature) => {
  const response = await axios.get(`${API_URL}/subscription/feature-access/${feature}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
