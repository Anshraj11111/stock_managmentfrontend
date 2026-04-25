
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { shopService } from '../../services/shopService';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

const Products = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isOwner = user?.role?.toLowerCase() === "owner";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showValueTooltip, setShowValueTooltip] = useState(false);
  const [shopCategory, setShopCategory] = useState('');

  const [formData, setFormData] = useState({
    product_name: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    stock_unit: 'pieces',
    low_stock_threshold: 10,
    storage_location: '',
    expiry_date: '',
    date_added: '', // ✅ Empty by default - owner will set manually
    sub_category: '',
    size: '',
    brand_name: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    sub_category: '',
    size: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchShopCategory();
  }, []);

  // Filter products based on search query from URL
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && products.length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(product => 
        product.product_name.toLowerCase().includes(query) ||
        (product.storage_location && product.storage_location.toLowerCase().includes(query))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

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

  const fetchShopCategory = async () => {
    try {
      const shopData = await shopService.getShopDetails();
      setShopCategory(shopData.category || '');
    } catch (error) {
      console.error('Failed to fetch shop category:', error);
      // Don't show error toast as this is a background operation
      // Products page will still work without category info
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate clothes-specific required fields
    if (shopCategory === 'clothes') {
      const errors = {
        sub_category: '',
        size: '',
      };

      if (!formData.sub_category) {
        errors.sub_category = t('products.subCategoryRequired');
      }

      if (!formData.size) {
        errors.size = t('products.sizeRequired');
      }

      // If there are validation errors, display them and prevent submission
      if (errors.sub_category || errors.size) {
        setValidationErrors(errors);
        setSubmitting(false);
        toast.error(t('products.validationFailed'));
        return;
      }
    }

    // Clear validation errors if validation passes
    setValidationErrors({
      sub_category: '',
      size: '',
    });

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
      setFormData({
        ...product,
        stock_unit: product.stock_unit || 'pieces',
        low_stock_threshold: product.low_stock_threshold || 10,
        storage_location: product.storage_location || '',
        expiry_date: product.expiry_date || '',
        date_added: product.date_added || '', // ✅ Load existing date
        sub_category: product.sub_category || '',
        size: product.size || '',
        brand_name: product.brand_name || '',
      });
    } else {
      setEditingProduct(null);
      // Auto-populate date_added with current date for new clothes products
      const currentDate = shopCategory === 'clothes' 
        ? new Date().toISOString().split('T')[0] 
        : '';
      
      setFormData({
        product_name: '',
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
        stock_unit: 'pieces',
        low_stock_threshold: 10,
        storage_location: '',
        expiry_date: '',
        date_added: currentDate, // ✅ Auto-populate for new clothes products
        sub_category: '',
        size: '',
        brand_name: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setValidationErrors({
      sub_category: '',
      size: '',
    });
  };

  const getStockStatus = (quantity, threshold = 10) => {
    // Parse quantity if it's a string like "10 kg"
    const numericQuantity = typeof quantity === 'string' 
      ? parseFloat(quantity.replace(/[^0-9.]/g, '')) || 0
      : quantity;

    if (numericQuantity === 0)
      return {
        label: t('products.outOfStock'),
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: AlertCircle,
      };
    if (numericQuantity < threshold)
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
    lowStock: products.filter((p) => {
      const qty = typeof p.stock_quantity === 'string' 
        ? parseFloat(p.stock_quantity.replace(/[^0-9.]/g, '')) || 0
        : p.stock_quantity;
      const threshold = p.low_stock_threshold || 10;
      return qty < threshold && qty > 0;
    }).length,
    outOfStock: products.filter((p) => {
      const qty = typeof p.stock_quantity === 'string' 
        ? parseFloat(p.stock_quantity.replace(/[^0-9.]/g, '')) || 0
        : p.stock_quantity;
      return qty === 0;
    }).length,
    totalValue: products.reduce((sum, p) => {
      const qty = typeof p.stock_quantity === 'string' 
        ? parseFloat(p.stock_quantity.replace(/[^0-9.]/g, '')) || 0
        : p.stock_quantity;
      return sum + p.selling_price * qty;
    }, 0),
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
            {searchParams.get('search') 
              ? `Showing results for "${searchParams.get('search')}" (${filteredProducts.length} found)`
              : t('products.subtitle')
            }
          </p>
        </div>

        <div className="flex gap-3">
          {searchParams.get('search') && (
            <button
              onClick={() => {
                window.history.pushState({}, '', '/products');
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base"
            >
              Clear Search
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('products.addProduct')}</span>
              <span className="sm:hidden">{t('common.add')}</span>
            </button>
          )}
        </div>
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
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-300 mb-2" />
            <p className="text-xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 truncate">
              ₹{Math.round(stats.totalValue).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mt-1">{t('products.inventoryValue')}</p>
            
            {showValueTooltip && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-secondary-900 border-2 border-emerald-300 dark:border-emerald-500 rounded-xl p-4 shadow-xl z-10 animate-in slide-in-from-top-2">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold mb-1">{t('products.exactInventoryValue')}:</p>
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
                {shopCategory === 'clothes' && (
                  <>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.subCategory')}</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.size')}</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.brandName')}</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">Date Added</th>
                  </>
                )}
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">Storage Location</th>
                {shopCategory !== 'clothes' && <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">Date Added</th>}
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">Expiry Date</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.status')}</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300">{t('products.actions')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={shopCategory === 'clothes' ? (isOwner ? 13 : 12) : (isOwner ? 9 : 8)} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="w-12 h-12 text-secondary-400 dark:text-secondary-600" />
                      <p className="text-lg font-semibold text-secondary-700 dark:text-secondary-300">
                        {searchParams.get('search') 
                          ? `No products found for "${searchParams.get('search')}"`
                          : 'No products available'
                        }
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {searchParams.get('search') 
                          ? 'Try searching with a different keyword'
                          : 'Add your first product to get started'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock_quantity, product.low_stock_threshold || 10);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={product.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">{product.product_name}</td>
                      {isOwner && <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">₹{product.purchase_price}</td>}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">₹{product.selling_price}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">
                        {product.stock_quantity} {product.stock_unit || ''}
                      </td>
                      {shopCategory === 'clothes' && (
                        <>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                            {product.sub_category ? t(`products.${product.sub_category}`) : '-'}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                            {product.size || '-'}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                            {product.brand_name || '-'}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                            {product.date_added ? new Date(product.date_added).toLocaleDateString('en-GB') : '-'}
                          </td>
                        </>
                      )}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                        {product.storage_location || '-'}
                      </td>
                      {shopCategory !== 'clothes' && (
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                          {product.date_added ? new Date(product.date_added).toLocaleDateString('en-GB') : '-'}
                        </td>
                      )}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
                        {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('en-GB') : '-'}
                      </td>
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
                })
              )}
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

              {/* Stock Quantity with Unit */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Stock Quantity (e.g., 10, 5.5)"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
                
                <select
                  value={formData.stock_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_unit: e.target.value })
                  }
                  className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kg</option>
                  <option value="grams">Grams</option>
                  <option value="liters">Liters</option>
                  <option value="ml">ML</option>
                  <option value="meters">Meters</option>
                  <option value="cm">CM</option>
                  <option value="boxes">Boxes</option>
                  <option value="packets">Packets</option>
                  <option value="bottles">Bottles</option>
                </select>
              </div>

              {/* Low Stock Threshold */}
              {isOwner && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    placeholder="Alert when stock falls below (e.g., 10)"
                    value={formData.low_stock_threshold}
                    onChange={(e) =>
                      setFormData({ ...formData, low_stock_threshold: e.target.value })
                    }
                    className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    You'll be alerted when stock falls below this number
                  </p>
                </div>
              )}

              {/* Storage Location */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                  Storage Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rack A-5, Godown 2, Section B12"
                  value={formData.storage_location}
                  onChange={(e) =>
                    setFormData({ ...formData, storage_location: e.target.value })
                  }
                  className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Where is this product stored? (Rack/Godown/Section)
                </p>
              </div>

              {/* ✅ Expiry Date (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                  className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  ⏰ For products with expiration dates (food, medicine, etc.)
                </p>
              </div>

              {/* ✅ Date Added - Conditional for Clothes Category */}
              {shopCategory === 'clothes' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                    Date Added
                  </label>
                  <input
                    type="date"
                    value={formData.date_added}
                    readOnly
                    disabled
                    className="w-full border border-secondary-300 dark:border-secondary-700 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 px-3 sm:px-4 py-2 sm:py-3 rounded-xl cursor-not-allowed text-sm sm:text-base"
                  />
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    📅 {editingProduct 
                      ? 'Date when this product was originally added (read-only)' 
                      : 'Auto-populated with current date (read-only)'}
                  </p>
                </div>
              )}

              {/* Clothes-specific fields - Conditional rendering */}
              {shopCategory === 'clothes' && (
                <>
                  {/* Sub-category dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                      {t('products.subCategory')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={(e) => {
                        setFormData({ ...formData, sub_category: e.target.value });
                        // Clear validation error when user selects a value
                        if (e.target.value) {
                          setValidationErrors({ ...validationErrors, sub_category: '' });
                        }
                      }}
                      className={`w-full border ${validationErrors.sub_category ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-700'} bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base`}
                    >
                      <option value="">{t('products.selectSubCategory')}</option>
                      <option value="women">{t('products.women')}</option>
                      <option value="men">{t('products.men')}</option>
                      <option value="child">{t('products.child')}</option>
                      <option value="girl">{t('products.girl')}</option>
                      <option value="boy">{t('products.boy')}</option>
                    </select>
                    {validationErrors.sub_category && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {validationErrors.sub_category}
                      </p>
                    )}
                    {!validationErrors.sub_category && (
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                        Required for clothes products
                      </p>
                    )}
                  </div>

                  {/* Size dropdown with custom option */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                      {t('products.size')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="size"
                      value={formData.size === '' || ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(formData.size) ? formData.size : 'custom'}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setFormData({ ...formData, size: '' });
                        } else {
                          setFormData({ ...formData, size: e.target.value });
                          // Clear validation error when user selects a value
                          if (e.target.value) {
                            setValidationErrors({ ...validationErrors, size: '' });
                          }
                        }
                      }}
                      className={`w-full border ${validationErrors.size ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-700'} bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base`}
                    >
                      <option value="">{t('products.selectSize')}</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                      <option value="custom">{t('products.customSize')}</option>
                    </select>
                    {(formData.size === '' || (formData.size !== '' && !['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(formData.size))) && (
                      <input
                        type="text"
                        placeholder={t('products.enterCustomSize')}
                        value={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(formData.size) ? '' : formData.size}
                        onChange={(e) => {
                          setFormData({ ...formData, size: e.target.value });
                          // Clear validation error when user enters custom size
                          if (e.target.value) {
                            setValidationErrors({ ...validationErrors, size: '' });
                          }
                        }}
                        className={`w-full border ${validationErrors.size ? 'border-red-500 dark:border-red-500' : 'border-secondary-300 dark:border-secondary-700'} bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base mt-2`}
                      />
                    )}
                    {validationErrors.size && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        {validationErrors.size}
                      </p>
                    )}
                    {!validationErrors.size && (
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                        Required for clothes products
                      </p>
                    )}
                  </div>

                  {/* Brand Name input */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                      {t('products.brandName')}
                    </label>
                    <input
                      type="text"
                      name="brand_name"
                      value={formData.brand_name}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_name: e.target.value })
                      }
                      placeholder={t('products.enterBrandName')}
                      maxLength={255}
                      className="w-full border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                      Optional - Brand or manufacturer name
                    </p>
                  </div>
                </>
              )}

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
                  className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
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
