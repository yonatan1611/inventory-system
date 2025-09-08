// controllers/productController.js
import { productService } from '../services/productService.js';
import { activityService } from '../services/activityService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';

// Get all products
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

// Create product with variants
export const createProduct = catchAsync(async (req, res) => {
  const { name, description, category, variants } = req.body;
  
  const product = await productService.createProduct({
    name,
    description,
    category,
    variants: variants || []
  });
  
  await activityService.createActivity(
    'CREATE_PRODUCT',
    `Created product: ${product.name} with ${product.variants.length} variants. Base SKU: ${product.baseSku}`,
    req.user.userId,
    product.id
  );
  
  successResponse(res, 201, product, 'Product created successfully');
});



// Update product
// Update product with variants
export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, category, variants } = req.body;
  
  const product = await productService.updateProduct(id, {
    name,
    description,
    category,
    variants: variants || []
  });

  await activityService.createActivity(
    'UPDATE_PRODUCT', // Changed from CREATE_PRODUCT to UPDATE_PRODUCT
    `Updated product: ${product.name} with ${product.variants.length} variants. Base SKU: ${product.baseSku}`,
    req.user.userId,
    product.id
  );
  
  successResponse(res, 200, product, 'Product updated successfully');
});

// Add variant to product
export const addVariant = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { color, size, costPrice, sellingPrice, quantity } = req.body;
  
  const variant = await productService.addProductVariant(productId, {
    color,
    size,
    costPrice,
    sellingPrice,
    quantity
  });
  
  await activityService.createActivity(
  'ADD_VARIANT',
  `Added variant to product. Variant SKU: ${variant.sku}`,
  req.user.userId,
  parseInt(productId)
);
  
  successResponse(res, 201, variant, 'Variant added successfully');
});

// Update variant
// In your productController.js, add this function:
// In productController.js
export const updateVariant = catchAsync(async (req, res) => {
  const { variantId } = req.params;
  const variantData = req.body;
  
  // Check if variant exists
  const variant = await prisma.productVariant.findUnique({
    where: { id: parseInt(variantId) }
  });

  if (!variant) {
    throw new APIError('Variant not found', 404);
  }

  // Update the variant
  const updatedVariant = await prisma.productVariant.update({
    where: { id: parseInt(variantId) },
    data: variantData
  });

  // Log activity
  await activityService.createActivity(
    'UPDATE_VARIANT',
    `Updated variant: ${updatedVariant.sku}`,
    req.user.userId,
    variant.productId
  );

  successResponse(res, 200, updatedVariant, 'Variant updated successfully');
});

// Delete variant
export const deleteVariant = catchAsync(async (req, res) => {
  const { variantId } = req.params;
  
  const variant = await productService.getProductVariantById(variantId);
  const result = await productService.deleteProductVariant(variantId);
  
  await activityService.createActivity(
    'DELETE_VARIANT',
    `Deleted variant: ${variant.sku}`,
    req.user.userId,
    variant.productId
  );
  
  successResponse(res, 200, null, result.message || 'Variant deleted successfully');
});

// Delete product
export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Get product details before deleting
  const product = await productService.getProductById(id);
  
  const result = await productService.deleteProduct(id);
  
  // Log activity with product details
  await activityService.createActivity(
    'DELETE_PRODUCT',
    `Deleted product: ${product.name} (Base SKU: ${product.baseSku})`,
    req.user.userId,
    parseInt(id)
  );
  
  successResponse(res, 200, null, result.message || 'Product archived');
});

// Restore (un-archive)
export const restoreProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.restoreProduct(id);
  successResponse(res, 200, null, result.message || 'Product restored');
});

// Hard delete (permanent)
export const hardDeleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.hardDeleteProduct(id);
  successResponse(res, 200, null, result.message || 'Product permanently deleted');
});

// Add to productController.js
export const updateVariantQuantity = catchAsync(async (req, res) => {
  const { variantId } = req.params;
  const { quantity } = req.body;
  
  // Check if variant exists
  const variant = await prisma.productVariant.findUnique({
    where: { id: parseInt(variantId) }
  });

  if (!variant) {
    throw new APIError('Variant not found', 404);
  }

  // Update variant quantity
  const updatedVariant = await prisma.productVariant.update({
    where: { id: parseInt(variantId) },
    data: { quantity: parseInt(quantity) }
  });

  // Log activity
  await activityService.createActivity(
    'UPDATE_VARIANT',
    `Updated variant quantity: ${variant.sku} to ${quantity}`,
    req.user.userId,
    variant.productId
  );

  successResponse(res, 200, updatedVariant, 'Variant quantity updated successfully');
});