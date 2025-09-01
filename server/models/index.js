import prisma from '../utils/database.js';

// Product model methods
export const Product = {
  findAll: () => prisma.product.findMany({ include: { transactions: true } }),
  findById: (id) => prisma.product.findUnique({ 
    where: { id: parseInt(id) },
    include: { transactions: true }
  }),
  findBySKU: (sku) => prisma.product.findUnique({ where: { sku } }),
  create: (data) => prisma.product.create({ data }),
  update: (id, data) => prisma.product.update({
    where: { id: parseInt(id) },
    data
  }),
  delete: (id) => prisma.product.delete({ where: { id: parseInt(id) } }),
};

// Transaction model methods
export const Transaction = {
  findAll: () => prisma.transaction.findMany({
    include: { product: true },
    orderBy: { date: 'desc' }
  }),
  create: (data) => prisma.transaction.create({ data }),
  findByDateRange: (startDate, endDate) => prisma.transaction.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: { product: true }
  }),
};

// User model methods
export const User = {
  findByUsername: (username) => prisma.user.findUnique({ where: { username } }),
  create: (data) => prisma.user.create({ data }),
  findFirst: () => prisma.user.findFirst(),
};