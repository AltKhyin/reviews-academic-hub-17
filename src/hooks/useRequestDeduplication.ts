// ABOUTME: Enhanced request deduplication to prevent API cascades at component level
import { useCallback, useRef } from 'react';
import { useAPIRateLimit } from './useAPIRateLimit';

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  fingerprint: string;
}

// Global request cache to prevent duplicate requests across components
const globalRequestCache = new Map<string, PendingRequest<any>>();
const requestTimingMap = new Map<string, number[]>();

export const useRequestDeduplication = () => {
  const { checkRateLimit, logRequest } = useAPIRateLimit();
  const componentId = useRef(`comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Generate request fingerprint for deduplication
  const generateFingerprint = useCallback((endpoint: string, params: any): string => {
    const paramString = typeof params === 'object' ? JSON.stringify(params) : String(params);
    return `${endpoint}:${paramString}`;
  }, []);

  // Smart deduplication with timing analysis
  const deduplicateRequest = useCallback(<T>(
    endpoint: string,
    params: any,
    requestFn: () => Promise<T>,
    options: {
      maxAge?: number;
      cascadeThreshold?: number;
      componentLevel?: boolean;
    } = {}
  ): Promise<T> => {
    const { maxAge = 5000, cascadeThreshold = 3, componentLevel = true } = options;
    const fingerprint = generateFingerprint(endpoint, params);
    const now = Date.now();

    // Track request timing for cascade detection
    if (!requestTimingMap.has(fingerprint)) {
      requestTimingMap.set(fingerprint, []);
    }
    const timings = requestTimingMap.get(fingerprint)!;
    timings.push(now);

    // Clean old timings (keep last 10 seconds)
    const recentTimings = timings.filter(time => now - time < 10000);
    requestTimingMap.set(fingerprint, recentTimings);

    // Cascade detection
    const rapidRequests = recentTimings.filter(time => now - time < 1000); // Last 1 second
    if (rapidRequests.length >= cascadeThreshold) {
      console.warn(`🚨 Request cascade detected: ${fingerprint} (${rapidRequests.length} requests in 1s)`);
      
      // Rate limit check with cascade detection
      if (!checkRateLimit({
        endpoint,
        maxRequests: cascadeThreshold,
        windowMs: 1000,
        cascadeThreshold: cascadeThreshold
      })) {
        return Promise.reject(new Error('Request cascade prevented by rate limiting'));
      }
    }

    // Check for existing pending request
    const existingRequest = globalRequestCache.get(fingerprint);
    if (existingRequest && (now - existingRequest.timestamp) < maxAge) {
      console.log(`♻️ Request deduplicated: ${fingerprint} (age: ${now - existingRequest.timestamp}ms)`);
      return existingRequest.promise;
    }

    // Create new request with enhanced logging
    const requestId = `${componentId.current}_${now}_${Math.random().toString(36).substr(2, 5)}`;
    console.log(`📡 New request: ${fingerprint} (${requestId})`);

    logRequest(endpoint, requestId);

    const promise = requestFn().finally(() => {
      // Clean up after request completes
      setTimeout(() => {
        globalRequestCache.delete(fingerprint);
      }, maxAge);
    });

    // Cache the request
    globalRequestCache.set(fingerprint, {
      promise,
      timestamp: now,
      fingerprint
    });

    return promise;
  }, [generateFingerprint, checkRateLimit, logRequest, componentId]);

  // Batch requests for similar endpoints
  const batchSimilarRequests = useCallback(<T>(
    requests: Array<{
      endpoint: string;
      params: any;
      requestFn: () => Promise<T>;
    }>,
    batchWindow: number = 100
  ): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log(`📦 Batching ${requests.length} similar requests`);
          const results = await Promise.all(
            requests.map(req => 
              deduplicateRequest(req.endpoint, req.params, req.requestFn, {
                componentLevel: true,
                cascadeThreshold: 2
              })
            )
          );
          resolve(results);
        } catch (error) {
          reject(error);
        }
      }, batchWindow);
    });
  }, [deduplicateRequest]);

  // Get request statistics for monitoring
  const getRequestStats = useCallback(() => {
    const activeRequests = Array.from(globalRequestCache.values());
    const recentRequests = activeRequests.filter(req => 
      Date.now() - req.timestamp < 30000 // Last 30 seconds
    );

    const fingerprintCounts = Array.from(requestTimingMap.entries()).map(([fingerprint, timings]) => ({
      fingerprint,
      count: timings.length,
      recentCount: timings.filter(time => Date.now() - time < 10000).length
    }));

    return {
      activeRequests: activeRequests.length,
      recentRequests: recentRequests.length,
      fingerprintCounts,
      cacheSize: globalRequestCache.size,
      componentId: componentId.current
    };
  }, []);

  // Clear request cache (for debugging/testing)
  const clearRequestCache = useCallback((pattern?: string) => {
    if (pattern) {
      Array.from(globalRequestCache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => globalRequestCache.delete(key));
    } else {
      globalRequestCache.clear();
      requestTimingMap.clear();
    }
    console.log(`🧹 Request cache cleared${pattern ? ` (pattern: ${pattern})` : ''}`);
  }, []);

  return {
    deduplicateRequest,
    batchSimilarRequests,
    getRequestStats,
    clearRequestCache,
    componentId: componentId.current
  };
};
