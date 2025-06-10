
// ABOUTME: Parallel data loading hook with integrated section visibility management
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

// Section ID mapping between different parts of the system
const mapSectionVisibilityToConfig = (sections: any[]): SectionVisibilityConfig[] => {
  return sections.map(section => ({
    id: section.id,
    name: section.title,
    enabled: section.visible,
    order: section.order
  }));
};

export const useParallelDataLoader = (): ParallelDataState => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  const { sections, isLoading: sectionsLoading, getVisibleSections } = useSectionVisibility();
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Use optimized issues query
  const { 
    data: issues = [], 
    isLoading: issuesLoading, 
    error: issuesError,
    refetch: refetchIssues
  } = useOptimizedIssues({ limit: 20 });

  // Use optimized featured issue query
  const {
    data: featuredIssue,
    isLoading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured
  } = useOptimizedFeaturedIssue();

  // Use optimized sidebar data
  const optimizedSidebar = useOptimizedSidebarData();

  // Memoize section visibility to prevent unnecessary recalculations
  const sectionVisibility = useMemo(() => {
    if (!sectionsLoading && sections.length > 0) {
      const visibleSections = getVisibleSections();
      const mappedSections = mapSectionVisibilityToConfig(visibleSections);
      console.log('ParallelDataLoader: Memoized section visibility:', mappedSections);
      return mappedSections;
    }
    return [];
  }, [sections, sectionsLoading, getVisibleSections]);

  // Stable error management with memoization
  const currentErrors = useMemo(() => {
    const newErrors: Record<string, Error> = {};
    
    if (issuesError) newErrors.issues = issuesError as Error;
    if (featuredError) newErrors.featured = featuredError as Error;
    if (optimizedSidebar.hasError) newErrors.sidebar = new Error('Sidebar data error');
    
    return newErrors;
  }, [issuesError, featuredError, optimizedSidebar.hasError]);

  // Update errors only when they actually change
  useEffect(() => {
    const errorKeys = Object.keys(currentErrors);
    const existingErrorKeys = Object.keys(errors);
    
    if (errorKeys.length !== existingErrorKeys.length || 
        errorKeys.some(key => !errors[key] || errors[key].message !== currentErrors[key].message)) {
      setErrors(currentErrors);
    }
  }, [currentErrors, errors]);

  // Stable retry mechanism
  const retryFailed = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`ParallelDataLoader: Retrying failed requests (attempt ${retryCountRef.current})`);
      
      if (issuesError) refetchIssues();
      if (featuredError) refetchFeatured();
      
      // Clear errors temporarily to show loading state
      setErrors({});
    }
  }, [issuesError, featuredError, refetchIssues, refetchFeatured]);

  // Reset retry count on successful loads
  useEffect(() => {
    if (!issuesError && !featuredError && !optimizedSidebar.hasError) {
      retryCountRef.current = 0;
    }
  }, [issuesError, featuredError, optimizedSidebar.hasError]);

  const isLoading = authLoading || sectionsLoading || (issuesLoading && issues.length === 0) || featuredLoading;

  return {
    issues,
    sectionVisibility,
    reviewerComments: optimizedSidebar.reviewerComments.data || [],
    featuredIssue: featuredIssue || null,
    isLoading,
    errors,
    retryFailed,
  };
};
