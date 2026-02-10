import { useState } from 'react';
import { FileText, Download, Search, Calendar, CheckCircle, Clock } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [billId, setBillId] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInvoice = async () => {
    if (!billId.trim()) {
      toast.error('Please enter a bill ID');
      return;
    }

    setLoading(true);
    try {
      const blob = await invoiceService.generateInvoice(billId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
      setBillId('');
    } catch (error) {
      toast.error('Failed to generate invoice. Please check the bill ID.');
    } finally {
      setLoading(false);
    }
  };

  const recentInvoices = [
    { id: 1, billId: '12345', date: '2024-02-09', amount: 2500, status: 'paid' },
    { id: 2, billId: '12344', date: '2024-02-08', amount: 1800, status: 'paid' },
    { id: 3, billId: '12343', date: '2024-02-07', amount: 3200, status: 'pending' },
  ];

  return (
    <div className="px-6 pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Invoice Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download PDF invoices for your bills
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Invoice Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Generate Invoice
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bill ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={billId}
                    onChange={(e) => setBillId(e.target.value)}
                    placeholder="Enter bill ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                onClick={generateInvoice}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {loading ? 'Generating...' : 'Generate & Download PDF'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                💡 Quick Tips:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Check your billing history</li>
                <li>• Bill IDs are numeric values</li>
                <li>• Usually displayed on receipts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Recent Invoices
            </h2>

            <div className="space-y-4">
              {recentInvoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Invoice #{invoice.billId}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{invoice.amount.toLocaleString()}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {invoice.status === 'paid' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {invoice.status}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setBillId(invoice.billId);
                          generateInvoice();
                        }}
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">156</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">Paid</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">142</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
            <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">14</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Invoices</p>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
