import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Reports = () => {
  const [salesByProduct, setSalesByProduct] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/sales-by-product')
      .then(res => setSalesByProduct(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-accent to-blue-500 rounded-lg shadow-lg p-6 mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Sales by Product</h2>
        <i className="bi bi-bar-chart text-3xl text-white"></i>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity Sold</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Profit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(salesByProduct).map(([name, data], idx) => (
              <tr key={name} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 font-medium text-gray-800">{name}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                    {data.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-accent font-bold">
                  ${data.profit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;