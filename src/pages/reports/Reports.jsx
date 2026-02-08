import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Filter } from 'lucide-react';
import { reportService } from '../../services/reportService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, [filterType, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let response;

      if (filterType === 'daily') {
        response = await reportService.getDailyReport();
      } else if (filterType === 'monthly') {
        response = await reportService.getMonthlyReport();
      } else {
        response = await reportService.getReportByDateRange(dateRange.startDate, dateRange.endDate);
      }

      // Handle both array and object responses
      const reportData = Array.isArray(response) ? response : response ? [response] : [];
      setReports(reportData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // Export functionality to be implemented
      toast.success('Exporting reports...');
    } catch (error) {
      toast.error('Failed to export reports');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Reports</h1>
        </div>
        <Button
          onClick={handleExport}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filterType === 'custom' && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary-600" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary-600" />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reports Table */}
      {reports && reports.length > 0 ? (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-100 dark:bg-secondary-700 border-b border-secondary-200 dark:border-secondary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">Total Sales</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">Total Bills</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">Received Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200 dark:divide-secondary-600">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-300">
                      {new Date(report.date || report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-300">
                      ₹{(report.total_sales || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-300">
                      {report.total_bills || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600 dark:text-secondary-300">
                      {report.received_amount ? `₹${report.received_amount.toLocaleString()}` : '₹0'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400">
                      ₹{(report.total_sales || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No Reports Available"
          description="There are no reports available for the selected period. Try adjusting your filters."
        />
      )}
    </div>
  );
};

export default Reports;
