import { Product } from '../models/index.js';
import { APIError } from '../utils/helpers.js';

export const productService = {
  getAllProducts: async () => {
    return await Product.findAll();
  },

  getProductById: async (id) => {
    const product = await Product.findById(id);
    if (!product) {
      throw new APIError('Product not found', 404);
    }
    return product;
  },

  createProduct: async (productData) => {
    const { sku } = productData;
    
    // Check if SKU already exists
    const existingProduct = await Product.findBySKU(sku);
    if (existingProduct) {
      throw new APIError('SKU already exists', 400);
    }
    
    return await Product.create(productData);
  },

  updateProduct: async (id, productData) => {
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new APIError('Product not found', 404);
    }
    
    // Check if SKU is being changed to one that already exists
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const skuExists = await Product.findBySKU(productData.sku);
      if (skuExists) {
        throw new APIError('SKU already exists', 400);
      }
    }
    
    return await Product.update(id, productData);
  },

  deleteProduct: async (id) => {
    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw new APIError('Product not found', 404);
    }
    
    await Product.delete(id);
    return { message: 'Product deleted successfully' };
  },

  checkStockAvailability: async (productId, requestedQuantity) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new APIError('Product not found', 404);
    }
    
    if (product.quantity < requestedQuantity) {
      throw new APIError('Insufficient stock', 400);
    }
    
    return product;
  }
};