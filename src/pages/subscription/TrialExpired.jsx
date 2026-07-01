import { AlertCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrialExpired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-500 w-24 h-24 rounded-full flex items-center justify-center">
            <AlertCircle className="text-white" size={56} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Trial Period Expired
        </h1>

        {/* Message */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
            Your 31-day free trial has ended. To continue using the app, please pay a refundable deposit of <span className="font-bold text-2xl text-blue-600">₹100</span>.
          </p>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Important Information:</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Deposit Amount: <strong>₹100</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span><strong>100% Refundable</strong> after 2 months of subscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Unlock all features after payment verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-500/10 dark:to-blue-500/10 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-500">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-center">
            Contact Us to Make Payment
          </h3>
          <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-300">
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-700 transition shadow-lg"
          >
            View Subscription Plans
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-4 rounded-xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
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
