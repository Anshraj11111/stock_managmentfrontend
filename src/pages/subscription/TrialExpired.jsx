import { AlertCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrialExpired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 w-24 h-24 rounded-full flex items-center justify-center">
            <AlertCircle className="text-white" size={56} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Trial Period Expired
        </h1>

        {/* Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
            Your 31-day free trial has ended. To continue using the app, please pay a refundable deposit of <span className="font-bold text-2xl text-green-600">₹100</span>.
          </p>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Important Information:</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Deposit Amount: <strong>₹100</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>100% Refundable</strong> after 2 months of subscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Unlock all features after payment verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-center">
            Contact Us to Make Payment
          </h3>
          <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400">
            <Phone size={24} />
            <a 
              href="tel:+918269858259" 
              className="text-2xl font-bold hover:underline"
            >
              +91-8269858259
            </a>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Call or WhatsApp for payment details
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/subscription')}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
          >
            View Subscription Plans
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back to Login
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Once payment is verified by admin, you can continue using all features
        </p>
      </div>
    </div>
  );
};

export default TrialExpired;
