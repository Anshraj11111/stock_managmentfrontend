import { useEffect, useState } from "react";
import {
  FileText, Download, Search, Calendar,
  CheckCircle, Clock, Edit, X, Plus, Trash2,
  RefreshCw, Save,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { invoiceService } from "../../services/invoiceService";
import { billService } from "../../services/billService";
import { productService } from "../../services/productService";
import toast from "react-hot-toast";

const Invoices = () => {
  const { t } = useTranslation();
  const [billId, setBillId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  // ── Edit bill state ────────────────────────────────────────────────────────
  const [editingBill, setEditingBill]   = useState(null);
  const [editItems, setEditItems]       = useState([]);
  const [editMeta, setEditMeta]         = useState({ customer_name: '', customer_phone: '', gst_percentage: '', discount_type: '', discount_value: '' });
  const [products, setProducts]         = useState([]);
  const [editSaving, setEditSaving]     = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  /* =============================
     FETCH REAL DATA
  ============================== */
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([
        fetchRecentInvoices(),
        fetchInvoiceStats(),
        fetchProducts(),
      ]);
      setLoadingData(false);
    };
    loadData();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (_) {}
  };

  const fetchRecentInvoices = async () => {
    try {
      console.log('🔄 Fetching recent invoices...');
      const data = await invoiceService.getRecentInvoices();
      console.log('✅ Recent invoices loaded:', data);
      setRecentInvoices(data);
    } catch (err) {
      console.error('❌ Failed to load recent invoices:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load recent invoices");
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      console.log('🔄 Fetching invoice stats...');
      const data = await invoiceService.getInvoiceStats();
      console.log('✅ Invoice stats loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Failed to load invoice stats:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load invoice stats");
    }
  };

  /* =============================
     EDIT BILL
  ============================== */
  const openEditBill = async (inv) => {
    try {
      const full = await billService.getBillById(inv.id);
      setEditingBill(full);
      // Map BillItems to editable rows
      const rows = (full.BillItems || []).map(item => ({
        product_id: item.product_id || null,
        item_name:  item.Product?.product_name || item.item_name || '',
        price:      item.price,
        quantity:   item.quantity,
      }));
      setEditItems(rows.length > 0 ? rows : [{ product_id: null, item_name: '', price: '', quantity: 1 }]);
      setEditMeta({
        customer_name:   full.customer_name  || '',
        customer_phone:  full.customer_phone || '',
        gst_percentage:  full.gst_percentage  || '',
        discount_type:   full.discount_type   || '',
        discount_value:  full.discount_percentage || '',
      });
      setShowEditModal(true);
    } catch {
      toast.error('Failed to load bill details');
    }
  };

  const updateEditItem = (idx, key, val) => {
    setEditItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [key]: val };
      // Auto-fill price from product
      if (key === 'product_id' && val) {
        const p = products.find(pr => pr.id === parseInt(val));
        if (p) {
          updated.item_name = p.product_name;
          updated.price     = p.selling_price;
        }
      }
      return updated;
    }));
  };

  const addEditItem = () =>
    setEditItems(prev => [...prev, { product_id: null, item_name: '', price: '', quantity: 1 }]);

  const removeEditItem = (idx) =>
    setEditItems(prev => prev.filter((_, i) => i !== idx));

  const calcEditTotal = () => {
    const sub = editItems.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseFloat(i.quantity) || 0), 0);
    const gst = editMeta.gst_percentage > 0 ? (sub * editMeta.gst_percentage) / 100 : 0;
    let total  = sub + gst;
    if (editMeta.discount_type && editMeta.discount_value > 0) {
      const disc = editMeta.discount_type === 'percentage'
        ? (total * editMeta.discount_value) / 100
        : parseFloat(editMeta.discount_value);
      total = Math.max(0, total - disc);
    }
    return { sub: sub.toFixed(2), gst: gst.toFixed(2), total: total.toFixed(2) };
  };

  const saveEditBill = async () => {
    if (!editingBill) return;
    const validItems = editItems.filter(i => i.item_name && parseFloat(i.price) > 0);
    if (validItems.length === 0) { toast.error('Add at least one valid item'); return; }

    setEditSaving(true);
    try {
      const payload = {
        items: validItems.map(i => ({
          ...(i.product_id ? { product_id: parseInt(i.product_id) } : { item_name: i.item_name }),
          price:    parseFloat(i.price),
          quantity: parseFloat(i.quantity) || 1,
        })),
        customer_name:   editMeta.customer_name  || undefined,
        customer_phone:  editMeta.customer_phone || undefined,
        gst_percentage:  editMeta.gst_percentage  ? parseFloat(editMeta.gst_percentage)  : undefined,
        discount_type:   editMeta.discount_type   || undefined,
        discount_value:  editMeta.discount_value  ? parseFloat(editMeta.discount_value)  : undefined,
      };

      await billService.editBill(editingBill.id, payload);
      toast.success('Bill updated successfully');
      setShowEditModal(false);
      setEditingBill(null);
      fetchRecentInvoices();
      fetchInvoiceStats();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Update failed');
    } finally {
      setEditSaving(false);
    }
  };
  const generateInvoice = async (id) => {
    const targetId = id || billId;

    if (!targetId) {
      toast.error("Please enter Bill ID");
      return;
    }

    setLoading(true);
    try {
      const blob = await invoiceService.generateInvoice(targetId);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${targetId}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded");
      setBillId("");
    } catch (err) {
      toast.error("Invoice not found or access denied");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 px-4 sm:px-6 lg:px-8 pb-10 space-y-6">
      {/* HEADER */}
      <div className="pt-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
          {t('invoices.title')}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 text-sm sm:text-base">
          {t('invoices.subtitle')}
        </p>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN - GENERATE INVOICE */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 bg-white dark:bg-secondary-900 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-secondary-900 dark:text-secondary-100">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/15 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              {t('invoices.generateInvoice')}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 dark:text-secondary-500" />
                <input
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                  placeholder="Enter Bill ID"
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                disabled={loading}
                onClick={() => generateInvoice()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <Download className="w-5 h-5" />
                {loading ? t('invoices.generating') : t('invoices.downloadInvoice')}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RECENT INVOICES */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-secondary-900 dark:text-secondary-100">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/15 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              {t('invoices.recentInvoices')}
            </h2>

            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-500 border-t-blue-600 dark:border-t-blue-400"></div>
                <span className="mt-4 text-secondary-500 dark:text-secondary-400 font-medium">Loading invoices...</span>
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-secondary-100 dark:bg-secondary-800 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-secondary-400 dark:text-secondary-500" />
                </div>
                <p className="text-lg font-medium text-secondary-600 dark:text-secondary-400 mb-2">No invoices found</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-500">Create your first bill to see invoices here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-secondary-50 to-white dark:from-secondary-800 dark:to-secondary-850 rounded-xl hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all"
                  >
                    {/* LEFT SIDE - Bill Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                        {inv.bill_number}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* MIDDLE - Amount & Status */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-secondary-900 dark:text-secondary-100">
                          ₹{inv.total_amount.toLocaleString('en-IN')}
                        </p>
                        <span
                          className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                            inv.status === "PAID"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      {/* RIGHT SIDE - Download + Edit buttons */}
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        {inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => openEditBill(inv)}
                            className="p-2.5 rounded-lg transition-all hover:scale-110"
                            style={{ color: '#3b82f6' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Edit Bill"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {/* Download PDF */}
                        <button
                          onClick={() => generateInvoice(inv.id)}
                          className="p-2.5 rounded-lg transition-all hover:scale-110"
                          style={{ color: '#3b82f6' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total" value={stats.total} icon={FileText} color="indigo" />
        <StatCard title="Paid" value={stats.paid} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
      </div>

      {/* ── EDIT BILL MODAL ────────────────────────────────────────────────── */}
      {showEditModal && editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
            style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>

            {/* Header */}
            <div className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid #21262d' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                  <Edit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: '#e6edf3' }}>
                    Edit Bill #{editingBill.bill_number}
                  </h2>
                  <p className="text-xs" style={{ color: '#6e7681' }}>
                    Modify items, prices, customer details
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#8b949e' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#21262d'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#8b949e' }}>
                  Customer Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Customer Name"
                    value={editMeta.customer_name}
                    onChange={e => setEditMeta(p => ({ ...p, customer_name: e.target.value }))} />
                  <input className="input-field" placeholder="Phone"
                    value={editMeta.customer_phone}
                    onChange={e => setEditMeta(p => ({ ...p, customer_phone: e.target.value }))} />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8b949e' }}>
                    Items
                  </p>
                  <button onClick={addEditItem}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}>
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      {/* Product select or name */}
                      <div className="col-span-5">
                        <select
                          className="input-field text-sm"
                          value={item.product_id || ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '__custom__') {
                              updateEditItem(idx, 'product_id', null);
                            } else {
                              updateEditItem(idx, 'product_id', val ? parseInt(val) : null);
                            }
                          }}
                        >
                          <option value="">— Custom item —</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.product_name}</option>
                          ))}
                        </select>
                        {!item.product_id && (
                          <input className="input-field text-sm mt-1" placeholder="Item name *"
                            value={item.item_name}
                            onChange={e => updateEditItem(idx, 'item_name', e.target.value)} />
                        )}
                      </div>
                      {/* Qty */}
                      <input className="input-field text-sm col-span-2" type="number" min="0.01" step="any"
                        placeholder="Qty" value={item.quantity}
                        onChange={e => updateEditItem(idx, 'quantity', e.target.value)} />
                      {/* Price */}
                      <input className="input-field text-sm col-span-3" type="number" min="0" step="any"
                        placeholder="Price ₹" value={item.price}
                        onChange={e => updateEditItem(idx, 'price', e.target.value)} />
                      {/* Line total */}
                      <span className="col-span-1 text-xs font-semibold text-center" style={{ color: '#3b82f6' }}>
                        ₹{((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)).toFixed(0)}
                      </span>
                      {/* Delete */}
                      <button onClick={() => removeEditItem(idx)}
                        className="col-span-1 p-1.5 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: '#f85149' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(248,81,73,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#8b949e' }}>
                  Tax & Discount
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#6e7681' }}>GST %</label>
                    <input className="input-field" type="number" min="0" max="28" placeholder="0"
                      value={editMeta.gst_percentage}
                      onChange={e => setEditMeta(p => ({ ...p, gst_percentage: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#6e7681' }}>Discount Type</label>
                    <select className="input-field"
                      value={editMeta.discount_type}
                      onChange={e => setEditMeta(p => ({ ...p, discount_type: e.target.value }))}>
                      <option value="">None</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#6e7681' }}>Discount Value</label>
                    <input className="input-field" type="number" min="0" placeholder="0"
                      disabled={!editMeta.discount_type}
                      value={editMeta.discount_value}
                      onChange={e => setEditMeta(p => ({ ...p, discount_value: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Total preview */}
              {(() => {
                const { sub, gst, total } = calcEditTotal();
                return (
                  <div className="rounded-xl p-4 space-y-1.5"
                    style={{ backgroundColor: '#0d1117', border: '1px solid #21262d' }}>
                    <div className="flex justify-between text-sm" style={{ color: '#8b949e' }}>
                      <span>Subtotal</span><span>₹{sub}</span>
                    </div>
                    {parseFloat(editMeta.gst_percentage) > 0 && (
                      <div className="flex justify-between text-sm" style={{ color: '#8b949e' }}>
                        <span>GST ({editMeta.gst_percentage}%)</span><span>₹{gst}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1"
                      style={{ color: '#e6edf3', borderTop: '1px solid #21262d' }}>
                      <span>New Total</span>
                      <span style={{ color: '#3b82f6' }}>₹{total}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5" style={{ borderTop: '1px solid #21262d' }}>
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors"
                style={{ border: '1px solid #30363d', color: '#8b949e' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#21262d'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                Cancel
              </button>
              <button onClick={saveEditBill} disabled={editSaving}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                {editSaving
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                  : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =============================
   STAT CARD
============================= */
const StatCard = ({ title, value, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
      border: "border-indigo-200 dark:border-indigo-800",
      icon: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
    },
    green: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
      border: "border-orange-200 dark:border-orange-800",
      icon: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
    }
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`rounded-2xl p-6 border transition-all hover:shadow-lg transform hover:scale-[1.02] ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.iconBg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${colors.badge}`}>
          {title}
        </span>
      </div>
      <p className="text-4xl font-bold text-secondary-900 dark:text-secondary-100">{value}</p>
      <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">
        {title === "Total" ? "Total Invoices" : title === "Paid" ? "Completed" : "Awaiting Payment"}
      </p>
    </div>
  );
};

export default Invoices;
