import toast from 'react-hot-toast';

/**
 * Non-blocking confirmation dialog using react-hot-toast.
 * Replaces window.confirm() which blocks the JS thread and looks native/ugly.
 *
 * Usage:
 *   const ok = await confirmAction('Delete this product?');
 *   if (!ok) return;
 *
 * @param {string} message - Confirmation message to show
 * @param {object} opts - Optional: { confirmLabel, cancelLabel, duration }
 * @returns {Promise<boolean>}
 */
export const confirmAction = (message, opts = {}) => {
  const {
    confirmLabel = 'Yes, delete',
    cancelLabel  = 'Cancel',
    duration     = 6000,
  } = opts;

  return new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 max-w-xs">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              {confirmLabel}
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="flex-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      ),
      { duration, id: `confirm-${Date.now()}` }
    );
  });
};
