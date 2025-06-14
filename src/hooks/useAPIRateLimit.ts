
// ABOUTME: API rate limiting hook with intelligent queuing and user-friendly feedback
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  showToast?: boolean;
}

interface RateLimitState {
  requests: number[];
  isBlocked: boolean;
  nextAllowedTime: number;
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  showToast: true,
};

// Global rate limit storage per endpoint
const rateLimitStorage = new Map<string, RateLimitState>();

export const useAPIRateLimit = (endpoint: string, config?: RateLimitConfig) => {
  const { toast } = useToast();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isRateLimited, setIsRateLimited] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = rateLimitStorage.get(endpoint) || {
      requests: [],
      isBlocked: false,
      nextAllowedTime: 0,
    };

    // Clean old requests outside the window
    state.requests = state.requests.filter(
      timestamp => now - timestamp < finalConfig.windowMs
    );

    // Check if we're still blocked
    if (state.isBlocked && now < state.nextAllowedTime) {
      if (finalConfig.showToast) {
        const waitTime = Math.ceil((state.nextAllowedTime - now) / 1000);
        toast({
          title: "Limite de requisições atingido",
          description: `Aguarde ${waitTime}s antes de tentar novamente.`,
          variant: "destructive",
        });
      }
      return false;
    }

    // Check if we exceed the limit
    if (state.requests.length >= finalConfig.maxRequests) {
      state.isBlocked = true;
      state.nextAllowedTime = now + finalConfig.windowMs;
      
      if (finalConfig.showToast) {
        toast({
          title: "Muitas requisições",
          description: "Aguarde um momento antes de continuar.",
          variant: "destructive",
        });
      }

      setIsRateLimited(true);
      
      // Clear rate limit after window
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsRateLimited(false);
        const currentState = rateLimitStorage.get(endpoint);
        if (currentState) {
          currentState.isBlocked = false;
          currentState.nextAllowedTime = 0;
        }
      }, finalConfig.windowMs);

      rateLimitStorage.set(endpoint, state);
      return false;
    }

    // Add current request
    state.requests.push(now);
    state.isBlocked = false;
    rateLimitStorage.set(endpoint, state);
    return true;
  }, [endpoint, finalConfig, toast]);

  const getRemainingRequests = useCallback((): number => {
    const state = rateLimitStorage.get(endpoint);
    if (!state) return finalConfig.maxRequests;
    
    const now = Date.now();
    const validRequests = state.requests.filter(
      timestamp => now - timestamp < finalConfig.windowMs
    );
    
    return Math.max(0, finalConfig.maxRequests - validRequests.length);
  }, [endpoint, finalConfig]);

  return {
    checkRateLimit,
    getRemainingRequests,
    isRateLimited,
  };
};
