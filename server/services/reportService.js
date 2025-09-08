// server/services/reportService.js
import { Transaction, Product } from '../models/index.js';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getSellingAndCost = (product, transaction = {}) => {
  // prefer product-level price, otherwise pick first variant (common case)
  const selling = product?.sellingPrice ?? product?.variants?.[0]?.sellingPrice;
  const cost = product?.costPrice ?? product?.variants?.[0]?.costPrice;
  const discount = transaction.discount || 0;
  const discountType = transaction.discountType || 'fixed';
  
  let finalSellingPrice = toNum(selling);
  
  // Apply discount
  if (discountType === 'percentage') {
    finalSellingPrice = finalSellingPrice * (1 - toNum(discount) / 100);
  } else {
    finalSellingPrice = finalSellingPrice - toNum(discount);
  }
  
  return { 
    selling: Math.max(0, finalSellingPrice), // Ensure non-negative price
    cost: toNum(cost) 
  };
};

export const reportService = {
  generateProfitLossReport: async (startDate, endDate) => {
    const transactions = await Transaction.findByDateRange(startDate, endDate);
    // FIX: Changed from salesData to salesData (correct variable name)
    const salesData = transactions.filter(t => t.type === 'SALE');

    let totalRevenue = 0;
    let totalCost = 0;

    salesData.forEach(sale => {
      const qty = toNum(sale.quantity);
      const { selling, cost } = getSellingAndCost(sale.product || {}, sale);
      totalRevenue += qty * selling;
      totalCost += qty * cost;
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return {
      startDate,
      endDate,
      totalSales: salesData.length,
      totalRevenue,
      totalCost,
      profit,
      profitMargin: profitMargin.toFixed(2)
    };
  },

  generateInventoryValuation: async () => {
    const products = await Product.findAll();
    let totalValue = 0;

    const valuation = products.map(product => {
      // If product has variants, sum their values
      if (product.variants && product.variants.length) {
        const variantsValuation = product.variants.map(v => {
          const qty = toNum(v.quantity);
          const cost = toNum(v.costPrice);
          return { id: v.id, sku: v.sku, name: product.name, quantity: qty, costPrice: cost, value: qty * cost };
        });
        variantsValuation.forEach(v => (totalValue += v.value));
        // Return flattened product representation with variants aggregated:
        const productValue = variantsValuation.reduce((s, v) => s + v.value, 0);
        return {
          id: product.id,
          name: product.name,
          sku: product.baseSku,
          quantity: product.variants.reduce((s, v) => s + toNum(v.quantity), 0),
          costPrice: null,
          value: productValue,
          variants: variantsValuation
        };
      } else {
        const qty = toNum(product.quantity);
        const cost = toNum(product.costPrice);
        const productValue = qty * cost;
        totalValue += productValue;
        return { id: product.id, name: product.name, sku: product.baseSku, quantity: qty, costPrice: cost, value: productValue };
      }
    });

    return {
      totalValue,
      products: valuation
    };
  },

  generateSalesByProduct: async (startDate, endDate) => {
    const transactions = await Transaction.findByDateRange(startDate, endDate);
    const sales = transactions.filter(t => t.type === 'SALE');
    const summary = {};

    sales.forEach(sale => {
      const product = sale.product || {};
      const name = product.name ?? 'Unknown';
      const qty = toNum(sale.quantity);
      const { selling, cost } = getSellingAndCost(product, sale);

      if (!summary[name]) summary[name] = { name, quantity: 0, revenue: 0, profit: 0 };
      summary[name].quantity += qty;
      summary[name].revenue += qty * selling;
      summary[name].profit += qty * (selling - cost);
    });

    return Object.values(summary);
  },

  generateSalesByMonth: async () => {
    const transactions = await Transaction.findAll();
    const sales = transactions.filter(t => t.type === 'SALE');
    const monthly = {};

    sales.forEach(sale => {
      const date = new Date(sale.date);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const qty = toNum(sale.quantity);
      const { selling, cost } = getSellingAndCost(sale.product || {}, sale);

      if (!monthly[month]) monthly[month] = { name: month, sales: 0, profit: 0 };
      monthly[month].sales += qty * selling;
      monthly[month].profit += qty * (selling - cost);
    });

    return Object.values(monthly).sort((a, b) => new Date(a.name) - new Date(b.name));
  },

  generateInventoryCategories: async () => {
    const products = await Product.findAll();
    const categories = {};

    products.forEach(product => {
      const name = product.category ?? 'Uncategorized';

      if (product.variants && product.variants.length) {
        product.variants.forEach(v => {
          const qty = Number(v.quantity) || 0;
          const cost = Number(v.costPrice) || 0;
          categories[name] = categories[name] || { value: 0, items: 0 };
          categories[name].value += qty * cost;
          categories[name].items += qty;
        });
      } else {
        // fallback if no variants
        const qty = Number(product.quantity) || 0;
        const cost = Number(product.costPrice) || 0;
        categories[name] = categories[name] || { value: 0, items: 0 };
        categories[name].value += qty * cost;
        categories[name].items += qty;
      }
    });

    return Object.entries(categories).map(([name, { value, items }]) => ({ name, value, items }));
  }
};