import prisma from '../utils/database.js';

// Product model methods
export const Product = {
  // include variants so costPrice/sellingPrice/quantity are available
  findAll: () => prisma.product.findMany({ include: { variants: true, transactions: true } }),
  findById: (id) => prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: { variants: true, transactions: true }
  }),
  findBySKU: (baseSku) => prisma.product.findUnique({ where: { baseSku } }),
  create: (data) => prisma.product.create({ data }),
  update: (id, data) => prisma.product.update({
    where: { id: parseInt(id) },
    data
  }),
  delete: (id) => prisma.product.delete({ where: { id: parseInt(id) } }),
};

// In models/index.js, add ProductVariant model methods
// In models/index.js, update the ProductVariant model methods
export const ProductVariant = {
  findById: (id) => prisma.productVariant.findUnique({
    where: { id: parseInt(id) },
    include: { transactions: true } // Include transactions
  }),
  update: (id, data) => prisma.productVariant.update({
    where: { id: parseInt(id) },
    data,
    include: { transactions: true } // Include transactions
  }),
  // Add other methods as needed
};

// Transaction model methods
// In models/index.js, update the Transaction model methods
export const Transaction = {
  findAll: () => prisma.transaction.findMany({
    include: { 
      product: { include: { variants: true } },
      variant: true // Include the variant relation
    },
    orderBy: { date: 'desc' }
  }),
  create: (data) => prisma.transaction.create({ 
    data,
    include: { product: true, variant: true } // Include the variant in the response
  }),
  findByDateRange: (startDate, endDate) => {
    const dateFilter = {};
    if (startDate && !isNaN(new Date(startDate))) dateFilter.gte = new Date(startDate);
    if (endDate && !isNaN(new Date(endDate))) dateFilter.lte = new Date(endDate);

    return prisma.transaction.findMany({
      where: Object.keys(dateFilter).length ? { date: dateFilter } : undefined,
      include: { 
        product: { include: { variants: true } },
        variant: true // Include the variant relation
      }
    });
  },
};

// User model methods
export const User = {
  findByUsername: (username) => prisma.user.findUnique({ where: { username } }),
  create: (data) => prisma.user.create({ data }),
  findFirst: () => prisma.user.findFirst(),
};