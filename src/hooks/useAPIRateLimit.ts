
// ABOUTME: API rate limiting hook with intelligent throttling and user feedback
import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  showToast?: boolean;
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  nextAllowedTime: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  showToast: true,
};

// Global rate limit storage per endpoint
const rateLimitStore = new Map<string, RateLimitState>();

export const useAPIRateLimit = (endpoint: string, config: RateLimitConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(finalConfig.maxRequests || 10);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Get or create rate limit state for this endpoint
    let state = rateLimitStore.get(endpoint);
    if (!state) {
      state = {
        requests: [],
        blocked: false,
        nextAllowedTime: 0,
      };
      rateLimitStore.set(endpoint, state);
    }

    // Check if we're still in a blocked state
    if (state.blocked && now < state.nextAllowedTime) {
      setIsBlocked(true);
      setRemainingRequests(0);
      
      if (finalConfig.showToast) {
        const waitTime = Math.ceil((state.nextAllowedTime - now) / 1000);
        toast({
          title: "Rate Limited",
          description: `Please wait ${waitTime} seconds before trying again.`,
          variant: "destructive",
        });
      }
      
      return false;
    }

    // Clean up old requests outside the window
    const windowStart = now - (finalConfig.windowMs || 60000);
    state.requests = state.requests.filter(time => time > windowStart);

    // Check if we're at the limit
    if (state.requests.length >= (finalConfig.maxRequests || 10)) {
      // Block for the remainder of the window
      const oldestRequest = Math.min(...state.requests);
      const blockUntil = oldestRequest + (finalConfig.windowMs || 60000);
      
      state.blocked = true;
      state.nextAllowedTime = blockUntil;
      
      setIsBlocked(true);
      setRemainingRequests(0);
      
      if (finalConfig.showToast) {
        const waitTime = Math.ceil((blockUntil - now) / 1000);
        toast({
          title: "Rate Limited",
          description: `Too many requests. Please wait ${waitTime} seconds.`,
          variant: "destructive",
        });
      }

      // Set a timeout to unblock
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      cleanupTimeoutRef.current = setTimeout(() => {
        state!.blocked = false;
        setIsBlocked(false);
        setRemainingRequests(finalConfig.maxRequests || 10);
      }, blockUntil - now);
      
      return false;
    }

    // Allow the request and record it
    state.requests.push(now);
    state.blocked = false;
    setIsBlocked(false);
    setRemainingRequests((finalConfig.maxRequests || 10) - state.requests.length);
    
    return true;
  }, [endpoint, finalConfig]);

  const resetRateLimit = useCallback(() => {
    const state = rateLimitStore.get(endpoint);
    if (state) {
      state.requests = [];
      state.blocked = false;
      state.nextAllowedTime = 0;
    }
    setIsBlocked(false);
    setRemainingRequests(finalConfig.maxRequests || 10);
    
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, [endpoint, finalConfig.maxRequests]);

  const getRateLimitStatus = useCallback(() => {
    const state = rateLimitStore.get(endpoint);
    if (!state) return { requests: 0, blocked: false, remaining: finalConfig.maxRequests || 10 };
    
    const now = Date.now();
    const windowStart = now - (finalConfig.windowMs || 60000);
    const activeRequests = state.requests.filter(time => time > windowStart);
    
    return {
      requests: activeRequests.length,
      blocked: state.blocked && now < state.nextAllowedTime,
      remaining: Math.max(0, (finalConfig.maxRequests || 10) - activeRequests.length),
      nextAllowedTime: state.nextAllowedTime,
    };
  }, [endpoint, finalConfig]);

  return {
    checkRateLimit,
    resetRateLimit,
    getRateLimitStatus,
    isBlocked,
    remainingRequests,
  };
};
