import React, { useState } from 'react';
import ProductForm from '../components/products/ProductForm';
import ProductList from '../components/products/ProductList';
import { useProducts } from '../hooks/useProducts';
import ErrorBoundary from '../components/error/ErrorBoundary';

const Products = () => {
  const { products, loading, error, createProduct, updateProduct, deleteProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      } else {
        await createProduct(productData);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={handleCreate}
          className="bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <i className="bi bi-plus-circle mr-2"></i> Add Product
        </button>
      </div>

      <ErrorBoundary>
        <ProductList
          products={Array.isArray(products) ? products : []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </ErrorBoundary>

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default Products;