import { productService } from '../services/productService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';

// Get all products
// controller
export const getProducts = catchAsync(async (req, res) => {
  const includeArchived = req.query.archived === 'true';
  const products = await productService.getAllProducts({ includeArchived });
  successResponse(res, 200, products);
});


// Get single product
export const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  successResponse(res, 200, product);
});

// Create product
export const createProduct = catchAsync(async (req, res) => {
  const { name, category, sku, costPrice, sellingPrice, quantity } = req.body;
  
  const product = await productService.createProduct({
    name,
    category,
    sku,
    costPrice: parseFloat(costPrice),
    sellingPrice: parseFloat(sellingPrice),
    quantity: parseInt(quantity)
  });
  
  successResponse(res, 201, product, 'Product created successfully');
});

// Update product
export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, category, sku, costPrice, sellingPrice, quantity } = req.body;
  
  const product = await productService.updateProduct(id, {
    name,
    category,
    sku,
    costPrice: parseFloat(costPrice),
    sellingPrice: parseFloat(sellingPrice),
    quantity: parseInt(quantity)
  });
  
  successResponse(res, 200, product, 'Product updated successfully');
});

// Delete product
// server/controllers/productController.js
export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.deleteProduct(id);
  successResponse(res, 200, null, result.message || 'Product archived');
});

// Restore (un-archive)
export const restoreProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.restoreProduct(id);
  successResponse(res, 200, null, result.message || 'Product restored');
});

// Hard delete (permanent) — optional, protect via roles
export const hardDeleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.hardDeleteProduct(id);
  successResponse(res, 200, null, result.message || 'Product permanently deleted');
});
