
// ABOUTME: Hook interface for unified data access replacing scattered hooks
import { useState, useEffect, useCallback } from 'react';
import { DataAccessLayer, DataOperation, DataResponse } from '@/core/Data Access Layer';

export interface UseUnifiedDataAccessOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export function useUnifiedDataAccess<T>(
  operation: DataOperation,
  options: UseUnifiedDataAccessOptions = {}
) {
  const [state, setState] = useState<DataResponse<T>>({
    data: null as T,
    error: null,
    loading: true,
    fromCache: false,
  });

  const dataLayer = DataAccessLayer.getInstance();

  const executeOperation = useCallback(async () => {
    if (!options.enabled ?? true) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await dataLayer.executeOperation<T>(operation);
      setState(result);
    } catch (error) {
      setState({
        data: null as T,
        error: error as Error,
        loading: false,
        fromCache: false,
      });
    }
  }, [operation, options.enabled]);

  const refetch = useCallback(() => {
    return executeOperation();
  }, [executeOperation]);

  useEffect(() => {
    executeOperation();
  }, [executeOperation]);

  // Handle window focus refetch
  useEffect(() => {
    if (!options.refetchOnWindowFocus) return;

    const handleFocus = () => {
      executeOperation();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [executeOperation, options.refetchOnWindowFocus]);

  return {
    ...state,
    refetch,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null,
  };
}
