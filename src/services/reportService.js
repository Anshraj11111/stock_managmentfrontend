import api from './api';

export const reportService = {
  // Get daily sales report
  getDailyReport: async () => {
    const response = await api.get('/reports/daily');
    return response.data;
  },

  // Get monthly sales report
  getMonthlyReport: async () => {
    const response = await api.get('/reports/monthly');
    return response.data;
  },

  // Get report by date range
  getReportByDateRange: async (startDate, endDate) => {
    const response = await api.get('/reports/daily');
    return response.data;
  },
};
