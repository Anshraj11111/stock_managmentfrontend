import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, DollarSign, Package, TrendingUp, Activity } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/adminService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader size="lg" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      subtitle: `${stats?.users?.active || 0} active`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600',
      link: '/admin/users'
    },
    {
      title: 'Total Shops',
      value: stats?.shops?.total || 0,
      subtitle: `${stats?.shops?.active || 0} active`,
      icon: Store,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600',
      link: '/admin/shops'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.revenue?.total?.toFixed(2) || 0}`,
      subtitle: `₹${stats?.revenue?.monthly?.toFixed(2) || 0} this month`,
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600',
      link: '/admin/analytics'
    },
    {
      title: 'Active Subscriptions',
      value: stats?.subscriptions?.active || 0,
      subtitle: `${stats?.subscriptions?.trial || 0} on trial`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600',
      link: '/admin/subscriptions'
    },
    {
      title: 'Total Products',
      value: stats?.counts?.products || 0,
      subtitle: 'Across all shops',
      icon: Package,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600',
      link: '/admin/shops'
    },
    {
      title: 'Total Staff',
      value: stats?.counts?.staff || 0,
      subtitle: 'Staff members',
      icon: Activity,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600',
      link: '/admin/users'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your platform statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.link)}
              className={`${card.bgColor} rounded-xl p-6 border border-secondary-200 dark:border-secondary-800 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(card.link);
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 group-hover:scale-105 transition-transform">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-3 ${card.color} rounded-lg group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm ${card.textColor} font-medium`}>
                {card.subtitle}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Revenue Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                <span className="font-bold text-secondary-900 dark:text-secondary-100">
                  ₹{stats?.revenue?.total?.toFixed(2) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Monthly Revenue:</span>
                <span className="font-bold text-blue-600">
                  ₹{stats?.revenue?.monthly?.toFixed(2) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Today's Revenue:</span>
                <span className="font-bold text-blue-600">
                  ₹{stats?.revenue?.today?.toFixed(2) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* User & Shop Stats */}
          <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Platform Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
                <span className="font-bold text-blue-600">
                  {stats?.users?.active || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Inactive Users:</span>
                <span className="font-bold text-red-600">
                  {stats?.users?.inactive || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Trial Shops:</span>
                <span className="font-bold text-orange-600">
                  {stats?.shops?.trial || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Expired Shops:</span>
                <span className="font-bold text-gray-600 dark:text-gray-400">
                  {stats?.shops?.expired || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
