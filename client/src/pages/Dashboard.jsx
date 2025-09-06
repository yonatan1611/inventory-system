import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import dashboardHero from '../assets/dashboard-hero.png';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    transactions: 0,
    totalProfit: 0,
    inventoryValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/transactions'),
      api.get('/reports/profit-loss'),
      api.get('/reports/inventory-valuation'),
      api.get('/reports/sales-by-month'),
      api.get('/reports/inventory-categories'),
    ]).then(([productsRes, transactionsRes, profitRes, inventoryRes, salesRes, inventoryCatRes]) => {
      setStats({
        products: productsRes.data.data.length,
        transactions: transactionsRes.data.data.length,
        totalProfit: profitRes.data.data.profit || 0,
        inventoryValue: inventoryRes.data.data.totalValue || 0,
      });

      setSalesData(Array.isArray(salesRes.data.data) ? salesRes.data.data : []);
      setInventoryData(Array.isArray(inventoryCatRes.data.data) ? inventoryCatRes.data.data : []);
      setRecentTransactions(Array.isArray(transactionsRes.data.data) ? transactionsRes.data.data.slice(0, 5) : []);
    }).finally(() => {
      setTimeout(() => setLoading(false), 500);
    });
  }, []);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  const handleAddProduct = () => {
    window.location.href = '/products/new';
  };

  const handleCreateTransaction = () => {
    window.location.href = '/transactions/new';
  };

  const handleGenerateReport = () => {
    window.location.href = '/reports';
  };

  const handleViewNotifications = () => {
    window.location.href = '/notifications';
  };

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-gray-700 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">${entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Gradient Background */}
     <div 
        className="relative h-96 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${dashboardHero})`, filter: 'brightness(0.8)' }}
      >
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-12 opacity-10">
          <div className="animate-float h-16 w-16 bg-white rounded-full" style={{ animationDelay: '0s' }}></div>
          <div className="animate-float h-20 w-20 bg-white rounded-full" style={{ animationDelay: '1s' }}></div>
          <div className="animate-float h-12 w-12 bg-white rounded-full" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Ferehiwot Zeleke <span className="text-indigo-700">Store Management</span></h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 text-indigo-700">
            Get real-time insights into your inventory, sales performance, and business growth
          </p>
          <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium w-48 hover:bg-indigo-50 transition-colors shadow-lg">
            Explore Analytics
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="rounded-xl bg-indigo-100 p-3 mr-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.products}</div>
              <div className="text-gray-500">Total Products</div>
              <div className="text-sm text-green-500 mt-1">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                5.2% from last month
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="rounded-xl bg-green-100 p-3 mr-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stats.transactions}</div>
              <div className="text-gray-500">Transactions</div>
              <div className="text-sm text-green-500 mt-1">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                12.3% from last month
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="rounded-xl bg-purple-100 p-3 mr-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 01118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">${stats.totalProfit.toFixed(2)}</div>
              <div className="text-gray-500">Total Profit</div>
              <div className="text-sm text-red-500 mt-1">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                1.2% from last month
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="rounded-xl bg-orange-100 p-3 mr-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">${stats.inventoryValue.toFixed(2)}</div>
              <div className="text-gray-500">Inventory Value</div>
              <div className="text-sm text-green-500 mt-1">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                3.7% from last month
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'analytics', name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'reports', name: 'Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-3 px-4 flex items-center text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md'
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales & Profit Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" name="Sales ($)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Profit ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Advanced Analytics</h2>
            <p className="text-gray-600 mb-6">
              Dive deeper into your business metrics with our advanced analytics tools. 
              Track performance trends, identify opportunities, and make data-driven decisions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <div className="rounded-xl bg-indigo-100 p-3 inline-flex mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Performance Metrics</h3>
                <p className="text-sm text-gray-600">Track key performance indicators in real-time</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <div className="rounded-xl bg-green-100 p-3 inline-flex mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Trend Analysis</h3>
                <p className="text-sm text-gray-600">Identify patterns and trends in your data</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="rounded-xl bg-purple-100 p-3 inline-flex mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Predictive Insights</h3>
                <p className="text-sm text-gray-600">Forecast future performance based on historical data</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Reports</h2>
            <p className="text-gray-600 mb-6">
              Generate comprehensive reports on sales, inventory, and profitability. 
              Export data in multiple formats for further analysis and presentations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Sales Reports
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Daily sales performance</li>
                  <li>• Product category analysis</li>
                  <li>• Regional sales breakdown</li>
                  <li>• Customer purchase history</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2  0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Inventory Reports
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Stock level monitoring</li>
                  <li>• Inventory turnover rates</li>
                  <li>• Reorder recommendations</li>
                  <li>• Warehouse efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              <button className="text-indigo-600 text-sm font-medium">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tx.product?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const selling = Number(tx.product?.sellingPrice ?? tx.product?.variants?.[0]?.sellingPrice ?? 0);
                        const qty = Number(tx.quantity ?? 0);
                        return `$${(selling * qty).toFixed(2)}`;
                      })()}
                    </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleAddProduct}
              >
                <div className="flex items-center">
                  <div className="rounded-xl bg-indigo-100 p-3 mr-4">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span>Add New Product</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleCreateTransaction}
              >
                <div className="flex items-center">
                  <div className="rounded-xl bg-green-100 p-3 mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Create Transaction</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleGenerateReport}
              >
                <div className="flex items-center">
                  <div className="rounded-xl bg-purple-100 p-3 mr-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Generate Report</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={handleViewNotifications}
              >
                <div className="flex items-center">
                  <div className="rounded-xl bg-orange-100 p-3 mr-4">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span>View Notifications</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default Dashboard;