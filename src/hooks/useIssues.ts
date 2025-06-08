
// ABOUTME: Updated issues hook to use optimized version with intelligent caching
import { useOptimizedIssues, useOptimizedFeaturedIssue } from './useOptimizedIssues';

// Maintain backward compatibility for the main useIssues hook
export const useIssues = () => {
  return useOptimizedIssues({ includeUnpublished: true });
};

// Export optimized versions for specific use cases
export { useOptimizedIssues, useOptimizedFeaturedIssue, useIssuesBatch } from './useOptimizedIssues';
