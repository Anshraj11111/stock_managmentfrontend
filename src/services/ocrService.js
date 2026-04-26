import Tesseract from 'tesseract.js';

/**
 * Extract text from image using OCR
 */
export const extractTextFromImage = async (imageFile, onProgress) => {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng', // Language: English
      {
        logger: (m) => {
          // Progress callback
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        }
      }
    );

    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Parse product table from extracted text
 */
export const parseProductTable = (text) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Try to detect table structure
  const products = [];
  let headers = [];
  
  // Simple heuristic: Look for lines with numbers (prices/quantities)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if line contains numbers (likely product data)
    const hasNumbers = /\d+/.test(line);
    
    if (hasNumbers) {
      // Try to extract product info
      // Format: Product Name | Price | Quantity
      const parts = line.split(/[\s\t|,]+/);
      
      if (parts.length >= 3) {
        // Extract product name (first part, may be multiple words)
        let productName = '';
        let price = null;
        let quantity = null;
        
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j].trim();
          
          // Check if it's a number
          if (/^\d+\.?\d*$/.test(part)) {
            if (price === null) {
              price = parseFloat(part);
            } else if (quantity === null) {
              quantity = part;
            }
          } else {
            // It's part of product name
            productName += (productName ? ' ' : '') + part;
          }
        }
        
        if (productName && price) {
          products.push({
            product_name: productName,
            purchase_price: price,
            selling_price: price * 1.2, // 20% margin
            stock_quantity: quantity || '1'
          });
        }
      }
    }
  }
  
  return products;
};

/**
 * Process image and extract products
 */
export const processImageForProducts = async (imageFile, onProgress) => {
  // Step 1: Extract text from image
  const ocrResult = await extractTextFromImage(imageFile, onProgress);
  
  if (!ocrResult.success) {
    throw new Error(ocrResult.error || 'Failed to extract text from image');
  }
  
  // Step 2: Parse products from text
  const products = parseProductTable(ocrResult.text);
  
  if (products.length === 0) {
    throw new Error('No products found in image. Please ensure the image contains a clear product list.');
  }
  
  return {
    success: true,
    products,
    rawText: ocrResult.text,
    confidence: ocrResult.confidence
  };
};
