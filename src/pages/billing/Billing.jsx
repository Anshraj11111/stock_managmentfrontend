import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Receipt, CreditCard, Smartphone, Banknote } from 'lucide-react';
import jsPDF from 'jspdf';
import { productService } from '../../services/productService';
import { billService } from '../../services/billService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payments: [{ mode: 'cash', amount: '' }],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
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

    // Validate payments - ensure all amounts are positive numbers
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
      
      // Prepare bill data for printing
      const billDataForPrint = {
        id: billResponse.bill_id || billResponse.data?.bill_id || 'N/A',
        items: previewData.items,
        total_amount: previewData.total_amount,
        payments: paymentsWithNumbers,
      };
      
      // Print the bill
      printBill(billDataForPrint);
      
      // Reset form
      setSelectedItems([]);
      setPreviewData(null);
      setShowPaymentModal(false);
      setPaymentData({ payments: [{ mode: 'cash', amount: '' }] });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create bill';
      console.error('Bill creation failed:', errorMsg);
      toast.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const printBill = (billData) => {
    const doc = new jsPDF();

    // Shop header
    doc.setFontSize(20);
    doc.text('Shop Bill', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Shop Name: Your Shop Name', 20, 40);
    doc.text(`Bill ID: ${billData.id || 'N/A'}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    // Items table
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

    // Total
    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${previewData.total_amount}`, 130, yPosition);

    // Payments
    yPosition += 20;
    doc.text('Payment Details:', 20, yPosition);
    yPosition += 10;
    paymentData.payments.forEach(payment => {
      doc.text(`${payment.mode.toUpperCase()}: ₹${payment.amount}`, 30, yPosition);
      yPosition += 10;
    });

    // Save the PDF
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          Billing
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Create bills and manage payments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2">
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Products
            </h2>

            {products.length === 0 ? (
              <EmptyState
                title="No products available"
                description="Add products to your inventory first."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                        {product.product_name}
                      </h3>
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        ₹{product.selling_price}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                      Stock: {product.stock_quantity}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => addToBill(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Bill
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Bill */}
        <div className="space-y-6">
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Current Bill
            </h2>

            {selectedItems.length === 0 ? (
              <EmptyState
                title="No items selected"
                description="Add products to create a bill."
              />
            ) : (
              <div className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">
                          {item.name}
                        </p>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromBill(item.product_id)}
                          className="p-1 rounded text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={previewBill}
                  loading={previewLoading}
                  className="w-full"
                >
                  Preview Bill
                </Button>
              </div>
            )}
          </div>

          {/* Bill Preview */}
          {previewData && (
            <div className="glass-card">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Bill Preview
              </h2>

              <div className="space-y-3">
                {previewData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.total}</span>
                  </div>
                ))}

                <div className="border-t border-secondary-200 dark:border-secondary-700 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{previewData.total_amount}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Create Bill
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay flex items-center justify-center p-4">
          <div className="modal-content max-w-md w-full">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Payment Details
            </h2>

            <div className="space-y-4">
              <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Amount</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  ₹{previewData.total_amount}
                </p>
              </div>

              <div className="space-y-3">
                {paymentData.payments.map((payment, index) => {
                  const Icon = paymentIcons[payment.mode];
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                      <Icon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                      <select
                        value={payment.mode}
                        onChange={(e) => updatePayment(index, 'mode', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-secondary-300 dark:border-secondary-700 rounded bg-white dark:bg-secondary-900"
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
                        className="flex-1 px-2 py-1 text-sm border border-secondary-300 dark:border-secondary-700 rounded bg-white dark:bg-secondary-900"
                        required
                      />
                      {paymentData.payments.length > 1 && (
                        <button
                          onClick={() => removePayment(index)}
                          className="p-1 text-danger-600 hover:text-danger-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={addPaymentMethod}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createBill}
                  loading={createLoading}
                >
                  Create Bill
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
