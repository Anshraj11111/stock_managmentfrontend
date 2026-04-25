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
      toast.success('Bill downloaded successfully!');
      setBillIdInput('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bill not found');
    } finally {
      setDownloading(false);
    }
  };

  // ✅ NEW: Generate Bill (not Invoice) - Similar to Billing.jsx format
  const generateProfessionalBill = async (bill) => {
    const doc = new jsPDF();
    
    let yPos = 15;
    
    // ========================================
    // CLEAN PROFESSIONAL HEADER
    // ========================================
    
    // Company Name - Large, Bold, Professional Font
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text(shop?.shop_name?.toUpperCase() || 'YOUR SHOP NAME', 105, yPos, { align: 'center' });
    yPos += 8;
    
    // Tagline
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text('Quality Products & Excellent Service', 105, yPos, { align: 'center' });
    yPos += 6;
    
    // Company Details
    doc.setFontSize(10);
    if (shop?.address) {
      const addressLines = doc.splitTextToSize(shop.address, 140);
      doc.text(addressLines[0], 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    if (shop?.owner_phone) {
      doc.text(`Phone: ${shop.owner_phone}`, 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    if (shop?.gstin) {
      doc.text(`GSTIN: ${shop.gstin}`, 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    // ========================================
    // BILL DETAILS - Clean Layout
    // ========================================
    
    // Bill Number
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('Bill No:', 15, yPos);
    doc.setFontSize(13);
    doc.text(`#${bill.bill_number || bill.id}`, 40, yPos);
    
    // Date - Right aligned
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('Date:', 150, yPos);
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.text(new Date(bill.createdAt).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }), 165, yPos);
    
    yPos += 10;
    
    // ========================================
    // CUSTOMER DETAILS
    // ========================================
    
    if (bill.customer_name || bill.customer_phone) {
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.text('Customer:', 15, yPos);
      
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      doc.text(bill.customer_name || 'Walk-in Customer', 40, yPos);
      
      // Move phone to next line, aligned under date
      if (bill.customer_phone) {
        yPos += 5;
        doc.text(`Phone: ${bill.customer_phone}`, 150, yPos);
      }
      
      yPos += 8;
    }
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    // ========================================
    // ITEMS TABLE - Clean & Readable
    // ========================================
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, 180, 8, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('Product / Service', 18, yPos + 5.5);
    doc.text('Qty', 130, yPos + 5.5);
    doc.text('Rate', 150, yPos + 5.5);
    doc.text('Amount', 175, yPos + 5.5);
    
    yPos += 8;
    
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
    
    // Items rows
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    
    items.forEach((item, index) => {
      const itemTotal = parseFloat(item.total || (item.price * item.quantity));
      subtotal += itemTotal;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Alternating row colors
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, 180, 8, 'F');
      }
      
      // Item data
      const productName = item.name.length > 55 ? item.name.substring(0, 55) + '...' : item.name;
      doc.text(productName, 18, yPos + 5.5);
      doc.text(item.quantity.toString(), 133, yPos + 5.5, { align: 'center' });
      doc.text(parseFloat(item.price).toFixed(2), 165, yPos + 5.5, { align: 'right' });
      doc.setFont('times', 'bold');
      doc.text(itemTotal.toFixed(2), 192, yPos + 5.5, { align: 'right' });
      doc.setFont('times', 'normal');
      
      yPos += 8;
    });
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    // ========================================
    // TOTALS SECTION - Clean & Clear
    // ========================================
    
    doc.setFontSize(11);
    
    // Subtotal
    doc.setFont('times', 'normal');
    doc.text('Subtotal:', 130, yPos);
    doc.setFont('times', 'bold');
    doc.text((bill.subtotal_amount || subtotal).toFixed(2), 192, yPos, { align: 'right' });
    yPos += 7;
    
    // GST (if applicable)
    if (bill.gst_amount && bill.gst_percentage) {
      doc.setFont('times', 'normal');
      doc.text(`GST (${bill.gst_percentage}%):`, 130, yPos);
      doc.setFont('times', 'bold');
      doc.text(parseFloat(bill.gst_amount).toFixed(2), 192, yPos, { align: 'right' });
      yPos += 7;
    }
    
    // Discount (if applicable)
    if (bill.discount_amount && parseFloat(bill.discount_amount) > 0) {
      doc.setFont('times', 'normal');
      const discountLabel = bill.discount_type === 'percentage' 
        ? `Discount (${bill.discount_value}%):` 
        : `Discount:`;
      doc.text(discountLabel, 130, yPos);
      doc.setFont('times', 'bold');
      doc.text(`-${parseFloat(bill.discount_amount).toFixed(2)}`, 192, yPos, { align: 'right' });
      yPos += 7;
    }
    
    // Separator line
    doc.setLineWidth(0.8);
    doc.line(130, yPos, 195, yPos);
    yPos += 7;
    
    // Grand Total - Highlighted with proper alignment
    doc.setFillColor(240, 240, 240);
    doc.rect(125, yPos - 5, 70, 10, 'F');
    
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text('GRAND TOTAL:', 128, yPos);
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    const grandTotalText = parseFloat(bill.total_amount).toFixed(2);
    doc.text(grandTotalText, 192, yPos, { align: 'right' });
    
    yPos += 12;
    
    // ========================================
    // AMOUNT IN WORDS
    // ========================================
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('Amount in Words:', 15, yPos);
    
    doc.setFont('times', 'normal');
    const amountInWords = numberToWords(bill.total_amount);
    doc.text(amountInWords.toUpperCase(), 15, yPos + 6);
    
    yPos += 15;
    
    // ========================================
    // PAYMENT DETAILS & SIGNATURE - Fixed Layout
    // ========================================
    
    const paymentStartY = yPos;
    
    // Payment Details - Left side
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('Payment Details:', 15, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    
    // Parse payments
    let payments = [];
    if (typeof bill.payments === 'string') {
      try {
        payments = JSON.parse(bill.payments);
      } catch (e) {
        payments = [];
      }
    } else if (Array.isArray(bill.payments)) {
      payments = bill.payments;
    } else if (bill.BillPayments && Array.isArray(bill.BillPayments)) {
      payments = bill.BillPayments.map(p => ({
        mode: p.payment_mode,
        amount: p.amount
      }));
    }
    
    payments.forEach(payment => {
      const paymentMode = payment.mode.toUpperCase();
      const paymentAmount = parseFloat(payment.amount).toFixed(2);
      
      doc.text(paymentMode + ':', 15, yPos);
      doc.text(paymentAmount, 60, yPos);
      yPos += 5;
    });
    
    // Signature - Right side
    const signYPos = paymentStartY;
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('For ' + (shop?.shop_name?.toUpperCase() || 'YOUR SHOP'), 130, signYPos);
    
    // Add signature image if available
    if (shop?.signature_image) {
      try {
        doc.addImage(shop.signature_image, 'PNG', 130, signYPos + 5, 30, 10);
      } catch (error) {
        console.error('Failed to add signature image:', error);
      }
    }
    
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text('Authorized Signatory', 130, signYPos + 20);
    
    // Ensure consistent bottom spacing
    yPos = Math.max(yPos, signYPos + 25);
    
    // ========================================
    // TERMS & CONDITIONS - Dynamic from Settings
    // ========================================
    doc.setLineWidth(0.3);
    doc.line(15, yPos, 195, yPos);
    yPos += 5;
    
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', 15, yPos);
    yPos += 5;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    
    const termsText = shop?.terms_and_conditions || 
      'Goods once sold will not be taken back\nSubject to local jurisdiction';
    
    const termsLines = termsText.split('\n');
    termsLines.forEach((line, index) => {
      if (line.trim()) {
        doc.text(`• ${line.trim()}`, 15, yPos);
        yPos += 4;
      }
    });
    
    yPos += 4;
    
    // ========================================
    // FOOTER
    // ========================================
    doc.setLineWidth(0.3);
    doc.line(15, yPos, 195, yPos);
    yPos += 5;
    
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('times', 'italic');
    doc.text('This is a computer-generated bill', 105, yPos + 4, { align: 'center' });
    
    // Save PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new tab
    window.open(pdfUrl, '_blank');
    
    // Trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Bill_${bill.bill_number || bill.id}_${new Date().getTime()}.pdf`;
    link.click();
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
  };

  const generateProfessionalInvoice = async (bill) => {
    const doc = new jsPDF();
    
    // Generate QR Code if UPI ID exists
    let qrCodeDataUrl = null;
    if (shop?.upi_id) {
      try {
        const upiString = `upi://pay?pa=${shop.upi_id}&pn=${encodeURIComponent(shop.shop_name || 'Shop')}&am=${bill.total_amount}&cu=INR`;
        qrCodeDataUrl = await QRCode.toDataURL(upiString, {
          width: 100,
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
    
    let yPos = 15;
    
    // ========================================
    // CLEAN PROFESSIONAL HEADER
    // ========================================
    
    // Company Name - Large, Bold, Professional Font
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('times', 'bold'); // ✅ Changed to Times for more professional look
    doc.text(shop?.shop_name?.toUpperCase() || 'YOUR SHOP NAME', 105, yPos, { align: 'center' });
    yPos += 8;
    
    // TAX INVOICE Badge - Right side
    doc.setFillColor(0, 0, 0);
    doc.rect(160, 10, 35, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('TAX INVOICE', 177.5, 15, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Tagline
    doc.setFontSize(10);
    doc.setFont('times', 'normal'); // ✅ Professional font
    doc.text('Quality Products & Excellent Service', 105, yPos, { align: 'center' });
    yPos += 6;
    
    // Company Details
    doc.setFontSize(10);
    if (shop?.address) {
      const addressLines = doc.splitTextToSize(shop.address, 140);
      doc.text(addressLines[0], 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    if (shop?.owner_phone) {
      doc.text(`Phone: ${shop.owner_phone}`, 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    if (shop?.gstin) {
      doc.text(`GSTIN: ${shop.gstin}`, 105, yPos, { align: 'center' });
      yPos += 5;
    }
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    // ========================================
    // INVOICE DETAILS - Clean Layout
    // ========================================
    
    // Invoice Number
    doc.setFontSize(11);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('Invoice No:', 15, yPos);
    doc.setFontSize(13);
    doc.text(`#${bill.bill_number || bill.id}`, 45, yPos);
    
    // Date - Right aligned
    doc.setFontSize(11);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('Date:', 150, yPos);
    doc.setFontSize(11);
    doc.setFont('times', 'normal'); // ✅ Professional font
    doc.text(new Date(bill.createdAt).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }), 165, yPos);
    
    yPos += 10;
    
    // ========================================
    // CUSTOMER DETAILS
    // ========================================
    
    if (bill.customer_name || bill.customer_phone) {
      doc.setFontSize(10);
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text('Bill To:', 15, yPos);
      
      doc.setFontSize(11);
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(bill.customer_name || 'Walk-in Customer', 35, yPos);
      
      // ✅ Fixed: Move phone to next line, aligned under date
      if (bill.customer_phone) {
        yPos += 5; // Move to next line
        doc.text(`Phone: ${bill.customer_phone}`, 150, yPos); // Align under date
      }
      
      yPos += 8;
    }
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    // ========================================
    // ITEMS TABLE - Clean & Readable
    // ========================================
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, 180, 8, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.setFontSize(10);
    doc.text('Product / Service', 18, yPos + 5.5);
    doc.text('HSN', 110, yPos + 5.5);
    doc.text('Qty', 130, yPos + 5.5);
    doc.text('Rate', 150, yPos + 5.5);
    doc.text('Amount', 175, yPos + 5.5);
    
    yPos += 8;
    
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
    
    // Items rows
    doc.setFont('times', 'normal'); // ✅ Professional font
    doc.setFontSize(10);
    
    items.forEach((item, index) => {
      const itemTotal = parseFloat(item.total || (item.price * item.quantity));
      subtotal += itemTotal;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Alternating row colors
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, 180, 8, 'F');
      }
      
      // Item data
      const productName = item.name.length > 50 ? item.name.substring(0, 50) + '...' : item.name;
      doc.text(productName, 18, yPos + 5.5);
      doc.text('-', 112, yPos + 5.5);
      doc.text(item.quantity.toString(), 133, yPos + 5.5, { align: 'center' });
      doc.text(parseFloat(item.price).toFixed(2), 165, yPos + 5.5, { align: 'right' });
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text(itemTotal.toFixed(2), 192, yPos + 5.5, { align: 'right' }); // ✅ Moved right for better alignment
      doc.setFont('times', 'normal'); // ✅ Professional font
      
      yPos += 8;
    });
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    // ========================================
    // TOTALS SECTION - Clean & Clear
    // ========================================
    
    doc.setFontSize(11);
    
    // Subtotal
    doc.setFont('times', 'normal'); // ✅ Professional font
    doc.text('Subtotal:', 130, yPos);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text(subtotal.toFixed(2), 192, yPos, { align: 'right' }); // ✅ Moved right for better alignment
    yPos += 7;
    
    // GST (if applicable)
    if (bill.gst_amount && bill.gst_percentage) {
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(`GST (${bill.gst_percentage}%):`, 130, yPos);
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text(parseFloat(bill.gst_amount).toFixed(2), 192, yPos, { align: 'right' }); // ✅ Moved right for better alignment
      yPos += 7;
    }
    
    // Discount (if applicable)
    if (bill.discount_amount && parseFloat(bill.discount_amount) > 0) {
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(`Discount:`, 130, yPos);
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text(`-${parseFloat(bill.discount_amount).toFixed(2)}`, 192, yPos, { align: 'right' }); // ✅ Moved right for better alignment
      yPos += 7;
    }
    
    // Separator line
    doc.setLineWidth(0.8);
    doc.line(130, yPos, 195, yPos);
    yPos += 7;
    
    // Grand Total - Highlighted with proper alignment and professional font
    doc.setFillColor(240, 240, 240);
    doc.rect(125, yPos - 5, 70, 10, 'F'); // ✅ Made box wider and moved left
    
    doc.setFontSize(13);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('GRAND TOTAL:', 128, yPos); // ✅ Moved text left to give more space
    doc.setFontSize(14);
    doc.setFont('times', 'bold'); // ✅ Ensure consistent font
    // ✅ Fixed: Better right alignment with more space for large numbers, removed potential character issues
    const grandTotalText = parseFloat(bill.total_amount).toFixed(2);
    doc.text(grandTotalText, 192, yPos, { align: 'right' }); // ✅ Moved further right
    
    yPos += 12;
    
    // ========================================
    // AMOUNT IN WORDS
    // ========================================
    doc.setFontSize(10);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('Amount in Words:', 15, yPos);
    
    doc.setFont('times', 'normal'); // ✅ Professional font
    const amountInWords = numberToWords(bill.total_amount);
    doc.text(amountInWords.toUpperCase(), 15, yPos + 6);
    
    yPos += 15;
    
    // ========================================
    // BANK DETAILS & QR CODE SECTION
    // ========================================
    
    // Bank Details - Left side
    doc.setFontSize(10);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('Bank Details:', 15, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('times', 'normal'); // ✅ Professional font
    
    if (shop?.bank_name) {
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text('Bank:', 15, yPos);
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(shop.bank_name, 35, yPos);
      yPos += 5;
    }
    
    if (shop?.bank_account_number) {
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text('A/C:', 15, yPos);
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(shop.bank_account_number, 35, yPos);
      yPos += 5;
    }
    
    if (shop?.bank_ifsc) {
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text('IFSC:', 15, yPos);
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(shop.bank_ifsc, 35, yPos);
      yPos += 5;
    }
    
    if (shop?.upi_id) {
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text('UPI:', 15, yPos);
      doc.setFont('times', 'normal'); // ✅ Professional font
      doc.text(shop.upi_id, 35, yPos);
    }
    
    // QR Code & Signature - Right side
    const rightStartY = yPos - 25;
    
    // QR Code
    if (qrCodeDataUrl) {
      doc.addImage(qrCodeDataUrl, 'PNG', 125, rightStartY, 25, 25);
      doc.setFontSize(9);
      doc.setFont('times', 'bold'); // ✅ Professional font
      doc.text('Scan to Pay', 132, rightStartY + 28);
    }
    
    // Signature Section
    doc.setFontSize(10);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('For ' + (shop?.shop_name?.toUpperCase() || 'YOUR SHOP'), 155, rightStartY + 5);
    
    // Add signature image if available
    if (shop?.signature_image) {
      try {
        doc.addImage(shop.signature_image, 'PNG', 155, rightStartY + 10, 30, 10);
      } catch (error) {
        console.error('Failed to add signature image:', error);
      }
    }
    
    doc.setFontSize(9);
    doc.setFont('times', 'normal'); // ✅ Professional font
    doc.text('Authorized Signatory', 155, rightStartY + 25);
    
    yPos += 35;
    
    // ========================================
    // TERMS & CONDITIONS - Dynamic from Settings
    // ========================================
    doc.setLineWidth(0.3);
    doc.line(15, yPos, 195, yPos);
    yPos += 5;
    
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', 15, yPos);
    yPos += 5;
    
    doc.setFont('times', 'normal'); // ✅ Professional font
    doc.setFontSize(8);
    
    // ✅ Fixed: Use dynamic terms & conditions from shop settings
    const termsText = shop?.terms_and_conditions || 
      'Goods once sold will not be taken back\nSubject to local jurisdiction';
    
    const termsLines = termsText.split('\n');
    termsLines.forEach((line, index) => {
      if (line.trim()) {
        doc.text(`• ${line.trim()}`, 15, yPos);
        yPos += 4;
      }
    });
    
    yPos += 4;
    
    // ========================================
    // FOOTER
    // ========================================
    doc.setLineWidth(0.3);
    doc.line(15, yPos, 195, yPos);
    yPos += 5;
    
    doc.setFontSize(10);
    doc.setFont('times', 'bold'); // ✅ Professional font
    doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('times', 'italic'); // ✅ Professional font
    doc.text('This is a computer-generated invoice', 105, yPos + 4, { align: 'center' });
    
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
                      await generateProfessionalBill(selectedBill);
                      saveDownloadedInvoice(selectedBill.id, selectedBill.total_amount);
                      toast.success('Bill downloaded!');
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Bill
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
              <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
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
                    className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-emerald-50 dark:bg-emerald-500/10"
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
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full">
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
