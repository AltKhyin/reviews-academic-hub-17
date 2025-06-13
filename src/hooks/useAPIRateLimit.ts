
// ABOUTME: Enhanced API rate limiting hook with cascade prevention
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  showToast?: boolean;
  cascadeProtection?: boolean;
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  nextAllowedTime: number;
  cascadeCount: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 5, // Reduced from 10 to be more aggressive
  windowMs: 30000, // Reduced to 30 seconds
  showToast: true,
  cascadeProtection: true,
};

// Global rate limit storage per endpoint
const rateLimitStore = new Map<string, RateLimitState>();
const cascadeDetection = new Map<string, number>();

export const useAPIRateLimit = (endpoint: string, config: RateLimitConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(finalConfig.maxRequests || 5);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTime = useRef<number>(0);

  // Cascade detection
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < 100) { // Requests within 100ms = cascade
      const count = cascadeDetection.get(endpoint) || 0;
      cascadeDetection.set(endpoint, count + 1);
      
      if (count > 3 && finalConfig.cascadeProtection) {
        console.warn(`🚨 API cascade detected for ${endpoint}: ${count} rapid requests`);
        if (finalConfig.showToast) {
          toast({
            title: "API Cascade Detected",
            description: `Too many rapid requests to ${endpoint}. Implementing protection.`,
            variant: "destructive",
          });
        }
      }
    } else {
      cascadeDetection.set(endpoint, 0);
    }
    
    lastRequestTime.current = now;
  });

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Check for cascade protection
    const cascadeCount = cascadeDetection.get(endpoint) || 0;
    if (cascadeCount > 5 && finalConfig.cascadeProtection) {
      setIsBlocked(true);
      setRemainingRequests(0);
      
      if (finalConfig.showToast) {
        toast({
          title: "Cascade Protection Active",
          description: `API cascade protection is blocking rapid requests to ${endpoint}.`,
          variant: "destructive",
        });
      }
      
      return false;
    }
    
    // Get or create rate limit state for this endpoint
    let state = rateLimitStore.get(endpoint);
    if (!state) {
      state = {
        requests: [],
        blocked: false,
        nextAllowedTime: 0,
        cascadeCount: 0,
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
    const windowStart = now - (finalConfig.windowMs || 30000);
    state.requests = state.requests.filter(time => time > windowStart);

    // Check if we're at the limit
    if (state.requests.length >= (finalConfig.maxRequests || 5)) {
      // Block for the remainder of the window
      const oldestRequest = Math.min(...state.requests);
      const blockUntil = oldestRequest + (finalConfig.windowMs || 30000);
      
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
        setRemainingRequests(finalConfig.maxRequests || 5);
      }, blockUntil - now);
      
      return false;
    }

    // Allow the request and record it
    state.requests.push(now);
    state.blocked = false;
    setIsBlocked(false);
    setRemainingRequests((finalConfig.maxRequests || 5) - state.requests.length);
    
    return true;
  }, [endpoint, finalConfig]);

  const resetRateLimit = useCallback(() => {
    const state = rateLimitStore.get(endpoint);
    if (state) {
      state.requests = [];
      state.blocked = false;
      state.nextAllowedTime = 0;
    }
    cascadeDetection.set(endpoint, 0);
    setIsBlocked(false);
    setRemainingRequests(finalConfig.maxRequests || 5);
    
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, [endpoint, finalConfig.maxRequests]);

  const getRateLimitStatus = useCallback(() => {
    const state = rateLimitStore.get(endpoint);
    const cascadeCount = cascadeDetection.get(endpoint) || 0;
    
    if (!state) return { 
      requests: 0, 
      blocked: false, 
      remaining: finalConfig.maxRequests || 5,
      cascadeCount 
    };
    
    const now = Date.now();
    const windowStart = now - (finalConfig.windowMs || 30000);
    const activeRequests = state.requests.filter(time => time > windowStart);
    
    return {
      requests: activeRequests.length,
      blocked: state.blocked && now < state.nextAllowedTime,
      remaining: Math.max(0, (finalConfig.maxRequests || 5) - activeRequests.length),
      nextAllowedTime: state.nextAllowedTime,
      cascadeCount,
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
