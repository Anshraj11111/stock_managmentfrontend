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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center">
          <div className="bg-blue-600 dark:bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white" size={40} />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Feature Locked
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {reason || `Upgrade to Premium to access ${feature}`}
          </p>

          <div className="bg-blue-50 dark:bg-emerald-950/30 border border-blue-200 dark:border-blue-600 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Premium Features Include:</strong>
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>✅ Reports & Analytics</li>
              <li>✅ Staff Management</li>
              <li>✅ Customers/Udhar</li>
              <li>✅ All Basic Features</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition flex items-center justify-center gap-2 font-semibold"
          >
            Upgrade to Premium
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
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
