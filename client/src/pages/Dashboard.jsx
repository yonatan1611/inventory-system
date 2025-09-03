import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    transactions: 0,
    totalProfit: 0,
    inventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch summary stats from your backend (you may need to create this endpoint)
    Promise.all([
      api.get('/products'),
      api.get('/transactions'),
      api.get('/reports/profit-loss'),
      api.get('/reports/inventory-valuation'),
    ]).then(([productsRes, transactionsRes, profitRes, inventoryRes]) => {
      setStats({
        products: productsRes.data.data.length,
        transactions: transactionsRes.data.data.length,
        totalProfit: profitRes.data.data.totalProfit || 0,
        inventoryValue: inventoryRes.data.data.totalValue || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500">Quick overview of your inventory and sales performance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
          <i className="bi bi-box-seam text-4xl text-accent mr-4"></i>
          <div>
            <div className="text-2xl font-bold">{stats.products}</div>
            <div className="text-gray-500">Products</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
          <i className="bi bi-arrow-left-right text-4xl text-blue-500 mr-4"></i>
          <div>
            <div className="text-2xl font-bold">{stats.transactions}</div>
            <div className="text-gray-500">Transactions</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
          <i className="bi bi-currency-dollar text-4xl text-green-500 mr-4"></i>
          <div>
            <div className="text-2xl font-bold">${stats.totalProfit.toFixed(2)}</div>
            <div className="text-gray-500">Total Profit</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
          <i className="bi bi-graph-up text-4xl text-purple-500 mr-4"></i>
          <div>
            <div className="text-2xl font-bold">${stats.inventoryValue.toFixed(2)}</div>
            <div className="text-gray-500">Inventory Value</div>
          </div>
        </div>
      </div>
      {/* You can add charts, recent transactions, or quick links here */}
    </div>
  );
};

export default Dashboard;