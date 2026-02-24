import { useState, useEffect } from 'react';
import { Search, Ban, Clock, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Calendar, Package, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/adminService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [extendDays, setExtendDays] = useState(30);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [shopProducts, setShopProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchShops();
  }, [page, search, status]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await adminService.getShops(page, limit, search, status);
      if (response.success) {
        setShops(response.shops);
        setTotal(response.total);
        setTotalPages(response.pages);
      }
    } catch (error) {
      toast.error('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id, currentSuspendStatus) => {
    const action = currentSuspendStatus ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this shop?`)) {
      return;
    }

    try {
      const response = await adminService.suspendShop(id);
      if (response.success) {
        toast.success(response.message || `Shop ${action}ed successfully`);
        fetchShops();
      }
    } catch (error) {
      toast.error(`Failed to ${action} shop`);
    }
  };

  const handleToggleSubscription = async (id, currentStatus) => {
    try {
      const response = await adminService.updateSubscription(id, !currentStatus);
      if (response.success) {
        toast.success(`Subscription ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchShops();
      }
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedShop || extendDays === 0) {
      toast.error('Please enter valid number of days');
      return;
    }

    try {
      const response = await adminService.extendTrial(selectedShop.id, extendDays);
      if (response.success) {
        if (extendDays > 0) {
          toast.success(`Trial extended by ${extendDays} days`);
        } else {
          toast.success(`Trial reduced by ${Math.abs(extendDays)} days`);
        }
        setShowExtendModal(false);
        setSelectedShop(null);
        setExtendDays(30);
        fetchShops();
      }
    } catch (error) {
      toast.error('Failed to update trial period');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleShowProducts = async (shop) => {
    setSelectedShop(shop);
    setShowProductsModal(true);
    setLoadingProducts(true);
    
    try {
      const response = await adminService.getShopProducts(shop.id);
      if (response.success) {
        setShopProducts(response.products);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Products error:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const closeProductsModal = () => {
    setShowProductsModal(false);
    setSelectedShop(null);
    setShopProducts([]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Shop Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all shops and subscriptions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by shop name..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={handleStatusChange}
              className="px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="trial">Trial</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {shops.length} of {total} shops
          </div>
        </div>

        {/* Shops Table */}
        <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No shops found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Trial End
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {shops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-gray-50 dark:hover:bg-secondary-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-secondary-900 dark:text-secondary-100">
                            {shop.shop_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-secondary-900 dark:text-secondary-100">
                              {shop.owner_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {shop.owner_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            shop.plan_type === 'trial'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {shop.plan_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(shop.trial_end_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-900 dark:text-gray-100">
                            {shop.total_products} products
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {shop.total_staff} staff
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            shop.subscription_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {shop.subscription_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleShowProducts(shop)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                              title="Show Products"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleSubscription(shop.id, shop.subscription_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                shop.subscription_active
                                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              }`}
                              title={shop.subscription_active ? 'Deactivate' : 'Activate'}
                            >
                              {shop.subscription_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedShop(shop);
                                setShowExtendModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Extend Trial"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSuspend(shop.id, shop.isSuspended)}
                              className={`p-2 rounded-lg transition-colors ${
                                shop.isSuspended
                                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              }`}
                              title={shop.isSuspended ? 'Unsuspend' : 'Suspend'}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-secondary-200 dark:divide-secondary-700">
                {shops.map((shop) => (
                  <div key={shop.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-secondary-900 dark:text-secondary-100">
                          {shop.shop_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {shop.owner_name}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        shop.subscription_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {shop.subscription_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Plan:</span>
                        <span className="ml-2 text-secondary-900 dark:text-secondary-100">{shop.plan_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Trial End:</span>
                        <span className="ml-2 text-secondary-900 dark:text-secondary-100">{formatDate(shop.trial_end_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Products:</span>
                        <span className="ml-2 text-secondary-900 dark:text-secondary-100">{shop.total_products}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Staff:</span>
                        <span className="ml-2 text-secondary-900 dark:text-secondary-100">{shop.total_staff}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleShowProducts(shop)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        Products
                      </button>
                      <button
                        onClick={() => handleToggleSubscription(shop.id, shop.subscription_active)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          shop.subscription_active
                            ? 'text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                            : 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                        }`}
                      >
                        {shop.subscription_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {shop.subscription_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedShop(shop);
                          setShowExtendModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Extend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Extend Trial Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Manage Trial Period
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Shop: <span className="font-semibold text-secondary-900 dark:text-secondary-100">{selectedShop?.shop_name}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Current Trial End: <span className="font-medium text-secondary-900 dark:text-secondary-100">{formatDate(selectedShop?.trial_end_date)}</span>
            </p>

            {/* Quick Action Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-3">
                Quick Actions
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExtendDays(7)}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                >
                  +7 Days
                </button>
                <button
                  onClick={() => setExtendDays(15)}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                >
                  +15 Days
                </button>
                <button
                  onClick={() => setExtendDays(30)}
                  className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium"
                >
                  +30 Days
                </button>
                <button
                  onClick={() => setExtendDays(60)}
                  className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium"
                >
                  +60 Days
                </button>
                <button
                  onClick={() => setExtendDays(-7)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
                >
                  -7 Days
                </button>
                <button
                  onClick={() => setExtendDays(-15)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
                >
                  -15 Days
                </button>
              </div>
            </div>

            {/* Custom Days Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                Custom Days (use negative for reduction)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter days (e.g., 30 or -7)"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {extendDays > 0 ? `Trial will be extended by ${extendDays} days` : extendDays < 0 ? `Trial will be reduced by ${Math.abs(extendDays)} days` : 'Enter number of days'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedShop(null);
                  setExtendDays(30);
                }}
                className="flex-1 px-4 py-2 border border-secondary-300 dark:border-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendTrial}
                disabled={extendDays === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extendDays > 0 ? 'Extend Trial' : 'Reduce Trial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Modal */}
      {showProductsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-800">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                  <Package className="w-6 h-6 text-indigo-600" />
                  Shop Products
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {selectedShop?.shop_name}
                </p>
              </div>
              <button
                onClick={closeProductsModal}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : shopProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No products found</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">This shop hasn't added any products yet</p>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Products</p>
                      <p className="text-2xl font-bold text-blue-600">{shopProducts.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Stock</p>
                      <p className="text-2xl font-bold text-green-600">
                        {shopProducts.reduce((sum, p) => sum + p.stock_quantity, 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Profit Margin</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {(shopProducts.reduce((sum, p) => sum + parseFloat(p.profit_margin), 0) / shopProducts.length).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Product Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Purchase Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Selling Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Profit
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Margin
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Stock
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                          {shopProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-secondary-800">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-medium text-secondary-900 dark:text-secondary-100">
                                  {product.product_name}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                ₹{product.purchase_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                ₹{product.selling_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`font-semibold ${
                                  product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ₹{product.profit.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.profit_margin >= 20
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : product.profit_margin >= 10
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {product.profit_margin}%
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.stock_quantity > 10
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : product.stock_quantity > 0
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {product.stock_quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-secondary-200 dark:divide-secondary-700">
                      {shopProducts.map((product) => (
                        <div key={product.id} className="p-4 space-y-3">
                          <div className="font-medium text-secondary-900 dark:text-secondary-100">
                            {product.product_name}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Purchase:</span>
                              <span className="ml-2 text-secondary-900 dark:text-secondary-100">₹{product.purchase_price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Selling:</span>
                              <span className="ml-2 text-secondary-900 dark:text-secondary-100">₹{product.selling_price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                              <span className={`ml-2 font-semibold ${
                                product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ₹{product.profit.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Margin:</span>
                              <span className="ml-2 text-secondary-900 dark:text-secondary-100">{product.profit_margin}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                              <span className="ml-2 text-secondary-900 dark:text-secondary-100">{product.stock_quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary-200 dark:border-secondary-800">
              <button
                onClick={closeProductsModal}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminShops;
