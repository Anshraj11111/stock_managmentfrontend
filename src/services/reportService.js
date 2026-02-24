import api from './api';

export const reportService = {
  // Get daily sales report
  getDailyReport: async () => {
    const response = await api.get('/reports/daily');
    return response.data;
  },

  // Get monthly sales report
  getMonthlyReport: async (month, year) => {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    const response = await api.get(`/reports/monthly?month=${currentMonth}&year=${currentYear}`);
    return response.data;
  },

  // Get report by date range
  getReportByDateRange: async (startDate, endDate) => {
    const response = await api.get(`/reports/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};
