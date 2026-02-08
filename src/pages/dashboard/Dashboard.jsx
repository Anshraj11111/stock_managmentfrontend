import { useState, useEffect } from 'react';
import { Package, Users, Receipt, TrendingUp, DollarSign, ArrowRight, BarChart3, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalBills: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { isOwner } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsResponse, reportsResponse] = await Promise.all([
        productService.getProducts(),
        reportService.getDailyReport(),
      ]);

      // Ensure data is properly extracted
      const products = Array.isArray(productsResponse) 
        ? productsResponse 
        : Array.isArray(productsResponse.data) 
          ? productsResponse.data 
          : [];
      
      const reportData = reportsResponse || {};

      // Calculate stats
      const totalProducts = products.length;
      const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;
      const totalSales = reportData.total_sales || 0;
      const totalBills = reportData.total_bills || 0;

      setStats({
        totalProducts,
        totalSales,
        totalBills,
        lowStockProducts,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Sales',
      value: `₹${Math.round(stats.totalSales).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Bills',
      value: stats.totalBills,
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="px-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl opacity-10"></div>
        <div className="relative px-6 py-4">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
            Welcome back!
          </h1>
          <p className="text-base text-secondary-600 dark:text-secondary-400">
            Here's an overview of your business performance today.
          </p>
        </div>
      </div>

      {/* Stats Grid - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {statCards.map((stat, index) => {
          const Stat = stat.icon;
          return (
            <div
              key={index}
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-800 dark:to-secondary-900 p-6 border border-secondary-200 dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {/* Background decoration */}
              <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Stat className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Enhanced with Navigation */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Products */}
          <button
            onClick={() => navigate('/products')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border border-blue-200 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-md hover:shadow-lg text-left"
          >
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                Products
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Manage inventory
              </p>
            </div>
          </button>

          {/* Create Bill */}
          <button
            onClick={() => navigate('/billing')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 shadow-md hover:shadow-lg text-left"
          >
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                Create Bill
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                New sales bill
              </p>
            </div>
          </button>

          {/* View Reports */}
          <button
            onClick={() => navigate('/reports')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200 dark:border-green-700 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 shadow-md hover:shadow-lg text-left"
          >
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                Reports
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Sales analytics
              </p>
            </div>
          </button>

          {/* Staff/Settings */}
          {isOwner ? (
            <button
              onClick={() => navigate('/staff')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 border border-orange-200 dark:border-orange-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 shadow-md hover:shadow-lg text-left"
            >
              <div className="relative z-10">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                  Staff
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Manage team
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/settings')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 border border-orange-200 dark:border-orange-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 shadow-md hover:shadow-lg text-left"
            >
              <div className="relative z-10">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                  Settings
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Preferences
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 border border-primary-200 dark:border-primary-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200 dark:bg-primary-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
          <div className="relative z-10">
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Inventory Status</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {stats.lowStockProducts} Low Stock
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Items below threshold
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200 dark:border-green-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 dark:bg-green-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
          <div className="relative z-10">
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Today's Sales</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              ₹{Math.round(stats.totalSales).toLocaleString()}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              from {stats.totalBills} bills
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border border-blue-200 dark:border-blue-700">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 dark:bg-blue-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
          <div className="relative z-10">
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Product Count</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {stats.totalProducts}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Active products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
