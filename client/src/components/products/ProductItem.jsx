import React from 'react';

const ProductItem = ({ product, onEdit, onDelete }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap">${product.costPrice.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap">${product.sellingPrice.toFixed(2)}</td>
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
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ProductItem;