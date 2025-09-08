import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Download, Filter, Search, ArrowDown, ArrowUp, Calendar, Percent, RefreshCw } from 'lucide-react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debug info
  const [debugInfo, setDebugInfo] = useState({
    apiResponse: null,
    filteredCount: 0,
    sortedCount: 0
  });

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/transactions');
      console.log('API Response:', response.data); // Debug log
      
      // Handle different response structures
      let transactionsData = [];
      if (Array.isArray(response.data)) {
        transactionsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        transactionsData = response.data.data;
      } else if (response.data && response.data.transactions) {
        transactionsData = response.data.transactions;
      }
      
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      
      setDebugInfo(prev => ({
        ...prev,
        apiResponse: response.data,
        filteredCount: transactionsData.length
      }));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = transactions;
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(tx => {
        if (typeFilter === 'in') {
          return tx.type === 'PURCHASE' || tx.type === 'REFILL';
        } else if (typeFilter === 'out') {
          return tx.type === 'SALE';
        }
        return true;
      });
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx.product?.name?.toLowerCase().includes(term) || 
        tx.variant?.sku?.toLowerCase().includes(term) ||
        tx.notes?.toLowerCase().includes(term) ||
        tx.id?.toString().includes(term)) ||
        (tx.type && tx.type.toLowerCase().includes(term))
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      result = result.filter(tx => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        
        switch (dateFilter) {
          case 'today':
            return txDate >= today;
          case 'yesterday':
            return txDate >= yesterday && txDate < today;
          case 'week':
            return txDate >= lastWeek;
          case 'month':
            return txDate >= lastMonth;
          default:
            return true;
        }
      });
    }
    
    setFilteredTransactions(result);
    setCurrentPage(1); // Reset to first page when filters change
    
    setDebugInfo(prev => ({
      ...prev,
      filteredCount: result.length
    }));
  }, [transactions, searchTerm, typeFilter, dateFilter]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
    if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fixed price and discount calculation
  const getPriceInfo = (transaction) => {
    const isSale = transaction.type === 'SALE';
    
    // Get the appropriate price based on transaction type
    const basePrice = isSale 
      ? transaction.variant?.sellingPrice || transaction.product?.sellingPrice || 0
      : transaction.variant?.costPrice || transaction.product?.costPrice || 0;
    
    // Apply discount only for sales
    let finalPrice = basePrice;
    let discountAmount = 0;
    
    if (isSale && transaction.discount && transaction.discount > 0) {
      if (transaction.discountType === 'percentage') {
        discountAmount = basePrice * (transaction.discount / 100);
      } else {
        discountAmount = transaction.discount;
      }
      finalPrice = Math.max(0, basePrice - discountAmount);
    }
    
    const total = finalPrice * transaction.quantity;
    
    return {
      basePrice,
      finalPrice,
      discountAmount,
      total,
      hasDiscount: isSale && transaction.discount > 0
    };
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Product', 'Variant', 'Quantity', 'Price', 'Discount', 'Total', 'Date', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...sortedTransactions.map(tx => {
        const { basePrice, finalPrice, discountAmount, total, hasDiscount } = getPriceInfo(tx);
        
        return [
          tx.id,
          tx.type,
          tx.product?.name || tx.productId,
          tx.variant ? `${tx.variant.color || ''} ${tx.variant.size || ''}`.trim() : 'N/A',
          tx.type === 'SALE' ? `-${tx.quantity}` : `+${tx.quantity}`,
          finalPrice.toFixed(2),
          hasDiscount ? `${tx.discount}${tx.discountType === 'percentage' ? '%' : ''}` : '0',
          total.toFixed(2),
          new Date(tx.date).toLocaleString(),
          `"${tx.notes || ''}"`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Transactions</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Transaction History</h1>
            <p className="text-gray-600">Track all inventory movements and sales</p>
          </div>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-2">No transactions found</div>
            <div className="text-sm text-gray-400">
              {transactions.length === 0 
                ? "There are no transactions in the system yet." 
                : "Try adjusting your search or filters"}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        {sortConfig.key === 'type' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product/Variant
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center gap-1">
                        Quantity
                        {sortConfig.key === 'quantity' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date & Time
                        {sortConfig.key === 'date' && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map(tx => {
                    const isStockIn = tx.type === 'PURCHASE' || tx.type === 'REFILL';
                    const { basePrice, finalPrice, discountAmount, total, hasDiscount } = getPriceInfo(tx);
                    
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isStockIn 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isStockIn ? (
                              <>
                                <ArrowDown className="w-3 h-3 mr-1" />
                                {tx.type === 'REFILL' ? 'Refill' : 'Stock In'}
                              </>
                            ) : (
                              <>
                                <ArrowUp className="w-3 h-3 mr-1" />
                                Stock Out
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tx.product?.name || tx.productId}</div>
                          {tx.variant && (
                            <div className="text-sm text-gray-500">
                              {tx.variant.sku}
                              {tx.variant.color && ` • Color: ${tx.variant.color}`}
                              {tx.variant.size && ` • Size: ${tx.variant.size}`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            isStockIn ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isStockIn ? '+' : '-'}{tx.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasDiscount && (
                            <div className="text-xs text-blue-600 flex items-center">
                              
                              Discount: {tx.discount} Birr
                              {tx.discountType === 'percentage' ? '' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tx.date ? new Date(tx.date).toLocaleDateString() : '—'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tx.date ? new Date(tx.date).toLocaleTimeString() : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-green-500 max-w-xs">
                          {tx.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {sortedTransactions.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, sortedTransactions.length)}
                    </span> of{" "}
                    <span className="font-medium">{sortedTransactions.length}</span> results
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show page numbers with ellipsis for many pages
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`w-8 h-8 text-sm border rounded-md ${
                              currentPage === pageNum
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </div>
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;