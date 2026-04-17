import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { checkFeatureAccess } from '../../services/subscriptionService';

const FeatureLock = ({ feature, children }) => {
  const [hasAccess, setHasAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      const response = await checkFeatureAccess(feature);
      setHasAccess(response.has_access);
      setReason(response.reason);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(true); // Default to allowing access on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white" size={40} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Feature Locked
          </h2>
          
          <p className="text-gray-600 mb-6">
            {reason || `Upgrade to Premium to access ${feature}`}
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Premium Features Include:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Reports & Analytics</li>
              <li>✅ Staff Management</li>
              <li>✅ Customers/Udhar</li>
              <li>✅ All Basic Features</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-semibold"
          >
            Upgrade to Premium
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default FeatureLock;
