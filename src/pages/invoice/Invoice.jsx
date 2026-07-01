import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Receipt, FileCheck } from 'lucide-react';
import jsPDF from 'jspdf';
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

  // ─────────────────────────────────────────────────────────────────────────
  // SHARED PDF BUILDER — same professional design for Bill & Invoice
  // ─────────────────────────────────────────────────────────────────────────
  const buildPDF = (bill, mode = 'bill') => {
    const isInvoice = mode === 'invoice';
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const PW = 210; const PH = 297;
    const M  = 14;  const CW = PW - M * 2; // 182mm

    const BLUE  = [30,  58, 138];
    const LBLUE = [37,  99, 235];
    const BGBL  = [240, 244, 255];
    const BGGY  = [248, 250, 252];
    const BORD  = [209, 216, 232];
    const DARK  = [30,  41,  59];
    const GREY  = [100, 116, 139];
    const WHITE = [255, 255, 255];
    const GREEN = [21,  128,  61];
    const RED   = [220,  38,  38];

    const rs = (n) => `Rs.${Number(n || 0).toFixed(2)}`;

    const sc = (rgb, type = 'text') => {
      if (type === 'fill') doc.setFillColor(...rgb);
      else if (type === 'draw') doc.setDrawColor(...rgb);
      else doc.setTextColor(...rgb);
    };

    let Y = M;

    // ── 1. HEADER BAND ──────────────────────────────────────────────────────
    sc(BLUE, 'fill');
    doc.rect(0, 0, PW, 30, 'F');

    sc(WHITE);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text((shop?.shop_name || 'SHOP NAME').toUpperCase(), M, 10);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(191, 219, 254);
    let shopY = 15;
    if (shop?.category)    { doc.text(shop.category, M, shopY); shopY += 4; }
    const addrParts = [];
    if (shop?.address)     addrParts.push(shop.address);
    if (shop?.owner_phone) addrParts.push(`Ph: ${shop.owner_phone}`);
    if (addrParts.length)  { doc.text(addrParts.join('  |  '), M, shopY, { maxWidth: CW * 0.65 }); shopY += 4; }
    if (shop?.gstin)       doc.text(`GSTIN: ${shop.gstin}`, M, shopY);

    sc(WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
    doc.text(isInvoice ? 'INVOICE' : 'BILL', PW - M, 12, { align: 'right' });

    Y = 30;

    // ── 2. TITLE BAR ────────────────────────────────────────────────────────
    sc(LBLUE, 'fill');
    doc.rect(0, Y, PW, 8, 'F');
    sc(WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    const titleLabel = isInvoice ? 'INVOICE' : 'BILL';
    doc.text(`${titleLabel}  –  #${bill.bill_number || bill.id}`, PW / 2, Y + 5.5, { align: 'center' });
    Y += 8 + 4;

    // ── 3. INFO BOXES ────────────────────────────────────────────────────────
    const BOX_H = 22; const BOX_W = (CW - 4) / 2;
    sc(BGBL, 'fill'); sc(BORD, 'draw'); doc.setLineWidth(0.3);
    doc.rect(M, Y, BOX_W, BOX_H, 'FD');

    let lY = Y + 5;
    const metaLine = (label, val, x = M) => {
      if (!val) return;
      sc(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
      doc.text(label, x + 3, lY);
      sc(GREY); doc.setFont('helvetica', 'normal');
      doc.text(String(val), x + 3 + doc.getTextWidth(label) + 1, lY);
      lY += 4.5;
    };

    // Parse payments from BillPayments array
    const pmts = bill.BillPayments || bill.payments || [];
    const pmtModes = pmts.map(p => (p.payment_mode || p.mode || '').toUpperCase()).filter(Boolean).join(', ');

    metaLine(isInvoice ? 'Invoice No:' : 'Bill No:', `#${bill.bill_number || bill.id}`);
    metaLine('Date:', new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' }));
    metaLine('Status:', bill.status || '-');
    if (pmtModes) metaLine('Payment:', pmtModes);

    const RX = M + BOX_W + 4;
    sc(BGBL, 'fill'); sc(BORD, 'draw');
    doc.rect(RX, Y, BOX_W, BOX_H, 'FD');
    let rY = Y + 5;
    const custLine = (label, val) => {
      if (!val) return;
      sc(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
      doc.text(label, RX + 3, rY);
      sc(GREY); doc.setFont('helvetica', 'normal');
      doc.text(String(val), RX + 3 + doc.getTextWidth(label) + 1, rY);
      rY += 4.5;
    };
    custLine('To:', bill.customer_name || 'Walk-in Customer');
    custLine('Mobile:', bill.customer_phone);

    Y += BOX_H + 5;

    // ── 4. ITEMS TABLE ───────────────────────────────────────────────────────
    const cols = [
      { key: 'sno',  hdr: '#',           x: M,       w: 7,   align: 'left'   },
      { key: 'desc', hdr: 'DESCRIPTION', x: M + 7,   w: 73,  align: 'left'   },
      { key: 'qty',  hdr: 'QTY',         x: M + 80,  w: 20,  align: 'center' },
      { key: 'rate', hdr: 'RATE',        x: M + 100, w: 27,  align: 'right'  },
      { key: 'gst',  hdr: 'GST%',        x: M + 127, w: 18,  align: 'center' },
      { key: 'amt',  hdr: 'AMOUNT',      x: M + 145, w: (M + CW) - (M + 145), align: 'right' },
    ];

    const TH_H = 7;
    sc(BLUE, 'fill'); doc.rect(M, Y, CW, TH_H, 'F');
    sc(WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    cols.forEach(c => {
      const tx = c.align === 'right' ? c.x + c.w - 1.5 : c.align === 'center' ? c.x + c.w / 2 : c.x + 1.5;
      doc.text(c.hdr, tx, Y + 4.8, { align: c.align });
    });
    Y += TH_H;

    // parse items from BillItems
    const rawItems = bill.BillItems || bill.items || [];
    const items = rawItems.map(item => ({
      name:     item.Product?.product_name || item.name || 'Item',
      price:    parseFloat(item.price || 0),
      quantity: parseFloat(item.quantity || 1),
      total:    parseFloat(item.total || (item.price * item.quantity) || 0),
    }));

    const gstPct = bill.gst_percentage || 0;

    items.forEach((item, idx) => {
      if (Y > PH - 40) { doc.addPage(); Y = M; }
      const ROW_H = 6;
      const bg = idx % 2 === 0 ? WHITE : BGGY;
      sc(bg, 'fill'); sc(BORD, 'draw'); doc.setLineWidth(0.2);
      doc.rect(M, Y, CW, ROW_H, 'FD');
      const vals = {
        sno:  String(idx + 1),
        desc: (item.name || '').substring(0, 40),
        qty:  String(item.quantity),
        rate: rs(item.price),
        gst:  gstPct > 0 ? `${gstPct}%` : '0%',
        amt:  rs(item.total),
      };
      sc(DARK);
      cols.forEach(c => {
        doc.setFont('helvetica', c.key === 'desc' ? 'bold' : 'normal'); doc.setFontSize(7.5);
        const tx = c.align === 'right' ? c.x + c.w - 1.5 : c.align === 'center' ? c.x + c.w / 2 : c.x + 1.5;
        doc.text(vals[c.key] || '', tx, Y + 4, { align: c.align });
      });
      Y += ROW_H;
    });

    sc(BORD, 'draw'); doc.setLineWidth(0.4);
    doc.rect(M, Y - items.length * 6 - TH_H, CW, TH_H + items.length * 6, 'D');
    Y += 3;

    // ── 5. TOTALS ────────────────────────────────────────────────────────────
    const TW = 72; const TX = M + CW - TW; const TR_H = 6;

    const totalRow = (label, val, isFinal = false, color = null) => {
      if (isFinal) {
        sc(BLUE, 'fill'); doc.rect(TX, Y, TW, TR_H + 1, 'F');
        sc(WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(label, TX + 2, Y + 4.5);
        doc.text(val, TX + TW - 1.5, Y + 4.5, { align: 'right' });
        Y += TR_H + 1;
      } else {
        sc(BORD, 'draw'); doc.setLineWidth(0.2); doc.rect(TX, Y, TW, TR_H, 'D');
        sc(color || GREY); doc.setFont('helvetica', color ? 'bold' : 'normal'); doc.setFontSize(8);
        doc.text(label, TX + 2, Y + 4);
        doc.text(val, TX + TW - 1.5, Y + 4, { align: 'right' });
        Y += TR_H;
      }
    };

    const subtotal = bill.subtotal_amount || bill.total_amount;
    totalRow('Subtotal', rs(subtotal));
    if (bill.gst_percentage > 0 && bill.gst_amount)
      totalRow(`GST (${bill.gst_percentage}%)`, rs(bill.gst_amount));
    if (bill.discount_amount && parseFloat(bill.discount_amount) > 0)
      totalRow('Discount', `-${rs(bill.discount_amount)}`);
    totalRow('GRAND TOTAL', rs(bill.total_amount), true);

    const paidAmt = parseFloat(bill.paid_amount || 0);
    const dueAmt  = parseFloat(bill.due_amount  || 0);
    if (paidAmt > 0)    totalRow('Paid Amount',  rs(paidAmt), false, GREEN);
    if (dueAmt  > 0.01) totalRow('Balance Due',  rs(dueAmt),  false, RED);

    Y += 5;

    // Amount in words
    sc(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text('Amount in Words: ', M, Y);
    sc(GREY); doc.setFont('helvetica', 'normal');
    doc.text(numberToWords(bill.total_amount).toUpperCase(), M + doc.getTextWidth('Amount in Words: '), Y);
    Y += 6;

    // ── 6. DIVIDER ───────────────────────────────────────────────────────────
    sc(BORD, 'draw'); doc.setLineWidth(0.3); doc.line(M, Y, M + CW, Y);
    Y += 5;

    // ── 7. PAYMENT + SIGNATURE ───────────────────────────────────────────────
    const hasBankInfo = shop?.bank_name || shop?.bank_account_number || shop?.upi_id;
    const PAY_W   = hasBankInfo ? (CW - 4) / 2 : 0;
    const SIG_X   = hasBankInfo ? M + PAY_W + 4 : M;
    const SIG_W   = hasBankInfo ? CW - PAY_W - 4 : CW;
    const secTopY = Y;

    if (hasBankInfo) {
      sc(LBLUE); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text('Payment Details:', M, Y); Y += 5;
      const bLine = (label, val) => {
        if (!val) return;
        sc(DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.text(`${label}: `, M, Y);
        sc(GREY); doc.text(val, M + doc.getTextWidth(`${label}: `), Y);
        Y += 4.2;
      };
      bLine('Bank',   shop.bank_name);
      bLine('Branch', shop.bank_branch);
      bLine('A/C No', shop.bank_account_number);
      bLine('IFSC',   shop.bank_ifsc);
      if (shop.upi_id) bLine('UPI', `${shop.upi_id}${shop.upi_name ? ` (${shop.upi_name})` : ''}`);
    }

    // Signature block
    sc(GREY); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Authorised Signatory', SIG_X + SIG_W / 2, secTopY, { align: 'center' });

    if (shop?.signature_image) {
      try { doc.addImage(shop.signature_image, 'PNG', SIG_X + SIG_W / 2 - 15, secTopY + 3, 30, 12); }
      catch (_) { /* skip */ }
    }

    const sigLineY = secTopY + 20;
    sc(BORD, 'draw'); doc.setLineWidth(0.4);
    doc.line(SIG_X + 4, sigLineY, SIG_X + SIG_W - 4, sigLineY);
    sc(DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(shop?.authorized_signatory || shop?.shop_name || 'Authorized Signatory',
      SIG_X + SIG_W / 2, sigLineY + 4, { align: 'center' });

    Y = Math.max(Y, sigLineY + 8) + 6;

    // ── 8. TERMS ─────────────────────────────────────────────────────────────
    const effectiveTerms = shop?.terms_and_conditions || 'Goods once sold will not be taken back.';
    sc(LBLUE); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Terms & Conditions:', M, Y); Y += 4;
    sc(GREY); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    effectiveTerms.split('\n').forEach(line => {
      if (line.trim()) { doc.text(`• ${line.trim()}`, M, Y, { maxWidth: CW }); Y += 4; }
    });
    Y += 3;

    // ── 9. FOOTER ─────────────────────────────────────────────────────────────
    sc(BORD, 'draw'); doc.setLineWidth(0.3); doc.line(M, Y, M + CW, Y); Y += 4;
    sc(GREY); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text(`This is a computer-generated ${isInvoice ? 'invoice' : 'bill'}. Thank you for your business!`,
      PW / 2, Y, { align: 'center' });

    return doc;
  };

  // ✅ NEW: Generate Bill
  const generateProfessionalBill = async (bill) => {
    const doc = buildPDF(bill, 'bill');
    const pdfBlob = doc.output('blob');
    const pdfUrl  = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Bill_${bill.bill_number || bill.id}_${Date.now()}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
  };

  const generateProfessionalInvoice = async (bill) => {
    const doc = buildPDF(bill, 'invoice');
    const pdfBlob = doc.output('blob');
    const pdfUrl  = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Invoice_${bill.bill_number || bill.id}_${Date.now()}.pdf`;
    a.click();
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
                          Bill #{bill.bill_number || bill.id}
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
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-blue-600">
                          ₹{parseFloat(bill.total_amount).toFixed(2)}
                        </p>
                        {/* Status badge */}
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          bill.status === 'PAID'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : bill.status === 'PARTIAL'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {bill.status}
                        </span>
                        {/* Due amount - always show if > 0 */}
                        {parseFloat(bill.due_amount || 0) > 0 && (
                          <p className="text-xs font-bold text-red-500 dark:text-red-400">
                            Due: ₹{parseFloat(bill.due_amount).toFixed(2)}
                          </p>
                        )}
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
                      <span className="text-blue-600 text-base">
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
              <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-300" />
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
                    className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg bg-blue-50 dark:bg-blue-500/10"
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
                        <p className="text-sm font-bold text-blue-600">
                          ₹{parseFloat(invoice.amount).toFixed(2)}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-full">
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
                      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
