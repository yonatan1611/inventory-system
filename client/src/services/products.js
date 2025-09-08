// src/services/products.js
import api from './api';

export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  sell: (data) => api.post('/transactions/sell', data),
  // Add these variant-related methods:
  getVariant: (variantId) => api.get(`/variants/${variantId}`),
  updateVariant: (variantId, variantData) => api.put(`/variants/${variantId}`, variantData),
  createVariant: (productId, variantData) => api.post(`/products/${productId}/variants`, variantData),
  deleteVariant: (variantId) => api.delete(`/variants/${variantId}`),
  updateVariantForProduct: (productId, variantId, variantData) => 
  api.put(`/products/${productId}/variants/${variantId}`, variantData),
};