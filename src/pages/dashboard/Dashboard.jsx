import { useState, useEffect } from 'react';
import { Package, Users, Receipt, TrendingUp, DollarSign, ArrowRight, BarChart3, Settings, ShoppingCart, AlertCircle, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../store/AuthContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalBills: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { isOwner, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsResponse, reportsResponse] = await Promise.all([
        productService.getProducts(),
        reportService.getDailyReport(),
      ]);

      const products = Array.isArray(productsResponse) 
        ? productsResponse 
        : Array.isArray(productsResponse.data) 
          ? productsResponse.data 
          : [];
      
      const reportData = reportsResponse || {};

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

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // const statCards = [
  //   {
  //     title: 'Total Revenue',
  //     value: `₹${Math.round(stats.totalSales).toLocaleString()}`,
  //     change: '+12.5%',
  //     changeType: 'positive',
  //     icon: DollarSign,
  //     gradient: 'from-emerald-500 to-teal-600',
  //     bgGradient: 'from-emerald-50 to-teal-50',
  //     iconBg: 'bg-emerald-100',
  //     iconColor: 'text-emerald-600',
  //   },
  //   {
  //     title: 'Total Orders',
  //     value: stats.totalBills,
  //     change: '+8.2%',
  //     changeType: 'positive',
  //     icon: ShoppingCart,
  //     gradient: 'from-blue-500 to-indigo-600',
  //     bgGradient: 'from-blue-50 to-indigo-50',
  //     iconBg: 'bg-blue-100',
  //     iconColor: 'text-blue-600',
  //   },
  //   {
  //     title: 'Products',
  //     value: stats.totalProducts,
  //     change: '+3.1%',
  //     changeType: 'positive',
  //     icon: Package,
  //     gradient: 'from-purple-500 to-pink-600',
  //     bgGradient: 'from-purple-50 to-pink-50',
  //     iconBg: 'bg-purple-100',
  //     iconColor: 'text-purple-600',
  //   },
  //   {
  //     title: 'Low Stock Alert',
  //     value: stats.lowStockProducts,
  //     change: 'Needs Attention',
  //     changeType: 'warning',
  //     icon: AlertCircle,
  //     gradient: 'from-orange-500 to-red-600',
  //     bgGradient: 'from-orange-50 to-red-50',
  //     iconBg: 'bg-orange-100',
  //     iconColor: 'text-orange-600',
  //   },
  // ];

  const statCards = [
  ...(isOwner
    ? [
        {
          title: t('dashboard.totalRevenue'),
          value: `₹${Math.round(stats.totalSales).toLocaleString()}`,
          change: '+12.5%',
          changeType: 'positive',
          icon: DollarSign,
          gradient: 'from-emerald-500 to-teal-600',
          bgGradient: 'from-emerald-50 to-teal-50',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
        },
      ]
    : []),

  {
    title: t('dashboard.totalOrders'),
    value: stats.totalBills,
    change: '+8.2%',
    changeType: 'positive',
    icon: ShoppingCart,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },

  {
    title: t('dashboard.products'),
    value: stats.totalProducts,
    change: '+3.1%',
    changeType: 'positive',
    icon: Package,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },

  ...(isOwner
    ? [
        {
          title: t('dashboard.lowStockAlert'),
          value: stats.lowStockProducts,
          change: t('dashboard.needsAttention'),
          changeType: 'warning',
          icon: AlertCircle,
          gradient: 'from-orange-500 to-red-600',
          bgGradient: 'from-orange-50 to-red-50',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
        },
      ]
    : []),
];


  // const quickActions = [
  //   {
  //     title: 'Create Bill',
  //     description: 'Generate new invoice',
  //     icon: Receipt,
  //     color: 'from-violet-500 to-purple-600',
  //     hoverColor: 'hover:from-violet-600 hover:to-purple-700',
  //     route: '/billing',
  //   },
  //   {
  //     title: 'Manage Products',
  //     description: 'Update inventory',
  //     icon: Package,
  //     color: 'from-blue-500 to-cyan-600',
  //     hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
  //     route: '/products',
  //   },
  //   {
  //     title: 'View Reports',
  //     description: 'Analytics & insights',
  //     icon: BarChart3,
  //     color: 'from-emerald-500 to-green-600',
  //     hoverColor: 'hover:from-emerald-600 hover:to-green-700',
  //     route: '/reports',
  //   },
  //   {
  //     title: isOwner ? 'Manage Staff' : 'Settings',
  //     description: isOwner ? 'Team management' : 'Account settings',
  //     icon: isOwner ? Users : Settings,
  //     color: 'from-pink-500 to-rose-600',
  //     hoverColor: 'hover:from-pink-600 hover:to-rose-700',
  //     route: isOwner ? '/staff' : '/settings',
  //   },
  // ];

const quickActions = [
  {
    title: t('dashboard.createBill'),
    description: t('dashboard.generateInvoice'),
    icon: Receipt,
    color: 'from-violet-500 to-purple-600',
    hoverColor: 'hover:from-violet-600 hover:to-purple-700',
    route: '/billing',
  },
  {
    title: t('dashboard.manageProducts'),
    description: t('dashboard.updateInventory'),
    icon: Package,
    color: 'from-blue-500 to-cyan-600',
    hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
    route: '/products',
  },

  ...(isOwner
    ? [
        {
          title: t('dashboard.viewReports'),
          description: t('dashboard.analyticsInsights'),
          icon: BarChart3,
          color: 'from-emerald-500 to-green-600',
          hoverColor: 'hover:from-emerald-600 hover:to-green-700',
          route: '/reports',
        },
        {
          title: t('dashboard.manageStaff'),
          description: t('dashboard.teamManagement'),
          icon: Users,
          color: 'from-pink-500 to-rose-600',
          hoverColor: 'hover:from-pink-600 hover:to-rose-700',
          route: '/staff',
        },
      ]
    : []),
];


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {t('dashboard.welcomeBack')}, {user?.name}!
                  </h1>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {getCurrentDate()}
                  </p>
                </div>
              </div>
              <p className="text-white/90 text-sm sm:text-base">
                {t('dashboard.happeningToday')}
              </p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/30 flex-shrink-0">
              <p className="text-white/80 text-xs sm:text-sm mb-1">{t('dashboard.todaysPerformance')}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-xl sm:text-2xl font-bold text-white">+15.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`${stat.iconBg} dark:bg-secondary-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor} dark:text-secondary-300`} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                
                <h3 className="text-secondary-600 dark:text-secondary-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">{stat.title}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">{stat.value}</p>
                
                <div className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                  <Activity className="w-3 h-3" />
                  <span>{t('dashboard.vsLastMonth')}</span>
                </div>
              </div>

              {/* Hover effect line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100">{t('dashboard.quickActions')}</h2>
          <div className="h-1 flex-1 ml-0 sm:ml-6 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.color} ${action.hoverColor} p-4 sm:p-6 text-left transition-all duration-500 hover:shadow-2xl hover:scale-105 transform`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl w-fit mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{action.title}</h3>
                  <p className="text-white/80 text-sm">{action.description}</p>
                  
                  <div className="mt-3 sm:mt-4 flex items-center text-white/90 text-sm font-medium">
                    <span>{t('dashboard.getStarted')}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    

    
      {/* Bottom Stats Section */}
      {isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Status */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                  <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{t('dashboard.inventoryStatus')}</h3>
              </div>
              <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                {stats.lowStockProducts}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('dashboard.itemsNeedRestocking')}</p>
              <button 
                onClick={() => navigate('/products')}
                className="mt-4 text-amber-600 dark:text-amber-400 font-medium text-sm hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 group"
              >
                {t('dashboard.viewDetails')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{t('dashboard.todaysSales')}</h3>
              </div>
              <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                ₹{Math.round(stats.totalSales).toLocaleString()}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('dashboard.fromTransactions', { count: stats.totalBills })}</p>
              <button 
                onClick={() => navigate('/reports')}
                className="mt-4 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group"
              >
                {t('dashboard.viewReports')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Product Count */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{t('dashboard.totalProducts')}</h3>
              </div>
              <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                {stats.totalProducts}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">{t('dashboard.activeInInventory')}</p>
              <button 
                onClick={() => navigate('/products')}
                className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
              >
                {t('dashboard.manageProducts')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Dashboard;
