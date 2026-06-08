import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  Search,
  FileDown,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../utils/cn";
import api from "../../utils/api";

// ─── helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",     icon: Clock },
  sent:      { label: "Sent",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",  icon: Send },
  accepted:  { label: "Accepted",  color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: CheckCircle },
  rejected:  { label: "Rejected",  color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",     icon: XCircle },
  expired:   { label: "Expired",   color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Clock },
  converted: { label: "Converted", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", icon: ArrowRightLeft },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", cfg.color)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
const QuotationModal = ({ onClose, onSaved, editing }) => {
  const [form, setForm] = useState({
    customer_name: editing?.customer_name || "",
    customer_phone: editing?.customer_phone || "",
    customer_email: editing?.customer_email || "",
    customer_address: editing?.customer_address || "",
    gst_percentage: editing?.gst_percentage || "",
    discount_type: editing?.discount_type || "",
    discount_value: editing?.discount_value || "",
    valid_until: editing?.valid_until || "",
    notes: editing?.notes || "",
    terms_and_conditions: editing?.terms_and_conditions || "",
  });
  const [items, setItems] = useState(
    editing?.items?.length
      ? editing.items.map((i) => ({ item_name: i.item_name, quantity: i.quantity, price: i.price, unit: i.unit || "pcs", description: i.description || "" }))
      : [{ item_name: "", quantity: 1, price: "", unit: "pcs", description: "" }]
  );
  const [saving, setSaving] = useState(false);

  const updateItem = (idx, key, val) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { item_name: "", quantity: 1, price: "", unit: "pcs", description: "" }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (parseFloat(it.quantity) || 0), 0);
  const gstAmt = form.gst_percentage > 0 ? (subtotal * form.gst_percentage) / 100 : 0;
  let total = subtotal + gstAmt;
  if (form.discount_type && form.discount_value > 0) {
    const disc = form.discount_type === "percentage" ? (total * form.discount_value) / 100 : parseFloat(form.discount_value);
    total = Math.max(0, total - disc);
  }

  const handleSave = async () => {
    if (!items.some((i) => i.item_name && i.price)) {
      toast.error("At least one item with name and price is required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, items };
      if (editing) {
        await api.put(`/quotations/${editing.id}`, payload);
        toast.success("Quotation updated");
      } else {
        await api.post("/quotations", payload);
        toast.success("Quotation created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              {editing ? "Edit Quotation" : "New Quotation"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800">
            <XCircle className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 uppercase tracking-wide">Customer Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Customer Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              <input className="input-field" placeholder="Phone" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              <input className="input-field" placeholder="Email (optional)" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              <input className="input-field" placeholder="Valid Until (YYYY-MM-DD)" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
              <textarea className="input-field col-span-2 resize-none" rows={2} placeholder="Customer Address (optional)" value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide">Items</h3>
              <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                  <input className="input-field col-span-4" placeholder="Item Name *" value={item.item_name} onChange={(e) => updateItem(idx, "item_name", e.target.value)} />
                  <input className="input-field col-span-2" placeholder="Qty" type="number" min="0.01" step="any" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                  <input className="input-field col-span-1" placeholder="Unit" value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} />
                  <input className="input-field col-span-2" placeholder="Price ₹ *" type="number" min="0" step="any" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} />
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {fmt((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0))}
                    </span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input className="input-field col-span-11" placeholder="Description (optional)" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Tax / Discount */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3 uppercase tracking-wide">Tax & Discount</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">GST %</label>
                <input className="input-field" type="number" min="0" max="28" placeholder="e.g. 18" value={form.gst_percentage} onChange={(e) => setForm({ ...form, gst_percentage: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">Discount Type</label>
                <select className="input-field" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                  <option value="">None</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">Discount Value</label>
                <input className="input-field" type="number" min="0" placeholder="0" value={form.discount_value} disabled={!form.discount_type} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Notes / T&C */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">Notes</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Internal notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-secondary-500 dark:text-secondary-400 mb-1 block">Terms & Conditions</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Payment terms, validity..." value={form.terms_and_conditions} onChange={(e) => setForm({ ...form, terms_and_conditions: e.target.value })} />
            </div>
          </div>

          {/* Total Preview */}
          <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            {gstAmt > 0 && (
              <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                <span>GST ({form.gst_percentage}%)</span><span>{fmt(gstAmt)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-secondary-900 dark:text-white border-t border-secondary-200 dark:border-secondary-700 pt-1 mt-1">
              <span>Total</span><span className="text-emerald-600 dark:text-emerald-400">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-secondary-200 dark:border-secondary-700">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            {editing ? "Update Quotation" : "Create Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Quotations = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append("status", statusFilter);

      const [listRes, statsRes] = await Promise.all([
        api.get(`/quotations?${params}`),
        api.get("/quotations/stats"),
      ]);
      setQuotations(listRes.data.quotations || []);
      setTotalPages(listRes.data.pages || 1);
      setStats(statsRes.data || {});
    } catch {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quotation?")) return;
    setActionLoading(id + "_del");
    try {
      await api.delete(`/quotations/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(id + "_status");
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async (id, quotationNumber) => {
    const toastId = toast.loading("Generating PDF...");
    try {
      const res = await api.get(`/quotations/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${quotationNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded", { id: toastId });
    } catch {
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const filtered = quotations.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.quotation_number?.toLowerCase().includes(s) ||
      q.customer_name?.toLowerCase().includes(s) ||
      q.customer_phone?.includes(s)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Quotations</h1>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Create & manage professional quotations</p>
          </div>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "total",     label: "Total",     color: "text-secondary-700 dark:text-secondary-300" },
          { key: "draft",     label: "Draft",     color: "text-gray-600 dark:text-gray-400" },
          { key: "sent",      label: "Sent",      color: "text-blue-600 dark:text-blue-400" },
          { key: "accepted",  label: "Accepted",  color: "text-green-600 dark:text-green-400" },
          { key: "rejected",  label: "Rejected",  color: "text-red-600 dark:text-red-400" },
          { key: "converted", label: "Converted", color: "text-purple-600 dark:text-purple-400" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key === "total" ? "" : key); setPage(1); }}
            className={cn(
              "bg-white dark:bg-secondary-900 rounded-xl p-4 text-left border-2 transition-all hover:shadow-md",
              statusFilter === (key === "total" ? "" : key)
                ? "border-emerald-500 shadow-md"
                : "border-transparent"
            )}
          >
            <div className={cn("text-2xl font-bold", color)}>{stats[key] || 0}</div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            className="input-field pl-9 w-full"
            placeholder="Search by name, phone, or quotation number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-full sm:w-40"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary-400 dark:text-secondary-500">
            <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No quotations found</p>
            <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create your first quotation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Quotation #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Valid Until</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-secondary-900 dark:text-white">
                      {q.quotation_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-secondary-900 dark:text-white">{q.customer_name || "—"}</div>
                      {q.customer_phone && <div className="text-xs text-secondary-500">{q.customer_phone}</div>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {fmt(q.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3 text-secondary-600 dark:text-secondary-400 text-xs">
                      {q.valid_until || "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary-500 dark:text-secondary-400 text-xs">
                      {new Date(q.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* PDF */}
                        <button
                          title="Download PDF"
                          onClick={() => handleDownloadPDF(q.id, q.quotation_number)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        {q.status !== "converted" && (
                          <button
                            title="Edit"
                            onClick={async () => {
                              try {
                                const res = await api.get(`/quotations/${q.id}`);
                                setEditing(res.data);
                                setShowModal(true);
                              } catch { toast.error("Failed to load quotation"); }
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Mark Sent */}
                        {q.status === "draft" && (
                          <button
                            title="Mark as Sent"
                            disabled={actionLoading === q.id + "_status"}
                            onClick={() => handleStatusChange(q.id, "sent")}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Accept / Reject */}
                        {q.status === "sent" && (
                          <>
                            <button
                              title="Mark Accepted"
                              disabled={actionLoading === q.id + "_status"}
                              onClick={() => handleStatusChange(q.id, "accepted")}
                              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              title="Mark Rejected"
                              disabled={actionLoading === q.id + "_status"}
                              onClick={() => handleStatusChange(q.id, "rejected")}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Delete */}
                        {q.status !== "converted" && (
                          <button
                            title="Delete"
                            disabled={actionLoading === q.id + "_del"}
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === q.id + "_del"
                              ? <RefreshCw className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200 dark:border-secondary-800">
            <span className="text-sm text-secondary-500 dark:text-secondary-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <QuotationModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default Quotations;
