import { useState, useEffect } from 'react';
import { TrendingUp, Users, Store, DollarSign, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/adminService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [conversionData, setConversionData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch overview data
      const overviewResponse = await adminService.getAnalytics('overview', period);
      
      // Fetch conversion data
      const conversionResponse = await adminService.getAnalytics('conversion', period);
      
      if (overviewResponse.success) {
        setAnalyticsData(overviewResponse.data);
      }
      
      if (conversionResponse.success) {
        setConversionData(conversionResponse.data);
      }
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (data) => {
    if (!data || data.length < 2) return { value: 0, isPositive: true };
    
    const latest = data[data.length - 1]?.count || data[data.length - 1]?.total || 0;
    const previous = data[data.length - 2]?.count || data[data.length - 2]?.total || 0;
    
    if (previous === 0) return { value: 0, isPositive: true };
    
    const change = ((latest - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  const getTotalCount = (data) => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + (parseInt(item.count) || parseInt(item.total) || 0), 0);
  };

  const formatPeriodLabel = (period) => {
    if (!period) return '';
    
    // Handle different period formats
    if (period.includes('-')) {
      // Monthly format: "2026-02"
      const [year, month] = period.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    
    return period;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Platform growth and performance metrics
            </p>
          </div>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="daily">Last 30 Days</option>
            <option value="weekly">Last 90 Days</option>
            <option value="monthly">Last 12 Months</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* User Signups */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  {analyticsData?.users && (() => {
                    const trend = calculateTrend(analyticsData.users);
                    return (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        trend.isPositive ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {trend.value}%
                      </div>
                    );
                  })()}
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                  {analyticsData?.users ? getTotalCount(analyticsData.users) : 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  User Signups
                </p>
              </div>

              {/* Shop Growth */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  {analyticsData?.shops && (() => {
                    const trend = calculateTrend(analyticsData.shops);
                    return (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        trend.isPositive ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {trend.value}%
                      </div>
                    );
                  })()}
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                  {analyticsData?.shops ? getTotalCount(analyticsData.shops) : 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New Shops
                </p>
              </div>

              {/* Revenue */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  {analyticsData?.revenue && (() => {
                    const trend = calculateTrend(analyticsData.revenue);
                    return (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        trend.isPositive ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {trend.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {trend.value}%
                      </div>
                    );
                  })()}
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                  ₹{analyticsData?.revenue ? getTotalCount(analyticsData.revenue).toLocaleString() : 0}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
              </div>

              {/* Conversion Rate */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-600 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                  {conversionData?.conversion_rate || 0}%
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Signups Chart */}
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800">
                <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Signups Trend
                </h3>
                <div className="space-y-2">
                  {analyticsData?.users && analyticsData.users.length > 0 ? (
                    analyticsData.users.slice(-10).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 w-24">
                          {formatPeriodLabel(item.period)}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-secondary-800 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2 text-xs text-white font-semibold"
                            style={{
                              width: `${Math.min((parseInt(item.count) / Math.max(...analyticsData.users.map(u => parseInt(u.count)))) * 100, 100)}%`
                            }}
                          >
                            {item.count > 0 && item.count}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data available</p>
                  )}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800">
                <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Revenue Growth
                </h3>
                <div className="space-y-2">
                  {analyticsData?.revenue && analyticsData.revenue.length > 0 ? (
                    analyticsData.revenue.slice(-10).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 w-24">
                          {formatPeriodLabel(item.period)}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-secondary-800 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2 text-xs text-white font-semibold"
                            style={{
                              width: `${Math.min((parseFloat(item.total) / Math.max(...analyticsData.revenue.map(r => parseFloat(r.total) || 0))) * 100, 100)}%`
                            }}
                          >
                            {item.total > 0 && `₹${parseFloat(item.total).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Growth Chart */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800">
              <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                Shop Growth Trend
              </h3>
              <div className="space-y-2">
                {analyticsData?.shops && analyticsData.shops.length > 0 ? (
                  analyticsData.shops.slice(-10).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 w-24">
                        {formatPeriodLabel(item.period)}
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-secondary-800 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full flex items-center justify-end pr-2 text-xs text-white font-semibold"
                          style={{
                            width: `${Math.min((parseInt(item.count) / Math.max(...analyticsData.shops.map(s => parseInt(s.count)))) * 100, 100)}%`
                          }}
                        >
                          {item.count > 0 && item.count}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data available</p>
                )}
              </div>
            </div>

            {/* Conversion Details */}
            {conversionData && (
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 border border-secondary-200 dark:border-secondary-800">
                <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  Trial to Paid Conversion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{conversionData.trial_count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Trial Shops</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{conversionData.paid_count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Paid Shops</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">{conversionData.conversion_rate}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Conversion Rate</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
