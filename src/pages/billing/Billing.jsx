// import { useState, useEffect } from 'react';
// import { Plus, Minus, Trash2, Receipt, CreditCard, Smartphone, Banknote, ShoppingCart, DollarSign, Package, Search } from 'lucide-react';
// import jsPDF from 'jspdf';
// import { productService } from '../../services/productService';
// import { billService } from '../../services/billService';
// import Button from '../../components/common/Button';
// import Loader from '../../components/common/Loader';
// import toast from 'react-hot-toast';

// const Billing = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [previewData, setPreviewData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [createLoading, setCreateLoading] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [paymentData, setPaymentData] = useState({
//     payments: [{ mode: 'cash', amount: '' }],
//   });

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

//   const addToBill = (product) => {
//     const existing = selectedItems.find(item => item.product_id === product.id);
//     if (existing) {
//       updateQuantity(product.id, existing.quantity + 1);
//     } else {
//       setSelectedItems([...selectedItems, {
//         product_id: product.id,
//         name: product.product_name,
//         price: product.selling_price,
//         quantity: 1,
//         total: product.selling_price,
//       }]);
//     }
//   };

//   const updateQuantity = (productId, newQuantity) => {
//     if (newQuantity <= 0) {
//       removeFromBill(productId);
//       return;
//     }

//     setSelectedItems(selectedItems.map(item =>
//       item.product_id === productId
//         ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
//         : item
//     ));
//   };

//   const removeFromBill = (productId) => {
//     setSelectedItems(selectedItems.filter(item => item.product_id !== productId));
//   };

//   const previewBill = async () => {
//     if (selectedItems.length === 0) {
//       toast.error('Please add items to the bill');
//       return;
//     }

//     setPreviewLoading(true);
//     try {
//       const data = await billService.previewBill(selectedItems);
//       setPreviewData(data);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to preview bill');
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   const createBill = async () => {
//     if (!previewData) {
//       toast.error('Please preview the bill first');
//       return;
//     }

//     const paymentsWithNumbers = paymentData.payments.map(p => ({
//       ...p,
//       amount: parseFloat(p.amount) || 0,
//     }));

//     const totalPaid = paymentsWithNumbers.reduce((sum, p) => sum + p.amount, 0);
//     const tolerance = 0.01;
    
//     if (Math.abs(totalPaid - previewData.total_amount) > tolerance) {
//       toast.error(`Payment amount (₹${totalPaid.toFixed(2)}) must match bill total (₹${previewData.total_amount.toFixed(2)})`);
//       return;
//     }

//     setCreateLoading(true);
//     try {
//       const billResponse = await billService.createBill({
//         items: selectedItems,
//         payments: paymentsWithNumbers,
//       });

//       toast.success('Bill created successfully!');
      
//       const billDataForPrint = {
//         id: billResponse.bill_id || billResponse.data?.bill_id || 'N/A',
//         items: previewData.items,
//         total_amount: previewData.total_amount,
//         payments: paymentsWithNumbers,
//       };
      
//       printBill(billDataForPrint);
      
//       setSelectedItems([]);
//       setPreviewData(null);
//       setShowPaymentModal(false);
//       setPaymentData({ payments: [{ mode: 'cash', amount: '' }] });
//     } catch (error) {
//       const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create bill';
//       toast.error(errorMsg);
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   const printBill = (billData) => {
//     const doc = new jsPDF();
//     doc.setFontSize(20);
//     doc.text('Shop Bill', 105, 20, { align: 'center' });
//     doc.setFontSize(12);
//     doc.text('Shop Name: Your Shop Name', 20, 40);
//     doc.text(`Bill ID: ${billData.id || 'N/A'}`, 20, 50);
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

//     let yPosition = 80;
//     doc.setFontSize(10);
//     doc.text('Item', 20, yPosition);
//     doc.text('Qty', 100, yPosition);
//     doc.text('Price', 130, yPosition);
//     doc.text('Total', 160, yPosition);

//     yPosition += 10;
//     doc.line(20, yPosition, 190, yPosition);
//     yPosition += 10;

//     previewData.items.forEach(item => {
//       doc.text(item.name, 20, yPosition);
//       doc.text(item.quantity.toString(), 100, yPosition);
//       doc.text(`₹${item.price}`, 130, yPosition);
//       doc.text(`₹${item.total}`, 160, yPosition);
//       yPosition += 10;
//     });

//     yPosition += 10;
//     doc.line(20, yPosition, 190, yPosition);
//     yPosition += 10;
//     doc.setFontSize(12);
//     doc.text(`Total Amount: ₹${previewData.total_amount}`, 130, yPosition);

//     yPosition += 20;
//     doc.text('Payment Details:', 20, yPosition);
//     yPosition += 10;
//     paymentData.payments.forEach(payment => {
//       doc.text(`${payment.mode.toUpperCase()}: ₹${payment.amount}`, 30, yPosition);
//       yPosition += 10;
//     });

//     doc.save(`bill_${billData.id || Date.now()}.pdf`);
//   };

//   const addPaymentMethod = () => {
//     setPaymentData({
//       ...paymentData,
//       payments: [...paymentData.payments, { mode: 'cash', amount: '' }]
//     });
//   };

//   const updatePayment = (index, field, value) => {
//     const updatedPayments = [...paymentData.payments];
//     updatedPayments[index] = { ...updatedPayments[index], [field]: value };
//     setPaymentData({ ...paymentData, payments: updatedPayments });
//   };

//   const removePayment = (index) => {
//     if (paymentData.payments.length > 1) {
//       setPaymentData({
//         ...paymentData,
//         payments: paymentData.payments.filter((_, i) => i !== index)
//       });
//     }
//   };

//   const paymentIcons = {
//     cash: Banknote,
//     upi: Smartphone,
//     card: CreditCard,
//   };

//   const calculateTotal = () => {
//     return selectedItems.reduce((sum, item) => sum + item.total, 0);
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
//           <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
//             Create New Bill
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Select products and generate invoices
//           </p>
//         </div>
//         <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
//           <ShoppingCart className="w-5 h-5 text-emerald-600" />
//           <div>
//             <p className="text-xs text-gray-600 dark:text-gray-400">Items in Cart</p>
//             <p className="text-xl font-bold text-secondary-900 dark:text-secondary-100">{selectedItems.length}</p>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Products List */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//             />
//           </div>

//           {/* Products Grid */}
//           <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6">
//             <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
//               <Package className="w-5 h-5 text-indigo-600" />
//               Available Products
//             </h2>

//             {filteredProducts.length === 0 ? (
//               <div className="text-center py-12">
//                 <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 dark:text-gray-400">
//                   {searchTerm ? 'No products found' : 'No products available'}
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
//                 {filteredProducts.map((product, index) => (
//                   <div
//                     key={product.id}
//                     className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
//                     style={{ animationDelay: `${index * 50}ms` }}
//                   >
//                     <div className="absolute top-2 right-2">
//                       <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
//                         product.stock_quantity > 10 
//                           ? 'bg-green-100 text-green-700' 
//                           : product.stock_quantity > 0 
//                           ? 'bg-orange-100 text-orange-700' 
//                           : 'bg-red-100 text-red-700'
//                       }`}>
//                         Stock: {product.stock_quantity}
//                       </span>
//                     </div>

//                     <div className="mb-3">
//                       <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1 pr-20">
//                         {product.product_name}
//                       </h3>
//                       <div className="flex items-center gap-2">
//                         <DollarSign className="w-4 h-4 text-emerald-600" />
//                         <span className="text-2xl font-bold text-emerald-600">
//                           ₹{product.selling_price}
//                         </span>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => addToBill(product)}
//                       disabled={product.stock_quantity === 0}
//                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-lg"
//                     >
//                       <Plus className="w-4 h-4" />
//                       Add to Bill
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Bill Summary */}
//         <div className="space-y-6">
//           {/* Current Bill */}
//           <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 sticky top-20">
//             <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
//               <Receipt className="w-5 h-5 text-purple-600" />
//               Current Bill
//             </h2>

//             {selectedItems.length === 0 ? (
//               <div className="text-center py-12">
//                 <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 dark:text-gray-400 text-sm">
//                   No items added yet
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
//                   {selectedItems.map((item, index) => (
//                     <div
//                       key={item.product_id}
//                       className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-secondary-200 dark:border-secondary-700"
//                       style={{ animationDelay: `${index * 50}ms` }}
//                     >
//                       <div className="flex-1 min-w-0">
//                         <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">
//                           {item.name}
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           ₹{item.price} × {item.quantity} = ₹{item.total}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <button
//                           onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
//                           className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                         >
//                           <Minus className="w-4 h-4" />
//                         </button>
//                         <span className="w-8 text-center font-semibold">{item.quantity}</span>
//                         <button
//                           onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
//                           className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                         >
//                           <Plus className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => removeFromBill(item.product_id)}
//                           className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="border-t border-secondary-200 dark:border-secondary-800 pt-4">
//                   <div className="flex justify-between items-center mb-4">
//                     <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
//                     <span className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
//                       ₹{calculateTotal().toFixed(2)}
//                     </span>
//                   </div>

//                   <button
//                     onClick={previewBill}
//                     disabled={previewLoading}
//                     className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
//                   >
//                     {previewLoading ? 'Loading...' : 'Preview Bill'}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Bill Preview */}
//           {previewData && (
//             <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
//               <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
//                 <Receipt className="w-5 h-5 text-emerald-600" />
//                 Bill Preview
//               </h2>

//               <div className="space-y-3 mb-4">
//                 {previewData.items.map((item, index) => (
//                   <div key={index} className="flex justify-between text-sm">
//                     <span className="text-gray-700 dark:text-gray-300">
//                       {item.name} × {item.quantity}
//                     </span>
//                     <span className="font-semibold text-secondary-900 dark:text-secondary-100">
//                       ₹{item.total}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3 mb-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Total:</span>
//                   <span className="text-2xl font-bold text-emerald-600">
//                     ₹{previewData.total_amount}
//                   </span>
//                 </div>
//               </div>

//               <button
//                 onClick={() => setShowPaymentModal(true)}
//                 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 <Receipt className="w-5 h-5" />
//                 Proceed to Payment
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Payment Modal */}
//       {showPaymentModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
//             <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
//               Payment Details
//             </h2>

//             <div className="space-y-4">
//               <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
//                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
//                 <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-100">
//                   ₹{previewData.total_amount}
//                 </p>
//               </div>

//               <div className="space-y-3">
//                 {paymentData.payments.map((payment, index) => {
//                   const Icon = paymentIcons[payment.mode];
//                   return (
//                     <div key={index} className="flex items-center gap-3 p-4 border border-secondary-200 dark:border-secondary-800 rounded-xl bg-gray-50 dark:bg-gray-700">
//                       <Icon className="w-6 h-6 text-indigo-600" />
//                       <select
//                         value={payment.mode}
//                         onChange={(e) => updatePayment(index, 'mode', e.target.value)}
//                         className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-indigo-500"
//                       >
//                         <option value="cash">Cash</option>
//                         <option value="upi">UPI</option>
//                         <option value="card">Card</option>
//                       </select>
//                       <input
//                         type="number"
//                         step="0.01"
//                         value={payment.amount}
//                         onChange={(e) => updatePayment(index, 'amount', e.target.value)}
//                         placeholder="Amount"
//                         className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-indigo-500"
//                         required
//                       />
//                       {paymentData.payments.length > 1 && (
//                         <button
//                           onClick={() => removePayment(index)}
//                           className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               <button
//                 onClick={addPaymentMethod}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//               >
//                 <Plus className="w-5 h-5" />
//                 Add Payment Method
//               </button>

//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowPaymentModal(false)}
//                   className="px-6 py-2.5 border border-secondary-300 dark:border-secondary-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={createBill}
//                   disabled={createLoading}
//                   className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
//                 >
//                   {createLoading ? 'Creating...' : 'Create Bill'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Billing;

import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Receipt, CreditCard, Smartphone, Banknote, ShoppingCart, DollarSign, Package, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { productService } from '../../services/productService';
import { billService } from '../../services/billService';
import { shopService } from '../../services/shopService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';


const Billing = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shop, setShop] = useState(null);

  // ✅ NEW: Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
  });

  // ✅ NEW: GST state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);

  // ✅ NEW: Discount state
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState(0);

  const [paymentData, setPaymentData] = useState({
    payments: [{ mode: 'cash', amount: '' }],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
  const fetchShop = async () => {
    try {
      const data = await shopService.getShopDetails();
      setShop(data);
    } catch (err) {
      console.log("Shop fetch error");
    }
  };

  fetchShop();
}, []);


  useEffect(() => {
    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addToBill = (product) => {
    const existing = selectedItems.find(item => item.product_id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      setSelectedItems([...selectedItems, {
        product_id: product.id,
        name: product.product_name,
        price: product.selling_price,
        quantity: 1,
        total: product.selling_price,
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    // ✅ Handle direct input - parse as number
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      removeFromBill(productId);
      return;
    }

    // ✅ Check stock availability
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available in stock`);
      return;
    }

    setSelectedItems(selectedItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity: quantity, total: item.price * quantity }
        : item
    ));
  };

  const removeFromBill = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.product_id !== productId));
  };

  const previewBill = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please add items to the bill');
      return;
    }

    // ✅ Validate customer phone if provided
    if (customerDetails.phone && !/^[0-9]{10}$/.test(customerDetails.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setPreviewLoading(true);
    try {
      // ✅ Include GST and Discount in preview request
      const requestData = {
        items: selectedItems,
        ...(gstEnabled && { gst_percentage: gstPercentage }),
        ...(discountEnabled && discountValue > 0 && {
          discount_type: discountType,
          discount_value: discountValue
        })
      };

      const data = await billService.previewBill(requestData);
      setPreviewData(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to preview bill');
    } finally {
      setPreviewLoading(false);
    }
  };

  const createBill = async () => {
    if (!previewData) {
      toast.error('Please preview the bill first');
      return;
    }

    const paymentsWithNumbers = paymentData.payments.map(p => ({
      ...p,
      amount: parseFloat(p.amount) || 0,
    }));

    const totalPaid = paymentsWithNumbers.reduce((sum, p) => sum + p.amount, 0);
    const tolerance = 0.01;
    
    if (Math.abs(totalPaid - previewData.total_amount) > tolerance) {
      toast.error(`Payment amount (₹${totalPaid.toFixed(2)}) must match bill total (₹${previewData.total_amount.toFixed(2)})`);
      return;
    }

    setCreateLoading(true);
    try {
      // ✅ Include customer details and GST in bill creation
      const billData = {
        items: selectedItems,
        payments: paymentsWithNumbers,
        ...(customerDetails.name && { customer_name: customerDetails.name }),
        ...(customerDetails.phone && { customer_phone: customerDetails.phone }),
        ...(gstEnabled && { gst_percentage: gstPercentage }),
        ...(discountEnabled && discountValue > 0 && {
          discount_type: discountType,
          discount_value: discountValue
        })
      };

      const billResponse = await billService.createBill(billData);

      toast.success('Bill created successfully!');
      
      const billDataForPrint = {
        id: billResponse.bill_id || billResponse.data?.bill_id || 'N/A',
        items: previewData.items,
        subtotal: previewData.subtotal || previewData.total_amount,
        gst_percentage: previewData.gst_percentage,
        gst_amount: previewData.gst_amount,
        discount_type: previewData.discount_type,
        discount_value: previewData.discount_value,
        discount_amount: previewData.discount_amount,
        total_amount: previewData.total_amount,
        payments: paymentsWithNumbers,
        customer: customerDetails.name || customerDetails.phone ? customerDetails : null,
      };
      
      printBill(billDataForPrint);
      
      // ✅ Reset all states
      setSelectedItems([]);
      setPreviewData(null);
      setShowPaymentModal(false);
      setPaymentData({ payments: [{ mode: 'cash', amount: '' }] });
      setCustomerDetails({ name: '', phone: '' });
      setGstEnabled(false);
      setGstPercentage(18);
      setDiscountEnabled(false);
      setDiscountType('percentage');
      setDiscountValue(0);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create bill';
      toast.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const printBill = (billData) => {
    const doc = new jsPDF();
    
    // Debug: Check shop data
    console.log('🏪 Shop data in printBill:', shop);
    
    // ========================================
    // HEADER SECTION - Shop Details (Top)
    // ========================================
    
    // Shop Name (Bold, Large, Centered)
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(shop?.shop_name?.toUpperCase() || 'YOUR SHOP NAME', 105, 20, { align: 'center' });
    
    // Shop Address (Centered, below shop name)
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    let headerY = 27;
    
    // Always show address line (even if empty, for consistent spacing)
    const shopAddress = shop?.address || shop?.shop_address || '';
    if (shopAddress) {
      // Split long address into multiple lines if needed
      const addressLines = doc.splitTextToSize(shopAddress, 160);
      addressLines.forEach(line => {
        doc.text(line, 105, headerY, { align: 'center' });
        headerY += 5;
      });
    }
    
    // Shop Phone (Centered, below address)
    const shopPhone = shop?.owner_phone || shop?.phone || '';
    if (shopPhone) {
      doc.text(`Phone: ${shopPhone}`, 105, headerY, { align: 'center' });
      headerY += 5;
    }
    
    // Horizontal line after header
    headerY += 2;
    doc.line(20, headerY, 190, headerY);
    
    // ========================================
    // BILL INFO SECTION
    // ========================================
    let yPosition = headerY + 7;
    
    doc.setFontSize(10);
    // Left side - Bill Number and Date
    doc.text(`Bill No: ${billData.id || 'N/A'}`, 20, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, 130, yPosition);
    
    yPosition += 8;
    
    // Customer Details (if provided)
    if (billData.customer && (billData.customer.name || billData.customer.phone)) {
      doc.text(`Customer: ${billData.customer.name || 'N/A'}`, 20, yPosition);
      if (billData.customer.phone) {
        doc.text(`Ph: ${billData.customer.phone}`, 130, yPosition);
      }
      yPosition += 8;
    }
    
    // Horizontal line before items
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    // ========================================
    // ITEMS TABLE HEADER
    // ========================================
    doc.setFont(undefined, 'bold');
    doc.text('S.No', 20, yPosition);
    doc.text('Particulars', 40, yPosition);
    doc.text('Qty', 110, yPosition, { align: 'center' });
    doc.text('Rate', 155, yPosition, { align: 'right' });
    doc.text('Amount', 190, yPosition, { align: 'right' });
    
    yPosition += 2;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 6;
    
    // ========================================
    // ITEMS LIST
    // ========================================
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    
    (billData.items || previewData?.items || []).forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${index + 1}`, 20, yPosition);
      doc.text(item.name.substring(0, 30), 40, yPosition); // Limit name length
      doc.text(item.quantity.toString(), 110, yPosition, { align: 'center' });
      doc.text(`₹${parseFloat(item.price).toFixed(2)}`, 155, yPosition, { align: 'right' });
      doc.text(`₹${parseFloat(item.total).toFixed(2)}`, 190, yPosition, { align: 'right' });
      yPosition += 6;
    });
    
    // Line after items
    yPosition += 2;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    // ========================================
    // TOTALS SECTION (Right Aligned)
    // ========================================
    doc.setFontSize(10);
    
    // Subtotal
    doc.text('Subtotal:', 130, yPosition);
    doc.text(`₹${(billData.subtotal || previewData?.subtotal || billData.total_amount).toFixed(2)}`, 190, yPosition, { align: 'right' });
    yPosition += 7;
    
    // GST (if applicable)
    if (billData.gst_amount && billData.gst_percentage) {
      doc.text(`GST (${billData.gst_percentage}%):`, 130, yPosition);
      doc.text(`₹${parseFloat(billData.gst_amount).toFixed(2)}`, 190, yPosition, { align: 'right' });
      yPosition += 7;
    }
    
    // Discount (if applicable)
    if (billData.discount_amount && billData.discount_value) {
      const discountLabel = billData.discount_type === 'percentage' 
        ? `Discount (${billData.discount_value}%)` 
        : `Discount`;
      doc.setTextColor(255, 0, 0); // Red color
      doc.text(`${discountLabel}:`, 130, yPosition);
      doc.text(`-₹${parseFloat(billData.discount_amount).toFixed(2)}`, 190, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Reset to black
      yPosition += 7;
    }
    
    // Line before grand total
    doc.line(130, yPosition, 190, yPosition);
    yPosition += 7;
    
    // Grand Total (Bold)
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', 130, yPosition);
    doc.text(`₹${parseFloat(billData.total_amount).toFixed(2)}`, 190, yPosition, { align: 'right' });
    yPosition += 10;
    
    // ========================================
    // PAYMENT DETAILS
    // ========================================
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Payment Mode:', 20, yPosition);
    yPosition += 6;
    
    (billData.payments || paymentData.payments).forEach(payment => {
      doc.text(`  ${payment.mode.toUpperCase()}:`, 20, yPosition);
      doc.text(`₹${parseFloat(payment.amount).toFixed(2)}`, 80, yPosition, { align: 'right' });
      yPosition += 6;
    });
    
    // ========================================
    // FOOTER
    // ========================================
    yPosition += 10;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for your business!', 105, yPosition, { align: 'center' });
    
    // Bottom line
    yPosition += 5;
    doc.line(20, yPosition, 190, yPosition);
    
    // Shop name at bottom (small)
    yPosition += 5;
    doc.setFontSize(7);
    doc.text(`For ${shop?.shop_name || 'Your Shop Name'}`, 105, yPosition, { align: 'center' });
    
    // Save PDF
    doc.save(`Bill_${billData.id || Date.now()}.pdf`);
  };

  const addPaymentMethod = () => {
    setPaymentData({
      ...paymentData,
      payments: [...paymentData.payments, { mode: 'cash', amount: '' }]
    });
  };

  const updatePayment = (index, field, value) => {
    const updatedPayments = [...paymentData.payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setPaymentData({ ...paymentData, payments: updatedPayments });
  };

  const removePayment = (index) => {
    if (paymentData.payments.length > 1) {
      setPaymentData({
        ...paymentData,
        payments: paymentData.payments.filter((_, i) => i !== index)
      });
    }
  };

  const paymentIcons = {
    cash: Banknote,
    upi: Smartphone,
    card: CreditCard,
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.total, 0);
  };

  // ✅ Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discountEnabled || discountValue === 0) return 0;
    
    const subtotal = calculateTotal();
    const gstAmount = gstEnabled ? (subtotal * gstPercentage) / 100 : 0;
    const totalBeforeDiscount = subtotal + gstAmount;
    
    if (discountType === 'percentage') {
      return (totalBeforeDiscount * discountValue) / 100;
    } else {
      return discountValue;
    }
  };

  // ✅ Calculate final total after discount
  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const gstAmount = gstEnabled ? (subtotal * gstPercentage) / 100 : 0;
    const totalBeforeDiscount = subtotal + gstAmount;
    const discountAmount = calculateDiscountAmount();
    
    return Math.max(0, totalBeforeDiscount - discountAmount);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {t('billing.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('billing.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('billing.itemsInCart')}</p>
            <p className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100">{selectedItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Products List */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>

          {/* Products Grid */}
          <div className="bg-white dark:bg-secondary-900 rounded-xl sm:rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              {t('billing.availableProducts')}
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {searchTerm ? t('billing.noProductsFound') : t('billing.noProductsAvailable')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 sm:p-4 border border-secondary-200 dark:border-secondary-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        product.stock_quantity > 10 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : product.stock_quantity > 0 
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {t('billing.stock')}: {product.stock_quantity}
                      </span>
                    </div>

                    <div className="mb-3 pr-16">
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1 text-sm sm:text-base truncate">
                        {product.product_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                        <span className="text-lg sm:text-2xl font-bold text-emerald-600">
                          ₹{product.selling_price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToBill(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-lg text-sm sm:text-base"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t('billing.addToBill')}</span>
                      <span className="sm:hidden">{t('billing.add')}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="space-y-4 sm:space-y-6">
          {/* ✅ NEW: Customer Details Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Details (Optional)
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={customerDetails.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setCustomerDetails({ ...customerDetails, phone: value });
                }}
                maxLength="10"
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {customerDetails.phone && customerDetails.phone.length !== 10 && (
                <p className="text-xs text-red-600 dark:text-red-400">Phone must be exactly 10 digits</p>
              )}
            </div>
          </div>

          {/* ✅ NEW: GST Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl border border-green-200 dark:border-green-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                GST (Optional)
              </h3>
              <button
                onClick={() => setGstEnabled(!gstEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gstEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gstEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {gstEnabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="GST %"
                    value={gstPercentage}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 && value <= 28) {
                        setGstPercentage(value);
                      }
                    }}
                    min="0"
                    max="28"
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">%</span>
                </div>
                {selectedItems.length > 0 && (
                  <div className="bg-white dark:bg-secondary-800 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">GST ({gstPercentage}%):</span>
                      <span className="font-semibold text-green-600">
                        ₹{((calculateTotal() * gstPercentage) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1"></div>
                    <div className="flex justify-between text-base">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-green-600">
                        ₹{(calculateTotal() + (calculateTotal() * gstPercentage) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ NEW: Discount Section */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Discount (Optional)
              </h3>
              <button
                onClick={() => setDiscountEnabled(!discountEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  discountEnabled ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    discountEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {discountEnabled && (
              <div className="space-y-3">
                {/* Discount Type Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                      discountType === 'percentage'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-300 border border-orange-300 dark:border-orange-700'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                      discountType === 'fixed'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-300 border border-orange-300 dark:border-orange-700'
                    }`}
                  >
                    Fixed (₹)
                  </button>
                </div>

                {/* Discount Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={discountType === 'percentage' ? 'Discount %' : 'Discount Amount'}
                    value={discountValue}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (discountType === 'percentage' && value > 100) return;
                      const maxDiscount = gstEnabled 
                        ? calculateTotal() + (calculateTotal() * gstPercentage) / 100 
                        : calculateTotal();
                      if (discountType === 'fixed' && value > maxDiscount) return;
                      setDiscountValue(value);
                    }}
                    min="0"
                    max={discountType === 'percentage' ? '100' : (gstEnabled ? calculateTotal() + (calculateTotal() * gstPercentage) / 100 : calculateTotal())}
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    className="flex-1 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {discountType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>

                {/* Discount Preview */}
                {selectedItems.length > 0 && discountValue > 0 && (
                  <div className="bg-white dark:bg-secondary-800 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    
                    {gstEnabled && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">GST ({gstPercentage}%):</span>
                        <span className="font-semibold text-green-600">
                          ₹{((calculateTotal() * gstPercentage) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-red-600">
                      <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`}):</span>
                      <span className="font-semibold">
                        -₹{calculateDiscountAmount().toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1"></div>
                    <div className="flex justify-between text-base">
                      <span className="font-bold">Final Total:</span>
                      <span className="font-bold text-orange-600">
                        ₹{calculateFinalTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Bill */}
          <div className="bg-white dark:bg-secondary-900 rounded-xl sm:rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4 sm:p-6 sticky top-4 sm:top-20">
            <h2 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              {t('billing.currentBill')}
            </h2>

            {selectedItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('billing.noItemsAdded')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2 pr-2">
                  {selectedItems.map((item, index) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-secondary-200 dark:border-secondary-700"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate text-sm sm:text-base">
                          {item.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          ₹{item.price} × {item.quantity} = ₹{item.total}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {/* ✅ Editable Quantity Input */}
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                          min="1"
                          className="w-12 sm:w-16 text-center font-semibold text-sm sm:text-base border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => removeFromBill(item.product_id)}
                          className="p-1 sm:p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-secondary-200 dark:border-secondary-800 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('billing.subtotal')}:</span>
                    <span className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={previewBill}
                    disabled={previewLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {previewLoading ? t('common.loading') : t('billing.previewBill')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bill Preview */}
          {previewData && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                {t('billing.billPreview')}
              </h2>

              {/* ✅ Customer Details in Preview */}
              {(customerDetails.name || customerDetails.phone) && (
                <div className="mb-4 pb-3 border-b border-emerald-200 dark:border-emerald-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer:</p>
                  {customerDetails.name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{customerDetails.name}</p>
                  )}
                  {customerDetails.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{customerDetails.phone}</p>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-4">
                {previewData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                      ₹{item.total}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3 mb-4 space-y-2">
                {/* ✅ Show Subtotal */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                  <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                    ₹{previewData.subtotal || previewData.total_amount}
                  </span>
                </div>

                {/* ✅ Show GST if enabled */}
                {previewData.gst_amount && previewData.gst_percentage && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      GST ({previewData.gst_percentage}%):
                    </span>
                    <span className="font-semibold text-green-600">
                      +₹{previewData.gst_amount}
                    </span>
                  </div>
                )}

                {/* ✅ Show Discount if enabled */}
                {previewData.discount_amount && previewData.discount_value && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Discount ({previewData.discount_type === 'percentage' ? `${previewData.discount_value}%` : `₹${previewData.discount_value}`}):
                    </span>
                    <span className="font-semibold text-red-600">
                      -₹{previewData.discount_amount}
                    </span>
                  </div>
                )}

                <div className="border-t border-emerald-300 dark:border-emerald-600 pt-2 mt-2"></div>

                {/* ✅ Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Total:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ₹{previewData.total_amount}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Receipt className="w-5 h-5" />
                {t('billing.proceedToPayment')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header - Fixed */}
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {t('billing.paymentDetails')}
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('billing.totalAmount')}</p>
                <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-100">
                  ₹{previewData.total_amount}
                </p>
              </div>

              <div className="space-y-3">
                {paymentData.payments.map((payment, index) => {
                    const Icon = paymentIcons[payment.mode];

                    return (
                      <div key={index} className="space-y-3">
                        
                        <div className="flex items-center gap-3 p-4 border border-secondary-200 dark:border-secondary-800 rounded-xl bg-gray-50 dark:bg-gray-700">
                          <Icon className="w-6 h-6 text-indigo-600 flex-shrink-0" />

                          <select
                            value={payment.mode}
                            onChange={(e) => updatePayment(index, 'mode', e.target.value)}
                            className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 min-w-0"
                          >
                            <option value="cash">{t('billing.cash')}</option>
                            <option value="upi">{t('billing.upi')}</option>
                            <option value="card">{t('billing.card')}</option>
                          </select>

                          <input
                            type="number"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                            placeholder={t('billing.amount')}
                            className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 min-w-0"
                          />

                          {paymentData.payments.length > 1 && (
                            <button
                              onClick={() => removePayment(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* QR CODE */}
                        {payment.mode === "upi" && shop?.upi_id && payment.amount && (
                          <div className="w-full flex flex-col items-center bg-white dark:bg-secondary-800 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700">
                            <p className="text-sm font-semibold mb-2 text-secondary-900 dark:text-secondary-100">
                              {t('billing.scanToPay')}
                            </p>

                            <QRCodeCanvas
                              value={`upi://pay?pa=${shop.upi_id}&pn=${shop.shop_name}&am=${payment.amount}&cu=INR`}
                              size={180}
                            />

                            <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 break-all text-center">
                              {t('billing.upiId')}: {shop.upi_id}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  })}

              </div>

              {paymentData.payments.length < 3 && (
                <button
                  onClick={addPaymentMethod}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('billing.maxPayments')}
                </button>
              )}
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 border-t border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-800">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2.5 border border-secondary-300 dark:border-secondary-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={createBill}
                  disabled={createLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {createLoading ? t('billing.creating') : t('billing.createBill')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
