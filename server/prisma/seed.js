// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        name: 'Wireless Headphones',
        category: 'Electronics',
        sku: 'ELEC-001',
        costPrice: 25.00,
        sellingPrice: 49.99,
        quantity: 20,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: {
        name: 'Bluetooth Speaker',
        category: 'Electronics',
        sku: 'ELEC-002',
        costPrice: 35.00,
        sellingPrice: 69.99,
        quantity: 15,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ACC-001' },
      update: {},
      create: {
        name: 'Phone Case',
        category: 'Accessories',
        sku: 'ACC-001',
        costPrice: 5.00,
        sellingPrice: 14.99,
        quantity: 50,
      },
    }),
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });