
// ABOUTME: API rate limiting hook to prevent request cascades and abuse
import { useCallback, useRef } from 'react';

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  cascadeThreshold?: number;
}

interface RateLimitData {
  requests: number[];
  blocked: boolean;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

export const useAPIRateLimit = () => {
  const componentId = useRef(`rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const checkRateLimit = useCallback((config: RateLimitConfig): boolean => {
    const now = Date.now();
    const key = `${config.endpoint}:${config.maxRequests}:${config.windowMs}`;
    
    let rateLimitData = rateLimitStore.get(key);
    if (!rateLimitData) {
      rateLimitData = {
        requests: [],
        blocked: false,
        resetTime: now + config.windowMs
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Clean old requests outside the window
    rateLimitData.requests = rateLimitData.requests.filter(
      timestamp => now - timestamp < config.windowMs
    );

    // Check if we've exceeded the limit
    if (rateLimitData.requests.length >= config.maxRequests) {
      console.warn(`Rate limit exceeded for ${config.endpoint}: ${rateLimitData.requests.length}/${config.maxRequests} requests in ${config.windowMs}ms`);
      rateLimitData.blocked = true;
      rateLimitData.resetTime = now + config.windowMs;
      return false;
    }

    // Record this request
    rateLimitData.requests.push(now);
    rateLimitData.blocked = false;
    
    return true;
  }, []);

  const logRequest = useCallback((endpoint: string, requestId: string) => {
    console.log(`📡 API Request: ${endpoint} (${requestId}) from ${componentId.current}`);
  }, []);

  const getRateLimitStatus = useCallback((endpoint: string) => {
    const keys = Array.from(rateLimitStore.keys()).filter(key => key.startsWith(endpoint));
    return keys.map(key => {
      const data = rateLimitStore.get(key);
      return {
        key,
        requests: data?.requests.length || 0,
        blocked: data?.blocked || false,
        resetTime: data?.resetTime || 0
      };
    });
  }, []);

  return {
    checkRateLimit,
    logRequest,
    getRateLimitStatus,
    componentId: componentId.current
  };
};
