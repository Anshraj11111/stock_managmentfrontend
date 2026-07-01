import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Upload, 
  Save, 
  CheckCircle,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { 
  getAdminSettings, 
  updateAdminSettings,
  getPendingPayments,
  verifyPayment 
} from '../services/subscriptionService';
import AdminLayout from '../components/AdminLayout';

const AdminSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [qrPreview, setQrPreview] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settings, payments] = await Promise.all([
        getAdminSettings(),
        getPendingPayments()
      ]);
      
      setUpiId(settings.settings.upi_id || '');
      setQrPreview(settings.settings.qr_code);
      setPendingPayments(payments.payments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!upiId) {
      showMessage('error', 'Please enter UPI ID');
      return;
    }

    try {
      setSaving(true);
      const response = await updateAdminSettings(upiId, null);
      setQrPreview(response.qr_code); // Set the auto-generated QR code
      showMessage('success', 'Settings saved and QR code generated!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      await verifyPayment(paymentId, status, status === 'approved' ? 'Payment verified' : 'Payment rejected');
      showMessage('success', `Payment ${status}!`);
      fetchData(); // Refresh data
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error verifying payment:', error);
      showMessage('error', 'Failed to verify payment');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage UPI settings and verify payments</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-blue-50 text-blue-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* UPI Settings Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">UPI Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="8269858259@ybl"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  QR code will be auto-generated from this UPI ID
                </p>
              </div>

              {qrPreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated QR Code
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img 
                      src={qrPreview} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Generating QR...' : 'Save & Generate QR'}
              </button>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-100 p-3 rounded-lg">
                <QrCode className="text-orange-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Pending Payments ({pendingPayments.length})
              </h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending payments
                </div>
              ) : (
                pendingPayments.map((payment) => (
                  <div
                    key={payment.payment_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {payment.shop_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {payment.plan_name} - ₹{payment.amount}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <p>Transaction ID: {payment.transaction_id || 'N/A'}</p>
                      <p>Submitted: {new Date(payment.submitted_at).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        View Screenshot
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(payment.payment_id, 'approved')}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(payment.payment_id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Screenshot Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Screenshot</h2>
              
              <div className="mb-4">
                <p className="text-gray-600">Shop: {selectedPayment.shop_name}</p>
                <p className="text-gray-600">Amount: ₹{selectedPayment.amount}</p>
                <p className="text-gray-600">Transaction ID: {selectedPayment.transaction_id}</p>
              </div>

              {selectedPayment.screenshot ? (
                <img 
                  src={selectedPayment.screenshot} 
                  alt="Payment Screenshot" 
                  className="w-full max-h-96 object-contain border-2 border-gray-300 rounded-lg mb-4"
                />
              ) : (
                <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500 mb-4">
                  No screenshot available
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerifyPayment(selectedPayment.payment_id, 'approved')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Approve Payment
                </button>
                <button
                  onClick={() => handleVerifyPayment(selectedPayment.payment_id, 'rejected')}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Reject Payment
                </button>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubscription;
