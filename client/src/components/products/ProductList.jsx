import React from 'react';
import ProductItem from './ProductItem';

const ProductList = ({ products, onEdit, onDelete, onSell }) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onSell={onSell}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;