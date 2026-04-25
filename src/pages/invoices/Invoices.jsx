import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Search,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { invoiceService } from "../../services/invoiceService";
import toast from "react-hot-toast";

const Invoices = () => {
  const { t } = useTranslation();
  const [billId, setBillId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  /* =============================
     FETCH REAL DATA
  ============================== */
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([
        fetchRecentInvoices(),
        fetchInvoiceStats()
      ]);
      setLoadingData(false);
    };
    loadData();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      console.log('🔄 Fetching recent invoices...');
      const data = await invoiceService.getRecentInvoices();
      console.log('✅ Recent invoices loaded:', data);
      setRecentInvoices(data);
    } catch (err) {
      console.error('❌ Failed to load recent invoices:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load recent invoices");
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      console.log('🔄 Fetching invoice stats...');
      const data = await invoiceService.getInvoiceStats();
      console.log('✅ Invoice stats loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Failed to load invoice stats:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load invoice stats");
    }
  };

  /* =============================
     GENERATE PDF
  ============================== */
  const generateInvoice = async (id) => {
    const targetId = id || billId;

    if (!targetId) {
      toast.error("Please enter Bill ID");
      return;
    }

    setLoading(true);
    try {
      const blob = await invoiceService.generateInvoice(targetId);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${targetId}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded");
      setBillId("");
    } catch (err) {
      toast.error("Invoice not found or access denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 px-4 sm:px-6 lg:px-8 pb-10 space-y-6">
      {/* HEADER */}
      <div className="pt-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t('invoices.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
          {t('invoices.subtitle')}
        </p>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN - GENERATE INVOICE */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 bg-white dark:bg-secondary-900 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-secondary-900 dark:text-secondary-100">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              {t('invoices.generateInvoice')}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 dark:text-secondary-500" />
                <input
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                  placeholder="Enter Bill ID"
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                disabled={loading}
                onClick={() => generateInvoice()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <Download className="w-5 h-5" />
                {loading ? t('invoices.generating') : t('invoices.downloadInvoice')}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RECENT INVOICES */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-secondary-900 dark:text-secondary-100">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              {t('invoices.recentInvoices')}
            </h2>

            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 dark:border-emerald-500 border-t-emerald-600 dark:border-t-emerald-400"></div>
                <span className="mt-4 text-secondary-500 dark:text-secondary-400 font-medium">Loading invoices...</span>
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-secondary-100 dark:bg-secondary-800 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-secondary-400 dark:text-secondary-500" />
                </div>
                <p className="text-lg font-medium text-secondary-600 dark:text-secondary-400 mb-2">No invoices found</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-500">Create your first bill to see invoices here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-secondary-50 to-white dark:from-secondary-800 dark:to-secondary-850 rounded-xl hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500 transition-all"
                  >
                    {/* LEFT SIDE - Bill Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                        {inv.bill_number}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* MIDDLE - Amount & Status */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-secondary-900 dark:text-secondary-100">
                          ₹{inv.total_amount.toLocaleString('en-IN')}
                        </p>
                        <span
                          className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                            inv.status === "PAID"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      {/* RIGHT SIDE - Download Button */}
                      <button
                        onClick={() => generateInvoice(inv.id)}
                        className="p-3 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                        title="Download Invoice"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total" value={stats.total} icon={FileText} color="indigo" />
        <StatCard title="Paid" value={stats.paid} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
      </div>
    </div>
  );
};

/* =============================
   STAT CARD
============================= */
const StatCard = ({ title, value, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
      border: "border-indigo-200 dark:border-indigo-800",
      icon: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
      border: "border-orange-200 dark:border-orange-800",
      icon: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
    }
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`rounded-2xl p-6 border transition-all hover:shadow-lg transform hover:scale-[1.02] ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.iconBg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${colors.badge}`}>
          {title}
        </span>
      </div>
      <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
      <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
        {title === "Total" ? "Total Invoices" : title === "Paid" ? "Completed" : "Awaiting Payment"}
      </p>
    </div>
  );
};

export default Invoices;
