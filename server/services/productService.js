// server/services/productService.js
import { prisma } from '../prismaClient.js';
import { APIError } from '../utils/helpers.js';

// Helper function to generate random SKU
const generateSKU = (prefix = 'PROD', length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to ensure SKU is unique
// Helper function to ensure SKU is unique (with transaction support)
const ensureUniqueSKU = async (sku, isVariant = false, tx = prisma) => {
  let exists = false;
  const client = tx || prisma;
  
  if (isVariant) {
    exists = await client.productVariant.findUnique({
      where: { sku }
    });
  } else {
    exists = await client.product.findUnique({
      where: { baseSku: sku }
    });
  }
  
  return exists ? ensureUniqueSKU(generateSKU(), isVariant, tx) : sku;
};

export const productService = {
  getAllProducts: async (options = {}) => {
    const { includeArchived = false } = options;
    
    return await prisma.product.findMany({
      where: includeArchived ? {} : { archived: false },
      include: {
        variants: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getProductById: async (id) => {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        variants: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    return product;
  },

  createProduct: async (productData) => {
  const { name, description, category, variants } = productData;
  
  return await prisma.$transaction(async (tx) => {
    // Generate unique base SKU
    const baseSku = await ensureUniqueSKU(generateSKU(), false, tx);
    
    // Generate variant SKUs
    const variantsWithSKUs = await Promise.all(
      variants.map(async (variant) => {
        const variantSku = await ensureUniqueSKU(
          generateSKU(`${baseSku}-V`), 
          true,
          tx
        );
        
        return {
          ...variant,
          sku: variantSku,
          costPrice: parseFloat(variant.costPrice),
          sellingPrice: parseFloat(variant.sellingPrice),
          quantity: parseInt(variant.quantity)
        };
      })
    );

    return await tx.product.create({
      data: {
        name,
        description,
        category,
        baseSku,
        variants: {
          create: variantsWithSKUs
        }
      },
      include: {
        variants: true
      }
    });
  });
},

  updateProduct: async (id, productData) => {
  const { name, description, category, variants = [] } = productData;
  
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { variants: true }
  });

  if (!existingProduct) {
    throw new APIError('Product not found', 404);
  }

  return await prisma.$transaction(async (tx) => {
    // Update the product
    const updatedProduct = await tx.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category
      }
    });

    // Process variants
    const existingVariantIds = existingProduct.variants.map(v => v.id);
    const updatedVariantIds = [];
    
    for (const variantData of variants) {
      if (variantData.id) {
        // Update existing variant
        await tx.productVariant.update({
          where: { id: parseInt(variantData.id) },
          data: {
            color: variantData.color,
            size: variantData.size,
            costPrice: parseFloat(variantData.costPrice),
            sellingPrice: parseFloat(variantData.sellingPrice),
            quantity: parseInt(variantData.quantity)
          }
        });
        updatedVariantIds.push(parseInt(variantData.id));
      } else {
        // Create new variant
        const sku = await ensureUniqueSKU(
          generateSKU(`${updatedProduct.baseSku}-V`), 
          true,
          tx // Pass transaction instance
        );
        
        await tx.productVariant.create({
          data: {
            productId: parseInt(id),
            sku,
            color: variantData.color,
            size: variantData.size,
            costPrice: parseFloat(variantData.costPrice),
            sellingPrice: parseFloat(variantData.sellingPrice),
            quantity: parseInt(variantData.quantity)
          }
        });
      }
    }
    
    // Delete variants that were removed
    const variantsToDelete = existingVariantIds.filter(id => !updatedVariantIds.includes(id));
    for (const variantId of variantsToDelete) {
      await tx.productVariant.delete({
        where: { id: variantId }
      });
    }

    // Return the updated product with variants
    return await tx.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        variants: true
      }
    });
  });
},

  addProductVariant: async (productId, variantData) => {
    // Get the product to use its base SKU
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    // Generate unique variant SKU based on product's base SKU
    const sku = await ensureUniqueSKU(
      generateSKU(`${product.baseSku}-V`), 
      true
    );

    const { color, size, costPrice, sellingPrice, quantity } = variantData;
    
    // Check if variant with same color/size already exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: parseInt(productId),
        color: color || null,
        size: size || null
      }
    });

    if (existingVariant) {
      throw new APIError('Variant with this color and size already exists', 400);
    }

    return await prisma.productVariant.create({
      data: {
        productId: parseInt(productId),
        sku,
        color,
        size,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        quantity: parseInt(quantity)
      }
    });
  },

  updateProductVariant: async (variantId, variantData) => {
    const { color, size, costPrice, sellingPrice, quantity } = variantData;
    
    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: parseInt(variantId) },
      include: { product: true }
    });

    if (!existingVariant) {
      throw new APIError('Variant not found', 404);
    }

    // Check if another variant with same color/size already exists
    if (color !== existingVariant.color || size !== existingVariant.size) {
      const duplicateVariant = await prisma.productVariant.findFirst({
        where: {
          productId: existingVariant.productId,
          color: color || null,
          size: size || null,
          NOT: { id: parseInt(variantId) }
        }
      });

      if (duplicateVariant) {
        throw new APIError('Another variant with this color and size already exists', 400);
      }
    }

    return await prisma.productVariant.update({
      where: { id: parseInt(variantId) },
      data: {
        color,
        size,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        quantity: parseInt(quantity)
      }
    });
  },

  deleteProductVariant: async (variantId) => {
    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: parseInt(variantId) }
    });

    if (!variant) {
      throw new APIError('Variant not found', 404);
    }

    await prisma.productVariant.delete({
      where: { id: parseInt(variantId) }
    });

    return { message: 'Variant deleted successfully' };
  },

  // SOFT DELETE -> set archived = true
  deleteProduct: async (id) => {
    const productId = Number(id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new APIError('Product not found', 404);

    // If already archived, return a friendly message (or treat idempotently)
    if (product.archived) {
      return { message: 'Product already archived' };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { archived: true },
    });

    return { message: 'Product archived successfully' };
  },

  // Optional: restore (unarchive)
  restoreProduct: async (id) => {
    const productId = Number(id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new APIError('Product not found', 404);
    if (!product.archived) return { message: 'Product is not archived' };

    await prisma.product.update({ where: { id: productId }, data: { archived: false } });
    return { message: 'Product restored' };
  },

  // Optional: hard delete (permanently remove) — use carefully
  hardDeleteProduct: async (id) => {
    const productId = Number(id);
    // delete transactions first or rely on cascading if you set it; here we'll delete tx then product
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
    return { message: 'Product permanently deleted' };
  },

  checkStockAvailability: async (variantId, requestedQuantity) => {
    const variant = await prisma.productVariant.findUnique({ 
      where: { id: Number(variantId) } 
    });
    
    if (!variant) throw new APIError('Variant not found', 404);
    if (variant.quantity < requestedQuantity) throw new APIError('Insufficient stock', 400);
    return variant;
  },

    getProductVariantById: async (variantId) => {
    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(variantId) },
      include: {
        product: true
      }
    });

    if (!variant) {
      throw new APIError('Variant not found', 404);
    }

    return variant;
  },

   getProductVariantById: async (variantId) => {
    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(variantId) },
      include: {
        product: true
      }
    });

    if (!variant) {
      throw new APIError('Variant not found', 404);
    }

    return variant;
  },

  // Add this method for updating variant stock
  updateVariantStock: async (variantId, newQuantity) => {
    return await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { quantity: newQuantity }
    });
  },

  // Add this method for updating variant stock
  updateVariantStock: async (variantId, newQuantity) => {
    return await prisma.productVariant.update({
      where: { id: Number(variantId) },
      data: { quantity: newQuantity }
    });
  }
};