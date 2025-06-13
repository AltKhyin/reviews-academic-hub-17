
// ABOUTME: Enhanced API rate limiting with cascade detection and automatic protection
import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  cascadeThreshold?: number;
}

interface RequestLog {
  timestamp: number;
  endpoint: string;
  requestId: string;
}

// Global rate limiting state to prevent cascade across components
const globalRequestLog = new Map<string, RequestLog[]>();
const cascadeDetection = new Map<string, number>();

export const useAPIRateLimit = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const lastToastRef = useRef<number>(0);

  const checkRateLimit = useCallback((config: RateLimitConfig): boolean => {
    const { endpoint, maxRequests, windowMs, cascadeThreshold = 5 } = config;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create request log for this endpoint
    if (!globalRequestLog.has(endpoint)) {
      globalRequestLog.set(endpoint, []);
    }
    
    const requestLog = globalRequestLog.get(endpoint)!;
    
    // Clean up old requests outside the window
    const recentRequests = requestLog.filter(req => req.timestamp > windowStart);
    globalRequestLog.set(endpoint, recentRequests);
    
    // Enhanced cascade detection - check for rapid successive requests
    const rapidRequests = recentRequests.filter(req => req.timestamp > now - 10000); // Last 10 seconds
    
    if (rapidRequests.length >= cascadeThreshold) {
      const cascadeCount = cascadeDetection.get(endpoint) || 0;
      cascadeDetection.set(endpoint, cascadeCount + 1);
      
      console.warn(`🚨 API Cascade detected for ${endpoint}: ${rapidRequests.length} requests in 10s`);
      
      // Show cascade warning toast (max once per 30 seconds)
      if (now - lastToastRef.current > 30000) {
        toast({
          title: "Sistema de proteção ativo",
          description: `Detectado excesso de requisições para ${endpoint}. Limitando automaticamente.`,
          variant: "destructive",
        });
        lastToastRef.current = now;
      }
      
      setIsRateLimited(true);
      
      // Auto-recovery after cascade cooldown
      setTimeout(() => {
        setIsRateLimited(false);
        cascadeDetection.delete(endpoint);
      }, 15000); // 15 second cooldown
      
      return false;
    }
    
    // Standard rate limiting check
    if (recentRequests.length >= maxRequests) {
      console.warn(`Rate limit exceeded for ${endpoint}: ${recentRequests.length}/${maxRequests} requests`);
      
      // Show rate limit toast (max once per 30 seconds)
      if (now - lastToastRef.current > 30000) {
        toast({
          title: "Limite de requisições atingido",
          description: `Por favor aguarde antes de fazer nova requisição para ${endpoint}.`,
          variant: "destructive",
        });
        lastToastRef.current = now;
      }
      
      setIsRateLimited(true);
      
      // Auto-recovery after rate limit window
      setTimeout(() => setIsRateLimited(false), windowMs / 2);
      
      return false;
    }
    
    return true;
  }, []);

  const logRequest = useCallback((endpoint: string, requestId?: string) => {
    const now = Date.now();
    const id = requestId || `req_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!globalRequestLog.has(endpoint)) {
      globalRequestLog.set(endpoint, []);
    }
    
    const requestLog = globalRequestLog.get(endpoint)!;
    requestLog.push({
      timestamp: now,
      endpoint,
      requestId: id
    });
    
    console.log(`📡 API Request logged: ${endpoint} (${id})`);
  }, []);

  const getRateLimitStatus = useCallback((endpoint: string) => {
    const requestLog = globalRequestLog.get(endpoint) || [];
    const cascadeCount = cascadeDetection.get(endpoint) || 0;
    const now = Date.now();
    const recentRequests = requestLog.filter(req => req.timestamp > now - 60000); // Last minute
    
    return {
      requestCount: recentRequests.length,
      cascadeCount,
      isLimited: isRateLimited,
      lastRequest: recentRequests[recentRequests.length - 1]?.timestamp || 0
    };
  }, [isRateLimited]);

  const clearRateLimit = useCallback((endpoint?: string) => {
    if (endpoint) {
      globalRequestLog.delete(endpoint);
      cascadeDetection.delete(endpoint);
    } else {
      globalRequestLog.clear();
      cascadeDetection.clear();
    }
    setIsRateLimited(false);
    console.log(`🧹 Rate limit cleared${endpoint ? ` for ${endpoint}` : ' globally'}`);
  }, []);

  return {
    checkRateLimit,
    logRequest,
    getRateLimitStatus,
    clearRateLimit,
    isRateLimited
  };
};
