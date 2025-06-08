
// ABOUTME: Comprehensive error tracking and analytics for performance monitoring
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ErrorEvent {
  id: string;
  type: 'query' | 'mutation' | 'component' | 'network' | 'javascript';
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
}

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByPage: Record<string, number>;
  criticalErrors: number;
  recentErrors: ErrorEvent[];
  errorRate: number; // errors per minute
}

interface ErrorTrackingConfig {
  enableJavaScriptErrors?: boolean;
  enableQueryErrors?: boolean;
  enableNetworkErrors?: boolean;
  enableComponentErrors?: boolean;
  maxStoredErrors?: number;
  reportingInterval?: number;
  enableRemoteReporting?: boolean;
}

const defaultConfig: ErrorTrackingConfig = {
  enableJavaScriptErrors: true,
  enableQueryErrors: true,
  enableNetworkErrors: true,
  enableComponentErrors: true,
  maxStoredErrors: 100,
  reportingInterval: 60000, // 1 minute
  enableRemoteReporting: false,
};

// Generate session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useErrorTracking = (config: ErrorTrackingConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const queryClient = useQueryClient();
  
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics>({
    totalErrors: 0,
    errorsByType: {},
    errorsByPage: {},
    criticalErrors: 0,
    recentErrors: [],
    errorRate: 0,
  });

  const errorBuffer = useRef<ErrorEvent[]>([]);
  const sessionId = useRef(generateSessionId());
  const lastReportTime = useRef(Date.now());

  // Error severity classification
  const classifyErrorSeverity = useCallback((error: any, type: string): 'low' | 'medium' | 'high' | 'critical' => {
    // Critical: Authentication, payment, data corruption
    if (error.message?.includes('auth') || error.message?.includes('payment') || error.status === 500) {
      return 'critical';
    }
    
    // High: API failures, network errors, component crashes
    if (type === 'query' && error.status >= 400 || type === 'component' || type === 'network') {
      return 'high';
    }
    
    // Medium: Validation errors, user input errors
    if (error.status >= 400 && error.status < 500) {
      return 'medium';
    }
    
    // Low: Everything else
    return 'low';
  }, []);

  // Create error event
  const createErrorEvent = useCallback((
    type: ErrorEvent['type'],
    error: any,
    context: Record<string, any> = {}
  ): ErrorEvent => {
    const message = error.message || error.toString() || 'Unknown error';
    const stack = error.stack || '';
    const severity = classifyErrorSeverity(error, type);
    
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      stack,
      context: {
        ...context,
        errorCode: error.code,
        status: error.status,
        statusText: error.statusText,
      },
      timestamp: Date.now(),
      severity,
      sessionId: sessionId.current,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }, [classifyErrorSeverity]);

  // Log error
  const logError = useCallback((errorEvent: ErrorEvent) => {
    errorBuffer.current.push(errorEvent);
    
    // Limit buffer size
    if (errorBuffer.current.length > finalConfig.maxStoredErrors!) {
      errorBuffer.current = errorBuffer.current.slice(-finalConfig.maxStoredErrors!);
    }
    
    // Console logging based on severity
    const logMethod = errorEvent.severity === 'critical' ? 'error' 
                    : errorEvent.severity === 'high' ? 'warn'
                    : 'info';
    
    console[logMethod](`[ErrorTracking] ${errorEvent.type.toUpperCase()}:`, {
      message: errorEvent.message,
      context: errorEvent.context,
      severity: errorEvent.severity,
      timestamp: new Date(errorEvent.timestamp).toISOString(),
    });
    
    // Update metrics immediately for critical errors
    if (errorEvent.severity === 'critical') {
      setErrorMetrics(prev => ({
        ...prev,
        criticalErrors: prev.criticalErrors + 1,
      }));
    }
  }, [finalConfig.maxStoredErrors]);

  // JavaScript error tracking
  useEffect(() => {
    if (!finalConfig.enableJavaScriptErrors) return;

    const handleError = (event: ErrorEvent) => {
      const errorEvent = createErrorEvent('javascript', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      logError(errorEvent);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorEvent = createErrorEvent('javascript', event.reason, {
        type: 'unhandledRejection',
      });
      logError(errorEvent);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [finalConfig.enableJavaScriptErrors, createErrorEvent, logError]);

  // Query error tracking
  useEffect(() => {
    if (!finalConfig.enableQueryErrors) return;

    const cache = queryClient.getQueryCache();
    
    const unsubscribe = cache.subscribe((event) => {
      if (event.type === 'updated' && event.query.state.error) {
        const errorEvent = createErrorEvent('query', event.query.state.error, {
          queryKey: event.query.queryKey,
          queryHash: event.query.queryHash,
          failureCount: event.query.state.failureCount,
        });
        logError(errorEvent);
      }
    });

    return unsubscribe;
  }, [finalConfig.enableQueryErrors, queryClient, createErrorEvent, logError]);

  // Network error tracking
  useEffect(() => {
    if (!finalConfig.enableNetworkErrors) return;

    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Log network errors (4xx, 5xx)
        if (!response.ok) {
          const errorEvent = createErrorEvent('network', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          }, {
            method: args[1]?.method || 'GET',
            requestUrl: args[0].toString(),
          });
          logError(errorEvent);
        }
        
        return response;
      } catch (error) {
        const errorEvent = createErrorEvent('network', error, {
          requestUrl: args[0].toString(),
          method: args[1]?.method || 'GET',
        });
        logError(errorEvent);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [finalConfig.enableNetworkErrors, createErrorEvent, logError]);

  // Calculate and update metrics
  const updateMetrics = useCallback(() => {
    const now = Date.now();
    const timeWindow = finalConfig.reportingInterval!;
    const recentErrors = errorBuffer.current.filter(
      error => now - error.timestamp < timeWindow
    );
    
    // Calculate error rate (errors per minute)
    const errorRate = (recentErrors.length / (timeWindow / 60000));
    
    // Group errors by type and page
    const errorsByType: Record<string, number> = {};
    const errorsByPage: Record<string, number> = {};
    
    errorBuffer.current.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      
      const page = new URL(error.url).pathname;
      errorsByPage[page] = (errorsByPage[page] || 0) + 1;
    });
    
    const criticalErrors = errorBuffer.current.filter(
      error => error.severity === 'critical'
    ).length;
    
    setErrorMetrics({
      totalErrors: errorBuffer.current.length,
      errorsByType,
      errorsByPage,
      criticalErrors,
      recentErrors: errorBuffer.current.slice(-10), // Last 10 errors
      errorRate,
    });
    
    lastReportTime.current = now;
  }, [finalConfig.reportingInterval]);

  // Periodic metrics update
  useEffect(() => {
    const interval = setInterval(updateMetrics, finalConfig.reportingInterval);
    return () => clearInterval(interval);
  }, [updateMetrics, finalConfig.reportingInterval]);

  // Public API for manual error logging
  const trackError = useCallback((
    type: ErrorEvent['type'],
    error: any,
    context?: Record<string, any>
  ) => {
    const errorEvent = createErrorEvent(type, error, context);
    logError(errorEvent);
  }, [createErrorEvent, logError]);

  // Get error details
  const getErrorDetails = useCallback((errorId: string) => {
    return errorBuffer.current.find(error => error.id === errorId);
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    errorBuffer.current = [];
    setErrorMetrics({
      totalErrors: 0,
      errorsByType: {},
      errorsByPage: {},
      criticalErrors: 0,
      recentErrors: [],
      errorRate: 0,
    });
  }, []);

  // Export error data
  const exportErrors = useCallback(() => {
    return {
      errors: errorBuffer.current,
      metrics: errorMetrics,
      session: sessionId.current,
      exportedAt: new Date().toISOString(),
    };
  }, [errorMetrics]);

  return {
    errorMetrics,
    trackError,
    getErrorDetails,
    clearErrors,
    exportErrors,
    isTracking: true,
  };
};

// Component error boundary integration
export const withErrorTracking = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { trackError } = useErrorTracking();
    
    useEffect(() => {
      const handleComponentError = (error: Error, errorInfo: any) => {
        trackError('component', error, {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        });
      };
      
      // This would need to be integrated with an error boundary
      // For now, it's just a placeholder for the pattern
      
    }, [trackError]);
    
    return <Component {...props} />;
  };
};
