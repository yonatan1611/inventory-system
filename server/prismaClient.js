// server/prismaClient.js
import 'dotenv/config';                // load .env early (optional if you already load elsewhere)
import { PrismaClient } from '@prisma/client';

// Prevent multiple PrismaClient instances during development (nodemon/hot reload)
const _global = globalThis;
const prisma =
  _global.__prisma__ ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  _global.__prisma__ = prisma;
}

export { prisma };
