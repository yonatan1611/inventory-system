// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import ProductForm from '../components/products/ProductForm';
import ProductList from '../components/products/ProductList';
import { useProducts } from '../hooks/useProducts';

const Products = () => {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, sellProduct, refetch } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    if (error) {
      setNotification({ type: 'error', message: error });
    }
  }, [error]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setNotification({ type: 'success', message: 'Product updated successfully' });
      } else {
        await createProduct(productData);
        setNotification({ type: 'success', message: 'Product created successfully' });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save product' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setNotification({ type: 'success', message: 'Product deleted successfully' });
      } catch (err) {
        setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to delete product' });
      }
    }
  };

  const handleSell = async (productId, quantity) => {
    try {
      const result = await sellProduct(productId, quantity);
      setNotification({
        type: 'success',
        message: `Product sold! Profit: $${result.profit.toFixed(2)}`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to sell product'
      });
    }
  };

  const handleRetry = () => {
    setNotification({ type: '', message: '' });
    refetch();
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading products...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <i className="bi bi-plus-circle mr-2"></i> Add Product
        </button>
      </div>

      {notification.message && (
        <div className={`mb-4 p-4 rounded-md ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
          {notification.type === 'error' && (
            <button
              onClick={handleRetry}
              className="ml-4 text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load products: {error}
          <button
            onClick={handleRetry}
            className="ml-4 text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSell={handleSell}
        />
      )}

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Products;