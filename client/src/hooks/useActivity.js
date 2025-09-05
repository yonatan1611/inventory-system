// src/hooks/useActivities.js
import { useState, useEffect } from 'react';
import { activityAPI } from '../services/activity';

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
  });

  const fetchActivities = async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityAPI.getAll(page, limit);
      const data = response?.data?.data;
      
      if (data) {
        setActivities(data.activities || []);
        setPagination({
          page: data.currentPage,
          limit,
          totalPages: data.totalPages,
          total: data.total,
        });
      }
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch activities';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    pagination,
    fetchActivities,
  };
}