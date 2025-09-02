import { useState, useEffect } from 'react';
import { productsAPI } from '../services/products';

export function useProducts() {
  const [products, setProducts] = useState([]); // <-- Make sure this is an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll();
      const { data } = response;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (product) => {
    try {
      const response = await productsAPI.create(product);
      const newProduct = response.data;
      setProducts(prev => Array.isArray(prev) ? [...prev, newProduct] : [newProduct]);
      return newProduct;
    } catch (err) {
      throw err;
    }
  };

  const updateProduct = async (id, product) => {
    try {
      const response = await productsAPI.update(id, product);
      setProducts(prev => prev.map(p => p.id === id ? response.data : p));
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};