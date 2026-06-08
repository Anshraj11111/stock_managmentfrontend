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
//         <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-600">
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
//             <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-600 p-6">
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

//               <div className="border-t border-emerald-200 dark:border-emerald-500 pt-3 mb-4">
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
import { customerService } from '../../services/customerService';
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

  // ✅ NEW: Customer details state (with address)
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '', // ✅ Added address field
  });
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // ✅ NEW: Simple payment state
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' or 'upi'
  const [paidAmount, setPaidAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');

  // ✅ NEW: GST state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);

  // ✅ NEW: Discount state
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountValue, setDiscountValue] = useState(''); // Empty string instead of 0

  // ✅ REMOVED: Complex payment array - using simple state instead

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

  // ✅ NEW: Search customer by phone
  const searchCustomerByPhone = async (phone) => {
    if (phone.length !== 10) {
      setExistingCustomer(null);
      return;
    }

    setSearchingCustomer(true);
    try {
      const response = await customerService.searchByPhone(phone);
      if (response.found) {
        setExistingCustomer(response.customer);
        setCustomerDetails({
          name: response.customer.name,
          phone: response.customer.phone,
          address: response.customer.address || '', // ✅ Include address
        });
        toast.success(`Customer found! Previous due: ₹${response.customer.total_due}`);
      } else {
        setExistingCustomer(null);
      }
    } catch (error) {
      console.error('Customer search error:', error);
      setExistingCustomer(null);
    } finally {
      setSearchingCustomer(false);
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
    
    // Auto-scroll to preview bill section
    setTimeout(() => {
      const previewSection = document.getElementById('preview-bill-section');
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

    // ✅ Require customer name before preview
    if (!customerDetails.name.trim()) {
      toast.error('Please enter customer name before previewing bill');
      // Scroll to customer section
      document.getElementById('customer-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    // ✅ PREVENT DOUBLE SUBMISSION - Early return if already creating
    if (createLoading) {
      return;
    }

    if (!previewData) {
      toast.error('Please preview the bill first');
      return;
    }

    // ✅ SIMPLE VALIDATION
    const paid = parseFloat(paidAmount) || 0;
    const due = parseFloat(dueAmount) || 0;
    const total = previewData.total_amount;

    // Check if paid + due = total
    if (Math.abs((paid + due) - total) > 0.01) {
      toast.error(`Paid (₹${paid}) + Due (₹${due}) must equal Total (₹${total.toFixed(2)})`);
      return;
    }

    // If due > 0, require customer details including address
    if (due > 0) {
      if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
        toast.error('Customer name, phone, and address required for credit/due sales');
        return;
      }
      if (customerDetails.phone.length !== 10) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }
    }

    // ✅ SET LOADING STATE IMMEDIATELY
    setCreateLoading(true);
    
    // ✅ SHOW IMMEDIATE PROGRESS FEEDBACK
    const progressToast = toast.loading('Creating bill...');
    try {
      let customerId = existingCustomer?.id;

      // ✅ If due > 0 and customer doesn't exist, create customer first
      if (due > 0 && !existingCustomer) {
        // ✅ UPDATE PROGRESS
        toast.loading('Creating customer...', { id: progressToast });
        
        try {
          const customerResponse = await customerService.createOrUpdateCustomer({
            name: customerDetails.name,
            phone: customerDetails.phone,
            address: customerDetails.address, // ✅ Include address
          });
          customerId = customerResponse.customer.id;
          toast.success('Customer created successfully', { id: progressToast });
        } catch (error) {
          toast.error('Failed to create customer', { id: progressToast });
          setCreateLoading(false);
          return;
        }
      }

      // ✅ UPDATE PROGRESS - Saving bill
      toast.loading('Saving bill...', { id: progressToast });

      // ✅ Build simple payment array
      const payments = [];
      if (paid > 0) {
        payments.push({ mode: paymentMode, amount: paid });
      }
      if (due > 0) {
        payments.push({ mode: 'credit', amount: due });
      }

      // ✅ Include customer details and GST in bill creation
      const billData = {
        items: selectedItems,
        payments: payments,
        ...(customerId && { customer_id: customerId }),
        ...(customerDetails.name && { customer_name: customerDetails.name }),
        ...(customerDetails.phone && { customer_phone: customerDetails.phone }),
        ...(gstEnabled && { gst_percentage: gstPercentage }),
        ...(discountEnabled && discountValue > 0 && {
          discount_type: discountType,
          discount_value: discountValue
        })
      };

      const billResponse = await billService.createBill(billData);

      // ✅ SHOW SUCCESS IMMEDIATELY
      if (due > 0) {
        toast.success(`Bill created! Due amount ₹${due.toFixed(2)} added to customer account`, { id: progressToast });
      } else {
        toast.success('Bill created successfully!', { id: progressToast });
      }
      
      // ✅ UPDATE PROGRESS - Generating PDF
      toast.loading('Generating PDF...', { id: progressToast });
      
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
        payments: payments,
        customer: customerDetails.name || customerDetails.phone ? customerDetails : null,
      };
      
      printBill(billDataForPrint);
      
      // ✅ FINAL SUCCESS MESSAGE
      toast.success('Bill PDF downloaded!', { id: progressToast });
      
      // ✅ Reset all states
      setSelectedItems([]);
      setPreviewData(null);
      setShowPaymentModal(false);
      setPaymentMode('cash');
      setPaidAmount('');
      setDueAmount('');
      setCustomerDetails({ name: '', phone: '', address: '' });
      setExistingCustomer(null);
      setGstEnabled(false);
      setGstPercentage(18);
      setDiscountEnabled(false);
      setDiscountType('percentage');
      setDiscountValue(''); // Empty string instead of 0
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create bill';
      toast.error(errorMsg, { id: progressToast });
    } finally {
      setCreateLoading(false);
    }
  };

  const printBill = (billData) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // ── Dimensions ──────────────────────────────────────────────────────────
    const PW = 210; const PH = 297;
    const M  = 14;  const CW = PW - M * 2; // 182mm

    // ── Colours ──────────────────────────────────────────────────────────────
    const BLUE  = [30,  58, 138];   // dark navy
    const LBLUE = [37,  99, 235];   // bright blue
    const BGBL  = [240, 244, 255];  // light blue bg
    const BGGY  = [248, 250, 252];  // light grey row
    const BORD  = [209, 216, 232];  // border grey
    const DARK  = [30,  41,  59];   // text dark
    const GREY  = [100, 116, 139];  // text muted
    const WHITE = [255, 255, 255];
    const GREEN = [21, 128, 61];
    const RED   = [220, 38,  38];

    const rs = (n) => `Rs.${Number(n || 0).toFixed(2)}`;

    const setColor = (rgb, type = 'text') => {
      if (type === 'fill')   doc.setFillColor(...rgb);
      else if (type === 'draw') doc.setDrawColor(...rgb);
      else doc.setTextColor(...rgb);
    };

    let Y = M;

    // ── 1. HEADER BAND ───────────────────────────────────────────────────────
    const HDR_H = 30;
    setColor(BLUE, 'fill');
    doc.rect(0, 0, PW, HDR_H, 'F');

    // Shop name
    setColor(WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text((shop?.shop_name || 'SHOP NAME').toUpperCase(), M, 10);

    // Category / address / phone
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(191, 219, 254); // light blue
    let shopInfoY = 15;
    if (shop?.category) { doc.text(shop.category, M, shopInfoY); shopInfoY += 4; }
    const addrParts = [];
    if (shop?.address)     addrParts.push(shop.address);
    if (shop?.owner_phone) addrParts.push(`Ph: ${shop.owner_phone}`);
    if (addrParts.length)  { doc.text(addrParts.join('  |  '), M, shopInfoY, { maxWidth: CW * 0.65 }); shopInfoY += 4; }
    if (shop?.gstin)       doc.text(`GSTIN: ${shop.gstin}`, M, shopInfoY);

    // "BILL / INVOICE" top-right
    setColor(WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('BILL', PW - M, 12, { align: 'right' });

    Y = HDR_H;

    // ── 2. TITLE BAR ─────────────────────────────────────────────────────────
    setColor(LBLUE, 'fill');
    doc.rect(0, Y, PW, 8, 'F');
    setColor(WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`BILL  –  #${billData.id || 'N/A'}`, PW / 2, Y + 5.5, { align: 'center' });
    Y += 8 + 4;

    // ── 3. INFO BOXES ─────────────────────────────────────────────────────────
    const BOX_H = 22; const BOX_GAP = 4; const BOX_W = (CW - BOX_GAP) / 2;

    // Left — Bill meta
    setColor(BGBL, 'fill'); setColor(BORD, 'draw');
    doc.setLineWidth(0.3);
    doc.rect(M, Y, BOX_W, BOX_H, 'FD');
    let lY = Y + 5;
    const metaLine = (label, val) => {
      if (!val) return;
      setColor(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
      doc.text(label, M + 3, lY);
      setColor(GREY); doc.setFont('helvetica', 'normal');
      doc.text(String(val), M + 3 + doc.getTextWidth(label) + 1, lY);
      lY += 4.5;
    };
    metaLine('Bill No:', `#${billData.id || 'N/A'}`);
    metaLine('Date:', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' }));
    metaLine('Payment:', (billData.payments || []).map(p => p.mode.toUpperCase()).join(', ') || '-');

    // Right — Customer
    const RX = M + BOX_W + BOX_GAP;
    setColor(BGBL, 'fill'); setColor(BORD, 'draw');
    doc.rect(RX, Y, BOX_W, BOX_H, 'FD');
    let rY = Y + 5;
    const custLine = (label, val) => {
      if (!val) return;
      setColor(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
      doc.text(label, RX + 3, rY);
      setColor(GREY); doc.setFont('helvetica', 'normal');
      doc.text(String(val), RX + 3 + doc.getTextWidth(label) + 1, rY);
      rY += 4.5;
    };
    custLine('To:', billData.customer?.name || 'Walk-in Customer');
    custLine('Mobile:', billData.customer?.phone);

    Y += BOX_H + 5;

    // ── 4. ITEMS TABLE ────────────────────────────────────────────────────────
    // cols: x is absolute from left edge (0), w in mm
    const cols = [
      { key: 'sno',  hdr: '#',           x: M,       w: 7,   align: 'left'   },
      { key: 'desc', hdr: 'DESCRIPTION', x: M + 7,   w: 73,  align: 'left'   },
      { key: 'qty',  hdr: 'QTY',         x: M + 80,  w: 20,  align: 'center' },
      { key: 'rate', hdr: 'RATE',        x: M + 100, w: 27,  align: 'right'  },
      { key: 'gst',  hdr: 'GST%',        x: M + 127, w: 18,  align: 'center' },
      { key: 'amt',  hdr: 'AMOUNT',      x: M + 145, w: CW - 145, align: 'right' },
    ];
    // fix last col width
    cols[5].w = (M + CW) - cols[5].x;

    // Header row
    const TH_H = 7;
    setColor(BLUE, 'fill');
    doc.rect(M, Y, CW, TH_H, 'F');
    setColor(WHITE);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    cols.forEach(c => {
      doc.text(c.hdr, c.align === 'right' ? c.x + c.w - 1.5 : c.align === 'center' ? c.x + c.w / 2 : c.x + 1.5,
        Y + 4.8, { align: c.align });
    });
    Y += TH_H;

    // Data rows
    const items = billData.items || previewData?.items || [];
    const gstPct = billData.gst_percentage || 0;

    items.forEach((item, idx) => {
      if (Y > PH - 40) { doc.addPage(); Y = M; }

      const ROW_H = 6;
      const rowBg = idx % 2 === 0 ? WHITE : BGGY;
      setColor(rowBg, 'fill'); setColor(BORD, 'draw');
      doc.setLineWidth(0.2);
      doc.rect(M, Y, CW, ROW_H, 'FD');

      const itemTotal = parseFloat(item.total || item.price * item.quantity);
      const vals = {
        sno:  String(idx + 1),
        desc: (item.name || '').substring(0, 40),
        qty:  String(item.quantity),
        rate: rs(item.price),
        gst:  gstPct > 0 ? `${gstPct}%` : '0%',
        amt:  rs(itemTotal),
      };

      setColor(DARK);
      cols.forEach(c => {
        doc.setFont('helvetica', c.key === 'desc' ? 'bold' : 'normal');
        doc.setFontSize(7.5);
        doc.text(vals[c.key] || '', c.align === 'right' ? c.x + c.w - 1.5 : c.align === 'center' ? c.x + c.w / 2 : c.x + 1.5,
          Y + 4, { align: c.align });
      });
      Y += ROW_H;
    });

    // Table border
    setColor(BORD, 'draw');
    doc.setLineWidth(0.4);
    doc.rect(M, Y - items.length * 6 - TH_H, CW, TH_H + items.length * 6, 'D');
    Y += 3;

    // ── 5. TOTALS ─────────────────────────────────────────────────────────────
    const TW = 72; const TX = M + CW - TW; const TR_H = 6;

    const totalRow = (label, val, isFinal = false, color = null) => {
      if (isFinal) {
        setColor(BLUE, 'fill');
        doc.rect(TX, Y, TW, TR_H + 1, 'F');
        setColor(WHITE);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(label, TX + 2, Y + 4.5);
        doc.text(val, TX + TW - 1.5, Y + 4.5, { align: 'right' });
        Y += TR_H + 1;
      } else {
        setColor(BORD, 'draw'); doc.setLineWidth(0.2);
        doc.rect(TX, Y, TW, TR_H, 'D');
        setColor(color || GREY);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        doc.text(label, TX + 2, Y + 4);
        doc.setFont('helvetica', color ? 'bold' : 'normal');
        doc.text(val, TX + TW - 1.5, Y + 4, { align: 'right' });
        Y += TR_H;
      }
    };

    const subtotal = billData.subtotal || previewData?.subtotal || billData.total_amount;
    totalRow('Subtotal', rs(subtotal));
    if (billData.gst_amount && billData.gst_percentage)
      totalRow(`GST (${billData.gst_percentage}%)`, rs(billData.gst_amount));
    if (billData.discount_amount && parseFloat(billData.discount_amount) > 0)
      totalRow(billData.discount_type === 'percentage' ? `Discount (${billData.discount_value}%)` : 'Discount',
        `-${rs(billData.discount_amount)}`);
    totalRow('GRAND TOTAL', rs(billData.total_amount), true);

    // Paid / Due
    const totalPaid = (billData.payments || []).filter(p => p.mode !== 'credit').reduce((s, p) => s + parseFloat(p.amount), 0);
    const dueAmt    = parseFloat(billData.total_amount) - totalPaid;
    if (totalPaid > 0)  totalRow('Paid Amount', rs(totalPaid), false, GREEN);
    if (dueAmt > 0.01)  totalRow('Balance Due',  rs(dueAmt),   false, RED);

    Y += 6;

    // ── Amount in words ───────────────────────────────────────────────────────
    setColor(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text('Amount in Words: ', M, Y);
    setColor(GREY); doc.setFont('helvetica', 'normal');
    doc.text(numberToWords(billData.total_amount).toUpperCase(), M + doc.getTextWidth('Amount in Words: '), Y);
    Y += 6;

    // ── 6. DIVIDER ────────────────────────────────────────────────────────────
    setColor(BORD, 'draw'); doc.setLineWidth(0.3);
    doc.line(M, Y, M + CW, Y);
    Y += 5;

    // ── 7. PAYMENT + SIGNATURE (two cols) ───────────────────────────────────
    const PAY_W   = (CW - 4) / 2;
    const SIG_X   = M + PAY_W + 4;
    const SIG_W   = CW - PAY_W - 4;
    const secTopY = Y;

    // Payment details (left)
    setColor(LBLUE); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Payment Details:', M, Y);
    Y += 5;
    const pmtLine = (label, val, color) => {
      setColor(DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      doc.text(`${label}: `, M, Y, { continued: false });
      doc.text(`${label}: `, M, Y);
      setColor(color || GREY);
      doc.text(val, M + doc.getTextWidth(`${label}: `), Y);
      Y += 4.2;
    };
    (billData.payments || []).forEach(p => pmtLine(p.mode.toUpperCase(), rs(p.amount)));
    if (dueAmt > 0.01) pmtLine('BALANCE DUE', rs(dueAmt), RED);

    // Signature (right)
    setColor(GREY); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Authorised Signatory', SIG_X + SIG_W / 2, secTopY, { align: 'center' });

    if (shop?.signature_image) {
      try { doc.addImage(shop.signature_image, 'PNG', SIG_X + SIG_W / 2 - 15, secTopY + 3, 30, 12); }
      catch (_) { /* skip */ }
    }

    const sigLineY = secTopY + 20;
    setColor(BORD, 'draw'); doc.setLineWidth(0.4);
    doc.line(SIG_X + 4, sigLineY, SIG_X + SIG_W - 4, sigLineY);
    setColor(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(shop?.authorized_signatory || shop?.shop_name || 'Authorized Signatory',
      SIG_X + SIG_W / 2, sigLineY + 4, { align: 'center' });

    Y = Math.max(Y, sigLineY + 8) + 6;

    // ── 8. TERMS ─────────────────────────────────────────────────────────────
    const termsText = shop?.terms_and_conditions || 'Goods once sold will not be taken back.';
    setColor(LBLUE); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Terms & Conditions:', M, Y);
    Y += 4;
    setColor(GREY); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    termsText.split('\n').forEach(line => {
      if (line.trim()) { doc.text(`• ${line.trim()}`, M, Y, { maxWidth: CW }); Y += 4; }
    });
    Y += 3;

    // ── 9. FOOTER ─────────────────────────────────────────────────────────────
    setColor(BORD, 'draw'); doc.setLineWidth(0.3);
    doc.line(M, Y, M + CW, Y);
    Y += 4;
    setColor(GREY); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text('This is a computer-generated bill. Thank you for your business!', PW / 2, Y, { align: 'center' });

    // ── Save ─────────────────────────────────────────────────────────────────
    doc.save(`Bill_${billData.id || Date.now()}.pdf`);

    let yPos = Y; // alias kept for compatibility
  };

  // Helper function to convert number to words (Indian format)
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero Rupees Only';
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const hundred = Math.floor((num % 1000) / 100);
    const remainder = Math.floor(num % 100);
    
    let words = '';
    
    if (crore > 0) words += ones[crore] + ' Crore ';
    if (lakh > 0) words += (lakh < 10 ? ones[lakh] : tens[Math.floor(lakh / 10)] + ' ' + ones[lakh % 10]) + ' Lakh ';
    if (thousand > 0) words += (thousand < 10 ? ones[thousand] : tens[Math.floor(thousand / 10)] + ' ' + ones[thousand % 10]) + ' Thousand ';
    if (hundred > 0) words += ones[hundred] + ' Hundred ';
    
    if (remainder > 0) {
      if (remainder < 10) words += ones[remainder];
      else if (remainder < 20) words += teens[remainder - 10];
      else words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
    }
    
    return words.trim() + ' Rupees Only';
  };

  // ✅ REMOVED: Complex payment methods - using simple state instead

  const paymentIcons = {
    cash: Banknote,
    upi: Smartphone, // ✅ Simplified to just upi
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.total, 0);
  };

  // ✅ Calculate discount amount
  const calculateDiscountAmount = () => {
    const discountVal = parseFloat(discountValue) || 0;
    if (!discountEnabled || discountVal === 0) return 0;
    
    const subtotal = calculateTotal();
    const gstAmount = gstEnabled ? (subtotal * gstPercentage) / 100 : 0;
    const totalBeforeDiscount = subtotal + gstAmount;
    
    if (discountType === 'percentage') {
      return (totalBeforeDiscount * discountVal) / 100;
    } else {
      return discountVal;
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {t('billing.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('billing.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-5 py-2.5 rounded-xl shadow-lg">
          <ShoppingCart className="w-5 h-5 text-white" />
          <div>
            <p className="text-xs text-white/90 font-bold uppercase tracking-wider">{t('billing.itemsInCart')}</p>
            <p className="text-xl font-black text-white">{selectedItems.length}</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT - scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 transition-all font-medium shadow-md placeholder-gray-400"
            />
          </div>

          {/* Products Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-md">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              {t('billing.availableProducts')}
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? t('billing.noProductsFound') : t('billing.noProductsAvailable')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 border border-secondary-200 dark:border-secondary-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
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
                      <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1 text-sm truncate">{product.product_name}</h3>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span className="text-lg font-bold text-emerald-600">₹{product.selling_price}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToBill(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Plus className="w-3 h-3" />
                      {t('billing.addToBill')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Details */}
          <div id="customer-section" className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-600 p-4 sm:p-6">
            <h3 className="text-base font-bold text-secondary-900 dark:text-secondary-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Details
              <span className="text-red-500 text-xs font-normal">(Required to preview)</span>
            </h3>
            {existingCustomer && (
              <div className="mb-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">✓ Existing Customer Found</p>
                <p className="text-sm text-green-700 dark:text-green-400">Previous Due: ₹{parseFloat(existingCustomer.total_due).toFixed(2)}</p>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Customer Name" value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number (10 digits)</label>
                <input type="tel" placeholder="Search by phone..." value={customerDetails.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setCustomerDetails({ ...customerDetails, phone: value });
                    if (value.length === 10) searchCustomerByPhone(value);
                    else setExistingCustomer(null);
                  }}
                  maxLength="10"
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {searchingCustomer && <p className="text-xs text-blue-600 mt-1">Searching...</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea placeholder="Customer Address" value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                💡 Address & phone required only for credit/udhar sales
              </div>
            </div>
          </div>

          {/* GST Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                GST (Optional)
              </h3>
              <button onClick={() => setGstEnabled(!gstEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${gstEnabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${gstEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {gstEnabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="GST %" value={gstPercentage}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 0 && v <= 28) setGstPercentage(v); }}
                    min="0" max="28" step="0.1"
                    className="flex-1 px-4 py-2 border-2 border-indigo-400 dark:border-indigo-500 rounded-xl bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 font-bold focus:ring-2 focus:ring-indigo-400" />
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">%</span>
                </div>
                {selectedItems.length > 0 && (
                  <div className="bg-white dark:bg-secondary-800 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span><span className="font-semibold">₹{calculateTotal().toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">GST ({gstPercentage}%):</span><span className="font-semibold text-green-600">₹{((calculateTotal() * gstPercentage) / 100).toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1"></div>
                    <div className="flex justify-between text-base"><span className="font-bold">Total:</span><span className="font-bold text-green-600">₹{(calculateTotal() + (calculateTotal() * gstPercentage) / 100).toFixed(2)}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discount Section */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Discount (Optional)
              </h3>
              <button onClick={() => setDiscountEnabled(!discountEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${discountEnabled ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${discountEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {discountEnabled && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button onClick={() => setDiscountType('percentage')} className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${discountType === 'percentage' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-300 border border-orange-300 dark:border-orange-700'}`}>Percentage (%)</button>
                  <button onClick={() => setDiscountType('fixed')} className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${discountType === 'fixed' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-300 border border-orange-300 dark:border-orange-700'}`}>Fixed (₹)</button>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder={discountType === 'percentage' ? 'Enter discount %' : 'Enter discount amount'} value={discountValue}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') { setDiscountValue(''); return; }
                      const value = parseFloat(inputValue) || 0;
                      if (discountType === 'percentage' && value > 100) return;
                      setDiscountValue(inputValue);
                    }}
                    min="0"
                    className="flex-1 px-4 py-2 border-2 border-orange-400 dark:border-orange-500 rounded-xl bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 font-bold focus:ring-2 focus:ring-orange-400" />
                  <span className="text-lg font-bold text-orange-600">{discountType === 'percentage' ? '%' : '₹'}</span>
                </div>
                {selectedItems.length > 0 && discountValue && parseFloat(discountValue) > 0 && (
                  <div className="bg-white dark:bg-secondary-800 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span><span className="font-semibold">₹{calculateTotal().toFixed(2)}</span></div>
                    {gstEnabled && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">GST ({gstPercentage}%):</span><span className="font-semibold text-green-600">₹{((calculateTotal() * gstPercentage) / 100).toFixed(2)}</span></div>}
                    <div className="flex justify-between text-red-600"><span>Discount:</span><span className="font-semibold">-₹{calculateDiscountAmount().toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1"></div>
                    <div className="flex justify-between text-base"><span className="font-bold">Final Total:</span><span className="font-bold text-orange-600">₹{calculateFinalTotal().toFixed(2)}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>{/* end left grid */}
        </div>{/* end left column */}

        {/* RIGHT COLUMN - Fixed, own scroll */}
        <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          {/* Scrollable items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <h2 className="text-base font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10 border-b border-gray-100 dark:border-gray-700">
              <Receipt className="w-4 h-4 text-emerald-600" />
              {t('billing.currentBill')}
            </h2>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('billing.noItemsAdded')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-secondary-200 dark:border-secondary-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">₹{item.price} × {item.quantity} = ₹{item.total}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Minus className="w-3 h-3" /></button>
                      <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.product_id, e.target.value)} min="1"
                        className="w-10 text-center font-semibold text-sm border border-secondary-300 dark:border-secondary-700 rounded bg-white dark:bg-secondary-800 focus:ring-1 focus:ring-emerald-500" />
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => removeFromBill(item.product_id)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bill Preview */}
            {previewData && (
              <div className="mt-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-600 p-4">
                <h3 className="text-sm font-bold text-secondary-900 dark:text-secondary-100 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  {t('billing.billPreview')}
                </h3>
                {(customerDetails.name || customerDetails.phone) && (
                  <div className="mb-3 pb-2 border-b border-emerald-200 dark:border-emerald-500">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Customer:</p>
                    {customerDetails.name && <p className="text-xs text-gray-600 dark:text-gray-400">{customerDetails.name}</p>}
                    {customerDetails.phone && <p className="text-xs text-gray-600 dark:text-gray-400">{customerDetails.phone}</p>}
                  </div>
                )}
                <div className="space-y-1 mb-3">
                  {previewData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-secondary-900 dark:text-secondary-100 flex-shrink-0">₹{item.total}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-emerald-200 dark:border-emerald-500 pt-2 space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-600 dark:text-gray-400">Subtotal:</span><span className="font-semibold">₹{previewData.subtotal || previewData.total_amount}</span></div>
                  {previewData.gst_amount && <div className="flex justify-between text-xs"><span className="text-gray-600 dark:text-gray-400">GST ({previewData.gst_percentage}%):</span><span className="font-semibold text-green-600">+₹{previewData.gst_amount}</span></div>}
                  {previewData.discount_amount && <div className="flex justify-between text-xs"><span className="text-gray-600 dark:text-gray-400">Discount:</span><span className="font-semibold text-red-600">-₹{previewData.discount_amount}</span></div>}
                  <div className="flex justify-between items-center pt-1 border-t border-emerald-300 dark:border-emerald-600">
                    <span className="text-sm font-bold text-secondary-900 dark:text-secondary-100">Total:</span>
                    <span className="text-lg font-black text-emerald-600">₹{previewData.total_amount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions - always visible */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3">
            {selectedItems.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('billing.subtotal')}:</span>
                <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100">₹{calculateTotal().toFixed(2)}</span>
              </div>
            )}

            <button
              onClick={previewBill}
              disabled={previewLoading || selectedItems.length === 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium shadow-md transition-all duration-300 text-sm
                ${!customerDetails.name.trim() || selectedItems.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-lg'
                }`}
            >
              {previewLoading ? t('common.loading') : (
                !customerDetails.name.trim() && selectedItems.length > 0
                  ? '⚠ Enter customer name first'
                  : t('billing.previewBill')
              )}
            </button>

            {previewData && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
              >
                <Receipt className="w-4 h-4" />
                {t('billing.proceedToPayment')}
              </button>
            )}
          </div>
        </div>{/* end right column */}
      </div>{/* end two-column */}

      {/* ✅ SIMPLE Payment Modal - Dark Mode Friendly */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Header - Premium Gradient with Better Colors */}
            <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-700 dark:via-teal-700 dark:to-emerald-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                <Receipt className="w-7 h-7 text-white" />
                Payment Details
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50 dark:bg-gray-900">
              
              {/* Total Amount Display - Indigo/Purple Theme - Mobile Responsive */}
              <div className="text-center p-4 sm:p-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-700 dark:via-teal-700 dark:to-emerald-700 rounded-2xl shadow-2xl border-2 border-emerald-400 dark:border-emerald-600">
                <p className="text-xs sm:text-sm text-white/90 font-bold mb-1 sm:mb-2 tracking-wide uppercase">Total Amount</p>
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl tracking-tight break-all">
                  ₹{previewData.total_amount}
                </p>
              </div>

              {/* Payment Mode Dropdown - Premium Style */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                  Payment Mode
                </label>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-indigo-400 dark:border-indigo-500 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 font-bold text-lg focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 focus:border-indigo-600 dark:focus:border-indigo-400 appearance-none cursor-pointer shadow-lg transition-all"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 Online (UPI)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Paid Amount Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                  Paid Amount (₹)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={paidAmount}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow only numbers and decimal point
                    if (inputValue !== '' && !/^\d*\.?\d*$/.test(inputValue)) {
                      return;
                    }
                    setPaidAmount(inputValue);
                  }}
                  onBlur={() => {
                    // Calculate due amount only on blur (when user finishes typing)
                    if (paidAmount === '' || paidAmount === null) {
                      setDueAmount('');
                    } else {
                      const paid = parseFloat(paidAmount) || 0;
                      const due = Math.max(0, previewData.total_amount - paid);
                      setDueAmount(due.toFixed(2));
                    }
                  }}
                  placeholder="Enter paid amount"
                  className="w-full px-4 py-3 border-2 border-indigo-400 dark:border-indigo-500 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 focus:border-indigo-600 dark:focus:border-indigo-400 font-bold text-xl shadow-lg transition-all"
                />
              </div>

              {/* Due Amount Input */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 tracking-wide">
                  Due Amount (₹)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={dueAmount}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow only numbers and decimal point
                    if (inputValue !== '' && !/^\d*\.?\d*$/.test(inputValue)) {
                      return;
                    }
                    setDueAmount(inputValue);
                  }}
                  onBlur={() => {
                    // Calculate paid amount only on blur (when user finishes typing)
                    if (dueAmount === '' || dueAmount === null) {
                      setPaidAmount('');
                    } else {
                      const due = parseFloat(dueAmount) || 0;
                      const paid = Math.max(0, previewData.total_amount - due);
                      setPaidAmount(paid.toFixed(2));
                    }
                  }}
                  placeholder="Enter due amount"
                  className="w-full px-4 py-3 border-2 border-orange-400 dark:border-orange-500 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-orange-400 dark:focus:ring-orange-600 focus:border-orange-600 dark:focus:border-orange-400 font-bold text-xl shadow-lg transition-all"
                />
              </div>

              {/* QR Code - Show only for UPI payment */}
              {paymentMode === 'upi' && shop?.upi_id && paidAmount && parseFloat(paidAmount) > 0 && (
                <div className="w-full flex flex-col items-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 p-5 rounded-xl border-2 border-emerald-400 dark:border-emerald-500 shadow-lg">
                  <p className="text-sm font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                    Scan QR to Pay
                  </p>

                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <QRCodeCanvas
                      value={`upi://pay?pa=${shop.upi_id}&pn=${shop.shop_name}&am=${paidAmount}&cu=INR`}
                      size={180}
                    />
                  </div>

                  <p className="text-xs mt-3 text-gray-700 dark:text-gray-300 break-all text-center font-semibold">
                    UPI ID: {shop.upi_id}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                    Amount: ₹{parseFloat(paidAmount)}
                  </p>
                </div>
              )}

              {/* Due Warning */}
              {dueAmount && parseFloat(dueAmount) > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
                        Credit Payment
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        ₹{parseFloat(dueAmount)} will be added to customer's account. Please ensure customer name, phone, and address are filled above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl p-5 border-2 border-emerald-200 dark:border-gray-700 shadow-lg">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Payment Summary
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm bg-white/60 dark:bg-gray-700/60 p-3 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">Total Amount:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      ₹{previewData.total_amount}
                    </span>
                  </div>
                  {paidAmount && parseFloat(paidAmount) > 0 && (
                    <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-500/15 p-3 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">
                        Paid ({paymentMode === 'cash' ? 'Cash' : 'UPI'}):
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-300">
                        ₹{parseFloat(paidAmount)}
                      </span>
                    </div>
                  )}
                  {dueAmount && parseFloat(dueAmount) > 0 && (
                    <div className="flex justify-between text-sm bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">Due:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        ₹{parseFloat(dueAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-200 dark:border-gray-600 pt-3 mt-3"></div>
                  <div className="flex justify-between text-base bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 p-3 rounded-lg">
                    <span className="font-bold text-gray-900 dark:text-gray-100">Balance:</span>
                    <span className={`font-bold text-lg ${
                      Math.abs((parseFloat(paidAmount) || 0) + (parseFloat(dueAmount) || 0) - previewData.total_amount) < 0.01
                        ? 'text-emerald-600 dark:text-emerald-300'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{Math.abs((parseFloat(paidAmount) || 0) + (parseFloat(dueAmount) || 0) - previewData.total_amount)}
                      {Math.abs((parseFloat(paidAmount) || 0) + (parseFloat(dueAmount) || 0) - previewData.total_amount) < 0.01 ? ' ✓' : ' ✗'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer - Fixed with rounded bottom corners */}
            <div className="p-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaidAmount('');
                    setDueAmount('');
                    setPaymentMode('cash');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createBill}
                  disabled={createLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Bill'
                  )}
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
