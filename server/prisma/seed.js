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

  // Create sample products with variants
  await prisma.product.upsert({
    where: { baseSku: 'ELEC-001' },
    update: {},
    create: {
      name: 'Wireless Headphones',
      category: 'Electronics',
      baseSku: 'ELEC-001',
      description: 'High-quality wireless headphones',
      variants: {
        create: {
          sku: 'ELEC-001-BLACK',
          color: 'Black',
          costPrice: 25.00,
          sellingPrice: 49.99,
          quantity: 20,
        },
      },
    },
  });

  await prisma.product.upsert({
    where: { baseSku: 'ELEC-002' },
    update: {},
    create: {
      name: 'Bluetooth Speaker',
      category: 'Electronics',
      baseSku: 'ELEC-002',
      description: 'Portable Bluetooth speaker',
      variants: {
        create: {
          sku: 'ELEC-002-BLUE',
          color: 'Blue',
          costPrice: 35.00,
          sellingPrice: 69.99,
          quantity: 15,
        },
      },
    },
  });

  await prisma.product.upsert({
    where: { baseSku: 'ACC-001' },
    update: {},
    create: {
      name: 'Phone Case',
      category: 'Accessories',
      baseSku: 'ACC-001',
      description: 'Durable phone case',
      variants: {
        create: {
          sku: 'ACC-001-RED',
          color: 'Red',
          costPrice: 5.00,
          sellingPrice: 14.99,
          quantity: 50,
        },
      },
    },
  });

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