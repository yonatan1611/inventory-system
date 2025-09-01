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
  }
};