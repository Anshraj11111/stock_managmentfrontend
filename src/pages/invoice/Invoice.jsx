import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Receipt, FileCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { billService } from '../../services/billService';
import { shopService } from '../../services/shopService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Invoice = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [billDateFilter, setBillDateFilter] = useState('');
  const [invoiceDateFilter, setInvoiceDateFilter] = useState('');
  const [billIdInput, setBillIdInput] = useState('');
  const [downloadedInvoices, setDownloadedInvoices] = useState([]);

  useEffect(() => {
    fetchShop();
    fetchBills();
    loadDownloadedInvoices();
  }, []);

  const fetchShop = async () => {
    try {
      const data = await shopService.getShopDetails();
      setShop(data);
    } catch (err) {
      console.log("Shop fetch error");
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await billService.getBills();
      setBills(data);
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const loadDownloadedInvoices = () => {
    const stored = localStorage.getItem('downloadedInvoices');
    if (stored) {
      setDownloadedInvoices(JSON.parse(stored));
    }
  };

  const saveDownloadedInvoice = (billId, billAmount) => {
    const newInvoice = {
      billId,
      amount: billAmount,
      downloadedAt: new Date().toISOString()
    };
    const updated = [newInvoice, ...downloadedInvoices];
    setDownloadedInvoices(updated);
    localStorage.setItem('downloadedInvoices', JSON.stringify(updated));
  };

  const handleBillClick = async (bill) => {
    setSelectedBill(bill);
    // Fetch full bill details
    try {
      const fullBill = await billService.getBillById(bill.id);
      setSelectedBill(fullBill);
    } catch (error) {
      console.error('Failed to fetch bill details:', error);
    }
  };

  const downloadInvoiceById = async () => {
    if (!billIdInput || billIdInput.trim() === '') {
      toast.error('Please enter a Bill ID');
      return;
    }

    setDownloading(true);
    try {
      const bill = await billService.getBillById(billIdInput);
      await generateProfessionalInvoice(bill);
      saveDownloadedInvoice(bill.id, bill.total_amount);
      toast.success('Invoice downloaded successfully!');
      setBillIdInput('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bill not found');
    } finally {
      setDownloading(false);
    }
  };

  const generateProfessionalInvoice = async (bill) => {
    const doc = new jsPDF();
    
    // Premium Color Palette
    const colors = {
      primary: [79, 70, 229],       // Indigo-600 (more professional)
      secondary: [124, 58, 237],    // Violet-600
      accent: [219, 39, 119],       // Pink-600
      dark: [15, 23, 42],           // Slate-900
      light: [248, 250, 252],       // Slate-50
      success: [22, 163, 74],       // Green-600
      text: [30, 41, 59]            // Slate-800
    };
    
    // Generate QR Code if UPI ID exists
    let qrCodeDataUrl = null;
    if (shop?.upi_id) {
      try {
        const upiString = `upi://pay?pa=${shop.upi_id}&pn=${encodeURIComponent(shop.shop_name || 'Shop')}&am=${bill.total_amount}&cu=INR`;
        qrCodeDataUrl = await QRCode.toDataURL(upiString, {
          width: 120,
          margin: 1,
          color: {
            dark: '#6366F1',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('QR Code generation failed:', error);
      }
    }
    
    // ========================================
    // PREMIUM HEADER WITH GRADIENT EFFECT
    // ========================================
    
    // Header background with gradient effect (simulated with rectangles)
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 48, 'F');
    
    // Company Name - Extra Large, Bold, White
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(shop?.shop_name?.toUpperCase() || 'YOUR SHOP NAME', 15, 20);
    
    // Tagline - Medium, White
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Quality Products & Services', 15, 28);
    
    // Company Details - White text
    doc.setFontSize(9);
    let yPos = 34;
    if (shop?.address) {
      const addressLines = doc.splitTextToSize(shop.address, 85);
      doc.text(addressLines[0], 15, yPos);
    }
    
    // Contact info in header
    if (shop?.owner_phone) {
      doc.text(`📞 ${shop.owner_phone}`, 15, 39);
    }
    if (shop?.gstin) {
      doc.text(`GSTIN: ${shop.gstin}`, 15, 44);
    }
    
    // TAX INVOICE Badge - Right side with accent color
    doc.setFillColor(...colors.accent);
    doc.roundedRect(138, 10, 60, 14, 2, 2, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 168, 19, { align: 'center' });
    
    // Invoice Details Box - Premium card style
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(138, 26, 60, 20, 2, 2, 'FD');
    
    doc.setTextColor(...colors.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 141, 31);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.primary);
    doc.setFontSize(10);
    doc.text(`#${bill.bill_number || bill.id}`, 141, 36);
    
    doc.setTextColor(...colors.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 141, 41);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(new Date(bill.createdAt).toLocaleDateString('en-IN'), 141, 45);
    
    // Reset text color
    doc.setTextColor(...colors.text);
    yPos = 55;
    
    // ========================================
    // CUSTOMER DETAILS - Premium Card Style
    // ========================================
    
    if (bill.customer_name || bill.customer_phone) {
      // Customer card background
      doc.setFillColor(...colors.light);
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, yPos, 180, 18, 2, 2, 'FD');
      
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('BILL TO:', 18, yPos);
      
      doc.setTextColor(...colors.dark);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(bill.customer_name || 'Walk-in Customer', 18, yPos + 6);
      
      if (bill.customer_phone) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.text);
        doc.text(`📱 ${bill.customer_phone}`, 18, yPos + 11);
      }
      
      yPos += 22;
    } else {
      yPos += 6;
    }
    
    doc.setTextColor(...colors.text);
    
    // ========================================
    // PREMIUM ITEMS TABLE
    // ========================================
    
    const tableLeft = 15;
    const tableWidth = 180;
    const rowHeight = 8;
    
    // Column widths
    const col1 = 12;  // S.No
    const col2 = 85;  // Product Name
    const col3 = 18;  // HSN
    const col4 = 18;  // Qty
    const col5 = 23;  // Rate
    const col6 = 24;  // Amount
    
    // Table Header with gradient effect
    doc.setFillColor(...colors.primary);
    doc.roundedRect(tableLeft, yPos, tableWidth, rowHeight, 1, 1, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('S.No', tableLeft + 3, yPos + 5.5);
    doc.text('Product / Service', tableLeft + col1 + 3, yPos + 5.5);
    doc.text('HSN', tableLeft + col1 + col2 + 2, yPos + 5.5);
    doc.text('Qty', tableLeft + col1 + col2 + col3 + 2, yPos + 5.5);
    doc.text('Rate', tableLeft + col1 + col2 + col3 + col4 + 2, yPos + 5.5);
    doc.text('Amount', tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 5.5);
    
    yPos += rowHeight;
    
    // Parse items
    let items = [];
    if (typeof bill.items === 'string') {
      items = JSON.parse(bill.items);
    } else if (bill.BillItems && Array.isArray(bill.BillItems)) {
      items = bill.BillItems.map(item => ({
        name: item.Product?.product_name || 'Product',
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }));
    } else if (Array.isArray(bill.items)) {
      items = bill.items;
    }
    
    let subtotal = 0;
    
    // Items rows with alternating colors
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    
    items.forEach((item, index) => {
      const itemTotal = parseFloat(item.total || (item.price * item.quantity));
      subtotal += itemTotal;
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(...colors.light);
      }
      doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'F');
      
      // Draw borders
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.rect(tableLeft, yPos, tableWidth, rowHeight);
      
      // Item data
      doc.text(`${index + 1}`, tableLeft + 5, yPos + 5.5);
      const productName = item.name.length > 45 ? item.name.substring(0, 45) + '...' : item.name;
      doc.text(productName, tableLeft + col1 + 3, yPos + 5.5);
      doc.text('-', tableLeft + col1 + col2 + 5, yPos + 5.5);
      doc.text(item.quantity.toString(), tableLeft + col1 + col2 + col3 + 5, yPos + 5.5);
      doc.text(`₹${parseFloat(item.price).toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + 2, yPos + 5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`₹${itemTotal.toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 5.5);
      doc.setFont('helvetica', 'normal');
      
      yPos += rowHeight;
    });
    
    // Subtotal Row
    doc.setFillColor(...colors.light);
    doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Subtotal', tableLeft + col1 + col2 + col3 + 2, yPos + 5.5);
    doc.setTextColor(...colors.primary);
    doc.text(`₹${subtotal.toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 5.5);
    doc.setTextColor(...colors.text);
    
    yPos += rowHeight;
    
    // GST Row (if applicable)
    if (bill.gst_amount && bill.gst_percentage) {
      doc.setFillColor(255, 255, 255);
      doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`GST (${bill.gst_percentage}%)`, tableLeft + col1 + col2 + col3 + 2, yPos + 5.5);
      doc.text(`₹${parseFloat(bill.gst_amount).toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 5.5);
      yPos += rowHeight;
    }
    
    // Discount Row (if applicable)
    if (bill.discount_amount && parseFloat(bill.discount_amount) > 0) {
      doc.setFillColor(255, 255, 255);
      doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38); // Red color
      doc.text(`Discount`, tableLeft + col1 + col2 + col3 + 2, yPos + 5.5);
      doc.text(`-₹${parseFloat(bill.discount_amount).toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 5.5);
      doc.setTextColor(...colors.text);
      yPos += rowHeight;
    }
    
    // Grand Total Row - Premium style
    doc.setFillColor(...colors.success);
    doc.roundedRect(tableLeft, yPos, tableWidth, rowHeight + 2, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('GRAND TOTAL', tableLeft + col1 + col2 + col3 + 2, yPos + 6.5);
    doc.setFontSize(13);
    doc.text(`₹${parseFloat(bill.total_amount).toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 6.5);
    
    yPos += rowHeight + 8;
    doc.setTextColor(...colors.text);
    
    // ========================================
    // AMOUNT IN WORDS - Premium Style
    // ========================================
    doc.setFillColor(...colors.light);
    doc.roundedRect(tableLeft, yPos, tableWidth, 14, 1, 1, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...colors.primary);
    doc.text('Amount in Words:', tableLeft + 3, yPos + 6);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    doc.setFontSize(10);
    const amountInWords = numberToWords(bill.total_amount);
    doc.text(amountInWords.toUpperCase(), tableLeft + 3, yPos + 11);
    
    yPos += 20;
    doc.setTextColor(...colors.text);
    
    // ========================================
    // PAYMENT & BANK DETAILS SECTION
    // ========================================
    
    // Two column layout
    const leftColWidth = 90;
    const rightColWidth = 85;
    
    // Left Column - Bank Details Card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    doc.roundedRect(tableLeft, yPos, leftColWidth, 45, 2, 2, 'FD');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('BANK DETAILS', tableLeft + 3, yPos + 7);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.text);
    let bankYPos = yPos + 14;
    
    if (shop?.bank_name) {
      doc.setFont('helvetica', 'bold');
      doc.text('Bank Name:', tableLeft + 3, bankYPos);
      doc.setFont('helvetica', 'normal');
      doc.text(shop.bank_name, tableLeft + 27, bankYPos);
      bankYPos += 6;
    }
    
    if (shop?.bank_account_number) {
      doc.setFont('helvetica', 'bold');
      doc.text('Account No:', tableLeft + 3, bankYPos);
      doc.setFont('helvetica', 'normal');
      doc.text(shop.bank_account_number, tableLeft + 27, bankYPos);
      bankYPos += 6;
    }
    
    if (shop?.bank_ifsc) {
      doc.setFont('helvetica', 'bold');
      doc.text('IFSC Code:', tableLeft + 3, bankYPos);
      doc.setFont('helvetica', 'normal');
      doc.text(shop.bank_ifsc, tableLeft + 27, bankYPos);
      bankYPos += 6;
    }
    
    if (shop?.bank_branch) {
      doc.setFont('helvetica', 'bold');
      doc.text('Branch:', tableLeft + 3, bankYPos);
      doc.setFont('helvetica', 'normal');
      doc.text(shop.bank_branch, tableLeft + 27, bankYPos);
      bankYPos += 6;
    }
    
    if (shop?.upi_id) {
      doc.setFont('helvetica', 'bold');
      doc.text('UPI ID:', tableLeft + 3, bankYPos);
      doc.setFont('helvetica', 'normal');
      doc.text(shop.upi_id, tableLeft + 27, bankYPos);
    }
    
    // Right Column - QR Code & Signature
    const rightColX = tableLeft + leftColWidth + 5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.primary);
    doc.roundedRect(rightColX, yPos, rightColWidth, 45, 2, 2, 'FD');
    
    // QR Code
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', rightColX + 5, yPos + 5, 28, 28);
      doc.setFontSize(8);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('Scan to Pay', rightColX + 12, yPos + 37);
    }
    
    // Signature Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.dark);
    doc.text('Authorized Signatory', rightColX + 40, yPos + 41);
    
    // Add signature image if available
    if (shop?.signature_image) {
      try {
        doc.addImage(shop.signature_image, 'PNG', rightColX + 40, yPos + 20, 35, 15);
      } catch (error) {
        console.error('Failed to add signature image:', error);
      }
    }
    
    yPos += 54;
    doc.setTextColor(...colors.text);
    
    // ========================================
    // TERMS AND CONDITIONS - Premium Style
    // ========================================
    doc.setFillColor(...colors.light);
    doc.roundedRect(tableLeft, yPos, 180, 24, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('TERMS & CONDITIONS', tableLeft + 3, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    let termsYPos = yPos + 13;
    
    if (shop?.terms_and_conditions) {
      const termsLines = shop.terms_and_conditions.split('\n').filter(line => line.trim());
      termsLines.slice(0, 3).forEach((line) => {
        doc.text(`• ${line.trim()}`, tableLeft + 3, termsYPos);
        termsYPos += 4;
      });
    } else {
      doc.text('• Subject to local jurisdiction', tableLeft + 3, termsYPos);
      termsYPos += 4;
      doc.text('• Goods once sold will not be taken back', tableLeft + 3, termsYPos);
      termsYPos += 4;
      doc.text('• Payment terms as agreed', tableLeft + 3, termsYPos);
    }
    
    yPos += 28;
    
    // ========================================
    // FOOTER - Premium Thank You Message
    // ========================================
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    
    yPos += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...colors.text);
    doc.text('This is a computer-generated invoice', 105, yPos + 5, { align: 'center' });
    
    // Save PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new tab
    window.open(pdfUrl, '_blank');
    
    // Trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Invoice_${bill.bill_number || bill.id}_${new Date().getTime()}.pdf`;
    link.click();
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
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

  // Filter bills by date
  const filteredBills = billDateFilter
    ? bills.filter(bill => {
        const billDate = new Date(bill.createdAt).toLocaleDateString('en-IN');
        const filterDate = new Date(billDateFilter).toLocaleDateString('en-IN');
        return billDate === filterDate;
      })
    : bills;

  // Filter invoices by date
  const filteredInvoices = invoiceDateFilter
    ? downloadedInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.downloadedAt).toLocaleDateString('en-IN');
        const filterDate = new Date(invoiceDateFilter).toLocaleDateString('en-IN');
        return invoiceDate === filterDate;
      })
    : downloadedInvoices;

  return (
    <div className="px-6 pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          Invoice Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download invoices from real billing data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Recent Bills */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Recent Bills
              </h2>
            </div>

            {/* Date Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                <Calendar className="w-4 h-4 inline mr-2" />
                Filter by Date
              </label>
              <input
                type="date"
                value={billDateFilter}
                onChange={(e) => setBillDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {billDateFilter && (
                <button
                  onClick={() => setBillDateFilter('')}
                  className="text-xs text-primary-600 dark:text-primary-400 mt-1 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Bills List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader size="md" />
                </div>
              ) : filteredBills.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {billDateFilter ? 'No bills found for this date' : 'No bills yet'}
                  </p>
                </div>
              ) : (
                filteredBills.map((bill) => (
                  <div
                    key={bill.id}
                    onClick={() => handleBillClick(bill)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedBill?.id === bill.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                          Bill #{bill.id}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">
                          ₹{parseFloat(bill.total_amount).toFixed(2)}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          PAID
                        </span>
                      </div>
                    </div>
                    {bill.customer_name && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {bill.customer_name}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Section - Generate Invoice */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Generate Invoice
              </h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Enter Bill ID"
                type="number"
                value={billIdInput}
                onChange={(e) => setBillIdInput(e.target.value)}
                placeholder="e.g., 25"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    downloadInvoiceById();
                  }
                }}
              />

              <Button
                onClick={downloadInvoiceById}
                loading={downloading}
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
            </div>

            {/* Bill Details Preview */}
            {selectedBill && (
              <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700">
                <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                  Selected Bill Details
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bill ID:</span>
                    <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                      #{selectedBill.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="text-secondary-900 dark:text-secondary-100">
                      {new Date(selectedBill.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {selectedBill.customer_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                      <span className="text-secondary-900 dark:text-secondary-100">
                        {selectedBill.customer_name}
                      </span>
                    </div>
                  )}
                  {selectedBill.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="text-secondary-900 dark:text-secondary-100">
                        {selectedBill.customer_phone}
                      </span>
                    </div>
                  )}
                  
                  {/* Items List */}
                  {selectedBill.BillItems && selectedBill.BillItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                      <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                        Items:
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedBill.BillItems.map((item, index) => (
                          <div key={index} className="text-xs bg-secondary-50 dark:bg-secondary-800 p-2 rounded">
                            <div className="flex justify-between">
                              <span className="font-medium">{item.Product?.product_name || 'Product'}</span>
                              <span className="text-gray-600 dark:text-gray-400">x{item.quantity}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <span>₹{parseFloat(item.price).toFixed(2)} each</span>
                              <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Totals */}
                  <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 space-y-1">
                    {selectedBill.subtotal_amount && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="text-secondary-900 dark:text-secondary-100">
                          ₹{parseFloat(selectedBill.subtotal_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedBill.gst_amount && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          GST ({selectedBill.gst_percentage}%):
                        </span>
                        <span className="text-secondary-900 dark:text-secondary-100">
                          ₹{parseFloat(selectedBill.gst_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedBill.discount_amount && (
                      <div className="flex justify-between text-xs">
                        <span className="text-red-600 dark:text-red-400">Discount:</span>
                        <span className="text-red-600 dark:text-red-400">
                          -₹{parseFloat(selectedBill.discount_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t border-secondary-200 dark:border-secondary-700">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="text-emerald-600 text-base">
                        ₹{parseFloat(selectedBill.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Download Button */}
                  <button
                    onClick={async () => {
                      await generateProfessionalInvoice(selectedBill);
                      saveDownloadedInvoice(selectedBill.id, selectedBill.total_amount);
                      toast.success('Invoice downloaded!');
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Recent Invoices */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                Recent Invoices
              </h2>
            </div>

            {/* Date Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                <Calendar className="w-4 h-4 inline mr-2" />
                Filter by Date
              </label>
              <input
                type="date"
                value={invoiceDateFilter}
                onChange={(e) => setInvoiceDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {invoiceDateFilter && (
                <button
                  onClick={() => setInvoiceDateFilter('')}
                  className="text-xs text-primary-600 dark:text-primary-400 mt-1 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Invoices List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {invoiceDateFilter ? 'No invoices found for this date' : 'No invoices downloaded yet'}
                  </p>
                </div>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <div
                    key={index}
                    className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-emerald-50 dark:bg-emerald-900/10"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                          BILL-{invoice.billId}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(invoice.downloadedAt).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(invoice.downloadedAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">
                          ₹{parseFloat(invoice.amount).toFixed(2)}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                          PAID
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const bill = await billService.getBillById(invoice.billId);
                          await generateProfessionalInvoice(bill);
                          toast.success('Invoice re-downloaded!');
                        } catch (error) {
                          toast.error('Failed to download invoice');
                        }
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Re-download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
