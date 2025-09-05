// src/pages/Activities.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useActivities } from '../hooks/useActivity';

export default function Activities() {
  const { activities, loading, error, pagination, fetchActivities } = useActivities();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      fetchActivities(newPage, pagination.limit);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CREATE_PRODUCT':
        return <Plus className="w-4 h-4 text-emerald-500" />;
      case 'UPDATE_PRODUCT':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'DELETE_PRODUCT':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'SELL_PRODUCT':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'REFILL_STOCK':
        return <RotateCcw className="w-4 h-4 text-amber-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'CREATE_PRODUCT':
        return 'bg-emerald-50 border-emerald-200';
      case 'UPDATE_PRODUCT':
        return 'bg-blue-50 border-blue-200';
      case 'DELETE_PRODUCT':
        return 'bg-rose-50 border-rose-200';
      case 'SELL_PRODUCT':
        return 'bg-green-50 border-green-200';
      case 'REFILL_STOCK':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Activity Log</h1>
          <p className="text-sm text-slate-500">Track all actions performed in the system</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Activities</option>
              <option value="CREATE_PRODUCT">Product Created</option>
              <option value="UPDATE_PRODUCT">Product Updated</option>
              <option value="DELETE_PRODUCT">Product Deleted</option>
              <option value="SELL_PRODUCT">Product Sold</option>
              <option value="REFILL_STOCK">Stock Refilled</option>
            </select>
            <Filter className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg bg-slate-100 h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded">
          Failed to load activities. <button onClick={() => fetchActivities()} className="underline ml-2">Retry</button>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
          <p className="text-lg font-medium">No activities found</p>
          <p className="text-sm text-slate-500 mt-2">Activities will appear here as you use the system.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="font-medium">{activity.details}</div>
                      <div className="text-sm text-slate-500 whitespace-nowrap">
                        {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {activity.user?.username || 'System'}
                      </div>
                      
                      {activity.product && (
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {activity.product.name} ({activity.product.sku})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {(page - 1) * pagination.limit + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}