// server/services/productService.js
import { prisma } from '../prismaClient.js'; // adjust path to your prisma client
import { APIError } from '../utils/helpers.js';

export const productService = {
  getAllProducts: async ({ includeArchived = false } = {}) => {
    // default: only non-archived
    const where = includeArchived ? {} : { archived: false };
    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // include a transactions count for UI if helpful:
      include: { _count: { select: { transactions: true } } },
    });
  },

  getProductById: async (id) => {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) throw new APIError('Product not found', 404);
    return product;
  },

  createProduct: async (productData) => {
    const existing = await prisma.product.findUnique({ where: { sku: productData.sku } });
    if (existing) throw new APIError('SKU already exists', 400);
    return await prisma.product.create({ data: productData });
  },

  updateProduct: async (id, productData) => {
    const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!existing) throw new APIError('Product not found', 404);

    if (productData.sku && productData.sku !== existing.sku) {
      const skuExists = await prisma.product.findUnique({ where: { sku: productData.sku } });
      if (skuExists) throw new APIError('SKU already exists', 400);
    }

    return await prisma.product.update({
      where: { id: Number(id) },
      data: productData,
    });
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
