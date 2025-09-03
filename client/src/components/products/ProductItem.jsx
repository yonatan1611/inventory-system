import React from 'react';

const ProductItem = ({ product, onEdit, onDelete, onSell }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {typeof product.costPrice === 'number'
          ? `$${product.costPrice.toFixed(2)}`
          : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {typeof product.sellingPrice === 'number'
          ? `$${product.sellingPrice.toFixed(2)}`
          : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onEdit(product)}
          className="text-blue-600 hover:text-blue-900 mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="text-red-600 hover:text-red-900 mr-2"
        >
          Delete
        </button>
        <button
          onClick={() => {
            const qty = prompt('Enter quantity to sell:', 1);
            if (qty && !isNaN(qty) && qty > 0) {
              onSell(product.id, Number(qty));
            }
          }}
          className="text-green-600 hover:text-green-900"
        >
          Sell
        </button>
      </td>
    </tr>
  );
};

export default ProductItem;