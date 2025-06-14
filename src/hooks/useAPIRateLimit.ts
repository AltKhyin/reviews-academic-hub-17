
// ABOUTME: Manages API rate limiting for different endpoints.
import { useCallback, useRef } from 'react';

export interface RateLimitConfig {
  endpoint: string;
  maxRequests?: number;
  windowMs?: number;
}

interface RateLimitStatus {
  count: number;
  windowStart: number;
}

const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_MS = 60000; // 1 minute

export const useAPIRateLimit = () => {
  const limits = useRef<Record<string, RateLimitStatus>>({});

  const checkRateLimit = useCallback((config: RateLimitConfig): boolean => {
    const { endpoint, maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS } = config;
    const now = Date.now();
    
    const endpointLimit = limits.current[endpoint];

    if (!endpointLimit || now - endpointLimit.windowStart > windowMs) {
      // Reset window
      limits.current[endpoint] = {
        count: 1,
        windowStart: now,
      };
      return true;
    }

    if (endpointLimit.count < maxRequests) {
      endpointLimit.count++;
      return true;
    }

    // Limit exceeded
    return false;
  }, []);

  return { checkRateLimit };
};
