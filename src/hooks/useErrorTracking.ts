
// ABOUTME: Enhanced error tracking and monitoring system
import { useState, useCallback, useEffect } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';

interface ErrorMetric {
  count: number;
  lastOccurred: Date;
  type: string;
  message: string;
  stack?: string;
}

interface ErrorState {
  errors: Map<string, ErrorMetric>;
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
}

const CRITICAL_ERROR_TYPES = [
  'ChunkLoadError',
  'NetworkError',
  'DatabaseError',
  'AuthenticationError',
  'RLSViolation',
];

export const useErrorTracking = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    errors: new Map(),
    totalErrors: 0,
    errorRate: 0,
    criticalErrors: 0,
  });

  const [recentErrors, setRecentErrors] = useState<ErrorMetric[]>([]);

  // Track new error
  const trackError = useCallback((error: Error, context?: string) => {
    const errorKey = `${error.name}_${error.message.slice(0, 100)}`;
    const isCritical = CRITICAL_ERROR_TYPES.some(type => 
      error.name.includes(type) || error.message.includes(type)
    );

    setErrorState(prev => {
      const newErrors = new Map(prev.errors);
      const existing = newErrors.get(errorKey);
      
      const errorMetric: ErrorMetric = {
        count: existing ? existing.count + 1 : 1,
        lastOccurred: new Date(),
        type: error.name,
        message: error.message,
        stack: error.stack,
      };
      
      newErrors.set(errorKey, errorMetric);
      
      const totalErrors = Array.from(newErrors.values()).reduce((sum, metric) => sum + metric.count, 0);
      const criticalErrors = Array.from(newErrors.values())
        .filter(metric => CRITICAL_ERROR_TYPES.some(type => metric.type.includes(type)))
        .reduce((sum, metric) => sum + metric.count, 0);
      
      return {
        errors: newErrors,
        totalErrors,
        errorRate: totalErrors / (Date.now() / 1000 / 60), // errors per minute
        criticalErrors,
      };
    });

    // Add to recent errors
    setRecentErrors(prev => [
      {
        count: 1,
        lastOccurred: new Date(),
        type: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...prev.slice(0, 19) // Keep last 20 errors
    ]);

    // Log error with context
    console.error(`🚨 Error tracked${context ? ` (${context})` : ''}:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      isCritical,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Clear error metrics
  const clearErrors = useCallback(() => {
    setErrorState({
      errors: new Map(),
      totalErrors: 0,
      errorRate: 0,
      criticalErrors: 0,
    });
    setRecentErrors([]);
  }, []);

  // Get error summary
  const getErrorSummary = useCallback(() => {
    const errors = Array.from(errorState.errors.values());
    const topErrors = errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalErrors: errorState.totalErrors,
      uniqueErrors: errors.length,
      errorRate: errorState.errorRate,
      criticalErrors: errorState.criticalErrors,
      topErrors,
      hasRecentCritical: recentErrors.some(error => 
        CRITICAL_ERROR_TYPES.some(type => error.type.includes(type))
      ),
    };
  }, [errorState, recentErrors]);

  // Auto-clear old errors periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      setRecentErrors(prev => 
        prev.filter(error => error.lastOccurred > fiveMinutesAgo)
      );
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, []);

  return {
    errorMetrics: errorState,
    recentErrors,
    trackError,
    clearErrors,
    getErrorSummary,
  };
};
