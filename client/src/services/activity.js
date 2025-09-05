// src/services/activityApi.js
import api from './api';

export const activityAPI = {
  getAll: (page = 1, limit = 20) => api.get(`/activity?page=${page}&limit=${limit}`),
  getByProduct: (productId, page = 1, limit = 20) => 
    api.get(`/activity/product/${productId}?page=${page}&limit=${limit}`),
};