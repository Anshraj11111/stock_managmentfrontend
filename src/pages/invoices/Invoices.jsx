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
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  /* =============================
     FETCH REAL DATA
  ============================== */
  useEffect(() => {
    fetchRecentInvoices();
    fetchInvoiceStats();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      const data = await invoiceService.getRecentInvoices();
      setRecentInvoices(data);
    } catch (err) {
      toast.error("Failed to load recent invoices");
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const data = await invoiceService.getInvoiceStats();
      setStats(data);
    } catch (err) {
      toast.error("Failed to load invoice stats");
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
    <div className="px-6 pb-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t('invoices.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t('invoices.subtitle')}
        </p>
      </div>

      {/* GENERATE INVOICE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 bg-white dark:bg-secondary-900">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-secondary-900 dark:text-secondary-100">
              <FileText className="text-indigo-600 dark:text-indigo-400" /> {t('invoices.generateInvoice')}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 dark:text-secondary-500" />
                <input
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                  placeholder="Enter Bill ID"
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                disabled={loading}
                onClick={() => generateInvoice()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                {loading ? t('invoices.generating') : t('invoices.downloadInvoice')}
              </button>
            </div>
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className="lg:col-span-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-secondary-900 dark:text-secondary-100">
            <Clock className="text-indigo-600 dark:text-indigo-400" />
            {t('invoices.recentInvoices')}
          </h2>

          {recentInvoices.length === 0 ? (
            <p className="text-secondary-500 dark:text-secondary-400">No invoices found</p>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-semibold text-secondary-900 dark:text-secondary-100">
                      {inv.bill_number}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-secondary-900 dark:text-secondary-100">
                      ₹{inv.total_amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-lg ${
                        inv.status === "PAID"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <button
                    onClick={() => generateInvoice(inv.id)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <Download />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total" value={stats.total} icon={FileText} />
        <StatCard title="Paid" value={stats.paid} icon={CheckCircle} green />
        <StatCard title="Pending" value={stats.pending} icon={Clock} orange />
      </div>
    </div>
  );
};

/* =============================
   STAT CARD
============================= */
const StatCard = ({ title, value, icon: Icon, green, orange }) => (
  <div
    className={`rounded-2xl p-6 border transition-all hover:shadow-lg ${
      green
        ? "bg-white dark:bg-secondary-900 border-green-200 dark:border-green-800"
        : orange
        ? "bg-white dark:bg-secondary-900 border-orange-200 dark:border-orange-800"
        : "bg-white dark:bg-secondary-900 border-indigo-200 dark:border-indigo-800"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-8 h-8 ${
        green 
          ? "text-green-600 dark:text-green-400" 
          : orange 
          ? "text-orange-600 dark:text-orange-400" 
          : "text-indigo-600 dark:text-indigo-400"
      }`} />
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
        green
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : orange
          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
          : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
      }`}>
        {title}
      </span>
    </div>
    <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
  </div>
);

export default Invoices;
