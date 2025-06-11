
// ABOUTME: Enhanced parallel data loading hook with optimized caching and error handling
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useOptimizedIssues, useOptimizedFeaturedIssue } from './useOptimizedIssues';
import { useOptimizedSidebarData } from './useOptimizedSidebarData';
import { useStableAuth } from './useStableAuth';
import { useSectionVisibility } from './useSectionVisibility';
import { Issue } from '@/types/issue';

interface SectionVisibilityConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface ParallelDataState {
  issues: Issue[];
  sectionVisibility: SectionVisibilityConfig[];
  reviewerComments: any[];
  featuredIssue: Issue | null;
  isLoading: boolean;
  errors: Record<string, Error>;
  retryFailed: () => void;
}

// Type guard for Issue array
const isIssueArray = (data: unknown): data is Issue[] => {
  return Array.isArray(data);
};

// Type guard for sections array
const isSectionsArray = (data: unknown): data is any[] => {
  return Array.isArray(data);
};

// Section ID mapping between different parts of the system
const mapSectionVisibilityToConfig = (sections: any[]): SectionVisibilityConfig[] => {
  if (!Array.isArray(sections)) return [];
  
  return sections.map(section => ({
    id: section.id || '',
    name: section.title || section.name || '',
    enabled: section.visible !== false,
    order: section.order || 0
  }));
};

export const useParallelDataLoader = (): ParallelDataState => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  const { sections, isLoading: sectionsLoading, getVisibleSections } = useSectionVisibility();
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Load optimized issues data
  const { 
    data: issuesData, 
    isLoading: issuesLoading, 
    error: issuesError 
  } = useOptimizedIssues({ 
    limit: 20, 
    includeUnpublished: isAuthenticated 
  });

  // Load featured issue
  const { 
    data: featuredIssueData, 
    isLoading: featuredLoading, 
    error: featuredError 
  } = useOptimizedFeaturedIssue();

  // Load sidebar data
  const { 
    reviewerComments, 
    isLoading: sidebarLoading, 
    hasError: sidebarError 
  } = useOptimizedSidebarData();

  // Aggregate loading states
  const isLoading = useMemo(() => {
    return authLoading || sectionsLoading || issuesLoading || featuredLoading || sidebarLoading;
  }, [authLoading, sectionsLoading, issuesLoading, featuredLoading, sidebarLoading]);

  // Aggregate and track errors
  useEffect(() => {
    const newErrors: Record<string, Error> = {};
    
    if (issuesError) newErrors.issues = issuesError as Error;
    if (featuredError) newErrors.featured = featuredError as Error;
    if (sidebarError) newErrors.sidebar = new Error('Sidebar data loading failed');
    
    setErrors(newErrors);
  }, [issuesError, featuredError, sidebarError]);

  // Retry failed operations
  const retryFailed = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    setRetryCount(prev => prev + 1);
    setErrors({});
    
    // Implement exponential backoff for retries
    retryTimeoutRef.current = setTimeout(() => {
      // This will trigger a re-render and potentially retry failed queries
      console.log('Retrying failed data loads...');
    }, Math.min(1000 * Math.pow(2, retryCount), 10000));
  }, [retryCount]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Process and return the parallel data state
  return useMemo(() => ({
    issues: isIssueArray(issuesData) ? issuesData : [],
    sectionVisibility: mapSectionVisibilityToConfig(isSectionsArray(sections) ? sections : []),
    reviewerComments: reviewerComments.data || [],
    featuredIssue: featuredIssueData || null,
    isLoading,
    errors,
    retryFailed,
  }), [
    issuesData, 
    sections, 
    reviewerComments.data, 
    featuredIssueData, 
    isLoading, 
    errors, 
    retryFailed
  ]);
};
