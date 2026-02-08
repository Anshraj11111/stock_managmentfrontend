import { useState } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import { invoiceService } from '../../services/invoiceService';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [billId, setBillId] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInvoice = async () => {
    if (!billId.trim()) {
      toast.error('Please enter a bill ID');
      return;
    }

    setLoading(true);
    try {
      const blob = await invoiceService.generateInvoice(billId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
      setBillId('');
    } catch (error) {
      toast.error('Failed to generate invoice. Please check the bill ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          Invoices
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Generate and download PDF invoices for your bills
        </p>
      </div>

      <div className="max-w-md">
        <div className="glass-card">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Generate Invoice
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Bill ID"
              type="text"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              placeholder="Enter bill ID to generate invoice"
              icon={<Search className="w-4 h-4" />}
            />

            <Button
              onClick={generateInvoice}
              loading={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Generate & Download PDF
            </Button>
          </div>

          <div className="mt-6 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <h3 className="text-sm font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              How to find Bill ID:
            </h3>
            <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
              <li>• Check your billing history</li>
              <li>• Bill IDs are numeric values</li>
              <li>• Usually displayed on receipts</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Recent Invoices
        </h2>

        <EmptyState
          icon={FileText}
          title="No recent invoices"
          description="Generated invoices will appear here for quick access."
        />
      </div>
    </div>
  );
};

export default Invoices;
