import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Billing from './Billing';
import { productService } from '../../services/productService';
import { shopService } from '../../services/shopService';

// Mock dependencies
vi.mock('../../services/productService');
vi.mock('../../services/shopService');
vi.mock('../../services/billService');
vi.mock('../../services/customerService');
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockClothesProduct = {
  id: 1,
  product_name: 'Cotton T-Shirt',
  selling_price: 299,
  stock_quantity: 50,
  sub_category: 'men',
  size: 'L',
  brand_name: 'Nike',
};

const mockNonClothesProduct = {
  id: 2,
  product_name: 'Rice Bag',
  selling_price: 1000,
  stock_quantity: 25,
  sub_category: null,
  size: null,
  brand_name: null,
};

describe('Billing - Clothes Details Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shopService.getShopDetails.mockResolvedValue({ 
      category: 'clothes',
      shop_name: 'Test Shop'
    });
  });

  it('should display clothes details (sub_category, size, brand_name) in product card', async () => {
    productService.getProducts.mockResolvedValue([mockClothesProduct]);

    render(
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Verify sub_category is displayed
    expect(screen.getByText('men')).toBeInTheDocument();
    
    // Verify size is displayed
    expect(screen.getByText('Size: L')).toBeInTheDocument();
    
    // Verify brand_name is displayed
    expect(screen.getByText('Nike')).toBeInTheDocument();
  });

  it('should display clothes details in cart when product is added to bill', async () => {
    productService.getProducts.mockResolvedValue([mockClothesProduct]);

    render(
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Add product to bill - get all buttons and click the first one (the actual button, not the spans)
    const addButtons = screen.getAllByText(/billing\.addToBill/);
    const button = addButtons[0].closest('button');
    fireEvent.click(button);

    // Wait for item to appear in cart
    await waitFor(() => {
      // Product name should appear in cart
      const cartItems = screen.getAllByText('Cotton T-Shirt');
      expect(cartItems.length).toBeGreaterThan(1); // One in product list, one in cart
    });

    // Verify clothes details appear in cart
    expect(screen.getByText(/men • Size: L • Nike/)).toBeInTheDocument();
  });

  it('should omit brand_name from display when it is NULL', async () => {
    const productWithoutBrand = {
      ...mockClothesProduct,
      brand_name: null,
    };
    productService.getProducts.mockResolvedValue([productWithoutBrand]);

    render(
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Verify sub_category and size are displayed
    expect(screen.getByText('men')).toBeInTheDocument();
    expect(screen.getByText('Size: L')).toBeInTheDocument();
    
    // Verify brand_name is NOT displayed
    expect(screen.queryByText('Nike')).not.toBeInTheDocument();
  });

  it('should not display clothes details for non-clothes products', async () => {
    productService.getProducts.mockResolvedValue([mockNonClothesProduct]);

    render(
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Rice Bag')).toBeInTheDocument();
    });

    // Verify no clothes details are displayed (avoid matching "women" in other text)
    expect(screen.queryByText(/^men$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^women$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Size:/)).not.toBeInTheDocument();
  });

  it('should include clothes fields when adding product to selectedItems', async () => {
    productService.getProducts.mockResolvedValue([mockClothesProduct]);

    const { container } = render(
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Add product to bill - get all buttons and click the first one
    const addButtons = screen.getAllByText(/billing\.addToBill/);
    const button = addButtons[0].closest('button');
    fireEvent.click(button);

    // Wait for item to appear in cart
    await waitFor(() => {
      const cartItems = screen.getAllByText('Cotton T-Shirt');
      expect(cartItems.length).toBeGreaterThan(1);
    });

    // Verify the cart item contains clothes details
    expect(screen.getByText(/men • Size: L • Nike/)).toBeInTheDocument();
  });

  it('should display clothes details in cart without brand when brand_name is NULL', async () => {
    const productWithoutBrand = {
      ...mockClothesProduct,
      brand_name: null,
    };
    productService.getProducts.mockResolvedValue([productWithoutBrand]);

    render(
      <BrowserRouter>
        <Billing />
      </BrowserRouter>
    );

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Cotton T-Shirt')).toBeInTheDocument();
    });

    // Add product to bill - get all buttons and click the first one
    const addButtons = screen.getAllByText(/billing\.addToBill/);
    const button = addButtons[0].closest('button');
    fireEvent.click(button);

    // Wait for item to appear in cart
    await waitFor(() => {
      const cartItems = screen.getAllByText('Cotton T-Shirt');
      expect(cartItems.length).toBeGreaterThan(1);
    });

    // Verify cart shows sub_category and size but not brand
    expect(screen.getByText(/men • Size: L/)).toBeInTheDocument();
    expect(screen.queryByText(/Nike/)).not.toBeInTheDocument();
  });
});
