import api from "../utils/api"; // axios instance

export const invoiceService = {
  generateInvoice: async (billId) => {
    const res = await api.get(`/invoices/${billId}`, {
      responseType: "blob",
    });
    return res.data;
  },

  getRecentInvoices: async () => {
    const res = await api.get("/bills/recent");
    return res.data;
  },

  getInvoiceStats: async () => {
    const res = await api.get("/bills/stats");
    return res.data;
  },
};
