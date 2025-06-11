
// ABOUTME: Comprehensive error tracking with performance impact analysis
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ErrorMetric {
  id: string;
  timestamp: Date;
  errorType: string;
  message: string;
  stack?: string;
  component?: string;
  userAgent: string;
  url: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorMetrics {
  errorRate: number;
  totalErrors: number;
  criticalErrors: number;
  lastError?: ErrorMetric;
  errorsByType: Record<string, number>;
}

const MAX_STORED_ERRORS = 100;

export const useErrorTracking = () => {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<ErrorMetric[]>([]);
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics>({
    errorRate: 0,
    totalErrors: 0,
    criticalErrors: 0,
    errorsByType: {},
  });

  // Determine error severity based on error type and message
  const determineSeverity = useCallback((error: Error, component?: string): 'low' | 'medium' | 'high' | 'critical' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'medium';
    if (message.includes('auth') || message.includes('permission')) return 'high';
    if (message.includes('database') || message.includes('rls')) return 'critical';
    if (component?.includes('payment') || component?.includes('admin')) return 'high';
    
    return 'low';
  }, []);

  // Track error with context
  const trackError = useCallback((
    error: Error, 
    component?: string,
    additionalContext?: Record<string, any>
  ) => {
    const errorMetric: ErrorMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      errorType: error.name || 'Unknown',
      message: error.message,
      stack: error.stack,
      component,
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity: determineSeverity(error, component),
    };

    setErrors(prev => {
      const newErrors = [errorMetric, ...prev].slice(0, MAX_STORED_ERRORS);
      return newErrors;
    });

    // Log critical errors to console
    if (errorMetric.severity === 'critical') {
      console.error('🚨 Critical Error:', {
        error: errorMetric,
        context: additionalContext,
      });
    }

    // Invalidate queries if database-related error
    if (errorMetric.message.includes('database') || errorMetric.message.includes('rls')) {
      queryClient.invalidateQueries();
    }

  }, [determineSeverity, queryClient]);

  // Update metrics when errors change
  useEffect(() => {
    const now = Date.now();
    const recentWindow = 60 * 60 * 1000; // Last hour
    const recentErrors = errors.filter(e => now - e.timestamp.getTime() < recentWindow);
    
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const errorsByType = errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setErrorMetrics({
      errorRate: recentErrors.length / 60, // Errors per minute in last hour
      totalErrors: errors.length,
      criticalErrors,
      lastError: errors[0],
      errorsByType,
    });
  }, [errors]);

  // Clear old errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: 'low' | 'medium' | 'high' | 'critical') => {
    return errors.filter(e => e.severity === severity);
  }, [errors]);

  return {
    trackError,
    errorMetrics,
    errors,
    clearErrors,
    getErrorsBySeverity,
  };
};
