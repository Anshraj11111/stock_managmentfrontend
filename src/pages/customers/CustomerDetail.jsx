import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, IndianRupee, Calendar, TrendingUp, TrendingDown, Receipt, Wallet, Edit, Trash2, FileText, X, Package } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { billService } from '../../services/billService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ NEW: Edit customer state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [updating, setUpdating] = useState(false);

  // ✅ NEW: Bill view state
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loadingBill, setLoadingBill] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data.customer);
      setLedger(data.ledger);
      // Set edit form values
      setEditName(data.customer.name);
      setEditPhone(data.customer.phone);
      setEditAddress(data.customer.address || '');
    } catch (error) {
      toast.error('Failed to fetch customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(paymentAmount) > parseFloat(customer.total_due)) {
      toast.error('Payment amount cannot exceed total due');
      return;
    }

    setSubmitting(true);
    try {
      await customerService.recordPayment(id, {
        amount: parseFloat(paymentAmount),
        payment_mode: paymentMode,
        description: paymentDescription || `Payment received via ${paymentMode}`,
      });

      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentMode('cash');
      setPaymentDescription('');
      fetchCustomerDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ NEW: Update customer info
  const handleUpdateCustomer = async () => {
    if (!editName || !editPhone) {
      toast.error('Name and phone are required');
      return;
    }

    if (editPhone.length !== 10) {
      toast.error('Phone must be 10 digits');
      return;
    }

    setUpdating(true);
    try {
      await customerService.createOrUpdateCustomer({
        name: editName,
        phone: editPhone,
        address: editAddress,
      });

      toast.success('Customer updated successfully');
      setShowEditModal(false);
      fetchCustomerDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ NEW: Delete ledger entry (backend needs this endpoint)
  const handleDeleteLedgerEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry? This will adjust the customer\'s total due amount.')) {
      return;
    }

    try {
      await customerService.deleteLedgerEntry(id, entryId);
      toast.success('Entry deleted successfully');
      fetchCustomerDetails();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  // ✅ NEW: View bill in modal (same page)
  const handleViewBill = async (billId) => {
    setLoadingBill(true);
    setShowBillModal(true);
    
    try {
      const data = await billService.getBillById(billId);
      setSelectedBill(data);
    } catch (error) {
      toast.error('Failed to load bill details');
      setShowBillModal(false);
    } finally {
      setLoadingBill(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors self-start"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {customer.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Customer since {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
        {/* ✅ NEW: Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
        >
          <Edit className="w-4 h-4" />
          <span className="sm:inline">Edit Information</span>
        </button>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <Phone className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">Phone</h3>
          </div>
          <p className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100 break-all">
            {customer.phone}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">Address</h3>
          </div>
          <p className="text-sm text-secondary-900 dark:text-secondary-100 break-words">
            {customer.address || 'Not provided'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <IndianRupee className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">Total Due</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 mb-3 sm:mb-4">
            ₹{parseFloat(customer.total_due).toFixed(2)}
          </p>
          {parseFloat(customer.total_due) > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Wallet className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 sm:mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          Account Ledger
        </h2>

        {ledger.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ledger.map((entry) => (
              <div
                key={entry.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-xl border ${
                  entry.type === 'debit'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                    entry.type === 'debit'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {entry.type === 'debit' ? (
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-secondary-900 dark:text-secondary-100">
                      {entry.type === 'debit' ? 'Bill Created' : 'Payment Received'}
                    </p>
                    {/* ✅ Show Bill ID and make it clickable */}
                    {entry.reference_type === 'bill' && entry.reference_id ? (
                      <button
                        onClick={() => handleViewBill(entry.reference_id)}
                        className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold hover:underline transition-colors"
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        Bill ID: {entry.reference_id}
                      </button>
                    ) : (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                        {entry.description || 'Payment transaction'}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span className="break-all">{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                  <div className={`text-left sm:text-right ${
                    entry.type === 'debit' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    <p className="text-xl sm:text-2xl font-bold">
                      {entry.type === 'debit' ? '+' : '-'}₹{parseFloat(entry.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.reference_type.toUpperCase()}
                    </p>
                  </div>
                  {/* ✅ NEW: Delete Button */}
                  <button
                    onClick={() => handleDeleteLedgerEntry(entry.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              Record Payment
            </h2>

            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Due</p>
                <p className="text-4xl font-bold text-red-600">
                  ₹{parseFloat(customer.total_due).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Add a note..."
                  rows="2"
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2.5 border border-secondary-300 dark:border-secondary-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              Edit Customer Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="10 digit phone number"
                  maxLength="10"
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Customer address (optional)"
                  rows="3"
                  className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-secondary-300 dark:border-secondary-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCustomer}
                  disabled={updating}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ PREMIUM Bill View Modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-200 dark:border-gray-800">
            
            {/* Premium Header with Gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 p-4 sm:p-8 flex items-center justify-between z-10 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                    Bill Invoice
                  </h2>
                  <p className="text-indigo-100 text-xs sm:text-sm mt-1 hidden sm:block">Complete transaction details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBillModal(false);
                  setSelectedBill(null);
                }}
                className="p-2 sm:p-3 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-200 group"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable Premium Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(95vh-120px)] p-4 sm:p-8">
              {loadingBill ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader size="lg" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">Loading bill details...</p>
                </div>
              ) : selectedBill ? (
                <div className="space-y-4 sm:space-y-8">
                  
                  {/* Premium Bill Header Card */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl text-white">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-indigo-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Bill Number</p>
                        <p className="text-xl sm:text-3xl font-black">
                          #{selectedBill.id}
                        </p>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-indigo-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Date</p>
                        <p className="text-base sm:text-xl font-bold">
                          {new Date(selectedBill.createdAt).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-200">
                          {new Date(selectedBill.createdAt).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-indigo-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Status</p>
                        <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                          selectedBill.status === 'PAID' 
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {selectedBill.status === 'PAID' ? '✓ PAID' : '⏱ PENDING'}
                        </span>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-indigo-100 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Amount</p>
                        <p className="text-xl sm:text-3xl font-black break-all">
                          ₹{selectedBill.total_amount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Card - Premium */}
                  {(selectedBill.customer_name || selectedBill.customer_phone) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Customer Information</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        {selectedBill.customer_name && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-words">{selectedBill.customer_name}</p>
                          </div>
                        )}
                        {selectedBill.customer_phone && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white break-all">{selectedBill.customer_phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Premium Items Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                          Items Purchased
                        </h3>
                      </div>
                      <span className="px-2 sm:px-4 py-1 sm:py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs sm:text-sm font-bold">
                        {(selectedBill.BillItems || selectedBill.items || []).length} Items
                      </span>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {(selectedBill.BillItems || selectedBill.items || []).map((item, index) => (
                        <div
                          key={index}
                          className="group flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-words">
                              {item.Product?.product_name || item.product_name || item.name || 'Unknown Item'}
                            </p>
                            <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2">
                              <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Rate: <span className="text-indigo-600 dark:text-indigo-400">₹{item.price || item.Product?.selling_price || 0}</span>
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                Qty: <span className="text-purple-600 dark:text-purple-400">{item.quantity}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right sm:ml-4">
                            <p className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                              ₹{item.total || (item.price * item.quantity) || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Premium Bill Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center text-sm sm:text-base">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Subtotal</span>
                        <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                          ₹{selectedBill.subtotal || selectedBill.total_amount}
                        </span>
                      </div>
                      
                      {selectedBill.discount_amount > 0 && (
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Discount</span>
                          <span className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400">
                            -₹{selectedBill.discount_amount}
                          </span>
                        </div>
                      )}
                      
                      {selectedBill.gst_amount > 0 && (
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">GST</span>
                          <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                            +₹{selectedBill.gst_amount}
                          </span>
                        </div>
                      )}
                      
                      <div className="border-t-2 sm:border-t-3 border-indigo-300 dark:border-indigo-700 pt-3 sm:pt-4 mt-3 sm:mt-4"></div>
                      
                      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
                        <span className="text-base sm:text-xl font-bold text-white uppercase tracking-wide">Total Amount</span>
                        <span className="text-2xl sm:text-4xl font-black text-white break-all">
                          ₹{selectedBill.total_amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Payment Details */}
                  {selectedBill.Payments && selectedBill.Payments.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                          Payment Details
                        </h3>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        {selectedBill.Payments.map((payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border-2 border-green-200 dark:border-green-800 shadow-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                {payment.mode?.toUpperCase() || 'CASH'}
                              </p>
                              {payment.reference_id && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium break-all">
                                  Ref: {payment.reference_id}
                                </p>
                              )}
                            </div>
                            <span className="text-xl sm:text-3xl font-black text-green-600 dark:text-green-400 ml-2">
                              ₹{payment.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Due Amount if any */}
                      {selectedBill.due_amount > 0 && (
                        <div className="mt-3 sm:mt-4 p-3 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border-2 border-amber-300 dark:border-amber-700 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-lg font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Remaining Due</span>
                            <span className="text-xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 break-all">
                              ₹{selectedBill.due_amount}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Receipt className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">No bill data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
