import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Filter, TrendingUp, DollarSign, Receipt, Activity, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { reportService } from '../../services/reportService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { BarChart, Bar, LineChart, Line, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

const Reports = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('daily');
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterType, dateRange, singleDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let response;

      if (filterType === 'daily') {
        response = await reportService.getDailyReport();
        // Convert single object to array for consistent handling
        const reportData = response ? [response] : [];
        setReports(reportData);
      } else if (filterType === 'singleDay') {
        // For single day, use date range with same start and end date
        response = await reportService.getReportByDateRange(singleDate, singleDate);
        const reportData = Array.isArray(response) ? response : response ? [response] : [];
        setReports(reportData);
      } else if (filterType === 'monthly') {
        response = await reportService.getMonthlyReport();
        // Convert single object to array for consistent handling
        const reportData = response ? [response] : [];
        setReports(reportData);
      } else {
        // Custom date range
        response = await reportService.getReportByDateRange(dateRange.startDate, dateRange.endDate);
        const reportData = Array.isArray(response) ? response : response ? [response] : [];
        setReports(reportData);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (reports.length === 0) {
      toast.error('No reports to export');
      return;
    }

    try {
      setExporting(true);
      toast.loading('Generating PDF report...', { id: 'export' });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sales Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Date Range
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const dateStr = filterType === 'singleDay' 
        ? `Date: ${new Date(singleDate).toLocaleDateString()}`
        : filterType === 'daily' 
        ? `Date: ${new Date().toLocaleDateString()}`
        : `Period: ${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`;
      pdf.text(dateStr, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Summary Cards
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary', 15, yPos);
      yPos += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Total Revenue
      pdf.setFillColor(59, 130, 246);
      pdf.rect(15, yPos, 60, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Total Revenue', 20, yPos + 8);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`₹${totals.totalSales.toLocaleString()}`, 20, yPos + 18);
      
      // Total Bills
      pdf.setFillColor(139, 92, 246);
      pdf.rect(80, yPos, 60, 25, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Total Bills', 85, yPos + 8);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${totals.totalBills}`, 85, yPos + 18);
      
      // Amount Received
      pdf.setFillColor(16, 185, 129);
      pdf.rect(145, yPos, 60, 25, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Amount Received', 150, yPos + 8);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`₹${totals.totalReceived.toLocaleString()}`, 150, yPos + 18);
      
      yPos += 35;

      // Detailed Reports Table
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Reports', 15, yPos);
      yPos += 8;

      // Table Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPos, pageWidth - 30, 10, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date', 20, yPos + 7);
      pdf.text('Total Sales', 60, yPos + 7);
      pdf.text('Bills', 110, yPos + 7);
      pdf.text('Received', 145, yPos + 7);
      yPos += 10;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      reports.forEach((report, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
        }

        const date = new Date(report.date || report.createdAt).toLocaleDateString();
        pdf.text(date, 20, yPos + 6);
        pdf.text(`₹${(report.total_sales || 0).toLocaleString()}`, 60, yPos + 6);
        pdf.text(`${report.total_bills || 0}`, 110, yPos + 6);
        pdf.text(`₹${(report.received_amount || 0).toLocaleString()}`, 145, yPos + 6);
        yPos += 8;
      });

      yPos += 10;

      // Revenue Breakdown
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Revenue Breakdown', 15, yPos);
      yPos += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const receivedPercent = totals.totalSales > 0 
        ? ((totals.totalReceived / totals.totalSales) * 100).toFixed(1)
        : 0;
      const duePercent = totals.totalSales > 0 
        ? (((totals.totalSales - totals.totalReceived) / totals.totalSales) * 100).toFixed(1)
        : 0;

      pdf.setFillColor(16, 185, 129);
      pdf.rect(15, yPos, 90, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Received: ${receivedPercent}%`, 20, yPos + 6);
      pdf.text(`₹${totals.totalReceived.toLocaleString()}`, 20, yPos + 12);

      pdf.setFillColor(245, 158, 11);
      pdf.rect(110, yPos, 90, 15, 'F');
      pdf.text(`Due: ${duePercent}%`, 115, yPos + 6);
      pdf.text(`₹${(totals.totalSales - totals.totalReceived).toLocaleString()}`, 115, yPos + 12);

      // Footer
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      const filename = filterType === 'singleDay' 
        ? `Sales_Report_${singleDate}.pdf`
        : filterType === 'daily' 
        ? `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`
        : `Sales_Report_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
      
      pdf.save(filename);
      
      toast.success('Report exported successfully!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report', { id: 'export' });
    } finally {
      setExporting(false);
    }
  };

  const calculateTotals = () => {
    return reports.reduce((acc, report) => ({
      totalSales: acc.totalSales + (report.total_sales || 0),
      totalBills: acc.totalBills + (report.total_bills || 0),
      totalReceived: acc.totalReceived + (report.received_amount || 0),
    }), { totalSales: 0, totalBills: 0, totalReceived: 0 });
  };

  const totals = calculateTotals();

  // Prepare chart data for line/bar charts
  const chartData = reports.map(report => ({
    date: new Date(report.date || report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    sales: report.total_sales || 0,
    bills: report.total_bills || 0,
    received: report.received_amount || 0,
  }));

  // Prepare pie chart data for revenue breakdown
  const pieChartData = [
    { name: 'Received Amount', value: totals.totalReceived, color: '#2563eb' },
    { name: 'Due Amount', value: totals.totalSales - totals.totalReceived, color: '#f59e0b' },
  ];

  // Prepare pie chart data for bills
  const billsPieData = reports.map((report, index) => ({
    name: new Date(report.date || report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    value: report.total_bills || 0,
    color: `hsl(${(index * 360) / reports.length}, 70%, 60%)`,
  }));

  const COLORS = ['#3b82f6', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="px-6 pb-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            {t('reports.title')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('reports.subtitle')}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || reports.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Download className="w-5 h-5" />
          {exporting ? 'Exporting...' : t('reports.exportReport')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-500/10 dark:to-blue-500/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                <ArrowUpRight className="w-4 h-4" />
                +12.5%
              </span>
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{t('reports.totalRevenue')}</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              ₹{totals.totalSales.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-400/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900/30 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-slate-600" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                <ArrowUpRight className="w-4 h-4" />
                +8.2%
              </span>
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{t('reports.totalBills')}</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              {totals.totalBills}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-500/10 dark:to-blue-500/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                <ArrowUpRight className="w-4 h-4" />
                +15.3%
              </span>
            </div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{t('reports.amountReceived')}</p>
            <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
              ₹{totals.totalReceived.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{t('reports.filterReports')}</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              {t('reports.reportType')}
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="daily">{t('reports.dailyReport')}</option>
              <option value="singleDay">Single Day Report</option>
              <option value="monthly">{t('reports.monthlyReport')}</option>
              <option value="custom">{t('reports.customRange')}</option>
            </select>
          </div>

          {filterType === 'singleDay' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {filterType === 'custom' && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  {t('reports.startDate')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  {t('reports.endDate')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {reports && reports.length > 0 ? (
        <>
          <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                {t('reports.detailedReports')}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 dark:bg-secondary-950 border-b border-secondary-200 dark:border-secondary-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">{t('reports.date')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">{t('reports.totalSales')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">{t('reports.totalBills')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">{t('reports.receivedAmount')}</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">{t('reports.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((report, index) => (
                    <tr key={index} className="hover:bg-secondary-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-secondary-400" />
                          <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                            {new Date(report.date || report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                          ₹{(report.total_sales || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                          <Receipt className="w-3.5 h-3.5" />
                          {report.total_bills || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-600">
                          ₹{(report.received_amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {t('reports.active')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Graph Visualization - Professional Level */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-secondary-900 dark:to-secondary-950 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-8 shadow-lg">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  Sales Analytics Dashboard
                </h2>
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 ml-13">
                Comprehensive visual analysis of your business performance metrics
              </p>
            </div>

            {/* Two Column Layout for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Pie Chart */}
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-md border border-secondary-100 dark:border-secondary-800">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-1">Revenue Distribution</h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Received vs Due Amount</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent, value }) => {
                        const percentage = (percent * 100).toFixed(0);
                        return `${percentage}%`;
                      }}
                      outerRadius={90}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '8px 12px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500">
                    <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-1 font-medium">Received</p>
                    <p className="text-lg font-bold text-blue-600">₹{totals.totalReceived.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {totals.totalSales > 0 ? ((totals.totalReceived / totals.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-1 font-medium">Due</p>
                    <p className="text-lg font-bold text-amber-600">₹{(totals.totalSales - totals.totalReceived).toLocaleString()}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {totals.totalSales > 0 ? (((totals.totalSales - totals.totalReceived) / totals.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Bills Distribution Pie Chart */}
              <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-md border border-secondary-100 dark:border-secondary-800">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-1">Bills Distribution</h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Daily bill count breakdown</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={billsPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ value }) => `${value}`}
                      outerRadius={90}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {billsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        padding: '8px 12px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-1 font-medium">Total Bills</p>
                  <p className="text-2xl font-bold text-slate-600">{totals.totalBills}</p>
                  <p className="text-xs text-slate-600 mt-1">Across {reports.length} {reports.length === 1 ? 'day' : 'days'}</p>
                </div>
              </div>
            </div>

            {/* Bar Chart for Sales Comparison */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-md border border-secondary-100 dark:border-secondary-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-1">Daily Sales Performance</h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Sales vs Received Amount Comparison</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Total Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Received</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '13px', fontWeight: '500' }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '13px', fontWeight: '500' }}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="url(#colorSales)" 
                    name="Total Sales" 
                    radius={[10, 10, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar 
                    dataKey="received" 
                    fill="url(#colorReceived)" 
                    name="Received Amount" 
                    radius={[10, 10, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800">
          <BarChart3 className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">{t('reports.noReportsAvailable')}</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t('reports.noReportsForPeriod')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
