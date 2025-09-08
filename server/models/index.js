// models/index.js
import prisma from '../utils/database.js';

// Product model methods
export const Product = {
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

// ProductVariant model methods
export const ProductVariant = {
  findById: (id) => prisma.productVariant.findUnique({
    where: { id: parseInt(id) },
    include: { transactions: true }
  }),
  update: (id, data) => prisma.productVariant.update({
    where: { id: parseInt(id) },
    data,
    include: { transactions: true }
  }),
  create: (data) => prisma.productVariant.create({ data }),
  delete: (id) => prisma.productVariant.delete({ where: { id: parseInt(id) } }),
};

// Transaction model methods
// In models/index.js, update the Transaction model methods
export const Transaction = {
  findAll: () => prisma.transaction.findMany({
    include: { 
      product: { include: { variants: true } },
      variant: true
    },
    orderBy: { date: 'desc' }
  }),
  
  create: (data) => prisma.transaction.create({ 
    data,
    include: { product: true, variant: true }
  }),
  
  findByDateRange: (startDate, endDate) => {
    let dateFilter = {};
    
    if (startDate && endDate) {
      // Convert to Date objects and set time to cover the entire day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      dateFilter = {
        date: {
          gte: start,
          lte: end
        }
      };
    }
    
    return prisma.transaction.findMany({
      where: dateFilter,
      include: { 
        product: { include: { variants: true } },
        variant: true
      },
      orderBy: { date: 'desc' }
    });
  },
  
  // Add these new methods
  findById: (id) => prisma.transaction.findUnique({
    where: { id: parseInt(id) },
    include: { 
      product: { include: { variants: true } },
      variant: true
    }
  }),
  
  delete: (id) => prisma.transaction.delete({
    where: { id: parseInt(id) }
  })
};

// User model methods
export const User = {
  findByUsername: (username) => prisma.user.findUnique({ where: { username } }),
  create: (data) => prisma.user.create({ data }),
  findFirst: () => prisma.user.findFirst(),
};