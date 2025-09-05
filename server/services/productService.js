// server/services/productService.js
import { prisma } from '../prismaClient.js'; // adjust path to your prisma client
import { APIError } from '../utils/helpers.js';

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
    const { name, description, category, baseSku, variants } = productData;
    
    // Check if base SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { baseSku }
    });

    if (existingProduct) {
      throw new APIError('Base SKU already exists', 400);
    }

    return await prisma.product.create({
      data: {
        name,
        description,
        category,
        baseSku,
        variants: {
          create: variants.map(variant => ({
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            costPrice: parseFloat(variant.costPrice),
            sellingPrice: parseFloat(variant.sellingPrice),
            quantity: parseInt(variant.quantity)
          }))
        }
      },
      include: {
        variants: true
      }
    });
  },

  updateProduct: async (id, productData) => {
    const { name, description, category, baseSku } = productData;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      throw new APIError('Product not found', 404);
    }

    // Check if base SKU is being changed to one that already exists
    if (baseSku && baseSku !== existingProduct.baseSku) {
      const skuExists = await prisma.product.findUnique({
        where: { baseSku }
      });

      if (skuExists) {
        throw new APIError('Base SKU already exists', 400);
      }
    }

    return await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        baseSku
      },
      include: {
        variants: true
      }
    });
  },

  addProductVariant: async (productId, variantData) => {
    const { sku, color, size, costPrice, sellingPrice, quantity } = variantData;
    
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

    // Check if SKU already exists
    const skuExists = await prisma.productVariant.findUnique({
      where: { sku }
    });

    if (skuExists) {
      throw new APIError('SKU already exists', 400);
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
    const { sku, color, size, costPrice, sellingPrice, quantity } = variantData;
    
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

    // Check if SKU is being changed to one that already exists
    if (sku && sku !== existingVariant.sku) {
      const skuExists = await prisma.productVariant.findUnique({
        where: { sku },
        select: { id: true }
      });

      if (skuExists) {
        throw new APIError('SKU already exists', 400);
      }
    }

    return await prisma.productVariant.update({
      where: { id: parseInt(variantId) },
      data: {
        sku,
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

  checkStockAvailability: async (productId, requestedQuantity) => {
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) throw new APIError('Product not found', 404);
    if (product.quantity < requestedQuantity) throw new APIError('Insufficient stock', 400);
    return product;
  }
};
