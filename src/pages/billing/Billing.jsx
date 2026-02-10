import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Receipt, CreditCard, Smartphone, Banknote, ShoppingCart, DollarSign, Package, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import { productService } from '../../services/productService';
import { billService } from '../../services/billService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentData, setPaymentData] = useState({
    payments: [{ mode: 'cash', amount: '' }],
  });

  useEffect(() => {
    fetchProducts();
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
    if (newQuantity <= 0) {
      removeFromBill(productId);
      return;
    }

    setSelectedItems(selectedItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
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

    setPreviewLoading(true);
    try {
      const data = await billService.previewBill(selectedItems);
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
      const billResponse = await billService.createBill({
        items: selectedItems,
        payments: paymentsWithNumbers,
      });

      toast.success('Bill created successfully!');
      
      const billDataForPrint = {
        id: billResponse.bill_id || billResponse.data?.bill_id || 'N/A',
        items: previewData.items,
        total_amount: previewData.total_amount,
        payments: paymentsWithNumbers,
      };
      
      printBill(billDataForPrint);
      
      setSelectedItems([]);
      setPreviewData(null);
      setShowPaymentModal(false);
      setPaymentData({ payments: [{ mode: 'cash', amount: '' }] });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create bill';
      toast.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const printBill = (billData) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Shop Bill', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Shop Name: Your Shop Name', 20, 40);
    doc.text(`Bill ID: ${billData.id || 'N/A'}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    let yPosition = 80;
    doc.setFontSize(10);
    doc.text('Item', 20, yPosition);
    doc.text('Qty', 100, yPosition);
    doc.text('Price', 130, yPosition);
    doc.text('Total', 160, yPosition);

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    previewData.items.forEach(item => {
      doc.text(item.name, 20, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`₹${item.price}`, 130, yPosition);
      doc.text(`₹${item.total}`, 160, yPosition);
      yPosition += 10;
    });

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${previewData.total_amount}`, 130, yPosition);

    yPosition += 20;
    doc.text('Payment Details:', 20, yPosition);
    yPosition += 10;
    paymentData.payments.forEach(payment => {
      doc.text(`${payment.mode.toUpperCase()}: ₹${payment.amount}`, 30, yPosition);
      yPosition += 10;
    });

    doc.save(`bill_${billData.id || Date.now()}.pdf`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="px-6 pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Bill
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select products and generate invoices
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Items in Cart</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Products Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Available Products
            </h2>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'No products found' : 'No products available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        product.stock_quantity > 10 
                          ? 'bg-green-100 text-green-700' 
                          : product.stock_quantity > 0 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Stock: {product.stock_quantity}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 pr-20">
                        {product.product_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="text-2xl font-bold text-emerald-600">
                          ₹{product.selling_price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToBill(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Bill
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="space-y-6">
          {/* Current Bill */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600" />
              Current Bill
            </h2>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  No items added yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {selectedItems.map((item, index) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{item.price} × {item.quantity} = ₹{item.total}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromBill(item.product_id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={previewBill}
                    disabled={previewLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {previewLoading ? 'Loading...' : 'Preview Bill'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bill Preview */}
          {previewData && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Bill Preview
              </h2>

              <div className="space-y-3 mb-4">
                {previewData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{item.total}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
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
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Payment Details
            </h2>

            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{previewData.total_amount}
                </p>
              </div>

              <div className="space-y-3">
                {paymentData.payments.map((payment, index) => {
                  const Icon = paymentIcons[payment.mode];
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700">
                      <Icon className="w-6 h-6 text-indigo-600" />
                      <select
                        value={payment.mode}
                        onChange={(e) => updatePayment(index, 'mode', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={payment.amount}
                        onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      {paymentData.payments.length > 1 && (
                        <button
                          onClick={() => removePayment(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addPaymentMethod}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Payment Method
              </button>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createBill}
                  disabled={createLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Bill'}
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
