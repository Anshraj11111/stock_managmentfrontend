
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

const Products = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.role?.toLowerCase() === "owner";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showValueTooltip, setShowValueTooltip] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch {
      toast.error(t('products.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        toast.success(t('products.productUpdated'));
      } else {
        await productService.addProduct(formData);
        toast.success(t('products.productAdded'));
      }

      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || t('products.operationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;

    try {
      await productService.deleteProduct(productId);
      toast.success(t('products.productDeleted'));
      fetchProducts();
    } catch {
      toast.error(t('products.fetchFailed'));
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        product_name: '',
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return {
        label: t('products.outOfStock'),
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: AlertCircle,
      };
    if (quantity < 10)
      return {
        label: t('products.lowStock'),
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        icon: TrendingDown,
      };
    return {
      label: t('products.inStock'),
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      icon: TrendingUp,
    };
  };

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock_quantity < 10).length,
    outOfStock: products.filter((p) => p.stock_quantity === 0).length,
    totalValue: products.reduce(
      (sum, p) => sum + p.selling_price * p.stock_quantity,
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('products.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('products.subtitle')}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{t('products.addProduct')}</span>
            <span className="sm:hidden">{t('common.add')}</span>
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100">{stats.total}</p>
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-1">{t('products.totalProducts')}</p>
        </div>

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400 mb-2" />
          <p className="text-xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100">{stats.lowStock}</p>
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-1">{t('products.lowStockItems')}</p>
        </div>

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 mb-2" />
          <p className="text-xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100">{stats.outOfStock}</p>
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-1">{t('products.outOfStock')}</p>
        </div>

        {isOwner && (
          <div 
            className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all relative"
            onClick={() => setShowValueTooltip(!showValueTooltip)}
          >
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
            <p className="text-xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 truncate">
              ₹{Math.round(stats.totalValue).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-1">{t('products.inventoryValue')}</p>
            
            {showValueTooltip && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-secondary-900 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl p-4 shadow-xl z-10 animate-in slide-in-from-top-2">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold mb-1">{t('products.exactInventoryValue')}:</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-300 break-all">
                  ₹{Math.round(stats.totalValue).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.productName')}</th>
                {isOwner && <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.purchasePrice')}</th>}
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.sellingPrice')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.stock')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.status')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.actions')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock_quantity);
                const StatusIcon = status.icon;

                return (
                  <tr key={product.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">{product.product_name}</td>
                    {isOwner && <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">₹{product.purchase_price}</td>}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">₹{product.selling_price}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">{product.stock_quantity}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm ${status.color}`}>
                        <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{status.label}</span>
                        <span className="sm:hidden">{status.label.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3">
                      <button onClick={() => openModal(product)}>
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" />
                      </button>
                      {isOwner && (
                        <button onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 w-full max-w-md rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-secondary-900 dark:text-secondary-100">
              {editingProduct ? t('products.editProduct') : t('products.addProduct')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t('products.productName')}
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                required
              />

              {isOwner && (
                <input
                  type="number"
                  placeholder={t('products.purchasePrice')}
                  value={formData.purchase_price}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_price: e.target.value })
                  }
                  className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              )}

              <input
                type="number"
                placeholder={t('products.sellingPrice')}
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value })
                }
                className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                required
              />

              <input
                type="number"
                placeholder={t('products.stockQuantity')}
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
                className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                required
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 sm:py-3 bg-secondary-200 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 rounded-xl font-medium hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? t('products.saving') : (editingProduct ? t('common.update') : t('products.addProduct'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
