// import { useState, useEffect } from 'react';
// import { Plus, Edit, Trash2, Package, Search, Filter, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
// import { productService } from '../../services/productService';
// import Button from '../../components/common/Button';
// import Input from '../../components/common/Input';
// import Loader from '../../components/common/Loader';
// import { useAuth } from '../../store/AuthContext';
// import toast from 'react-hot-toast';

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const [formData, setFormData] = useState({
//     product_name: '',
//     purchase_price: '',
//     selling_price: '',
//     stock_quantity: '',
//   });
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     const filtered = products.filter(product =>
//       product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredProducts(filtered);
//   }, [searchTerm, products]);

//   const fetchProducts = async () => {
//     try {
//       const data = await productService.getProducts();
//       setProducts(data);
//       setFilteredProducts(data);
//     } catch (error) {
//       toast.error('Failed to fetch products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       if (editingProduct) {
//         await productService.updateProduct(editingProduct.id, formData);
//         toast.success('Product updated successfully');
//       } else {
//         await productService.addProduct(formData);
//         toast.success('Product added successfully');
//       }

//       fetchProducts();
//       closeModal();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Operation failed');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (productId) => {
//     if (!window.confirm('Are you sure you want to delete this product?')) return;

//     try {
//       await productService.deleteProduct(productId);
//       toast.success('Product deleted successfully');
//       fetchProducts();
//     } catch (error) {
//       toast.error('Failed to delete product');
//     }
//   };

//   const openModal = (product = null) => {
//     if (product) {
//       setEditingProduct(product);
//       setFormData({
//         product_name: product.product_name,
//         purchase_price: product.purchase_price,
//         selling_price: product.selling_price,
//         stock_quantity: product.stock_quantity,
//       });
//     } else {
//       setEditingProduct(null);
//       setFormData({
//         product_name: '',
//         purchase_price: '',
//         selling_price: '',
//         stock_quantity: '',
//       });
//     }
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingProduct(null);
//     setFormData({
//       product_name: '',
//       purchase_price: '',
//       selling_price: '',
//       stock_quantity: '',
//     });
//   };

//   const getStockStatus = (quantity) => {
//     if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
//     if (quantity < 10) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: TrendingDown };
//     return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: TrendingUp };
//   };

//   const stats = {
//     total: products.length,
//     lowStock: products.filter(p => p.stock_quantity < 10).length,
//     outOfStock: products.filter(p => p.stock_quantity === 0).length,
//     totalValue: products.reduce((sum, p) => sum + (p.selling_price * p.stock_quantity), 0),
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <Loader size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="px-6 pb-10 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//             Products Inventory
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Manage your products and track inventory levels
//           </p>
//         </div>
//         <button
//           onClick={() => openModal()}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
//         >
//           <Plus className="w-5 h-5" />
//           Add Product
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
//           <div className="flex items-center justify-between mb-2">
//             <Package className="w-8 h-8 text-blue-600" />
//             <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Total</span>
//           </div>
//           <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Products</p>
//         </div>

//         <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
//           <div className="flex items-center justify-between mb-2">
//             <TrendingDown className="w-8 h-8 text-orange-600" />
//             <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">Alert</span>
//           </div>
//           <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Low Stock Items</p>
//         </div>

//         <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
//           <div className="flex items-center justify-between mb-2">
//             <AlertCircle className="w-8 h-8 text-red-600" />
//             <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">Critical</span>
//           </div>
//           <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.outOfStock}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Out of Stock</p>
//         </div>

//         {isOwner && (
//           <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
//             <div className="flex items-center justify-between mb-2">
//               <TrendingUp className="w-8 h-8 text-emerald-600" />
//               <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Value</span>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 dark:text-white">
//               ₹{Math.round(stats.totalValue).toLocaleString()}
//             </p>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inventory Value</p>
//           </div>
//         )}

//       </div>

//       {/* Search and Filter */}
//       <div className="flex items-center gap-4 flex-wrap">
//         <div className="flex-1 min-w-[300px]">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//             />
//           </div>
//         </div>
//         <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//           <Filter className="w-5 h-5" />
//           Filter
//         </button>
//       </div>

//       {/* Products Table */}
//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
//           <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             {searchTerm ? 'Try adjusting your search' : 'Start by adding your first product'}
//           </p>
//           {!searchTerm && (
//             <button
//               onClick={() => openModal()}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
//             >
//               <Plus className="w-5 h-5" />
//               Add Product
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Product Name
//                   </th>
//                  {isOwner && (
//                   <td className="px-6 py-4">
//                     <p className="text-gray-900 dark:text-white font-medium">
//                       ₹{product.purchase_price}
//                     </p>
//                   </td>
//                 )}

//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Selling Price
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Stock
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredProducts.map((product, index) => {
//                   const status = getStockStatus(product.stock_quantity);
//                   const StatusIcon = status.icon;
//                   return (
//                     <tr
//                       key={product.id}
//                       className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//                       style={{ animationDelay: `${index * 50}ms` }}
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
//                             <Package className="w-5 h-5 text-white" />
//                           </div>
//                           <div>
//                             <p className="font-semibold text-gray-900 dark:text-white">{product.product_name}</p>
//                             <p className="text-xs text-gray-500">ID: #{product.id}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-gray-900 dark:text-white font-medium">₹{product.purchase_price}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-gray-900 dark:text-white font-medium">₹{product.selling_price}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-2xl font-bold text-gray-900 dark:text-white">{product.stock_quantity}</p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${status.color}`}>
//                           <StatusIcon className="w-3.5 h-3.5" />
//                           {status.label}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => openModal(product)}
//                             className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
//                             title="Edit"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           {isOwner && (
//                             <button
//                               onClick={() => handleDelete(product.id)}
//                               className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}

//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//               {editingProduct ? 'Edit Product' : 'Add New Product'}
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <Input
//                 label="Product Name"
//                 type="text"
//                 name="product_name"
//                 value={formData.product_name}
//                 onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
//                 placeholder="Enter product name"
//                 required
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 {isOwner && (
//                     <Input
//                       label="Purchase Price"
//                       type="number"
//                       step="0.01"
//                       name="purchase_price"
//                       value={formData.purchase_price}
//                       onChange={(e) =>
//                         setFormData({ ...formData, purchase_price: e.target.value })
//                       }
//                       placeholder="₹0.00"
//                       required
//                     />
//                 )}


//                 <Input
//                   label="Selling Price"
//                   type="number"
//                   step="0.01"
//                   name="selling_price"
//                   value={formData.selling_price}
//                   onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
//                   placeholder="₹0.00"
//                   required
//                 />
//               </div>

//               <Input
//                 label="Stock Quantity"
//                 type="number"
//                 name="stock_quantity"
//                 value={formData.stock_quantity}
//                 onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
//                 placeholder="Enter quantity"
//                 required
//               />

//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
//                 >
//                   {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Add'} Product
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Products;
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { productService } from '../../services/productService';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

const Products = () => {
  const { isOwner } = useAuth(); // ✅ IMPORTANT FIX

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
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
        toast.success('Product updated successfully');
      } else {
        await productService.addProduct(formData);
        toast.success('Product added successfully');
      }

      fetchProducts();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;

    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
      });
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
        label: 'Out of Stock',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
      };
    if (quantity < 10)
      return {
        label: 'Low Stock',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: TrendingDown,
      };
    return {
      label: 'In Stock',
      color: 'bg-green-100 text-green-700 border-green-200',
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
    <div className="px-6 pb-10 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Products Inventory
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your products and track inventory levels
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">Total Products</p>
        </div>

        {/* Low Stock */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
              Alert
            </span>
          </div>
          <p className="text-3xl font-bold">{stats.lowStock}</p>
          <p className="text-sm text-gray-600 mt-1">Low Stock Items</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
              Critical
            </span>
          </div>
          <p className="text-3xl font-bold">{stats.outOfStock}</p>
          <p className="text-sm text-gray-600 mt-1">Out of Stock</p>
        </div>

        {/* Inventory Value (Owner Only) */}
        {isOwner && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Value
              </span>
            </div>
            <p className="text-3xl font-bold">
              ₹{Math.round(stats.totalValue).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Inventory Value</p>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Product Name
                </th>

                {isOwner && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Purchase Price
                  </th>
                )}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Selling Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock_quantity);
                const StatusIcon = status.icon;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">
                      {product.product_name}
                    </td>

                    {isOwner && (
                      <td className="px-6 py-4">
                        ₹{product.purchase_price}
                      </td>
                    )}

                    <td className="px-6 py-4">
                      ₹{product.selling_price}
                    </td>

                    <td className="px-6 py-4">
                      {product.stock_quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => openModal(product)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>

                      {isOwner && (
                        <button onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
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

    </div>
  );
};

export default Products;
