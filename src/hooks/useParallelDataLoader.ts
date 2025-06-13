
// ABOUTME: Parallel data loading hook for coordinated data access
// Replaces individual API calls with batch loading for Phase B migration

import { useState, useEffect, useCallback } from 'react';
import { useStandardizedData } from './useStandardizedData';

interface ParallelDataConfig {
  endpoints: string[];
  dependencies?: any[];
  enabled?: boolean;
}

interface ParallelDataResult<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useParallelDataLoader = <T = any>({
  endpoints,
  dependencies = [],
  enabled = true
}: ParallelDataConfig): ParallelDataResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use standardized data access for coordination
  const { data: coordinatedData, loading: coordLoading, error: coordError } = useStandardizedData.usePageData('/parallel-batch');

  const loadData = useCallback(async () => {
    if (!enabled || endpoints.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // If coordinated data is available, use it
      if (coordinatedData) {
        setData(coordinatedData.batchResults || []);
        return;
      }

      // Fallback to parallel loading for backwards compatibility
      const promises = endpoints.map(async (endpoint) => {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        return response.json();
      });

      const results = await Promise.all(promises);
      setData(results);
    } catch (err) {
      console.error('Parallel data loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [endpoints, enabled, coordinatedData]);

  const refetch = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData, ...dependencies]);

  return {
    data,
    loading: loading || coordLoading,
    error: error || coordError,
    refetch
  };
};
