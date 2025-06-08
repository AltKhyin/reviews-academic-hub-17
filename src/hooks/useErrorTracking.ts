
// ABOUTME: Enhanced error tracking hook with optimized performance monitoring and reduced overhead
import { useCallback, useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ErrorMetrics {
  errorRate: number;
  totalErrors: number;
  criticalErrors: number;
  recentErrors: Error[];
  lastError: Error | null;
}

interface ErrorTrackingConfig {
  enableConsoleLogging?: boolean;
  enableRemoteReporting?: boolean;
  maxErrorHistory?: number;
  reportingThreshold?: number;
}

const defaultConfig: ErrorTrackingConfig = {
  enableConsoleLogging: true,
  enableRemoteReporting: false,
  maxErrorHistory: 10,
  reportingThreshold: 5,
};

export const useErrorTracking = (config: ErrorTrackingConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const queryClient = useQueryClient();
  
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics>({
    errorRate: 0,
    totalErrors: 0,
    criticalErrors: 0,
    recentErrors: [],
    lastError: null,
  });
  
  const errorHistoryRef = useRef<Array<{ error: Error; timestamp: number }>>([]);
  const reportingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized error tracking with batching
  const trackError = useCallback((error: Error, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const timestamp = Date.now();
    
    // Add to error history with size limit
    errorHistoryRef.current.unshift({ error, timestamp });
    if (errorHistoryRef.current.length > finalConfig.maxErrorHistory!) {
      errorHistoryRef.current = errorHistoryRef.current.slice(0, finalConfig.maxErrorHistory);
    }
    
    // Update metrics
    setErrorMetrics(prev => ({
      errorRate: calculateErrorRate(),
      totalErrors: prev.totalErrors + 1,
      criticalErrors: prev.criticalErrors + (severity === 'critical' ? 1 : 0),
      recentErrors: errorHistoryRef.current.slice(0, 5).map(e => e.error),
      lastError: error,
    }));
    
    // Console logging if enabled
    if (finalConfig.enableConsoleLogging) {
      const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'log';
      console[logLevel](`[${severity.toUpperCase()}] Error tracked:`, error);
    }
    
    // Batch remote reporting
    if (finalConfig.enableRemoteReporting && severity === 'critical') {
      // Could implement remote error reporting here
      console.warn('Critical error detected - would report to remote service');
    }
  }, [finalConfig]);

  // Calculate error rate over the last hour
  const calculateErrorRate = useCallback((): number => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentErrors = errorHistoryRef.current.filter(e => e.timestamp > oneHourAgo);
    return recentErrors.length;
  }, []);

  // Clear error history
  const clearErrors = useCallback(() => {
    errorHistoryRef.current = [];
    setErrorMetrics({
      errorRate: 0,
      totalErrors: 0,
      criticalErrors: 0,
      recentErrors: [],
      lastError: null,
    });
  }, []);

  // Get error summary
  const getErrorSummary = useCallback(() => {
    const recent = errorHistoryRef.current.slice(0, 10);
    const errorTypes = recent.reduce((acc, { error }) => {
      const type = error.constructor.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: errorHistoryRef.current.length,
      recentErrors: recent.length,
      errorTypes,
      lastErrorTime: recent[0]?.timestamp || null,
    };
  }, []);

  // Set up periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Remove errors older than 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      errorHistoryRef.current = errorHistoryRef.current.filter(e => e.timestamp > oneDayAgo);
    }, 60 * 60 * 1000); // Run every hour

    return () => {
      clearInterval(cleanup);
    };
  }, []);

  return {
    errorMetrics,
    trackError,
    clearErrors,
    getErrorSummary,
  };
};

