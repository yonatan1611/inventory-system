// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/products';

export function useProducts() {
  const [products, setProducts] = useState([]); // always an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getAll();
      const data = response?.data?.data;
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      return productsArray;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch products';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProduct = async (product) => {
    try {
      const response = await productsAPI.create(product);
      // handle both shapes: { data: product } or { data: { data: product } }
      const newProduct = response?.data?.data ?? response?.data ?? null;
      if (newProduct) {
        setProducts(prev => Array.isArray(prev) ? [...prev, newProduct] : [newProduct]);
      } else {
        // fallback: refetch if shape unexpected
        await fetchProducts();
      }
      return newProduct;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Create failed';
      setError(msg);
      throw err;
    }
  };

  const updateProduct = async (id, product) => {
    try {
      const response = await productsAPI.update(id, product);
      const updated = response?.data?.data ?? response?.data ?? null;
      if (updated) {
        setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      } else {
        await fetchProducts();
      }
      return updated;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Update failed';
      setError(msg);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await productsAPI.delete(id);
      // If backend returns deleted id or message, just remove by id locally
      setProducts(prev => prev.filter(p => p.id !== id));
      return response?.data ?? null;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Delete failed';
      setError(msg);
      throw err;
    }
  };

  const sellProduct = async (variantId, quantity = 1, options = {}) => {
  try {
    // Call sell endpoint with variantId instead of productId
    const response = await productsAPI.sell({ variantId, quantity, ...options });
    await fetchProducts();
    return response?.data?.data ?? response?.data ?? response;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Sell failed';
    setError(msg);
    throw err;
  }
};

const updateVariant = async (variantId, variantData) => {
  try {
    const response = await productsAPI.updateVariant(variantId, variantData);
    await fetchProducts();
    return response?.data?.data ?? response?.data ?? response;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Update failed';
    setError(msg);
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
    sellProduct,
    refetch: fetchProducts,
    updateVariant,
  };
}



