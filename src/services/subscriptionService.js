// Uses the central api instance so the 401→refresh interceptor works
import api from './api';
import axios from 'axios';

// Plans endpoint is public (no auth needed)
const PUBLIC_BASE = import.meta.env.VITE_API_BASE_URL || 'https://stock-managmenta5x.onrender.com/api';

export const getPlans = async () => {
  const response = await axios.get(`${PUBLIC_BASE}/subscription/plans`);
  return response.data;
};

export const getCurrentSubscription = async () => {
  const response = await api.get('/subscription/current');
  return response.data;
};

export const initiatePayment = async (planType, duration) => {
  const response = await api.post('/subscription/initiate-payment', {
    plan_type: planType,
    duration,
  });
  return response.data;
};

export const submitPaymentProof = async (paymentId, screenshot, transactionId, upiRef) => {
  const response = await api.post('/subscription/submit-payment', {
    payment_id:     paymentId,
    screenshot,
    transaction_id: transactionId,
    upi_ref:        upiRef,
  });
  return response.data;
};

export const checkFeatureAccess = async (feature) => {
  const response = await api.get(`/subscription/feature-access/${feature}`);
  return response.data;
};
