import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const ProductItem = ({ product, onEdit, onDelete, onSell }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.quantity || 0), 0) || 0;
  const hasVariants = product.variants?.length > 1;

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {hasVariants && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">Base SKU: {product.baseSku}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            {product.category}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.variants?.length || 0} variants
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {totalStock}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Variants rows */}
      {isExpanded && product.variants?.map((variant, index) => (
        <tr key={variant.id || index} className="bg-gray-50 border-b border-gray-100">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="ml-12">
              <div className="text-sm font-medium text-gray-900">Variant: {variant.sku}</div>
              <div className="text-sm text-gray-500">
                {variant.color && `Color: ${variant.color}`}
                {variant.color && variant.size && ' • '}
                {variant.size && `Size: ${variant.size}`}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${typeof variant.costPrice === 'number' ? variant.costPrice.toFixed(2) : 'N/A'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${typeof variant.sellingPrice === 'number' ? variant.sellingPrice.toFixed(2) : 'N/A'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {variant.quantity}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => onSell(variant.id, 1)}
                disabled={variant.quantity === 0}
                className={`p-1 rounded ${
                  variant.quantity === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                }`}
                title={variant.quantity === 0 ? 'Out of stock' : 'Sell variant'}
              >
                Sell
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ProductItem;