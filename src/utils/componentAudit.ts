// ABOUTME: Utility for auditing component usage. Placeholder.
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

export const analyzeComponentUsage = () => {
  const counts: unknown = apiCallMonitor.getCounts();

  // Type guard to ensure counts is an object with a count property
  if (
    counts &&
    typeof counts === 'object' &&
    'someComponent' in counts &&
    typeof (counts as any).someComponent === 'object' &&
    (counts as any).someComponent &&
    'count' in (counts as any).someComponent
  ) {
    if ((counts as any).someComponent.count > 100) {
      console.warn('High component usage for someComponent');
    }
  }
};
