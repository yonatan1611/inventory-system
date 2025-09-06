import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { safeNum } from '../utils/numberUtils';

const Reports = () => {
  const [salesByProduct, setSalesByProduct] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [inventoryByCategory, setInventoryByCategory] = useState([]);
  const [profitByMonth, setProfitByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('total'); // 'week' | 'month' | 'year' | 'total'

useEffect(() => {
  const normalizeSalesByProduct = (arr) => (arr || []).map(p => ({
    name: p.name ?? 'Unknown',
    quantity: Number(p.quantity) || 0,
    revenue: safeNum(p.revenue),
    profit: safeNum(p.profit),
    ...p
  }));

  const normalizeSalesByMonth = (arr) => (arr || []).map(m => ({
    name: m.name ?? '',
    sales: safeNum(m.sales),
    profit: safeNum(m.profit),
    ...m
  }));

const normalizeInventoryByCategory = (arr) => (arr || []).map(c => ({
  name: c.name ?? 'Uncategorized',
  value: Number(c.value) || 0,
  items: Number(c.items) || 0,
  ...c
}));

  setLoading(true);
  Promise.all([
    api.get('/reports/sales-by-product'),
    api.get('/reports/sales-by-month'),
    api.get('/reports/inventory-categories')
  ]).then(([salesProductRes, salesMonthRes, inventoryCatRes]) => {
    const salesProductData = salesProductRes.data?.data ?? [];
    const salesMonthData = salesMonthRes.data?.data ?? [];
    const inventoryCatData = inventoryCatRes.data?.data ?? [];

    setSalesByProduct(normalizeSalesByProduct(salesProductData));
    setSalesByMonth(normalizeSalesByMonth(salesMonthData));
    setInventoryByCategory(normalizeInventoryByCategory(inventoryCatData));
    setProfitByMonth(normalizeSalesByMonth(salesMonthData));
  }).catch(err => {
    console.error('Reports fetch error', err);
    setSalesByProduct([]);
    setSalesByMonth([]);
    setInventoryByCategory([]);
    setProfitByMonth([]);
  }).finally(() => {
    setLoading(false);
  });
}, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Analytics Reports', 14, 16);
    autoTable(doc, {
      head: [['Product', 'Quantity Sold', 'Revenue', 'Profit']],
      body: salesByProduct.map(p => [
        p.name,
        p.quantity,
        Number(p.revenue ?? 0).toFixed(2),
        Number(p.profit ?? 0).toFixed(2)
      ])
    });
    doc.save('report.pdf');
  };

  // Excel Export
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(salesByProduct);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SalesByProduct');
    XLSX.writeFile(wb, 'report.xlsx');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const handlePeriodChange = (e) => {
  setPeriod(e.target.value);
};

useEffect(() => {
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate = now.toISOString();

    if (period === 'week') {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - 7);
      startDate = firstDay.toISOString();
    } else if (period === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = firstDay.toISOString();
    } else if (period === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      startDate = firstDay.toISOString();
    } else {
      startDate = null; // total — don’t filter
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  setLoading(true);
  Promise.all([
    api.get('/reports/sales-by-product', { params: { startDate, endDate } }),
    api.get('/reports/sales-by-month', { params: { startDate, endDate } }),
    api.get('/reports/inventory-categories', { params: { startDate, endDate } })
  ])
    .then(([salesProductRes, salesMonthRes, inventoryCatRes]) => {
      const salesProductData = salesProductRes.data?.data ?? [];
      const salesMonthData = salesMonthRes.data?.data ?? [];
      const inventoryCatData = inventoryCatRes.data?.data ?? [];

      setSalesByProduct(salesProductData);
      setSalesByMonth(salesMonthData);
      setInventoryByCategory(inventoryCatData);
      setProfitByMonth(salesMonthData);
    })
    .catch(err => {
      console.error('Reports fetch error', err);
      setSalesByProduct([]);
      setSalesByMonth([]);
      setInventoryByCategory([]);
      setProfitByMonth([]);
    })
    .finally(() => {
      setLoading(false);
    });
}, [period]); // add period as dependency

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading reports...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Reports</h1>
        <p className="text-gray-600">Comprehensive insights into your business performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
        <nav className="flex space-x-8">
          {[
            { id: 'sales', name: 'Sales Analysis', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'inventory', name: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'profit', name: 'Profitability', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-3 px-4 flex items-center text-sm font-medium rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-white bg-indigo-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-end mb-6">
  <label className="mr-2 text-sm font-medium text-gray-600">View:</label>
  <select
    value={period}
    onChange={handlePeriodChange}
    className="border rounded-lg p-2 text-sm"
  >
    <option value="total">Total</option>
    <option value="week">This Week</option>
    <option value="month">This Month</option>
    <option value="year">This Year</option>
  </select>
</div>

      {/* Sales Analysis Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Sales Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" /> {/* expects 'name' for month */}
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales by Product</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesByProduct.map((product, idx) => (
                      <tr key={product.name} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full bg-blue-100 text-blue-800">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">${Number(product.revenue ?? 0).toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium text-green-600">${Number(product.profit ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Performing Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByProduct.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryByCategory.map((category, idx) => (
                    <tr key={category.name} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4">{category.items ?? '-'}</td>
                      <td className="px-6 py-4 font-medium">${category.value?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profitability Tab */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Profit Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" /> {/* expects 'name' for month */}
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${profitByMonth.reduce((sum, month) => sum + (month.profit || 0), 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Total Profit</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${salesByMonth.reduce((sum, month) => sum + (month.sales || 0), 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Total Revenue</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {salesByProduct.reduce((sum, product) => sum + (product.quantity || 0), 0)}
              </div>
              <div className="text-gray-600">Total Items Sold</div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Reports</h2>
        <div className="flex flex-wrap gap-4">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={handleExportPDF}
          >
            Export as PDF
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={handleExportExcel}
          >
            Export as Excel
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={handlePrint}
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;