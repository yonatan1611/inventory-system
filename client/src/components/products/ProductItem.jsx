import React, { useState } from 'react';
import { Edit, Trash2, ShoppingCart, MoreVertical, AlertCircle } from 'lucide-react';

const ProductItem = ({ product, onEdit, onDelete, onSell }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [sellQuantity, setSellQuantity] = useState('');

  const isLowStock = product.quantity <= (product.minStockLevel || 5);
  const isOutOfStock = product.quantity === 0;

  const handleSell = () => {
    const qty = parseInt(sellQuantity);
    if (qty && !isNaN(qty) && qty > 0 && qty <= product.quantity) {
      onSell(product.id, qty);
      setShowSellDialog(false);
      setSellQuantity('');
    }
  };

  const profitMargin = ((product.sellingPrice - product.costPrice) / product.costPrice) * 100;

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''
      }`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">{product.sku}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            {product.category}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${typeof product.costPrice === 'number' ? product.costPrice.toFixed(2) : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${typeof product.sellingPrice === 'number' ? product.sellingPrice.toFixed(2) : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <span className={`text-sm font-medium ${
              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {product.quantity}
            </span>
            {isLowStock && (
              <AlertCircle className="ml-1 h-4 w-4 text-yellow-500" />
            )}
          </div>
          {product.minStockLevel > 0 && (
            <div className="text-xs text-gray-500">Min: {product.minStockLevel}</div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {!isNaN(profitMargin) ? `${profitMargin.toFixed(1)}%` : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowSellDialog(true)}
              disabled={isOutOfStock}
              className={`p-1 rounded ${
                isOutOfStock 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
              }`}
              title={isOutOfStock ? 'Out of stock' : 'Sell product'}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  onEdit(product);
                  setShowMenu(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Edit Details
              </button>
              <button
                onClick={() => {
                  setShowSellDialog(true);
                  setShowMenu(false);
                }}
                disabled={isOutOfStock}
                className={`block px-4 py-2 text-sm w-full text-left ${
                  isOutOfStock 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sell Product
              </button>
              <button
                onClick={() => {
                  onDelete(product.id);
                  setShowMenu(false);
                }}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                Delete Product
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Sell Dialog */}
      {showSellDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sell Product</h3>
              <p className="text-sm text-gray-600 mb-2">
                Selling: <span className="font-medium">{product.name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Available stock: <span className="font-medium">{product.quantity}</span>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to sell
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter quantity"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSellDialog(false);
                    setSellQuantity('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSell}
                  disabled={!sellQuantity || parseInt(sellQuantity) <= 0 || parseInt(sellQuantity) > product.quantity}
                  className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductItem;