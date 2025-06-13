
// ABOUTME: Migrated request batcher to use unified RequestDeduplication system
import { useCallback } from 'react';
import { RequestDeduplication } from '@/core/RequestDeduplication';

const requestDeduplication = new RequestDeduplication();

export const useRequestBatcher = () => {
  const batchRequests = useCallback(async <T>(
    requests: Array<{
      key: string;
      fn: () => Promise<T>;
      endpoint: string;
      parameters?: Record<string, any>;
    }>
  ): Promise<T[]> => {
    // Use unified deduplication system
    const promises = requests.map(request => 
      requestDeduplication.deduplicateRequest(
        {
          endpoint: request.endpoint,
          parameters: request.parameters || {},
          hash: request.key
        },
        request.fn
      )
    );

    return Promise.all(promises);
  }, []);

  const getSavingsMetrics = useCallback(() => {
    return {
      savedRequests: requestDeduplication.getSavingsCount(),
      pendingRequests: requestDeduplication.getPendingRequestsCount(),
      cacheSize: requestDeduplication.getCacheSize()
    };
  }, []);

  return {
    batchRequests,
    getSavingsMetrics,
    clearCache: () => requestDeduplication.clearCache()
  };
};
