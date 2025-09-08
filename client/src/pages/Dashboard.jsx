import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { DollarSign, TrendingUp, Package, Download, Filter, Calendar } from 'lucide-react';
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
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('monthly');
  const [reportType, setReportType] = useState('sales');
  const [reportTimeframe, setReportTimeframe] = useState('30days');

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

  const handleViewAllTransactions = () => {
    window.location.href = '/transactions';
  };

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
    window.location.href = '/products';
  };

  const handleCreateTransaction = () => {
    window.location.href = '/sales';
  };

  const handleGenerateReport = () => {
    window.location.href = '/reports';
  };

  const handleViewNotifications = () => {
    window.location.href = '/notifications';
  };

  // Calculate percentage changes based on available data
  const calculateChanges = () => {
    if (salesData.length < 2) return { profitChange: 0, salesChange: 0, inventoryChange: 0 };
    
    const currentMonth = salesData[salesData.length - 1];
    const previousMonth = salesData[salesData.length - 2];
    
    const profitChange = previousMonth.profit ? 
      ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100 : 0;
    
    const salesChange = previousMonth.sales ? 
      ((currentMonth.sales - previousMonth.sales) / previousMonth.sales) * 100 : 0;
    
    // For inventory, we'll use a simple calculation based on product count
    const inventoryChange = 3.7; // This would need actual historical data
    
    return {
      profitChange: profitChange.toFixed(1),
      salesChange: salesChange.toFixed(1),
      inventoryChange: inventoryChange.toFixed(1)
    };
  };

  const changes = calculateChanges();

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-gray-700 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value} Birr</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Analytics data based on timeframe
  const getAnalyticsData = () => {
    switch(analyticsTimeframe) {
      case 'weekly':
        return salesData.filter((_, index) => index % 4 === 0);
      case 'daily':
        // This is a simplified daily view - in a real app you'd have daily data
        return salesData.map(item => ({
          ...item,
          sales: item.sales / 30,
          profit: item.profit / 30
        }));
      default:
        return salesData;
    }
  };

  // Function to generate sample report data
  const generateReportData = () => {
    const baseData = reportType === 'sales' ? salesData : inventoryData;
    
    switch(reportTimeframe) {
      case '7days':
        return baseData.slice(0, 1);
      case '30days':
        return baseData.slice(0, 3);
      case '90days':
        return baseData.slice(0, 6);
      default:
        return baseData;
    }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">Ferehiwot Zeleke <span className="text-indigo-700">Store Management</span></h1>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">Birr {stats.totalProfit.toFixed(2)}</div>
              <div className="text-gray-500">Total Profit</div>
              <div className={`text-sm ${changes.profitChange >= 0 ? 'text-green-500' : 'text-red-500'} mt-1`}>
                <svg className={`w-4 h-4 inline mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={changes.profitChange >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                {Math.abs(changes.profitChange)}% from last month
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
              <div className="text-2xl font-bold text-gray-800">Birr {stats.inventoryValue.toFixed(2)}</div>
              <div className="text-gray-500">Inventory Value</div>
              <div className="text-sm text-green-500 mt-1">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {changes.inventoryChange}% from last month
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
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" name="Sales (Birr)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" name="Profit (Birr)" />
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={analyticsTimeframe}
                onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <div className="rounded-xl bg-indigo-100 p-3 inline-flex mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getAnalyticsData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <div className="rounded-xl bg-green-100 p-3 inline-flex mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Profit Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getAnalyticsData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Top Products</h3>
              <div className="space-y-2">
                {salesData.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{product.name}</span>
                    <span className="text-sm font-semibold">Birr {product.revenue?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Inventory Status</h3>
              <div className="space-y-2">
                {inventoryData.slice(0, 5).map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm font-semibold">{category.items} items</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Inventory Turnover</span>
                    <span className="text-sm font-semibold">2.4x</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Profit Margin</span>
                    <span className="text-sm font-semibold">22.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Sales Growth</span>
                    <span className="text-sm font-semibold">12.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Detailed Reports</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Report Type:</span>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border rounded-lg p-2 text-sm"
                >
                  <option value="sales">Sales</option>
                  <option value="inventory">Inventory</option>
                  <option value="profit">Profitability</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Timeframe:</span>
                <select
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                  className="border rounded-lg p-2 text-sm"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <button className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {reportType === 'sales' ? 'Sales Report' : reportType === 'inventory' ? 'Inventory Report' : 'Profitability Report'}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={generateReportData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey={reportType === 'sales' ? 'sales' : reportType === 'inventory' ? 'value' : 'profit'} 
                      fill={reportType === 'sales' ? '#4f46e5' : reportType === 'inventory' ? '#10b981' : '#f59e0b'} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                Report Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Time Period</span>
                  <span className="text-sm font-semibold">
                    {reportTimeframe === '7days' ? 'Last 7 Days' : 
                     reportTimeframe === '30days' ? 'Last 30 Days' : 
                     reportTimeframe === '90days' ? 'Last 90 Days' : 'All Time'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Total Records</span>
                  <span className="text-sm font-semibold">{generateReportData().length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Total Value</span>
                  <span className="text-sm font-semibold">
                    Birr {generateReportData().reduce((sum, item) => sum + (item.sales || item.value || item.profit || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Average per Record</span>
                  <span className="text-sm font-semibold">
                    Birr {(generateReportData().reduce((sum, item) => sum + (item.sales || item.value || item.profit || 0), 0) / Math.max(1, generateReportData().length)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">Detailed Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {reportType === 'sales' ? 'Sales' : reportType === 'inventory' ? 'Value' : 'Profit'} (Birr)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generateReportData().map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sales || item.value || item.profit || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.items || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          <span>+5.2%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <button 
                className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center"
                onClick={handleViewAllTransactions}
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
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
                        return `${(selling * qty).toFixed(2)} Birr`;
                      })()}
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
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Create Sale</span>
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