
// ABOUTME: API rate limiting hook with intelligent throttling and user feedback
import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
  showToast?: boolean;
}

interface RateLimitState {
  requests: number[];
  isLimited: boolean;
  nextAllowedTime: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'issues': { maxRequests: 10, windowMs: 60000, showToast: true }, // 10 per minute
  'archive': { maxRequests: 15, windowMs: 60000, showToast: true }, // 15 per minute
  'comments': { maxRequests: 20, windowMs: 60000, showToast: true }, // 20 per minute
  'community': { maxRequests: 25, windowMs: 60000, showToast: true }, // 25 per minute
  'search': { maxRequests: 30, windowMs: 60000, showToast: true }, // 30 per minute
  'sidebar': { maxRequests: 5, windowMs: 60000, showToast: false }, // 5 per minute, no toast
  'analytics': { maxRequests: 5, windowMs: 300000, showToast: false }, // 5 per 5 minutes
};

export const useAPIRateLimit = (endpoint: string, customConfig?: Partial<RateLimitConfig>) => {
  const config = { ...DEFAULT_CONFIGS[endpoint], ...customConfig };
  const stateRef = useRef<RateLimitState>({
    requests: [],
    isLimited: false,
    nextAllowedTime: 0,
  });

  const [isLimited, setIsLimited] = useState(false);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;

    // Clean old requests outside the window
    state.requests = state.requests.filter(time => now - time < config.windowMs);

    // Check if we're still in a rate limit period
    if (state.isLimited && now < state.nextAllowedTime) {
      if (config.showToast) {
        const waitTime = Math.ceil((state.nextAllowedTime - now) / 1000);
        toast({
          title: "Rate limit exceeded",
          description: `Please wait ${waitTime}s before making more requests to ${endpoint}`,
          variant: "destructive",
        });
      }
      setIsLimited(true);
      return false;
    }

    // Check if we exceed the rate limit
    if (state.requests.length >= config.maxRequests) {
      state.isLimited = true;
      state.nextAllowedTime = now + (config.retryAfterMs || config.windowMs);
      
      if (config.showToast) {
        toast({
          title: "Rate limit exceeded",
          description: `Too many requests to ${endpoint}. Please slow down.`,
          variant: "destructive",
        });
      }
      
      setIsLimited(true);
      console.warn(`Rate limit exceeded for ${endpoint}:`, {
        requests: state.requests.length,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
      });
      
      return false;
    }

    // Add current request and allow it
    state.requests.push(now);
    state.isLimited = false;
    setIsLimited(false);
    return true;
  }, [endpoint, config]);

  const getRemainingRequests = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;
    const activeRequests = state.requests.filter(time => now - time < config.windowMs);
    return Math.max(0, config.maxRequests - activeRequests.length);
  }, [config]);

  const getTimeUntilReset = useCallback(() => {
    const now = Date.now();
    const state = stateRef.current;
    
    if (state.isLimited && now < state.nextAllowedTime) {
      return state.nextAllowedTime - now;
    }
    
    const oldestRequest = Math.min(...state.requests);
    if (oldestRequest) {
      return Math.max(0, (oldestRequest + config.windowMs) - now);
    }
    
    return 0;
  }, [config]);

  return {
    checkRateLimit,
    isLimited,
    remainingRequests: getRemainingRequests(),
    timeUntilReset: getTimeUntilReset(),
    config,
  };
};

// Rate limit decorator for query functions
export const withRateLimit = <T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  endpoint: string,
  config?: Partial<RateLimitConfig>
): T => {
  return ((...args: Parameters<T>) => {
    const { checkRateLimit } = useAPIRateLimit(endpoint, config);
    
    if (!checkRateLimit()) {
      return Promise.reject(new Error(`Rate limit exceeded for ${endpoint}`));
    }
    
    return queryFn(...args);
  }) as T;
};
