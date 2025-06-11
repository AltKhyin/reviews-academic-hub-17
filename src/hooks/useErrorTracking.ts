
// ABOUTME: Error tracking and monitoring hook with aggregated metrics
import { useState, useEffect, useCallback } from 'react';

interface ErrorMetrics {
  totalErrors: number;
  criticalErrors: number;
  errorRate: number;
  recentErrors: Error[];
}

export const useErrorTracking = () => {
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics>({
    totalErrors: 0,
    criticalErrors: 0,
    errorRate: 0,
    recentErrors: [],
  });

  const trackError = useCallback((error: Error, isCritical = false) => {
    setErrorMetrics(prev => ({
      totalErrors: prev.totalErrors + 1,
      criticalErrors: prev.criticalErrors + (isCritical ? 1 : 0),
      errorRate: prev.errorRate + 0.1,
      recentErrors: [error, ...prev.recentErrors].slice(0, 10),
    }));

    console.error('Tracked error:', error);
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(String(event.reason)), true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  // Reset error rate periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setErrorMetrics(prev => ({
        ...prev,
        errorRate: Math.max(0, prev.errorRate - 0.1),
      }));
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return {
    errorMetrics,
    trackError,
  };
};
