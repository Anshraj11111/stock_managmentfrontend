import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiCheck, FiAlertTriangle, FiX, FiImage, FiFileText, FiCamera, FiZap, FiShield, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadFile, confirmImport } from '../../services/importService';
import { processImageForProducts } from '../../services/ocrService';
import PreviewTable from '../../components/import/PreviewTable';

const BulkImport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
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
    // Check if it's an image file
    const imageTypes = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const isImage = imageTypes.includes(fileExt) || selectedFile.type.startsWith('image/');
    
    // Validate file type - Accept Excel, CSV, or Images
    const allowedTypes = ['.xlsx', '.xls', '.csv', ...imageTypes];
    
    if (!allowedTypes.includes(fileExt) && !isImage) {
      toast.error('Invalid file type. Please upload Excel, CSV, or Image file.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    
    // Handle image files with OCR
    if (isImage) {
      setIsProcessingImage(true);
      setOcrProgress(0);
      
      try {
        toast.loading('Processing image with OCR...', { id: 'ocr-processing' });
        
        const result = await processImageForProducts(selectedFile, (progress) => {
          setOcrProgress(progress);
        });
        
        toast.dismiss('ocr-processing');
        
        // Format result to match expected structure
        const formattedResult = {
          success: true,
          message: 'Image processed successfully',
          fileInfo: {
            fileName: selectedFile.name,
            fileType: 'Image (OCR)',
            totalRows: result.products.length,
            isImage: true,
            confidence: result.confidence
          },
          columnMapping: {
            product_name: 0,
            purchase_price: 1,
            selling_price: 2,
            stock_quantity: 3
          },
          detectedHeaders: ['Product Name', 'Purchase Price', 'Selling Price', 'Stock Quantity'],
          summary: {
            total: result.products.length,
            valid: result.products.length,
            errors: 0,
            warnings: 0
          },
          products: result.products.map((p, index) => ({
            rowNumber: index + 1,
            data: p,
            validation: 'ok',
            errors: [],
            warnings: []
          }))
        };
        
        setParseResult(formattedResult);
        setProducts(formattedResult.products);
        
        toast.success(
          `📸 Image processed! Found ${result.products.length} products.\n\n` +
          `💡 Please review and edit the extracted data before importing.`,
          { duration: 6000, style: { maxWidth: '500px' } }
        );
      } catch (error) {
        console.error('OCR error:', error);
        toast.error(
          `❌ Failed to process image\n\n${error.message}\n\n` +
          `💡 Try using a clearer image or Excel/CSV file instead.`,
          { duration: 8000, style: { maxWidth: '500px' } }
        );
        setFile(null);
      } finally {
        setIsProcessingImage(false);
        setOcrProgress(0);
      }
      return;
    }
    
    // Handle Excel/CSV files (existing logic)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Products</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <FiUpload className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Bulk Product Import
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Import multiple products at once from Excel, CSV, or images
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Section */}
        {!parseResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Main Upload Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Upload Area */}
              <div className="p-8 md:p-12">
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  animate={{
                    borderColor: isDragging ? 'rgb(16, 185, 129)' : 'rgb(209, 213, 219)',
                    backgroundColor: isDragging ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                  }}
                  className={`
                    relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[1.02]' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                  `}
                >
                  {/* Upload Icon with Animation */}
                  <motion.div
                    animate={{
                      y: isDragging ? -10 : 0,
                      scale: isDragging ? 1.1 : 1
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="mb-6"
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                      <div className="relative p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg">
                        <FiUpload className="text-5xl text-white" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {isDragging ? 'Drop your file here' : 'Upload Your File'}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
                    Drag and drop your file here, or click to browse
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      <FiFileText className="text-base" />
                      Excel, CSV
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      <FiCamera className="text-base" />
                      Images
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium animate-pulse">
                      <FiZap className="text-base" />
                      OCR Powered
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.jpg,.jpeg,.png,.bmp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isProcessingImage}
                    className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isProcessingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Processing Image... {ocrProgress}%
                        </>
                      ) : isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload className="text-xl" />
                          Select File
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.button>

                  {/* Progress Bar for OCR */}
                  <AnimatePresence>
                    {isProcessingImage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 max-w-md mx-auto"
                      >
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ocrProgress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FiFile className="text-lg" />
                      <span>Max 10MB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCheck className="text-lg text-blue-500" />
                      <span>Auto-detect columns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiShield className="text-lg text-blue-500" />
                      <span>Secure upload</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Feature Cards */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-bl-full"></div>
                    <div className="relative">
                      <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                        <FiCamera className="text-2xl text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                        Image Upload
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Upload photos of product lists - OCR automatically extracts data with high accuracy
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        NEW FEATURE
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-bl-full"></div>
                    <div className="relative">
                      <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                        <FiZap className="text-2xl text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                        Smart Detection
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Automatically detects product names, prices, quantities, and calculates margins
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="group relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-bl-full"></div>
                    <div className="relative">
                      <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                        <FiShield className="text-2xl text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                        Data Validation
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Validates all data and shows errors before importing to ensure data quality
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Section */}
        {parseResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {parseResult.summary.total}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                    <FiFile className="text-3xl text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Valid</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {parseResult.summary.valid}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-800 dark:to-blue-800 rounded-2xl">
                    <FiCheck className="text-3xl text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-800 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Warnings</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {parseResult.summary.warnings}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 rounded-2xl">
                    <FiAlertTriangle className="text-3xl text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-800 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Errors</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {parseResult.summary.errors}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-800 dark:to-pink-800 rounded-2xl">
                    <FiX className="text-3xl text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Duplicate Handling Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiShield className="text-2xl" />
                  Duplicate Product Handling
                </h3>
                <p className="text-blue-50 mt-2">
                  {parseResult.summary.warnings > 0 
                    ? `${parseResult.summary.warnings} product(s) already exist in your inventory. Choose how to handle them:`
                    : 'Choose how to handle products that already exist in your inventory:'}
                </p>
              </div>
              
              <div className="p-6 space-y-3">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start gap-4 cursor-pointer p-5 rounded-xl transition-all border-2 ${
                    duplicateAction === 'skip'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="skip"
                    checked={duplicateAction === 'skip'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">Skip duplicates</span>
                      {duplicateAction === 'skip' && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Don't import products that already exist. Keep existing data unchanged.
                    </p>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start gap-4 cursor-pointer p-5 rounded-xl transition-all border-2 ${
                    duplicateAction === 'update'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="update"
                    checked={duplicateAction === 'update'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">Update stock (add quantity)</span>
                      {duplicateAction === 'update' && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      Add new quantity to existing stock. Also updates purchase and selling prices.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <span className="text-xs font-mono text-blue-700 dark:text-blue-300">
                        Example: Existing 50 + New 20 = 70 total
                      </span>
                    </div>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-start gap-4 cursor-pointer p-5 rounded-xl transition-all border-2 ${
                    duplicateAction === 'replace'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="duplicateAction"
                    value="replace"
                    checked={duplicateAction === 'replace'}
                    onChange={(e) => setDuplicateAction(e.target.value)}
                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">Replace existing</span>
                      {duplicateAction === 'replace' && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      Completely replace existing product data with new data from file.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <span className="text-xs font-mono text-orange-700 dark:text-orange-300">
                        Example: Existing 50 → New 20 (replaces to 20)
                      </span>
                    </div>
                  </div>
                </motion.label>
              </div>
            </motion.div>

            {/* Preview Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiFileText className="text-2xl" />
                  Preview & Edit Products
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review and edit product data before importing
                </p>
              </div>
              <PreviewTable products={products} onProductsChange={setProducts} />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row justify-between gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              >
                <span className="flex items-center justify-center gap-2">
                  <FiX className="text-xl" />
                  Cancel
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: isImporting || parseResult.summary.errors === parseResult.summary.total ? 1 : 1.05 }}
                whileTap={{ scale: isImporting || parseResult.summary.errors === parseResult.summary.total ? 1 : 0.95 }}
                onClick={handleImport}
                disabled={isImporting || parseResult.summary.errors === parseResult.summary.total}
                className="relative px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      <span>Importing Products...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="text-2xl" />
                      <span>Import {parseResult.summary.valid} Products</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;
