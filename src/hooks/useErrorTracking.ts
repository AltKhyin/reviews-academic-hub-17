
// ABOUTME: Error tracking system for performance monitoring
import { useState, useCallback, useEffect } from 'react';

interface ErrorMetrics {
  errorRate: number;
  recentErrors: Array<{
    message: string;
    timestamp: Date;
    source: string;
  }>;
  totalErrors: number;
}

export const useErrorTracking = () => {
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics>({
    errorRate: 0,
    recentErrors: [],
    totalErrors: 0,
  });

  const trackError = useCallback((error: Error, source: string) => {
    setErrorMetrics(prev => {
      const newError = {
        message: error.message,
        timestamp: new Date(),
        source,
      };

      const recentErrors = [...prev.recentErrors, newError].slice(-10); // Keep last 10
      const totalErrors = prev.totalErrors + 1;
      const errorRate = Math.min(1, totalErrors / Math.max(1, totalErrors + 100)); // Simple rate calculation

      return {
        errorRate,
        recentErrors,
        totalErrors,
      };
    });
  }, []);

  // Set up global error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), 'global');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(String(event.reason)), 'promise');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [trackError]);

  return {
    errorMetrics,
    trackError,
  };
};
