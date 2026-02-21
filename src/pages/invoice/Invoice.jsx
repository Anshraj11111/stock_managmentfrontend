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
    
    // Generate QR Code if UPI ID exists
    let qrCodeDataUrl = null;
    if (shop?.upi_id) {
      try {
        // Generate UPI payment string
        const upiString = `upi://pay?pa=${shop.upi_id}&pn=${encodeURIComponent(shop.shop_name || 'Shop')}&am=${bill.total_amount}&cu=INR`;
        qrCodeDataUrl = await QRCode.toDataURL(upiString, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('QR Code generation failed:', error);
      }
    }
    
    // ========================================
    // HEADER SECTION - Company Details
    // ========================================
    
    // Company Name (Bold, Large, Left aligned)
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(shop?.shop_name?.toUpperCase() || 'YOUR SHOP NAME', 15, 15);
    
    // Tagline/Description (if any)
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Manufacturing & Supply of Quality Products', 15, 21);
    
    // Company Address
    doc.setFontSize(8);
    let yPos = 26;
    if (shop?.address) {
      const addressLines = doc.splitTextToSize(shop.address, 90);
      addressLines.forEach(line => {
        doc.text(line, 15, yPos);
        yPos += 4;
      });
    }
    
    // Contact Details (Left side)
    if (shop?.owner_phone) {
      doc.text(`Phone: ${shop.owner_phone}`, 15, yPos);
      yPos += 4;
    }
    
    if (shop?.gstin) {
      doc.text(`GSTIN: ${shop.gstin}`, 15, yPos);
      yPos += 4;
    }
    
    // PAN and Place of Supply
    if (shop?.pan) {
      doc.setFont(undefined, 'bold');
      doc.text('PAN:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(shop.pan, 30, yPos);
    }
    
    // Right side - TAX INVOICE heading and logo placeholder
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('TAX INVOICE', 140, 15);
    
    // ORIGINAL FOR RECIPIENT
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text('ORIGINAL FOR RECIPIENT', 140, 20);
    
    // Invoice Details Box (Right side)
    yPos = 25;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice No:', 140, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`${bill.bill_number || bill.id}`, 165, yPos);
    
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Date:', 140, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(bill.createdAt).toLocaleDateString('en-IN'), 165, yPos);
    
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Challan Date:', 140, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(bill.createdAt).toLocaleDateString('en-IN'), 165, yPos);
    
    // Horizontal line after header
    yPos = 55;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    
    // ========================================
    // CUSTOMER DETAILS SECTION
    // ========================================
    yPos += 6;
    
    if (bill.customer_name || bill.customer_phone) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('M/S:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(bill.customer_name || 'Walk-in Customer', 30, yPos);
      
      if (bill.customer_phone) {
        yPos += 5;
        doc.setFont(undefined, 'bold');
        doc.text('Phone:', 15, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(bill.customer_phone, 30, yPos);
      }
      yPos += 6;
    }
    
    // ========================================
    // ITEMS TABLE WITH BORDERS
    // ========================================
    
    const tableTop = yPos;
    const tableLeft = 15;
    const tableWidth = 180;
    const rowHeight = 6;
    
    // Column widths
    const col1 = 10;  // S.No
    const col2 = 80;  // Name of Product/Service
    const col3 = 20;  // HSN/SAC
    const col4 = 15;  // Qty
    const col5 = 25;  // Rate
    const col6 = 30;  // Taxable Value
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(tableLeft, yPos, tableWidth, rowHeight, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text('S. No.', tableLeft + 2, yPos + 4);
    doc.text('Name of Product / Service', tableLeft + col1 + 2, yPos + 4);
    doc.text('HSN / SAC', tableLeft + col1 + col2 + 2, yPos + 4);
    doc.text('Qty', tableLeft + col1 + col2 + col3 + 2, yPos + 4);
    doc.text('Rate', tableLeft + col1 + col2 + col3 + col4 + 2, yPos + 4);
    doc.text('Taxable Value', tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 4);
    
    // Draw header borders
    doc.setLineWidth(0.3);
    doc.rect(tableLeft, yPos, tableWidth, rowHeight);
    
    yPos += rowHeight;
    
    // Items
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    // Parse items - handle both formats (JSON string or BillItems array)
    let items = [];
    if (typeof bill.items === 'string') {
      items = JSON.parse(bill.items);
    } else if (bill.BillItems && Array.isArray(bill.BillItems)) {
      // Convert BillItems to items format
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
    
    items.forEach((item, index) => {
      const itemTotal = parseFloat(item.total || (item.price * item.quantity));
      subtotal += itemTotal;
      
      // Draw row
      doc.text(`${index + 1}`, tableLeft + 2, yPos + 4);
      doc.text(item.name.substring(0, 40), tableLeft + col1 + 2, yPos + 4);
      doc.text('-', tableLeft + col1 + col2 + 2, yPos + 4);
      doc.text(item.quantity.toString(), tableLeft + col1 + col2 + col3 + 2, yPos + 4);
      doc.text(`₹${parseFloat(item.price).toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + 2, yPos + 4);
      doc.text(`₹${itemTotal.toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 4);
      
      // Draw row borders
      doc.rect(tableLeft, yPos, tableWidth, rowHeight);
      
      yPos += rowHeight;
    });
    
    // GST Row (if applicable)
    if (bill.gst_amount && bill.gst_percentage) {
      doc.setFont(undefined, 'bold');
      doc.text(`IGST (${bill.gst_percentage}%)`, tableLeft + col1 + 2, yPos + 4);
      doc.setFont(undefined, 'normal');
      doc.rect(tableLeft, yPos, tableWidth, rowHeight);
      yPos += rowHeight;
    }
    
    // Total Row
    doc.setFont(undefined, 'bold');
    doc.text('Total', tableLeft + col1 + col2 + 2, yPos + 4);
    doc.text(`${items.reduce((sum, item) => sum + item.quantity, 0)}`, tableLeft + col1 + col2 + col3 + 2, yPos + 4);
    doc.text(`₹${subtotal.toFixed(2)}`, tableLeft + col1 + col2 + col3 + col4 + col5 + 2, yPos + 4);
    doc.rect(tableLeft, yPos, tableWidth, rowHeight);
    
    yPos += rowHeight + 2;
    
    // ========================================
    // AMOUNT IN WORDS
    // ========================================
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text('Total in words:', tableLeft, yPos + 4);
    doc.setFont(undefined, 'normal');
    const amountInWords = numberToWords(bill.total_amount);
    doc.text(amountInWords.toUpperCase(), tableLeft, yPos + 8);
    
    yPos += 15;
    
    // ========================================
    // GST BREAKDOWN TABLE
    // ========================================
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    
    // GST Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(tableLeft, yPos, 90, rowHeight, 'F');
    doc.text('HSN / SAC', tableLeft + 2, yPos + 4);
    doc.text('Taxable Value', tableLeft + 30, yPos + 4);
    
    doc.rect(tableLeft + 90, yPos, 90, rowHeight, 'F');
    doc.text('IGST', tableLeft + 92, yPos + 4);
    doc.text('Amount', tableLeft + 120, yPos + 4);
    doc.text('Total', tableLeft + 160, yPos + 4);
    
    doc.rect(tableLeft, yPos, 180, rowHeight);
    yPos += rowHeight;
    
    // GST Table Data
    doc.setFont(undefined, 'normal');
    doc.text('-', tableLeft + 2, yPos + 4);
    doc.text(`₹${subtotal.toFixed(2)}`, tableLeft + 30, yPos + 4);
    
    if (bill.gst_amount && bill.gst_percentage) {
      doc.text(`${bill.gst_percentage}%`, tableLeft + 92, yPos + 4);
      doc.text(`₹${parseFloat(bill.gst_amount).toFixed(2)}`, tableLeft + 120, yPos + 4);
    }
    doc.text(`₹${parseFloat(bill.total_amount).toFixed(2)}`, tableLeft + 160, yPos + 4);
    
    doc.rect(tableLeft, yPos, 180, rowHeight);
    yPos += rowHeight;
    
    // Total Tax in words
    doc.setFont(undefined, 'bold');
    doc.text('Total Tax in words:', tableLeft, yPos + 4);
    doc.setFont(undefined, 'normal');
    if (bill.gst_amount) {
      const taxInWords = numberToWords(bill.gst_amount);
      doc.text(taxInWords.toUpperCase(), tableLeft, yPos + 8);
    }
    
    yPos += 15;
    
    // ========================================
    // BANK DETAILS & SIGNATURE SECTION
    // ========================================
    
    // Bank Details (Left side)
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text('Bank Details', tableLeft, yPos);
    yPos += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    
    if (shop?.bank_name) {
      doc.text(`Name: ${shop.bank_name}`, tableLeft, yPos);
      yPos += 4;
    }
    
    if (shop?.bank_branch) {
      doc.text(`Branch: ${shop.bank_branch}`, tableLeft, yPos);
      yPos += 4;
    }
    
    if (shop?.bank_account_number) {
      doc.text(`Acc. Number: ${shop.bank_account_number}`, tableLeft, yPos);
      yPos += 4;
    }
    
    if (shop?.bank_ifsc) {
      doc.text(`IFSC: ${shop.bank_ifsc}`, tableLeft, yPos);
      yPos += 4;
    }
    
    if (shop?.upi_id) {
      yPos += 4;
      doc.text(`UPI ID: ${shop.upi_id}`, tableLeft, yPos);
    }
    
    // QR Code (Right side) - Use actual QR code if available
    const qrX = 140;
    const qrY = yPos - 25;
    
    if (qrCodeDataUrl) {
      // Add actual QR code
      doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, 30, 30);
    } else {
      // Fallback: Draw placeholder box
      doc.setLineWidth(0.5);
      doc.rect(qrX, qrY, 30, 30);
    }
    
    doc.setFontSize(6);
    doc.text('Pay using UPI', qrX + 5, qrY + 35);
    
    // Signature section (Right side)
    doc.setFontSize(7);
    doc.setFont(undefined, 'italic');
    doc.text('This is a computer generated', 140, yPos + 15);
    doc.text('invoice, no signature required.', 140, yPos + 19);
    
    yPos += 30;
    
    // ========================================
    // TERMS AND CONDITIONS
    // ========================================
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text('Terms and Conditions', tableLeft, yPos);
    yPos += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    
    if (shop?.terms_and_conditions) {
      // Use custom terms from settings
      const termsLines = shop.terms_and_conditions.split('\n');
      termsLines.forEach((line) => {
        if (line.trim()) {
          doc.text(line.trim(), tableLeft, yPos);
          yPos += 3;
        }
      });
    } else {
      // Default terms
      doc.text('Subject to Maharashtra Jurisdiction.', tableLeft, yPos);
      yPos += 4;
      doc.text('Our Responsibility Ceases as soon as goods leaves our Premises.', tableLeft, yPos);
      yPos += 4;
      doc.text('Goods once sold will not taken back.', tableLeft, yPos);
      yPos += 4;
      doc.text('Delivery Ex Premises.', tableLeft, yPos);
    }
    
    // Signature section (Right side) - MOVED DOWN
    yPos += 5; // Extra space
    doc.setFont(undefined, 'bold');
    if (shop?.authorized_signatory) {
      doc.text(shop.authorized_signatory, 140, yPos);
    } else {
      doc.text('Authorized Signatory', 140, yPos);
    }
    
    // Add signature image if available - POSITIONED ABOVE TEXT
    if (shop?.signature_image) {
      try {
        doc.addImage(shop.signature_image, 'PNG', 140, yPos - 18, 40, 15);
      } catch (error) {
        console.error('Failed to add signature image:', error);
      }
    }
    
    // Bottom line
    yPos += 8;
    doc.setLineWidth(0.3);
    doc.line(15, yPos, 195, yPos);
    
    // Thank you message
    yPos += 4;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for shopping with us!', 105, yPos, { align: 'center' });
    
    // Save PDF - Create blob and open in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open PDF in new tab
    const newWindow = window.open(pdfUrl, '_blank');
    
    // Also trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Invoice_${bill.bill_number || bill.id}.pdf`;
    link.click();
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
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
