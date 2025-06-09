
// ABOUTME: Error tracking hook for monitoring application errors
import { useState, useCallback } from 'react';

interface ErrorMetrics {
  totalErrors: number;
  criticalErrors: number;
  errorRate: number;
}

interface ErrorTrackingConfig {
  enableConsoleLogging?: boolean;
  enableRemoteReporting?: boolean;
  maxErrorHistory?: number;
  reportingThreshold?: number;
}

export const useErrorTracking = (config: ErrorTrackingConfig = {}) => {
  const [errorMetrics] = useState<ErrorMetrics>({
    totalErrors: 0,
    criticalErrors: 0,
    errorRate: 0,
  });

  const logError = useCallback((error: Error) => {
    if (config.enableConsoleLogging) {
      console.error('Error tracked:', error);
    }
  }, [config.enableConsoleLogging]);

  return {
    errorMetrics,
    logError,
  };
};
