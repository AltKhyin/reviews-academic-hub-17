
// ABOUTME: Optimized dashboard data loader with centralized user interaction management
import { useMemo, useEffect } from 'react';
import { useParallelDataLoader } from './useParallelDataLoader';
import { useUserInteractionInit } from '@/contexts/UserInteractionContext';

export const useOptimizedDashboardData = () => {
  const { 
    issues, 
    sectionVisibility, 
    featuredIssue, 
    isLoading, 
    errors,
    retryFailed 
  } = useParallelDataLoader();

  // Extract all issue IDs for bulk user interaction loading
  const allIssueIds = useMemo(() => {
    const ids = new Set<string>();
    
    // Add regular issues
    issues.forEach(issue => ids.add(issue.id));
    
    // Add featured issue
    if (featuredIssue) {
      ids.add(featuredIssue.id);
    }
    
    return Array.from(ids);
  }, [issues, featuredIssue]);

  // Initialize user interactions for all issues at once
  const userInteractions = useUserInteractionInit(allIssueIds);

  // Log optimization metrics
  useEffect(() => {
    if (allIssueIds.length > 0 && !isLoading) {
      console.log(`🚀 Dashboard optimization: Loading ${allIssueIds.length} issues with centralized user interactions`);
    }
  }, [allIssueIds.length, isLoading]);

  return {
    issues,
    sectionVisibility,
    featuredIssue,
    isLoading,
    errors,
    retryFailed,
    userInteractions,
    issueCount: allIssueIds.length,
  };
};
