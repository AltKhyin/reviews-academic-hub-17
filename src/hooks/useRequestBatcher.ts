
// ABOUTME: Request batching system to prevent API request cascades
import { useCallback, useRef, useEffect } from 'react';

interface BatchedRequest {
  key: string;
  resolver: (data: any) => void;
  rejector: (error: any) => void;
}

const BATCH_DELAY = 50; // 50ms batching window
const requestBatches = new Map<string, BatchedRequest[]>();
const batchTimeouts = new Map<string, NodeJS.Timeout>();

export const useRequestBatcher = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const batchRequest = useCallback(async <T>(
    batchKey: string,
    requestKey: string,
    requestFn: (keys: string[]) => Promise<Record<string, T>>,
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      // Get or create batch for this batch key
      if (!requestBatches.has(batchKey)) {
        requestBatches.set(batchKey, []);
      }
      
      const batch = requestBatches.get(batchKey)!;
      
      // Add this request to the batch
      batch.push({
        key: requestKey,
        resolver: resolve,
        rejector: reject
      });

      // Clear existing timeout
      const existingTimeout = batchTimeouts.get(batchKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout to execute batch
      const timeout = setTimeout(async () => {
        if (!mountedRef.current) return;

        const currentBatch = requestBatches.get(batchKey) || [];
        if (currentBatch.length === 0) return;

        // Clear the batch
        requestBatches.delete(batchKey);
        batchTimeouts.delete(batchKey);

        try {
          // Execute the batched request
          const keys = currentBatch.map(req => req.key);
          const results = await requestFn(keys);

          // Resolve individual requests
          currentBatch.forEach(req => {
            if (results[req.key] !== undefined) {
              req.resolver(results[req.key]);
            } else {
              req.rejector(new Error(`No result for key: ${req.key}`));
            }
          });
        } catch (error) {
          // Reject all requests in batch
          currentBatch.forEach(req => {
            req.rejector(error);
          });
        }
      }, BATCH_DELAY);

      batchTimeouts.set(batchKey, timeout);
    });
  }, []);

  const clearBatches = useCallback(() => {
    // Clear all pending batches
    batchTimeouts.forEach(timeout => clearTimeout(timeout));
    requestBatches.clear();
    batchTimeouts.clear();
  }, []);

  return {
    batchRequest,
    clearBatches
  };
};
