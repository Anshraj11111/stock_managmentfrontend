import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiDownload, FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { uploadFile, confirmImport, downloadTemplate } from '../../services/importService';
import PreviewTable from '../../components/import/PreviewTable';

const BulkImport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [products, setProducts] = useState([]);
  const [duplicateAction, setDuplicateAction] = useState('skip');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = async (selectedFile) => {
    // Validate file type - Accept Excel and CSV (PDF disabled for now)
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (fileExt === '.pdf') {
      toast.error(
        'PDF Import Not Available Yet\n\n' +
        'Please convert your PDF to Excel or CSV:\n' +
        '1. Open your PDF file\n' +
        '2. Select and copy the product table\n' +
        '3. Paste into Excel or Google Sheets\n' +
        '4. Save as .xlsx or .csv file\n' +
        '5. Upload the Excel/CSV file here\n\n' +
        'This ensures accurate data import with proper column detection.',
        { duration: 10000, style: { maxWidth: '500px' } }
      );
      return;
    }
    
    if (!allowedTypes.includes(fileExt)) {
      toast.error('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    
    // Auto-upload and parse
    setIsUploading(true);
    try {
      const result = await uploadFile(selectedFile);
      setParseResult(result);
      setProducts(result.products);
      
      // Show appropriate success message
      if (result.fileInfo?.isInvoice) {
        toast.success(
          `📄 Invoice detected! Found ${result.summary.total} products in the quote.\n\n` +
          `💡 Selling prices auto-calculated with 20% margin.`,
          { duration: 6000, style: { maxWidth: '500px' } }
        );
      } else {
        toast.success(`File parsed successfully! Found ${result.summary.total} products.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorData = error.response?.data;
      const errorMsg = errorData?.error || errorData?.message || error.message || 'Failed to parse file';
      
      // Show user-friendly error messages
      if (errorMsg.includes('PDF')) {
        toast.error(
          '❌ PDF files are not supported\n\n' +
          'Please convert your PDF to Excel or CSV format first.',
          { duration: 6000, icon: '📄' }
        );
      } else if (errorData?.missingFields || errorMsg.includes('Could not detect')) {
        // File format issue
        const isInvoice = errorData?.isInvoice;
        
        if (isInvoice) {
          toast.error(
            '❌ This file is not supported\n\n' +
            'Your invoice format could not be processed. The product table is missing required columns.\n\n' +
            'Please use our template format or contact support.',
            { duration: 8000, icon: '📄', style: { maxWidth: '500px' } }
          );
        } else {
          toast.error(
            '❌ This file format is not supported\n\n' +
            'Your file does not have the required columns:\n' +
            '• Product Name\n' +
            '• Purchase Price\n' +
            '• Stock Quantity\n\n' +
            '💡 Download our template to see the correct format.',
            { duration: 10000, icon: '📋', style: { maxWidth: '500px' } }
          );
        }
      } else if (errorMsg.includes('empty')) {
        toast.error(
          '❌ File is empty\n\nPlease upload a file with product data.',
          { duration: 5000, icon: '📄' }
        );
      } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('token')) {
        toast.error(
          '❌ Session expired\n\nPlease login again.',
          { duration: 5000, icon: '🔒' }
        );
      } else {
        // Generic error
        toast.error(
          `❌ Upload failed\n\n${errorMsg}\n\n💡 Try downloading and using our template.`,
          { duration: 6000, style: { maxWidth: '500px' } }
        );
      }
      
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!products || products.length === 0) {
      toast.error('No products to import');
      return;
    }

    // Filter out products with errors
    const validProducts = products.filter(p => p.validation !== 'error');
    
    if (validProducts.length === 0) {
      toast.error('No valid products to import. Please fix errors first.');
      return;
    }

    if (validProducts.length < products.length) {
      const errorCount = products.length - validProducts.length;
      const confirmed = window.confirm(
        `${errorCount} product(s) have errors and will be skipped. Continue with ${validProducts.length} valid products?`
      );
      if (!confirmed) return;
    }

    setIsImporting(true);
    try {
      const result = await confirmImport(validProducts, { duplicateAction });
      
      toast.success(
        `Import completed! Success: ${result.results.success}, Updated: ${result.results.updated}, Failed: ${result.results.failed}`
      );

      // Navigate back to products page after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setProducts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 Bulk Product Import
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Upload Excel or CSV file to import multiple products at once
              </p>
            </div>
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <FiDownload />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Upload Section */}
        {!parseResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-all
                ${isDragging 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }
              `}
            >
              <FiUpload className="mx-auto text-6xl text-gray-400 dark:text-gray-500 mb-4" />
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Drop your Excel or CSV file here
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Supported formats: Excel (.xlsx, .xls), CSV (.csv)
                <br />
                <span className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 block">
                  💡 Have a PDF? Convert it to Excel/CSV first for best results
                </span>
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Select File'}
              </button>

              <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <FiFile />
                  <span>Max 10MB</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <FiCheck />
                  <span>Auto-detect columns</span>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📊 Smart Detection
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Automatically detects product name, prices, and quantities from your file
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✅ Validation
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Validates data and shows errors before importing
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  🔄 Duplicate Handling
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Choose how to handle existing products
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {parseResult && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseResult.summary.total}
                    </p>
                  </div>
                  <FiFile className="text-3xl text-gray-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valid</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {parseResult.summary.valid}
                    </p>
                  </div>
                  <FiCheck className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {parseResult.summary.warnings}
                    </p>
                  </div>
                  <FiAlertTriangle className="text-3xl text-yellow-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {parseResult.summary.errors}
                    </p>
                  </div>
                  <FiX className="text-3xl text-red-500" />
                </div>
              </div>
            </div>

            {/* Duplicate Handling Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Duplicate Product Handling
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {parseResult.summary.warnings > 0 
                  ? `${parseResult.summary.warnings} product(s) already exist in your inventory. Choose how to handle them:`
                  : 'Choose how to handle products that already exist in your inventory:'}
              </p>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="skip"
                    checked={duplicateAction === 'skip'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="mt-1 text-primary-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Skip duplicates</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't import products that already exist. Keep existing data unchanged.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="update"
                    checked={duplicateAction === 'update'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="mt-1 text-primary-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Update stock (add quantity)</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add new quantity to existing stock. Also updates purchase and selling prices.
                      <br />
                      <span className="text-xs text-gray-500">Example: Existing 50 + New 20 = 70 total</span>
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="replace"
                    checked={duplicateAction === 'replace'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="mt-1 text-primary-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Replace existing</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completely replace existing product data with new data from file.
                      <br />
                      <span className="text-xs text-gray-500">Example: Existing 50 → New 20 (replaces to 20)</span>
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Preview & Edit
                </h3>
              </div>
              <PreviewTable products={products} onProductsChange={setProducts} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleImport}
                disabled={isImporting || parseResult.summary.errors === parseResult.summary.total}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <FiCheck />
                    <span>Import Products</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;
