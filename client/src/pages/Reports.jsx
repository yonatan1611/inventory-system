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
import { Download, Printer, Calendar, Filter, DollarSign, TrendingUp, Package } from 'lucide-react';

const Reports = () => {
  const [salesByProduct, setSalesByProduct] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [inventoryByCategory, setInventoryByCategory] = useState([]);
  const [profitByMonth, setProfitByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('total');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [customDateActive, setCustomDateActive] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalItems: 0
  });

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get date range based on selected period
  const getDateRange = (periodType) => {
    const now = new Date();
    let startDate, endDate = formatDate(now);

    if (periodType === 'day') {
      // For today, use the current date
      startDate = formatDate(now);
    } else if (periodType === 'week') {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - 6); // Last 7 days including today
      startDate = formatDate(firstDay);
    } else if (periodType === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = formatDate(firstDay);
    } else if (periodType === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      startDate = formatDate(firstDay);
    } else {
      return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const params = {};
        
        if (period !== 'total') {
          const { startDate, endDate } = customDateActive ? dateRange : getDateRange(period);
          if (startDate) params.startDate = startDate;
          if (endDate) params.endDate = endDate;
        }

        const [salesProductRes, salesMonthRes, inventoryCatRes, profitLossRes] = await Promise.all([
          api.get('/reports/sales-by-product', { params }),
          api.get('/reports/sales-by-month', { params }),
          api.get('/reports/inventory-categories', { params }),
          api.get('/reports/profit-loss', { params })
        ]);

        const salesProductData = salesProductRes.data?.data ?? [];
        const salesMonthData = salesMonthRes.data?.data ?? [];
        const inventoryCatData = inventoryCatRes.data?.data ?? [];
        const profitLossData = profitLossRes.data?.data ?? {};

        setSalesByProduct(salesProductData);
        setSalesByMonth(salesMonthData);
        setInventoryByCategory(inventoryCatData);
        setProfitByMonth(salesMonthData);
        
        // Calculate summary data
        const totalRevenue = salesProductData.reduce((sum, product) => sum + safeNum(product.revenue), 0);
        const totalProfit = salesProductData.reduce((sum, product) => sum + safeNum(product.profit), 0);
        const totalItems = salesProductData.reduce((sum, product) => sum + safeNum(product.quantity), 0);
        
        setSummaryData({
          totalRevenue,
          totalProfit,
          totalItems
        });
      } catch (err) {
        console.error('Reports fetch error', err);
        setSalesByProduct([]);
        setSalesByMonth([]);
        setInventoryByCategory([]);
        setProfitByMonth([]);
        setSummaryData({
          totalRevenue: 0,
          totalProfit: 0,
          totalItems: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, dateRange, customDateActive]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Export functions
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title with date range info
    let title = 'Analytics Reports';
    let dateInfo = 'All Time';
    
    if (period !== 'total') {
      const { startDate, endDate } = customDateActive ? dateRange : getDateRange(period);
      title += ` (${startDate} to ${endDate})`;
      dateInfo = `${startDate} to ${endDate}`;
    }
    
    doc.text(title, 14, 16);
    
    // Add summary section
    autoTable(doc, {
      head: [['Summary', '']],
      body: [
        ['Period', dateInfo],
        ['Total Revenue', `Birr ${summaryData.totalRevenue.toFixed(2)}`],
        ['Total Profit', `Birr ${summaryData.totalProfit.toFixed(2)}`],
        ['Total Items Sold', summaryData.totalItems]
      ],
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Sales by product table
    autoTable(doc, {
      head: [['Product', 'Quantity Sold', 'Revenue', 'Profit']],
      body: salesByProduct.map(p => [
        p.name,
        p.quantity,
        `Birr ${safeNum(p.revenue).toFixed(2)}`,
        `Birr ${safeNum(p.profit).toFixed(2)}`
      ]),
      startY: doc.lastAutoTable.finalY + 20
    });
    
    // Add a page for inventory data if needed
    if (inventoryByCategory.length > 0) {
      doc.addPage();
      doc.text('Inventory by Category', 14, 16);
      autoTable(doc, {
        head: [['Category', 'Items', 'Total Value']],
        body: inventoryByCategory.map(c => [
          c.name,
          c.items ?? '-',
          `Birr ${safeNum(c.value).toFixed(2)}`
        ]),
        startY: 25
      });
    }
    
    doc.save('report.pdf');
  };

const handleExportExcel = () => {
  const wb = XLSX.utils.book_new();
  
  // Format date for filename
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  // Format period information
  let periodInfo = 'All Time';
  if (period !== 'total') {
    const { startDate, endDate } = customDateActive ? dateRange : getDateRange(period);
    periodInfo = `${startDate} to ${endDate}`;
  }
  
  // Calculate additional metrics
  const totalInventoryValue = inventoryByCategory.reduce((sum, cat) => sum + (cat.value || 0), 0);
  const profitMargin = summaryData.totalRevenue > 0 
    ? (summaryData.totalProfit / summaryData.totalRevenue * 100) 
    : 0;
  
  // 1. Executive Summary Sheet
  const summarySheetData = [
    ['BUSINESS INTELLIGENCE REPORT'],
    ['Generated on', new Date().toLocaleString()],
    ['Report Period', periodInfo],
    [],
    ['KEY PERFORMANCE INDICATORS'],
    ['Total Revenue', `Birr ${summaryData.totalRevenue.toFixed(2)}`],
    ['Total Profit', `Birr ${summaryData.totalProfit.toFixed(2)}`],
    ['Total Items Sold', summaryData.totalItems],
    ['Profit Margin', `${profitMargin.toFixed(2)}%`],
    ['Average Revenue per Item', `Birr ${summaryData.totalItems > 0 ? (summaryData.totalRevenue / summaryData.totalItems).toFixed(2) : '0.00'}`],
    [],
    ['PRODUCT PERFORMANCE SUMMARY'],
    ['Total Products', salesByProduct.length],
    ['Top Product', salesByProduct[0]?.name || 'N/A'],
    ['Top Product Revenue', salesByProduct[0] ? `Birr ${salesByProduct[0].revenue.toFixed(2)}` : 'N/A'],
    ['Top Product Quantity', salesByProduct[0]?.quantity || 'N/A'],
    [],
    ['INVENTORY SUMMARY'],
    ['Total Categories', inventoryByCategory.length],
    ['Largest Category', inventoryByCategory[0]?.name || 'N/A'],
    ['Total Inventory Value', `Birr ${totalInventoryValue.toFixed(2)}`],
    ['Average Value per Category', `Birr ${inventoryByCategory.length > 0 ? (totalInventoryValue / inventoryByCategory.length).toFixed(2) : '0.00'}`]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Executive Summary');
  
  // 2. Sales by Product Sheet
  const salesData = salesByProduct.map(p => ({
    'Product Name': p.name,
    'Quantity Sold': p.quantity,
    'Revenue (Birr)': safeNum(p.revenue),
    'Cost (Birr)': safeNum(p.revenue) - safeNum(p.profit),
    'Profit (Birr)': safeNum(p.profit),
    'Profit Margin (%)': p.revenue > 0 ? (p.profit / p.revenue * 100).toFixed(2) : 0
  }));
  
  const salesWs = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, salesWs, 'Sales by Product');
  
  // 3. Monthly Sales Trend Sheet
  const monthlyData = salesByMonth.map(m => ({
    'Month': m.name,
    'Sales (Birr)': safeNum(m.sales),
    'Profit (Birr)': safeNum(m.profit),
    'Profit Margin (%)': m.sales > 0 ? (m.profit / m.sales * 100).toFixed(2) : 0,
    'Growth Rate (%)': '' // Placeholder for manual analysis
  }));
  
  const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Trends');
  
  // 4. Inventory by Category Sheet
  const inventoryData = inventoryByCategory.map(c => ({
    'Category': c.name,
    'Number of Items': c.items || 0,
    'Total Value (Birr)': safeNum(c.value),
    'Average Value per Item': c.items > 0 ? (c.value / c.items).toFixed(2) : 0,
    '% of Total Inventory': totalInventoryValue > 0 ? ((c.value / totalInventoryValue) * 100).toFixed(2) : 0
  }));
  
  const inventoryWs = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, inventoryWs, 'Inventory by Category');
  
  // 5. Performance Analysis Sheet
  const performanceData = [
    ['PERFORMANCE ANALYSIS'],
    [],
    ['Top 5 Products by Revenue'],
    ...salesByProduct.slice(0, 5).map(p => [p.name, `Birr ${p.revenue.toFixed(2)}`]),
    [],
    ['Top 5 Products by Profit'],
    ...salesByProduct.slice(0, 5).map(p => [p.name, `Birr ${p.profit.toFixed(2)}`]),
    [],
    ['Top 5 Products by Quantity'],
    ...salesByProduct.slice(0, 5).map(p => [p.name, p.quantity]),
    [],
    ['Inventory Distribution by Value'],
    ...inventoryByCategory.map(c => [
      c.name, 
      `Birr ${c.value.toFixed(2)}`,
      `${((c.value / totalInventoryValue) * 100).toFixed(1)}%`
    ]),
    [],
    ['Inventory Distribution by Items'],
    ...inventoryByCategory.map(c => [
      c.name, 
      c.items || 0,
      `${((c.items / inventoryByCategory.reduce((sum, cat) => sum + (cat.items || 0), 0)) * 100).toFixed(1)}%`
    ])
  ];
  
  const performanceWs = XLSX.utils.aoa_to_sheet(performanceData);
  XLSX.utils.book_append_sheet(wb, performanceWs, 'Performance Analysis');
  
  // 6. Raw Data Sheet (for further analysis)
  const rawData = [
    ['RAW DATA'],
    [],
    ['Sales Transactions'],
    ['Date', 'Product', 'Variant', 'Quantity', 'Revenue', 'Profit'],
    // You could add actual transaction data here if available
    [],
    ['Inventory Details'],
    ['Category', 'Product', 'Variant', 'Quantity', 'Cost', 'Value'],
    // You could add actual inventory details here if available
  ];
  
  const rawWs = XLSX.utils.aoa_to_sheet(rawData);
  XLSX.utils.book_append_sheet(wb, rawWs, 'Raw Data');
  
  // Set column widths for better readability
  const setColumnWidths = (ws, widths) => {
    ws['!cols'] = widths;
  };
  
  setColumnWidths(summaryWs, [{wch: 30}, {wch: 25}]);
  setColumnWidths(salesWs, [{wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}]);
  setColumnWidths(monthlyWs, [{wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}]);
  setColumnWidths(inventoryWs, [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 15}]);
  setColumnWidths(performanceWs, [{wch: 30}, {wch: 20}, {wch: 10}]);
  setColumnWidths(rawWs, [{wch: 15}, {wch: 20}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 10}]);
  
  // Save the file with a timestamped name
  XLSX.writeFile(wb, `Business_Intelligence_Report_${dateStr}_${timeStr}.xlsx`);
};
  const handlePrint = () => {
    window.print();
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
    setCustomDateActive(false);
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const applyCustomDate = () => {
    if (dateRange.startDate && dateRange.endDate) {
      setCustomDateActive(true);
      setPeriod('custom');
    }
  };

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

      {/* Period Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={period}
              onChange={handlePeriodChange}
              className="border rounded-lg p-2 text-sm"
            >
              <option value="total">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
            
            {period === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleCustomDateChange}
                  className="border rounded-lg p-2 text-sm"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleCustomDateChange}
                  className="border rounded-lg p-2 text-sm"
                />
                <button
                  onClick={applyCustomDate}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              onClick={handleExportExcel}
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
        
        {/* Display active filter */}
        <div className="mt-4 text-sm text-gray-600">
          {period === 'total' && 'Showing data for all time'}
          {period === 'day' && `Showing data for today (${getDateRange('day').startDate})`}
          {period === 'week' && `Showing data for this week (${getDateRange('week').startDate} to ${getDateRange('week').endDate})`}
          {period === 'month' && `Showing data for this month (${getDateRange('month').startDate} to ${getDateRange('month').endDate})`}
          {period === 'year' && `Showing data for this year (${getDateRange('year').startDate} to ${getDateRange('year').endDate})`}
          {period === 'custom' && customDateActive && `Showing data for custom range (${dateRange.startDate} to ${dateRange.endDate})`}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="rounded-xl bg-blue-100 p-3 mr-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                Birr {summaryData.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="rounded-xl bg-green-100 p-3 mr-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold text-gray-800">
                Birr {summaryData.totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="rounded-xl bg-purple-100 p-3 mr-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items Sold</p>
              <p className="text-2xl font-bold text-gray-800">
                {summaryData.totalItems}
              </p>
            </div>
          </div>
        </div>
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

      {/* Sales Analysis Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales by Product</h2>
              <div className="overflow-x-auto max-h-80">
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
                        <td className="px-6 py-4">{safeNum(product.revenue).toFixed(2)} Birr</td>
                        <td className="px-6 py-4 font-medium text-green-600">{safeNum(product.profit).toFixed(2)} Birr</td>
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
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue (Birr)" />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit (Birr)" />
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
            <div className="overflow-x-auto max-h-80">
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
                      <td className="px-6 py-4 font-medium">{safeNum(category.value).toFixed(2)} Birr</td>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profit Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profitByMonth.reduce((sum, month) => sum + safeNum(month.profit), 0).toFixed(2)} Birr
              </div>
              <div className="text-gray-600">Total Profit</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {salesByMonth.reduce((sum, month) => sum + safeNum(month.sales), 0).toFixed(2)} Birr
              </div>
              <div className="text-gray-600">Total Revenue</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {salesByProduct.reduce((sum, product) => sum + safeNum(product.quantity), 0)}
              </div>
              <div className="text-gray-600">Total Items Sold</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;