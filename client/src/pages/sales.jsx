// src/pages/Sales.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DollarSign, X, Plus, Minus, Trash2, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

export default function Sales() {
  const { products, loading, error, sellProduct, updateProduct, refetch } = useProducts();
  const [query, setQuery] = useState('');
  const [saleItems, setSaleItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [refillModal, setRefillModal] = useState({ isOpen: false, product: null, quantity: '' });

  useEffect(() => {
    if (error) {
      showToast('error', String(error));
    }
  }, [error]);

  const showToast = (type, message, ms = 3500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), ms);
  };

  const addProductToSale = (product) => {
    // Check if product is already in the sale
    const existingItem = saleItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already in sale
      setSaleItems(prev => 
        prev.map(item => 
          item.id === product.id 
            ? { ...item, saleQuantity: item.saleQuantity + 1 } 
            : item
        )
      );
    } else {
      // Add new product to sale with default values
      setSaleItems(prev => [
        ...prev, 
        { 
          ...product, 
          saleQuantity: 1, 
          saleDiscount: 0,
          salePrice: product.sellingPrice
        }
      ]);
    }
    
    showToast('success', `${product.name} added to sale`);
  };

  const updateSaleItem = (id, field, value) => {
    setSaleItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeSaleItem = (id) => {
    setSaleItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateItemTotal = (item) => {
    const quantity = Number(item.saleQuantity) || 0;
    const discount = Number(item.saleDiscount) || 0;
    const price = Number(item.salePrice) || 0;
    
    const discountedPrice = price * (1 - discount / 100);
    return discountedPrice * quantity;
  };

  const calculateGrandTotal = () => {
    return saleItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const processSale = async () => {
    if (saleItems.length === 0) {
      showToast('error', 'Please add products to the sale');
      return;
    }

    try {
      // Process each sale item
      const results = await Promise.all(
        saleItems.map(async (item) => {
          return await sellProduct(
            item.id, 
            Number(item.saleQuantity), 
            { discount: Number(item.saleDiscount) }
          );
        })
      );

      // Calculate total profit
      const totalProfit = results.reduce((sum, result) => {
        return sum + (result?.profit || 0);
      }, 0);

      showToast('success', `Sale completed! Total profit: $${totalProfit.toFixed(2)}`);
      
      // Reset sale items and refetch products
      setSaleItems([]);
      refetch?.();
    } catch (err) {
      console.error(err);
      showToast('error', err?.response?.data?.message || 'Failed to process sale');
    }
  };

  const handleRefill = async () => {
    if (!refillModal.product || !refillModal.quantity) {
      showToast('error', 'Please enter a valid quantity');
      return;
    }

    try {
      const newQuantity = Number(refillModal.product.quantity) + Number(refillModal.quantity);
      await updateProduct(refillModal.product.id, {
        ...refillModal.product,
        quantity: newQuantity
      });
      
      showToast('success', `Added ${refillModal.quantity} units to ${refillModal.product.name}`);
      setRefillModal({ isOpen: false, product: null, quantity: '' });
      refetch?.();
    } catch (err) {
      console.error(err);
      showToast('error', err?.response?.data?.message || 'Failed to refill stock');
    }
  };

  const filteredProducts = products?.filter(p => 
    String(p.name || '').toLowerCase().includes(query.trim().toLowerCase()) ||
    String(p.sku || '').toLowerCase().includes(query.trim().toLowerCase()) ||
    String(p.category || '').toLowerCase().includes(query.trim().toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Sales</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Selection */}
        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add Products to Sale</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-slate-200 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Product List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`p-3 border-b border-slate-100 flex justify-between items-center ${
                    product.quantity === 0 ? 'bg-rose-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-slate-500">
                      SKU: {product.sku || '—'} | Stock: {product.quantity} | ${product.sellingPrice?.toFixed(2)}
                    </div>
                    {product.quantity === 0 && (
                      <div className="text-xs text-rose-600 mt-1">Out of stock</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {product.quantity === 0 ? (
                      <button
                        onClick={() => setRefillModal({ isOpen: true, product, quantity: '' })}
                        className="px-3 py-1 bg-amber-600 text-white rounded flex items-center"
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Refill
                      </button>
                    ) : (
                      <button
                        onClick={() => addProductToSale(product)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-4 text-slate-500">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sale Details */}
        <div>
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Sale Details</h2>
            
            {saleItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Add products to begin a sale
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto mb-4">
                  {saleItems.map(item => (
                    <div key={item.id} className="p-3 border-b border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-slate-500">
                            SKU: {item.sku || '—'} | Stock: {item.quantity}
                          </div>
                        </div>
                        <button
                          onClick={() => removeSaleItem(item.id)}
                          className="text-rose-600 hover:text-rose-800 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Qty</label>
                          <div className="flex">
                            <button
                              onClick={() => updateSaleItem(
                                item.id, 
                                'saleQuantity', 
                                Math.max(1, (Number(item.saleQuantity) || 1) - 1)
                              )}
                              className="px-2 py-1 bg-slate-100 rounded-l"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.quantity}
                              value={item.saleQuantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string temporarily
                                if (value === '' || /^\d*$/.test(value)) {
                                  updateSaleItem(item.id, 'saleQuantity', value);
                                }
                              }}
                              onBlur={(e) => {
                                let value = parseInt(e.target.value) || 1;
                                if (value < 1) value = 1;
                                if (value > item.quantity) value = item.quantity;
                                updateSaleItem(item.id, 'saleQuantity', value);
                              }}
                              className="w-full px-2 py-1 border-y text-center"
                            />
                            <button
                              onClick={() => updateSaleItem(
                                item.id, 
                                'saleQuantity', 
                                Math.min(item.quantity, (Number(item.saleQuantity) || 0) + 1)
                              )}
                              className="px-2 py-1 bg-slate-100 rounded-r"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.salePrice}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow decimal numbers
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                updateSaleItem(item.id, 'salePrice', value);
                              }
                            }}
                            onBlur={(e) => {
                              let value = parseFloat(e.target.value) || 0;
                              if (value < 0) value = 0;
                              updateSaleItem(item.id, 'salePrice', value);
                            }}
                            className="w-full px-2 py-1 border rounded text-right"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Discount %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.saleDiscount}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string temporarily
                              if (value === '' || /^\d*$/.test(value)) {
                                updateSaleItem(item.id, 'saleDiscount', value);
                              }
                            }}
                            onBlur={(e) => {
                              let value = parseInt(e.target.value) || 0;
                              if (value < 0) value = 0;
                              if (value > 100) value = 100;
                              updateSaleItem(item.id, 'saleDiscount', value);
                            }}
                            className="w-full px-2 py-1 border rounded text-right"
                          />
                        </div>
                      </div>
                      
                      <div className="text-right mt-2 font-medium">
                        ${calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Grand Total:</span>
                    <span>${calculateGrandTotal().toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={processSale}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg flex items-center justify-center"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Process Sale
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Refill Modal */}
      <AnimatePresence>
        {refillModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold mb-4">Refill Stock</h2>
              <p className="mb-4">How many units would you like to add to <strong>{refillModal.product?.name}</strong>?</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={refillModal.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*$/.test(value)) {
                      setRefillModal(prev => ({ ...prev, quantity: value }));
                    }
                  }}
                  onBlur={(e) => {
                    let value = parseInt(e.target.value) || 1;
                    if (value < 1) value = 1;
                    setRefillModal(prev => ({ ...prev, quantity: value }));
                  }}
                  className="w-full p-2 border rounded"
                  placeholder="Enter quantity"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRefillModal({ isOpen: false, product: null, quantity: '' })}
                  className="px-4 py-2 border border-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefill}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Add to Stock
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed right-4 top-6 z-50 w-[320px] rounded-lg p-3 shadow-lg ${
              toast.type === 'error' 
                ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="text-sm">{toast.message}</div>
              <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}