import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from './Products';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../store/AuthContext';

// Mock dependencies
vi.mock('../../services/productService');
vi.mock('../../services/shopService');
vi.mock('../../store/AuthContext');
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockProducts = [
  {
    id: 1,
    product_name: 'Test Product',
    purchase_price: 100,
    selling_price: 150,
    stock_quantity: '50',
    stock_unit: 'pieces',
    low_stock_threshold: 10,
    storage_location: 'A1',
    expiry_date: null,
    date_added: '2024-01-15',
    sub_category: null,
    size: null,
    brand_name: null,
  },
];

describe('Products - Clothes Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { role: 'owner' },
    });
    productService.getProducts.mockResolvedValue(mockProducts);
  });

  it('should show validation error when sub_category is empty for clothes category', async () => {
    // Mock shop category as 'clothes'
    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Products Inventory')).toBeInTheDocument();
    });

    // Open add product modal
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Sub-Category')).toBeInTheDocument();
    });

    // Fill in required fields except sub_category
    const productNameInput = screen.getByPlaceholderText('Product Name');
    const sellingPriceInput = screen.getByPlaceholderText('Selling Price');
    const stockQuantityInput = screen.getByPlaceholderText(/Stock Quantity/);

    fireEvent.change(productNameInput, { target: { value: 'Test Shirt' } });
    fireEvent.change(sellingPriceInput, { target: { value: '500' } });
    fireEvent.change(stockQuantityInput, { target: { value: '10' } });

    // Select a size but leave sub_category empty
    const sizeSelect = screen.getByRole('combobox', { name: /Size/ });
    fireEvent.change(sizeSelect, { target: { value: 'M' } });

    // Try to submit the form
    const submitButton = screen.getByText('Add Product');
    fireEvent.click(submitButton);

    // Check that validation error appears
    await waitFor(() => {
      expect(screen.getByText('Sub-Category is required for clothes products')).toBeInTheDocument();
    });

    // Verify that the product was not added
    expect(productService.addProduct).not.toHaveBeenCalled();
  });

  it('should show validation error when size is empty for clothes category', async () => {
    // Mock shop category as 'clothes'
    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Products Inventory')).toBeInTheDocument();
    });

    // Open add product modal
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Sub-Category')).toBeInTheDocument();
    });

    // Fill in required fields except size
    const productNameInput = screen.getByPlaceholderText('Product Name');
    const sellingPriceInput = screen.getByPlaceholderText('Selling Price');
    const stockQuantityInput = screen.getByPlaceholderText(/Stock Quantity/);

    fireEvent.change(productNameInput, { target: { value: 'Test Shirt' } });
    fireEvent.change(sellingPriceInput, { target: { value: '500' } });
    fireEvent.change(stockQuantityInput, { target: { value: '10' } });

    // Select a sub_category but leave size empty
    const subCategorySelect = screen.getByRole('combobox', { name: /Sub-Category/ });
    fireEvent.change(subCategorySelect, { target: { value: 'men' } });

    // Try to submit the form
    const submitButton = screen.getByText('Add Product');
    fireEvent.click(submitButton);

    // Check that validation error appears
    await waitFor(() => {
      expect(screen.getByText('Size is required for clothes products')).toBeInTheDocument();
    });

    // Verify that the product was not added
    expect(productService.addProduct).not.toHaveBeenCalled();
  });

  it('should allow submission when both sub_category and size are filled for clothes category', async () => {
    // Mock shop category as 'clothes'
    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });
    productService.addProduct.mockResolvedValue({ id: 2 });

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Products Inventory')).toBeInTheDocument();
    });

    // Open add product modal
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Sub-Category')).toBeInTheDocument();
    });

    // Fill in all required fields
    const productNameInput = screen.getByPlaceholderText('Product Name');
    const sellingPriceInput = screen.getByPlaceholderText('Selling Price');
    const stockQuantityInput = screen.getByPlaceholderText(/Stock Quantity/);

    fireEvent.change(productNameInput, { target: { value: 'Test Shirt' } });
    fireEvent.change(sellingPriceInput, { target: { value: '500' } });
    fireEvent.change(stockQuantityInput, { target: { value: '10' } });

    // Select sub_category and size
    const subCategorySelect = screen.getByRole('combobox', { name: /Sub-Category/ });
    fireEvent.change(subCategorySelect, { target: { value: 'men' } });

    const sizeSelect = screen.getByRole('combobox', { name: /Size/ });
    fireEvent.change(sizeSelect, { target: { value: 'M' } });

    // Try to submit the form
    const submitButton = screen.getByText('Add Product');
    fireEvent.click(submitButton);

    // Verify that the product was added
    await waitFor(() => {
      expect(productService.addProduct).toHaveBeenCalled();
    });
  });

  it('should not validate clothes fields for non-clothes categories', async () => {
    // Mock shop category as 'grocery'
    shopService.getShopDetails.mockResolvedValue({ category: 'grocery' });
    productService.addProduct.mockResolvedValue({ id: 3 });

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Products Inventory')).toBeInTheDocument();
    });

    // Open add product modal
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Product Name')).toBeInTheDocument();
    });

    // Verify that clothes-specific fields are not shown
    expect(screen.queryByText('Sub-Category')).not.toBeInTheDocument();
    expect(screen.queryByText('Size')).not.toBeInTheDocument();

    // Fill in only standard required fields
    const productNameInput = screen.getByPlaceholderText('Product Name');
    const sellingPriceInput = screen.getByPlaceholderText('Selling Price');
    const stockQuantityInput = screen.getByPlaceholderText(/Stock Quantity/);

    fireEvent.change(productNameInput, { target: { value: 'Test Rice' } });
    fireEvent.change(sellingPriceInput, { target: { value: '100' } });
    fireEvent.change(stockQuantityInput, { target: { value: '50' } });

    // Try to submit the form
    const submitButton = screen.getByText('Add Product');
    fireEvent.click(submitButton);

    // Verify that the product was added without clothes validation
    await waitFor(() => {
      expect(productService.addProduct).toHaveBeenCalled();
    });
  });
});

describe('Products - Conditional Column Rendering (Task 8.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { role: 'owner' },
    });
  });

  it('should show clothes-specific columns when shopCategory is "clothes"', async () => {
    const clothesProducts = [
      {
        id: 1,
        product_name: 'Cotton T-Shirt',
        purchase_price: 150,
        selling_price: 299,
        stock_quantity: '50',
        stock_unit: 'pieces',
        low_stock_threshold: 10,
        storage_location: 'Rack A-3',
        expiry_date: null,
        date_added: '2024-01-15',
        sub_category: 'men',
        size: 'L',
        brand_name: 'Nike',
      },
    ];

    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });
    productService.getProducts.mockResolvedValue(clothesProducts);

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Verify clothes-specific columns are shown using translation keys
    expect(screen.getByText('products.subCategory')).toBeInTheDocument();
    expect(screen.getByText('products.size')).toBeInTheDocument();
    expect(screen.getByText('products.brandName')).toBeInTheDocument();
    
    // Verify Date Added column appears
    const dateAddedHeaders = screen.getAllByText('Date Added');
    expect(dateAddedHeaders.length).toBeGreaterThan(0);

    // Verify product data is displayed
    expect(screen.getByText('products.men')).toBeInTheDocument(); // Translated sub_category
    expect(screen.getByText('L')).toBeInTheDocument(); // Size
    expect(screen.getByText('Nike')).toBeInTheDocument(); // Brand name
  });

  it('should hide clothes-specific columns when shopCategory is not "clothes"', async () => {
    const groceryProducts = [
      {
        id: 1,
        product_name: 'Rice Bag',
        purchase_price: 800,
        selling_price: 1000,
        stock_quantity: '25',
        stock_unit: 'kg',
        low_stock_threshold: 5,
        storage_location: 'Godown 2',
        expiry_date: '2025-12-31',
        date_added: '2024-01-10',
        sub_category: null,
        size: null,
        brand_name: null,
      },
    ];

    shopService.getShopDetails.mockResolvedValue({ category: 'grocery' });
    productService.getProducts.mockResolvedValue(groceryProducts);

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Rice Bag')).toBeInTheDocument();
    });

    // Verify clothes-specific columns are NOT shown
    expect(screen.queryByText('products.subCategory')).not.toBeInTheDocument();
    expect(screen.queryByText('products.size')).not.toBeInTheDocument();
    expect(screen.queryByText('products.brandName')).not.toBeInTheDocument();

    // Verify standard columns are still shown
    expect(screen.getByText('Storage Location')).toBeInTheDocument();
    expect(screen.getByText('Date Added')).toBeInTheDocument();
    expect(screen.getByText('Expiry Date')).toBeInTheDocument();
  });

  it('should display "-" for NULL brand_name values', async () => {
    const clothesProducts = [
      {
        id: 1,
        product_name: 'Generic Shirt',
        purchase_price: 100,
        selling_price: 200,
        stock_quantity: '30',
        stock_unit: 'pieces',
        low_stock_threshold: 10,
        storage_location: 'Rack B-1',
        expiry_date: null,
        date_added: '2024-01-20',
        sub_category: 'women',
        size: 'M',
        brand_name: null, // NULL brand name
      },
    ];

    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });
    productService.getProducts.mockResolvedValue(clothesProducts);

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Generic Shirt')).toBeInTheDocument();
    });

    // Find the table row for the product
    const productRow = screen.getByText('Generic Shirt').closest('tr');
    
    // Verify "-" is displayed for NULL brand_name
    const cells = productRow.querySelectorAll('td');
    const brandNameCell = Array.from(cells).find(cell => 
      cell.textContent === '-' && 
      cell.previousElementSibling?.textContent === 'M' // Size column before brand
    );
    expect(brandNameCell).toBeInTheDocument();
  });

  it('should format date_added as DD/MM/YYYY', async () => {
    const clothesProducts = [
      {
        id: 1,
        product_name: 'Test Product',
        purchase_price: 100,
        selling_price: 200,
        stock_quantity: '10',
        stock_unit: 'pieces',
        low_stock_threshold: 5,
        storage_location: 'A1',
        expiry_date: null,
        date_added: '2024-03-15', // ISO format in database
        sub_category: 'men',
        size: 'L',
        brand_name: 'TestBrand',
      },
    ];

    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });
    productService.getProducts.mockResolvedValue(clothesProducts);

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Verify date is formatted as DD/MM/YYYY (15/03/2024)
    expect(screen.getByText('15/03/2024')).toBeInTheDocument();
  });

  it('should display all clothes columns in correct order', async () => {
    const clothesProducts = [
      {
        id: 1,
        product_name: 'Test Shirt',
        purchase_price: 150,
        selling_price: 300,
        stock_quantity: '20',
        stock_unit: 'pieces',
        low_stock_threshold: 5,
        storage_location: 'Rack A-1',
        expiry_date: null,
        date_added: '2024-01-15',
        sub_category: 'child',
        size: 'S',
        brand_name: 'KidsBrand',
      },
    ];

    shopService.getShopDetails.mockResolvedValue({ category: 'clothes' });
    productService.getProducts.mockResolvedValue(clothesProducts);

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Shirt')).toBeInTheDocument();
    });

    // Get all table headers
    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    // Verify clothes columns appear in the correct order using translation keys
    // Expected order: Product Name, [Purchase Price (owner only)], Selling Price, Stock, 
    // Sub-Category, Size, Brand Name, Date Added, Storage Location, Expiry Date, Status, Actions
    expect(headerTexts).toContain('products.subCategory');
    expect(headerTexts).toContain('products.size');
    expect(headerTexts).toContain('products.brandName');
    expect(headerTexts).toContain('Date Added');

    // Verify the order: Sub-Category should come before Size
    const subCategoryIndex = headerTexts.indexOf('products.subCategory');
    const sizeIndex = headerTexts.indexOf('products.size');
    const brandNameIndex = headerTexts.indexOf('products.brandName');
    const dateAddedIndex = headerTexts.indexOf('Date Added');

    expect(subCategoryIndex).toBeLessThan(sizeIndex);
    expect(sizeIndex).toBeLessThan(brandNameIndex);
    expect(brandNameIndex).toBeLessThan(dateAddedIndex);
  });
});
