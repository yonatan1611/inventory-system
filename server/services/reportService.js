import { Transaction, Product } from '../models/index.js';

export const reportService = {
  generateProfitLossReport: async (startDate, endDate) => {
    const transactions = await Transaction.findByDateRange(startDate, endDate);
    const salesData = transactions.filter(t => t.type === 'SALE');
    
    let totalRevenue = 0;
    let totalCost = 0;
    
    salesData.forEach(sale => {
      totalRevenue += sale.quantity * sale.product.sellingPrice;
      totalCost += sale.quantity * sale.product.costPrice;
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
      const productValue = product.quantity * product.costPrice;
      totalValue += productValue;
      
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        costPrice: product.costPrice,
        value: productValue
      };
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
      const name = sale.product.name;
      if (!summary[name]) summary[name] = { quantity: 0, profit: 0 };
      summary[name].quantity += sale.quantity;
      summary[name].profit += (sale.product.sellingPrice - sale.product.costPrice) * sale.quantity;
    });

    return summary;
  },

  generateSalesByMonth: async () => {
    const transactions = await Transaction.findAll();
    const sales = transactions.filter(t => t.type === 'SALE');
    const monthly = {};

    sales.forEach(sale => {
      const date = new Date(sale.date);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Jan 2025"
      if (!monthly[month]) monthly[month] = { name: month, sales: 0, profit: 0 };
      monthly[month].sales += sale.quantity * sale.product.sellingPrice;
      monthly[month].profit += (sale.product.sellingPrice - sale.product.costPrice) * sale.quantity;
    });

    // Return as array sorted by month
    return Object.values(monthly).sort((a, b) => new Date(a.name) - new Date(b.name));
  },

  generateInventoryCategories: async () => {
    const products = await Product.findAll();
    const categories = {};

    products.forEach(product => {
      if (!categories[product.category]) categories[product.category] = 0;
      categories[product.category] += product.quantity * product.costPrice;
    });

    // Return as array for pie chart
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }
};