import { useState, useEffect } from 'react';
import { 
  getPlans, 
  getCurrentSubscription, 
  initiatePayment, 
  submitPaymentProof 
} from '../../services/subscriptionService';
import { 
  CreditCard, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Upload,
  AlertCircle
} from 'lucide-react';

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState(null);
  const [currentSub, setCurrentSub] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [plansData, subData] = await Promise.all([
        getPlans(),
        getCurrentSubscription()
      ]);
      setPlans(plansData.plans);
      setCurrentSub(subData.subscription);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planType, duration) => {
    try {
      setLoading(true);
      console.log('Initiating payment for:', planType, duration);
      const payment = await initiatePayment(planType, duration);
      console.log('Payment data received:', payment);
      setPaymentData(payment);
      setSelectedPlan({ planType, duration });
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert(`Failed to initiate payment: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshot || !transactionId) {
      alert('Please upload screenshot and enter transaction ID');
      return;
    }

    try {
      setSubmitting(true);
      await submitPaymentProof(
        paymentData.payment_id,
        screenshot,
        transactionId,
        upiRef
      );
      alert('Payment submitted successfully! Admin will verify soon.');
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Subscription Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your business
          </p>
        </div>

        {/* Current Subscription Card */}
        {currentSub && (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Current Plan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Plan Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currentSub.plan_name || 'Trial'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Days Remaining</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currentSub.days_remaining} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expires On</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {currentSub.subscription_end_date 
                      ? new Date(currentSub.subscription_end_date).toLocaleDateString()
                      : new Date(currentSub.trial_end_date).toLocaleDateString()
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  currentSub.deposit_paid 
                    ? 'bg-green-100 dark:bg-green-800' 
                    : 'bg-red-100 dark:bg-red-800'
                }`}>
                  {currentSub.deposit_paid ? (
                    <Check className="text-green-600 dark:text-green-400" size={20} />
                  ) : (
                    <X className="text-red-600 dark:text-red-400" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Deposit Status</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currentSub.deposit_paid ? 'Paid' : 'Not Paid'}
                  </p>
                </div>
              </div>
            </div>

            {/* Trial Expiry Warning */}
            {currentSub.days_remaining <= 7 && !currentSub.deposit_paid && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
                  <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
                    Trial expires in {currentSub.days_remaining} days! Pay ₹100 deposit to continue.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deposit Section */}
        {!currentSub?.deposit_paid && (
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Refundable Deposit</h2>
              <p className="text-base sm:text-lg mb-4 text-white/90">
                Pay ₹100 deposit to unlock the app after trial. Get full refund after 2 months!
              </p>
              <button
                onClick={() => handleSelectPlan('deposit', null)}
                className="bg-white text-orange-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                Pay ₹100 Deposit
              </button>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Basic Plans */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Basic Plans
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Dashboard, Products, Billing
            </p>
            <div className="space-y-4">
              {plans?.basic.map((plan) => (
                <div
                  key={plan.duration}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {plan.duration} Months
                      </h3>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{plan.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectPlan('basic', plan.duration)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-md"
                    >
                      Select
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check size={16} className="flex-shrink-0" />
                      <span className="text-sm">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check size={16} className="flex-shrink-0" />
                      <span className="text-sm">Products Management</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check size={16} className="flex-shrink-0" />
                      <span className="text-sm">Billing</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X size={16} className="flex-shrink-0" />
                      <span className="text-sm">Reports (Locked)</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X size={16} className="flex-shrink-0" />
                      <span className="text-sm">Staff Management (Locked)</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X size={16} className="flex-shrink-0" />
                      <span className="text-sm">Customers/Udhar (Locked)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Plans */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Premium Plans
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              All Features Unlocked
            </p>
            <div className="space-y-4">
              {plans?.premium.map((plan) => (
                <div
                  key={plan.duration}
                  className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-200 text-white"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">
                          {plan.duration} Months
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold">₹{plan.price}</p>
                        <p className="text-xs sm:text-sm opacity-90">+₹1,500 vs Basic</p>
                      </div>
                      <button
                        onClick={() => handleSelectPlan('premium', plan.duration)}
                        className="w-full sm:w-auto bg-white text-purple-600 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition font-semibold shadow-md"
                      >
                        Select
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="flex-shrink-0" />
                        <span className="text-sm">All Basic Features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="flex-shrink-0" />
                        <span className="text-sm">Reports & Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="flex-shrink-0" />
                        <span className="text-sm">Staff Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="flex-shrink-0" />
                        <span className="text-sm">Customers/Udhar</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 py-8 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-center">Complete Payment</h2>
                <p className="text-blue-100 text-sm text-center mt-1">Scan QR or use UPI ID to pay</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Amount Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 text-center">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Amount to Pay</p>
                  <p className="text-5xl font-bold text-green-600">₹{paymentData.amount}</p>
                </div>

                {/* Two Column Layout for UPI and QR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* UPI ID Section */}
                  <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-semibold text-center">UPI ID</p>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-300 mb-3">
                      <p className="font-mono text-base font-bold text-gray-800 text-center break-all">
                        {paymentData.upi_id}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.upi_id);
                        alert('UPI ID copied!');
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      Copy UPI ID
                    </button>
                  </div>

                  {/* QR Code Section */}
                  <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
                    {paymentData.qr_code ? (
                      <>
                        <p className="text-sm text-gray-600 mb-3 font-semibold text-center">Scan QR Code</p>
                        <div className="flex justify-center">
                          <img 
                            src={paymentData.qr_code} 
                            alt="QR Code" 
                            className="w-48 h-48 border-4 border-gray-300 rounded-lg shadow-md"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 h-full flex items-center">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                          <p className="text-sm text-yellow-800">
                            QR Code not available. Please use the UPI ID to make payment.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 pt-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Upload Payment Proof</h3>
                  
                  {/* Screenshot Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Screenshot *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-gray-400 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <Upload className={screenshot ? "text-green-500" : "text-gray-400"} size={28} />
                        <span className={`font-medium ${screenshot ? "text-green-600" : "text-gray-600"}`}>
                          {screenshot ? '✓ Screenshot Uploaded' : 'Click to Upload Screenshot'}
                        </span>
                      </label>
                    </div>
                    {screenshot && (
                      <div className="mt-3 flex justify-center">
                        <img src={screenshot} alt="Preview" className="w-40 h-40 object-cover rounded-lg border-2 border-green-300 shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Transaction ID */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter UPI transaction ID"
                    />
                  </div>

                  {/* UPI Reference */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      UPI Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter UPI reference (optional)"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmitPayment}
                      disabled={submitting || !screenshot || !transactionId}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Payment'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setScreenshot(null);
                        setTransactionId('');
                        setUpiRef('');
                      }}
                      disabled={submitting}
                      className="px-8 bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-400 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
