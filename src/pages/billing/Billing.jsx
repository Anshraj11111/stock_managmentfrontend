import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Receipt, CreditCard, Smartphone, Banknote, ShoppingCart, DollarSign, Package, Search, Clock, Download, Edit, Calendar, ChevronRight, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { productService } from '../../services/productService';
import { billService } from '../../services/billService';
import { invoiceService } from '../../services/invoiceService';
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

  // ✅ Manual item add state
  const [showManualItem, setShowManualItem] = useState(false);
  const [manualItem, setManualItem] = useState({ name: '', price: '', quantity: 1 });

  // ✅ Recent bills state
  const [recentBills, setRecentBills] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // ✅ Bill Edit state
  const [showBillEditModal, setShowBillEditModal] = useState(false);
  const [editingBill, setEditingBill]       = useState(null);
  const [editItems, setEditItems]           = useState([]);
  const [editMeta, setEditMeta]             = useState({ customer_name: '', customer_phone: '', gst_percentage: '', discount_type: '', discount_value: '' });
  const [editSaving, setEditSaving]         = useState(false);

  // ✅ Bill View state
  const [showBillViewModal, setShowBillViewModal] = useState(false);
  const [viewingBill, setViewingBill]             = useState(null);
  const [viewLoading, setViewLoading]             = useState(false);

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
    fetchRecentBills(); // ✅ Load recent bills on mount
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

  const fetchRecentBills = async () => {
    setRecentLoading(true);
    try {
      const data = await billService.getBills();
      setRecentBills(Array.isArray(data) ? data.slice(0, 15) : []);
    } catch (_) { /* silent */ } finally {
      setRecentLoading(false);
    }
  };

  const downloadBillPDF = async (billId, billNumber) => {
    setDownloadingId(billId);
    try {
      const blob = await invoiceService.generateInvoice(billId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `bill-${billNumber}.pdf`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Bill downloaded');
    } catch { toast.error('Download failed'); }
    finally { setDownloadingId(null); }
  };

  // ── View Bill ──────────────────────────────────────────────────────────────
  const openBillView = async (bill) => {
    setViewLoading(true);
    setShowBillViewModal(true);
    try {
      const data = await billService.getBillDetails(bill.id);
      setViewingBill(data);
    } catch {
      toast.error('Failed to load bill details');
      setShowBillViewModal(false);
    } finally { setViewLoading(false); }
  };

  // ── Bill edit helpers ──────────────────────────────────────────────────────
  const openBillEdit = async (bill) => {
    try {
      const full = await billService.getBillById(bill.id);
      setEditingBill(full);
      const rows = (full.BillItems || []).map(item => ({
        product_id: item.product_id || null,
        item_name:  item.Product?.product_name || '',
        price:      item.price,
        quantity:   item.quantity,
      }));
      setEditItems(rows.length > 0 ? rows : [{ product_id: null, item_name: '', price: '', quantity: 1 }]);
      setEditMeta({
        customer_name:  full.customer_name  || '',
        customer_phone: full.customer_phone || '',
        gst_percentage: full.gst_percentage || '',
        discount_type:  full.discount_type  || '',
        discount_value: full.discount_percentage || '',
      });
      setShowBillEditModal(true);
    } catch { toast.error('Failed to load bill'); }
  };

  const updateEditItem = (idx, key, val) => {
    setEditItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [key]: val };
      if (key === 'product_id' && val) {
        const p = products.find(pr => pr.id === parseInt(val));
        if (p) { updated.item_name = p.product_name; updated.price = p.selling_price; }
      }
      return updated;
    }));
  };

  const calcEditTotal = () => {
    const sub   = editItems.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseFloat(i.quantity) || 0), 0);
    const gst   = parseFloat(editMeta.gst_percentage) > 0 ? (sub * editMeta.gst_percentage) / 100 : 0;
    let   total = sub + gst;
    if (editMeta.discount_type && parseFloat(editMeta.discount_value) > 0) {
      const d = editMeta.discount_type === 'percentage'
        ? (total * parseFloat(editMeta.discount_value)) / 100
        : parseFloat(editMeta.discount_value);
      total = Math.max(0, total - d);
    }
    return { sub: sub.toFixed(2), gst: gst.toFixed(2), total: total.toFixed(2) };
  };

  const saveBillEdit = async () => {
    if (!editingBill) return;
    const validItems = editItems.filter(i => i.item_name && parseFloat(i.price) > 0);
    if (validItems.length === 0) { toast.error('Add at least one valid item'); return; }
    setEditSaving(true);
    try {
      await billService.editBill(editingBill.id, {
        items: validItems.map(i => ({
          ...(i.product_id ? { product_id: parseInt(i.product_id) } : { item_name: i.item_name }),
          price:    parseFloat(i.price),
          quantity: parseFloat(i.quantity) || 1,
        })),
        customer_name:  editMeta.customer_name  || undefined,
        customer_phone: editMeta.customer_phone || undefined,
        gst_percentage: editMeta.gst_percentage  ? parseFloat(editMeta.gst_percentage)  : undefined,
        discount_type:  editMeta.discount_type   || undefined,
        discount_value: editMeta.discount_value  ? parseFloat(editMeta.discount_value)  : undefined,
      });
      toast.success('Bill updated ✓ — Preview loading...');
      setShowBillEditModal(false);
      setEditingBill(null);
      fetchRecentBills();

      // ✅ Load edited items into selectedItems and auto-preview
      const previewItems = validItems.map(i => ({
        product_id: i.product_id || `manual_${Date.now()}_${Math.random()}`,
        name:       i.item_name || '',
        price:      parseFloat(i.price),
        quantity:   parseFloat(i.quantity) || 1,
        total:      parseFloat(i.price) * (parseFloat(i.quantity) || 1),
        isManual:   !i.product_id,
      }));
      setSelectedItems(previewItems);

      // Set customer details from edit
      if (editMeta.customer_name || editMeta.customer_phone) {
        setCustomerDetails({
          name:    editMeta.customer_name  || '',
          phone:   editMeta.customer_phone || '',
          address: '',
        });
      }

      // Set GST/discount states
      if (editMeta.gst_percentage) {
        setGstEnabled(true);
        setGstPercentage(parseFloat(editMeta.gst_percentage));
      }
      if (editMeta.discount_type && editMeta.discount_value) {
        setDiscountEnabled(true);
        setDiscountType(editMeta.discount_type);
        setDiscountValue(editMeta.discount_value);
      }

      // Scroll to preview section after short delay
      setTimeout(() => {
        const el = document.getElementById('preview-bill-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Update failed');
    } finally { setEditSaving(false); }
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

  // ✅ Add a manually typed item (no product_id needed)
  const addManualItemToBill = () => {
    const name = manualItem.name.trim();
    const price = parseFloat(manualItem.price);
    const quantity = parseInt(manualItem.quantity) || 1;

    if (!name) { toast.error('Item name is required'); return; }
    if (!price || price <= 0) { toast.error('Enter a valid price'); return; }

    // Use a unique key for manual items — timestamp-based
    const manualKey = `manual_${Date.now()}`;
    setSelectedItems(prev => [...prev, {
      product_id: manualKey,  // unique identifier
      name,
      price,
      quantity,
      total: parseFloat((price * quantity).toFixed(2)),
      isManual: true,         // flag to skip stock check
    }]);

    setManualItem({ name: '', price: '', quantity: 1 });
    setShowManualItem(false);
    toast.success(`"${name}" added to bill`);
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
      // Filter manual items — send product_id only for real products
      const billItems = selectedItems.map(item => ({
        ...(item.isManual
          ? { item_name: item.name, price: item.price, quantity: item.quantity, unit: 'pcs' }
          : { product_id: item.product_id, quantity: item.quantity }
        )
      }));
      const requestData = {
        items: billItems,
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
      // Build items for API — manual items use item_name, real items use product_id
      const apiBillItems = selectedItems.map(item => ({
        ...(item.isManual
          ? { item_name: item.name, price: item.price, quantity: item.quantity, unit: 'pcs' }
          : { product_id: item.product_id, quantity: item.quantity }
        )
      }));
      const billData = {
        items: apiBillItems,
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
      fetchRecentBills(); // ✅ Refresh recent bills
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      {/* Premium Header */}
      <div className="flex-shrink-0 relative overflow-hidden"
        style={{ borderBottom: '1px solid #21262d' }}>
        {/* Background gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(31,111,235,0.08) 0%,rgba(13,17,23,1) 60%)', pointerEvents: 'none' }} />
        <div className="absolute top-0 left-0 w-64 h-full" style={{ background: 'radial-gradient(ellipse at left center, rgba(31,111,235,0.12), transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative flex items-center justify-between px-6 sm:px-8 py-5">
          {/* Left — title + icon */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1f6feb,#388bfd)', boxShadow: '0 0 20px rgba(31,111,235,0.35)' }}>
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#e6edf3' }}>
                {t('billing.title')}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#6e7681' }}>
                {t('billing.subtitle')}
              </p>
            </div>
          </div>

          {/* Right — cart badge + manual item button */}
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: 'rgba(37,99,235,0.12)', border: '1px solid rgba(56,139,253,0.35)' }}>
                <ShoppingCart className="w-5 h-5" style={{ color: '#388bfd' }} />
                <div>
                  <span className="text-base font-bold" style={{ color: '#388bfd' }}>
                    {selectedItems.length}
                  </span>
                  <span className="text-sm ml-1" style={{ color: '#6e7681' }}>
                    item{selectedItems.length !== 1 ? 's' : ''} in cart
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowManualItem(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: showManualItem
                  ? 'linear-gradient(135deg,#f85149,#da3633)'
                  : 'linear-gradient(135deg,#1f6feb,#388bfd)',
                color: '#fff',
                boxShadow: showManualItem
                  ? '0 4px 12px rgba(248,81,73,0.3)'
                  : '0 4px 12px rgba(31,111,235,0.3)',
              }}
            >
              <Plus className={`w-4 h-4 transition-transform duration-200 ${showManualItem ? 'rotate-45' : ''}`} />
              {showManualItem ? 'Cancel' : ' Add Manual Item'}
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-48 h-0.5"
          style={{ background: 'linear-gradient(90deg,#1f6feb,transparent)' }} />
      </div>

      {/* Single column layout */}
      <div className="flex-1 overflow-y-auto">
        {/* All content - wider, premium sizing */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-6 space-y-5">
          <div className="grid grid-cols-1 gap-5">

          {/* ── Manual Item Form (inline, expands on click) ── */}
          {showManualItem && (
            <div
              className="rounded-xl p-4 animate-fade-in"
              style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}
            >
              <p className="text-sm font-bold mb-3" style={{ color: '#388bfd' }}>
                ✏️ Add Custom Item to Bill
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  className="input-field"
                  placeholder="Item / Service name *"
                  value={manualItem.name}
                  onChange={e => setManualItem(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addManualItemToBill()}
                />
                <input
                  className="input-field"
                  placeholder="Price (₹) *"
                  type="number"
                  min="0"
                  step="any"
                  value={manualItem.price}
                  onChange={e => setManualItem(p => ({ ...p, price: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addManualItemToBill()}
                />
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="Qty"
                    type="number"
                    min="1"
                    value={manualItem.quantity}
                    onChange={e => setManualItem(p => ({ ...p, quantity: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addManualItemToBill()}
                  />
                  <button
                    onClick={addManualItemToBill}
                    className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all"
                    style={{ background: 'linear-gradient(135deg,#238636,#3fb950)' }}
                  >
                    Add
                  </button>
                </div>
              </div>
              {manualItem.name && manualItem.price && (
                <p className="text-xs mt-2" style={{ color: '#6e7681' }}>
                  Preview: {manualItem.name} × {manualItem.quantity || 1} = ₹{((parseFloat(manualItem.price) || 0) * (parseInt(manualItem.quantity) || 1)).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* ── PRODUCT SEARCH DROPDOWN (replaces product grid) ── */}
          <div className="relative">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6e7681' }} />
              <input
                type="text"
                placeholder="🔍  Search products to add to bill... (type product name)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setSearchTerm(searchTerm)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl font-medium text-base"
                style={{
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  color: '#e6edf3',
                  outline: 'none',
                  fontSize: '1rem',
                }}
                onFocusCapture={e => e.target.style.border = '2px solid #388bfd'}
                onBlurCapture={e => e.target.style.border = '1px solid #30363d'}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-lg"
                  style={{ color: '#8b949e' }}
                >✕ Clear</button>
              )}
            </div>

            {/* Dropdown results */}
            {(searchTerm.length > 0 || filteredProducts.length <= products.length) && searchTerm.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 z-30 mt-2 rounded-2xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: '#161b22', border: '1px solid #30363d', maxHeight: '420px', overflowY: 'auto' }}
              >
                {filteredProducts.length === 0 ? (
                  <div className="px-5 py-8 text-center text-base" style={{ color: '#6e7681' }}>
                    No products found for "{searchTerm}"
                  </div>
                ) : (
                  <>
                    {/* Add All matching */}
                    {filteredProducts.length > 1 && (
                      <button
                        onClick={() => {
                          const inStock = filteredProducts.filter(p => parseFloat(p.stock_quantity) > 0);
                          setSelectedItems(prev => {
                            const updated = [...prev];
                            inStock.forEach(product => {
                              const idx = updated.findIndex(i => i.product_id === product.id);
                              if (idx >= 0) {
                                const maxQty = parseFloat(product.stock_quantity);
                                updated[idx] = { ...updated[idx], quantity: Math.min(updated[idx].quantity + 1, maxQty), total: product.selling_price * Math.min(updated[idx].quantity + 1, maxQty) };
                              } else {
                                updated.push({ product_id: product.id, name: product.product_name, price: product.selling_price, quantity: 1, total: product.selling_price });
                              }
                            });
                            return updated;
                          });
                          toast.success(`${inStock.length} products added`);
                          setSearchTerm('');
                        }}
                        className="w-full px-5 py-3.5 flex items-center gap-2 text-sm font-semibold text-left transition-colors"
                        style={{ borderBottom: '1px solid #21262d', color: '#388bfd', backgroundColor: 'rgba(56,139,253,0.05)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(56,139,253,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(56,139,253,0.05)'}
                      >
                        <Plus className="w-4 h-4" />
                        Add all {filteredProducts.length} matching products
                      </button>
                    )}

                    {/* Individual product rows */}
                    {filteredProducts.map(product => {
                      const qty = parseFloat(product.stock_quantity) || 0;
                      const stockColor = qty > 10 ? '#3fb950' : qty > 0 ? '#f0883e' : '#f85149';
                      const inCart = selectedItems.find(i => i.product_id === product.id);

                      return (
                        <button
                          key={product.id}
                          disabled={qty === 0}
                          onClick={() => {
                            addToBill(product);
                            setSearchTerm('');
                          }}
                          className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ borderBottom: '1px solid rgba(33,38,45,0.6)' }}
                          onMouseEnter={e => { if (qty > 0) e.currentTarget.style.backgroundColor = '#21262d'; }}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold truncate" style={{ color: '#e6edf3' }}>
                              {product.product_name}
                              {inCart && <span className="ml-2 text-sm px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(56,139,253,0.15)', color: '#388bfd' }}>in cart ×{inCart.quantity}</span>}
                            </p>
                            <p className="text-sm mt-0.5" style={{ color: stockColor }}>
                              Stock: {product.stock_quantity}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-bold" style={{ color: '#388bfd' }}>₹{product.selling_price}</p>
                            {qty > 0 && (
                              <p className="text-sm mt-0.5 flex items-center gap-1 justify-end" style={{ color: '#3fb950' }}>
                                <Plus className="w-3.5 h-3.5" /> Add
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Hint */}
            {searchTerm.length === 0 && (
              <p className="mt-2 text-sm" style={{ color: '#6e7681' }}>
                💡 Type to search products — press Enter or click to add
              </p>
            )}
          </div>

          {/* Customer Details */}
          <div id="customer-section" className="rounded-2xl p-6" style={{ backgroundColor: '#161b22', border: '1px solid #30363d', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#e6edf3' }}>
              <svg className="w-5 h-5" style={{ color: '#388bfd' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Details
              <span className="text-xs font-normal ml-1" style={{ color: '#f85149' }}>(Required to preview)</span>
            </h3>
            {existingCustomer && (
              <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(56,139,253,0.3)' }}>
                <p className="text-sm font-semibold" style={{ color: '#388bfd' }}>✓ Existing Customer Found</p>
                <p className="text-sm" style={{ color: '#8b949e' }}>Previous Due: ₹{parseFloat(existingCustomer.total_due).toFixed(2)}</p>
              </div>
            )}
            <div className="space-y-4">
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                GST (Optional)
              </h3>
              <button onClick={() => setGstEnabled(!gstEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${gstEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
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
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">GST ({gstPercentage}%):</span><span className="font-semibold text-blue-600">₹{((calculateTotal() * gstPercentage) / 100).toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1"></div>
                    <div className="flex justify-between text-base"><span className="font-bold">Total:</span><span className="font-bold text-blue-600">₹{(calculateTotal() + (calculateTotal() * gstPercentage) / 100).toFixed(2)}</span></div>
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
                    {gstEnabled && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">GST ({gstPercentage}%):</span><span className="font-semibold text-blue-600">₹{((calculateTotal() * gstPercentage) / 100).toFixed(2)}</span></div>}
                    <div className="flex justify-between text-red-600"><span>Discount:</span><span className="font-semibold">-₹{calculateDiscountAmount().toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-1"></div>
                    <div className="flex justify-between text-base"><span className="font-bold">Final Total:</span><span className="font-bold text-orange-600">₹{calculateFinalTotal().toFixed(2)}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-4" />

          {/* ── RECENT BILLS ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(59,130,246,0.2)', backgroundColor: 'rgba(22,27,34,0.6)', backdropFilter: 'blur(12px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                  <Clock className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-secondary-900 dark:text-white">Recent Bills</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last {recentBills.length} transactions</p>
                </div>
              </div>
              <button
                onClick={fetchRecentBills}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
              >
                ↻ Refresh
              </button>
            </div>

            {/* Content */}
            {recentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Receipt className="w-7 h-7 mb-2 opacity-40" />
                <p className="text-xs">No bills yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left" style={{ backgroundColor: 'rgba(13,17,23,0.5)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
                      <th className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bill #</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customer</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                      <th className="px-3 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBills.map((bill, idx) => {
                      const sc =
                        bill.status === 'PAID'    ? '#3fb950' :
                        bill.status === 'PARTIAL' ? '#f0883e' :
                        bill.status === 'UNPAID'  ? '#f85149' : '#8b949e';
                      return (
                        <tr
                          key={bill.id}
                          style={{ borderBottom: idx < recentBills.length - 1 ? '1px solid rgba(59,130,246,0.08)' : 'none' }}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                        >
                          <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: '#3b82f6' }}>#{bill.bill_number}</td>
                          <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 max-w-[90px] truncate">
                            {bill.customer_name || 'Walk-in'}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">
                            ₹{Number(bill.total_amount).toLocaleString('en-IN')}
                            {bill.due_amount > 0 && (
                              <span className="block text-[10px] font-normal" style={{ color: '#f85149' }}>
                                Due: ₹{Number(bill.due_amount).toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                              style={{ backgroundColor: `${sc}18`, color: sc, border: `1px solid ${sc}33` }}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">
                            {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          {/* Actions: View + Edit + Download */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              {/* View */}
                              <button
                                onClick={() => openBillView(bill)}
                                className="p-1 rounded transition-colors"
                                style={{ color: '#8b949e' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.color = '#a78bfa'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b949e'; }}
                                title="View Bill"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {/* Edit */}
                              {bill.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => openBillEdit(bill)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: '#8b949e' }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#3b82f6'; }}
                                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b949e'; }}
                                  title="Edit Bill"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Download */}
                              <button
                                onClick={() => downloadBillPDF(bill.id, bill.bill_number)}
                                disabled={downloadingId === bill.id}
                                className="p-1 rounded transition-colors disabled:opacity-50"
                                style={{ color: '#8b949e' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#3b82f6'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b949e'; }}
                                title="Download PDF"
                              >
                                {downloadingId === bill.id
                                  ? <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                                  : <Download className="w-3.5 h-3.5" />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>{/* end left grid */}

          {/* ── CART ITEMS + PREVIEW + ACTIONS (inline, full width) ─────── */}
          {selectedItems.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #30363d', backgroundColor: '#161b22', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              {/* Cart header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #21262d', background: 'linear-gradient(135deg,rgba(31,111,235,0.1),rgba(56,139,253,0.05))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1f6feb,#388bfd)' }}>
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-base font-bold" style={{ color: '#e6edf3' }}>
                      Cart — {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
                    </span>
                    <p className="text-xs" style={{ color: '#6e7681' }}>Review before preview</p>
                  </div>
                </div>
                <button onClick={() => setSelectedItems([])}
                  className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#f85149', border: '1px solid rgba(248,81,73,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  🗑 Clear all
                </button>
              </div>

              {/* Items table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#0d1117', borderBottom: '1px solid #21262d' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#6e7681' }}>Item</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: '#6e7681' }}>Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#6e7681' }}>Unit Price</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#6e7681' }}>Total</th>
                      <th className="px-6 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, idx) => (
                      <tr key={item.product_id} style={{ borderBottom: idx < selectedItems.length - 1 ? '1px solid #21262d' : 'none' }}>
                        <td className="px-6 py-4 font-medium text-base" style={{ color: '#e6edf3' }}>{item.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors"
                              style={{ color: '#8b949e', border: '1px solid #21262d' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#21262d'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              −
                            </button>
                            <input type="number" value={item.quantity}
                              onChange={e => updateQuantity(item.product_id, e.target.value)}
                              min="1" className="w-16 text-center text-base font-bold rounded-lg py-1"
                              style={{ backgroundColor: '#0d1117', border: '1px solid #21262d', color: '#e6edf3' }} />
                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors"
                              style={{ color: '#8b949e', border: '1px solid #21262d' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#21262d'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm" style={{ color: '#8b949e' }}>₹{item.price}</td>
                        <td className="px-6 py-4 text-right text-base font-bold" style={{ color: '#388bfd' }}>₹{Number(item.total).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => removeFromBill(item.product_id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: '#f85149' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-6 py-5 space-y-2.5" style={{ borderTop: '1px solid #21262d', backgroundColor: 'rgba(13,17,23,0.6)' }}>
                <div className="flex justify-between text-sm" style={{ color: '#8b949e' }}>
                  <span>Subtotal</span><span className="font-semibold" style={{ color: '#e6edf3' }}>₹{calculateTotal().toFixed(2)}</span>
                </div>
                {previewData && (
                  <>
                    {previewData.gst_amount && (
                      <div className="flex justify-between text-sm" style={{ color: '#8b949e' }}>
                        <span>GST ({previewData.gst_percentage}%)</span>
                        <span className="font-semibold" style={{ color: '#388bfd' }}>+₹{previewData.gst_amount}</span>
                      </div>
                    )}
                    {previewData.discount_amount && (
                      <div className="flex justify-between text-sm" style={{ color: '#8b949e' }}>
                        <span>Discount</span>
                        <span className="font-semibold" style={{ color: '#f85149' }}>−₹{previewData.discount_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold text-xl pt-3" style={{ borderTop: '1px solid #30363d', color: '#e6edf3' }}>
                      <span>Grand Total</span>
                      <span style={{ color: '#388bfd', fontSize: '1.4rem' }}>₹{previewData.total_amount}</span>
                    </div>
                  </>
                )}
                {!previewData && (
                  <div className="flex justify-between items-center font-bold text-lg pt-2" style={{ borderTop: '1px solid #30363d', color: '#e6edf3' }}>
                    <span>Estimated Total</span>
                    <span style={{ color: '#8b949e' }}>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 px-6 py-5" style={{ borderTop: '1px solid #21262d' }}>
                <button
                  onClick={previewBill}
                  disabled={previewLoading || !customerDetails.name.trim()}
                  className="flex-1 py-4 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#1f6feb,#388bfd)', boxShadow: '0 4px 16px rgba(31,111,235,0.3)' }}
                  title={!customerDetails.name.trim() ? 'Enter customer name first' : ''}
                >
                  {previewLoading
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Loading...</>
                    : <><Receipt className="w-5 h-5" /> Preview Bill</>
                  }
                </button>

                {previewData && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex-1 py-4 rounded-2xl font-bold text-base text-white transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#6d28d9,#7c3aed)', boxShadow: '0 4px 16px rgba(109,40,217,0.3)' }}
                  >
                    <Receipt className="w-5 h-5" />
                    Proceed to Payment →
                  </button>
                )}
              </div>
            </div>
          )}

        </div>{/* end left column */}

      </div>{/* end single-column layout */}

      {/* ── VIEW MODAL ───────────────────────────────────────────────────── */}
      {showBillViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor:'#161b22',border:'1px solid #21262d' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom:'1px solid #21262d' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)' }}><Eye className="w-4 h-4 text-white"/></div>
                <div><h2 className="text-base font-bold" style={{ color:'#e6edf3' }}>Bill #{viewingBill?.bill_number||'…'}</h2><p className="text-xs" style={{ color:'#6e7681' }}>{viewingBill?new Date(viewingBill.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}</p></div>
              </div>
              <div className="flex items-center gap-2">
                {viewingBill&&(<span className="text-xs font-semibold px-2 py-1 rounded" style={{ color:viewingBill.status==='PAID'?'#3fb950':viewingBill.status==='PARTIAL'?'#f0883e':'#f85149',background:viewingBill.status==='PAID'?'rgba(63,185,80,0.15)':viewingBill.status==='PARTIAL'?'rgba(240,136,62,0.15)':'rgba(248,81,73,0.15)' }}>{viewingBill.status}</span>)}
                <button onClick={()=>{setShowBillViewModal(false);setViewingBill(null);}} className="p-1.5 rounded-lg" style={{ color:'#8b949e' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#21262d'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>✕</button>
              </div>
            </div>
            {viewLoading?(<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>)
            :viewingBill&&(
              <div className="p-5 space-y-4">
                {viewingBill.customer&&(<div className="rounded-xl p-4" style={{ backgroundColor:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)' }}>
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color:'#a78bfa' }}>Customer</p>
                  <p className="font-semibold text-sm" style={{ color:'#e6edf3' }}>{viewingBill.customer.name||'Walk-in'}</p>
                  {viewingBill.customer.phone&&<p className="text-xs mt-0.5" style={{ color:'#8b949e' }}>📞 {viewingBill.customer.phone}</p>}
                  {viewingBill.customer.total_due>0&&<p className="text-xs mt-1 font-semibold" style={{ color:'#f85149' }}>Total Due: ₹{Number(viewingBill.customer.total_due).toFixed(2)}</p>}
                </div>)}
                <div>
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color:'#8b949e' }}>Items</p>
                  <div className="rounded-xl overflow-hidden" style={{ border:'1px solid #21262d' }}>
                    <table className="w-full text-xs">
                      <thead><tr style={{ backgroundColor:'#0d1117' }}><th className="px-3 py-2 text-left" style={{ color:'#6e7681' }}>Item</th><th className="px-3 py-2 text-center" style={{ color:'#6e7681' }}>Qty</th><th className="px-3 py-2 text-right" style={{ color:'#6e7681' }}>Price</th><th className="px-3 py-2 text-right" style={{ color:'#6e7681' }}>Total</th></tr></thead>
                      <tbody>{(viewingBill.items||[]).map((item,i)=>(<tr key={i} style={{ borderTop:'1px solid #21262d' }}><td className="px-3 py-2.5 font-medium" style={{ color:'#e6edf3' }}>{item.product_name||'Item'}</td><td className="px-3 py-2.5 text-center" style={{ color:'#8b949e' }}>{item.quantity}</td><td className="px-3 py-2.5 text-right" style={{ color:'#8b949e' }}>₹{Number(item.unit_price).toFixed(2)}</td><td className="px-3 py-2.5 text-right font-semibold" style={{ color:'#e6edf3' }}>₹{Number(item.total).toFixed(2)}</td></tr>))}</tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-xl p-4 space-y-1.5" style={{ backgroundColor:'#0d1117',border:'1px solid #21262d' }}>
                  <div className="flex justify-between text-xs" style={{ color:'#8b949e' }}><span>Subtotal</span><span>₹{Number(viewingBill.subtotal_amount||0).toFixed(2)}</span></div>
                  {viewingBill.gst_percentage>0&&<div className="flex justify-between text-xs" style={{ color:'#8b949e' }}><span>GST ({viewingBill.gst_percentage}%)</span><span>₹{Number(viewingBill.gst_amount||0).toFixed(2)}</span></div>}
                  {viewingBill.discount_amount>0&&<div className="flex justify-between text-xs" style={{ color:'#f0883e' }}><span>Discount</span><span>-₹{Number(viewingBill.discount_amount).toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-sm pt-1" style={{ color:'#e6edf3',borderTop:'1px solid #21262d' }}><span>Grand Total</span><span style={{ color:'#3b82f6' }}>₹{Number(viewingBill.total_amount).toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs" style={{ color:'#3fb950' }}><span>Paid</span><span>₹{Number(viewingBill.paid_amount||0).toFixed(2)}</span></div>
                  {viewingBill.due_amount>0&&<div className="flex justify-between text-xs font-semibold" style={{ color:'#f85149' }}><span>Balance Due</span><span>₹{Number(viewingBill.due_amount).toFixed(2)}</span></div>}
                </div>
                {(viewingBill.payments||[]).length>0&&(<div>
                  <p className="text-xs font-semibold uppercase mb-2" style={{ color:'#8b949e' }}>Payments</p>
                  <div className="space-y-1.5">{viewingBill.payments.map((p,i)=>(<div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor:'#0d1117',border:'1px solid #21262d' }}><span className="text-xs font-semibold uppercase" style={{ color:'#3b82f6' }}>{p.payment_mode}</span>{p.reference_id&&<span className="text-xs" style={{ color:'#6e7681' }}>Ref: {p.reference_id}</span>}<span className="text-xs font-bold" style={{ color:'#e6edf3' }}>₹{Number(p.amount).toFixed(2)}</span></div>))}</div>
                </div>)}
              </div>
            )}
            <div className="flex gap-3 p-5" style={{ borderTop:'1px solid #21262d' }}>
              <button onClick={()=>{setShowBillViewModal(false);setViewingBill(null);}} className="flex-1 py-2.5 rounded-xl font-medium text-sm" style={{ border:'1px solid #30363d',color:'#8b949e' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#21262d'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>Close</button>
              {viewingBill&&viewingBill.status!=='CANCELLED'&&(<button onClick={()=>{setShowBillViewModal(false);openBillEdit(viewingBill);}} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)' }}>✏️ Edit This Bill</button>)}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────────── */}
      {showBillEditModal && editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor:'#161b22',border:'1px solid #21262d' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom:'1px solid #21262d' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)' }}><Edit className="w-4 h-4 text-white"/></div>
                <div><h2 className="text-base font-bold" style={{ color:'#e6edf3' }}>Edit Bill #{editingBill.bill_number}</h2><p className="text-xs" style={{ color:'#6e7681' }}>Modify items, prices, customer</p></div>
              </div>
              <button onClick={()=>setShowBillEditModal(false)} className="p-2 rounded-lg" style={{ color:'#8b949e' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#21262d'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div><p className="text-xs font-semibold uppercase mb-2" style={{ color:'#8b949e' }}>Customer</p>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Customer Name" value={editMeta.customer_name} onChange={e=>setEditMeta(p=>({...p,customer_name:e.target.value}))}/>
                  <input className="input-field" placeholder="Phone" value={editMeta.customer_phone} onChange={e=>setEditMeta(p=>({...p,customer_phone:e.target.value}))}/>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase" style={{ color:'#8b949e' }}>Items</p>
                  <button onClick={()=>setEditItems(p=>[...p,{product_id:null,item_name:'',price:'',quantity:1}])} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ color:'#3b82f6',background:'rgba(59,130,246,0.1)' }}>+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {editItems.map((item,idx)=>(
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select className="input-field text-sm" value={item.product_id||''} onChange={e=>updateEditItem(idx,'product_id',e.target.value?parseInt(e.target.value):null)}>
                          <option value="">— Custom —</option>
                          {products.map(p=><option key={p.id} value={p.id}>{p.product_name}</option>)}
                        </select>
                        {!item.product_id&&<input className="input-field text-sm mt-1" placeholder="Item name *" value={item.item_name} onChange={e=>updateEditItem(idx,'item_name',e.target.value)}/>}
                      </div>
                      <input className="input-field text-sm col-span-2" type="number" min="0.01" step="any" placeholder="Qty" value={item.quantity} onChange={e=>updateEditItem(idx,'quantity',e.target.value)}/>
                      <input className="input-field text-sm col-span-3" type="number" min="0" step="any" placeholder="₹ Price" value={item.price} onChange={e=>updateEditItem(idx,'price',e.target.value)}/>
                      <span className="col-span-1 text-xs font-bold text-center" style={{ color:'#3b82f6' }}>₹{((parseFloat(item.price)||0)*(parseFloat(item.quantity)||0)).toFixed(0)}</span>
                      <button onClick={()=>setEditItems(p=>p.filter((_,i)=>i!==idx))} className="col-span-1 p-1.5 rounded" style={{ color:'#f85149' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='rgba(248,81,73,0.1)'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <div><p className="text-xs font-semibold uppercase mb-2" style={{ color:'#8b949e' }}>Tax & Discount</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs mb-1 block" style={{ color:'#6e7681' }}>GST %</label><input className="input-field" type="number" min="0" max="28" placeholder="0" value={editMeta.gst_percentage} onChange={e=>setEditMeta(p=>({...p,gst_percentage:e.target.value}))}/></div>
                  <div><label className="text-xs mb-1 block" style={{ color:'#6e7681' }}>Discount Type</label><select className="input-field" value={editMeta.discount_type} onChange={e=>setEditMeta(p=>({...p,discount_type:e.target.value}))}><option value="">None</option><option value="percentage">Percentage</option><option value="fixed">Fixed ₹</option></select></div>
                  <div><label className="text-xs mb-1 block" style={{ color:'#6e7681' }}>Value</label><input className="input-field" type="number" min="0" placeholder="0" disabled={!editMeta.discount_type} value={editMeta.discount_value} onChange={e=>setEditMeta(p=>({...p,discount_value:e.target.value}))}/></div>
                </div>
              </div>
              {(()=>{const{sub,gst,total}=calcEditTotal();return(<div className="rounded-xl p-4 space-y-1" style={{ backgroundColor:'#0d1117',border:'1px solid #21262d' }}><div className="flex justify-between text-xs" style={{ color:'#8b949e' }}><span>Subtotal</span><span>₹{sub}</span></div>{parseFloat(editMeta.gst_percentage)>0&&<div className="flex justify-between text-xs" style={{ color:'#8b949e' }}><span>GST ({editMeta.gst_percentage}%)</span><span>₹{gst}</span></div>}<div className="flex justify-between font-bold text-sm pt-1" style={{ color:'#e6edf3',borderTop:'1px solid #21262d' }}><span>New Total</span><span style={{ color:'#3b82f6' }}>₹{total}</span></div></div>);})()}
            </div>
            <div className="flex gap-3 p-5" style={{ borderTop:'1px solid #21262d' }}>
              <button onClick={()=>setShowBillEditModal(false)} className="flex-1 py-2.5 rounded-xl font-medium text-sm" style={{ border:'1px solid #30363d',color:'#8b949e' }} onMouseEnter={e=>e.currentTarget.style.backgroundColor='#21262d'} onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>Cancel</button>
              <button onClick={saveBillEdit} disabled={editSaving} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                {editSaving?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</>:'✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SIMPLE Payment Modal - Dark Mode Friendly */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Header - Premium Gradient with Better Colors */}
            <div className="p-6 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-600 dark:from-blue-700 dark:via-blue-700 dark:to-blue-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                <Receipt className="w-7 h-7 text-white" />
                Payment Details
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50 dark:bg-gray-900">
              
              {/* Total Amount Display - Indigo/Purple Theme - Mobile Responsive */}
              <div className="text-center p-4 sm:p-8 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-600 dark:from-blue-700 dark:via-blue-700 dark:to-blue-700 rounded-2xl shadow-2xl border-2 border-blue-400 dark:border-blue-600">
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
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-full flex flex-col items-center bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/40 p-5 rounded-xl border-2 border-blue-400 dark:border-blue-500 shadow-lg">
                  <p className="text-sm font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-300" />
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
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl p-5 border-2 border-blue-200 dark:border-gray-700 shadow-lg">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="flex justify-between text-sm bg-blue-50 dark:bg-blue-500/15 p-3 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">
                        Paid ({paymentMode === 'cash' ? 'Cash' : 'UPI'}):
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-300">
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
                  <div className="border-t-2 border-blue-200 dark:border-gray-600 pt-3 mt-3"></div>
                  <div className="flex justify-between text-base bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 p-3 rounded-lg">
                    <span className="font-bold text-gray-900 dark:text-gray-100">Balance:</span>
                    <span className={`font-bold text-lg ${
                      Math.abs((parseFloat(paidAmount) || 0) + (parseFloat(dueAmount) || 0) - previewData.total_amount) < 0.01
                        ? 'text-blue-600 dark:text-blue-300'
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
