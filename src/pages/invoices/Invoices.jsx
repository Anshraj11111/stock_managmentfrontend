import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Search,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { invoiceService } from "../../services/invoiceService";
import toast from "react-hot-toast";

const Invoices = () => {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Invoice Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download invoices from real billing data
        </p>
      </div>

      {/* GENERATE INVOICE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText /> Generate Invoice
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                  placeholder="Enter Bill ID"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl"
                />
              </div>

              <button
                disabled={loading}
                onClick={() => generateInvoice()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                <Download className="w-5 h-5" />
                {loading ? "Generating..." : "Download Invoice"}
              </button>
            </div>
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="text-indigo-600" />
            Recent Invoices
          </h2>

          {recentInvoices.length === 0 ? (
            <p className="text-gray-500">No invoices found</p>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:shadow"
                >
                  <div>
                    <p className="font-semibold">
                      {inv.bill_number}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₹{inv.total_amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-lg ${
                        inv.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <button
                    onClick={() => generateInvoice(inv.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
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
    className={`rounded-2xl p-6 border ${
      green
        ? "bg-green-50 border-green-200"
        : orange
        ? "bg-orange-50 border-orange-200"
        : "bg-indigo-50 border-indigo-200"
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-8 h-8" />
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white">
        {title}
      </span>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default Invoices;
