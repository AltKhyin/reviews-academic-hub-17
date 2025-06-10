
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
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Use optimized issues query with enhanced error handling
  const { 
    data: issuesData, 
    isLoading: issuesLoading, 
    error: issuesError,
    refetch: refetchIssues
  } = useOptimizedIssues({ limit: 20 });

  // Use optimized featured issue query with enhanced error handling
  const {
    data: featuredIssueData,
    isLoading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured
  } = useOptimizedFeaturedIssue();

  // Use optimized sidebar data
  const optimizedSidebar = useOptimizedSidebarData();

  // Safely get issues array with type checking
  const issues = useMemo(() => {
    return isIssueArray(issuesData) ? issuesData : [];
  }, [issuesData]);

  // Safely get featured issue with type checking
  const featuredIssue = useMemo(() => {
    return featuredIssueData && typeof featuredIssueData === 'object' ? featuredIssueData as Issue : null;
  }, [featuredIssueData]);

  // Memoize section visibility with improved caching
  const sectionVisibility = useMemo(() => {
    if (!sectionsLoading && isSectionsArray(sections) && sections.length > 0) {
      const visibleSections = getVisibleSections();
      const mappedSections = mapSectionVisibilityToConfig(visibleSections);
      console.log('ParallelDataLoader: Cached section visibility:', mappedSections.length, 'sections');
      return mappedSections;
    }
    return [];
  }, [sections, sectionsLoading, getVisibleSections]);

  // Enhanced error management with debouncing
  const currentErrors = useMemo(() => {
    const newErrors: Record<string, Error> = {};
    
    if (issuesError) {
      newErrors.issues = issuesError as Error;
      console.warn('ParallelDataLoader: Issues error:', issuesError);
    }
    if (featuredError) {
      newErrors.featured = featuredError as Error;
      console.warn('ParallelDataLoader: Featured issue error:', featuredError);
    }
    if (optimizedSidebar.hasError) {
      newErrors.sidebar = new Error('Sidebar data error');
      console.warn('ParallelDataLoader: Sidebar error detected');
    }
    
    return newErrors;
  }, [issuesError, featuredError, optimizedSidebar.hasError]);

  // Debounced error updates to prevent excessive re-renders
  useEffect(() => {
    const errorKeys = Object.keys(currentErrors);
    const existingErrorKeys = Object.keys(errors);
    
    const hasErrorChanges = errorKeys.length !== existingErrorKeys.length || 
      errorKeys.some(key => !errors[key] || errors[key].message !== currentErrors[key].message);
    
    if (hasErrorChanges) {
      // Debounce error updates
      const timeoutId = setTimeout(() => {
        setErrors(currentErrors);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentErrors, errors]);

  // Enhanced retry mechanism with exponential backoff
  const retryFailed = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
      
      console.log(`ParallelDataLoader: Retrying failed requests (attempt ${retryCountRef.current}) with ${backoffDelay}ms delay`);
      
      setTimeout(() => {
        if (issuesError) {
          console.log('ParallelDataLoader: Retrying issues fetch');
          refetchIssues();
        }
        if (featuredError) {
          console.log('ParallelDataLoader: Retrying featured issue fetch');
          refetchFeatured();
        }
        
        // Clear errors temporarily to show loading state
        setErrors({});
      }, backoffDelay);
    } else {
      console.warn('ParallelDataLoader: Max retries reached, stopping retry attempts');
    }
  }, [issuesError, featuredError, refetchIssues, refetchFeatured]);

  // Reset retry count on successful loads
  useEffect(() => {
    if (!issuesError && !featuredError && !optimizedSidebar.hasError) {
      retryCountRef.current = 0;
    }
  }, [issuesError, featuredError, optimizedSidebar.hasError]);

  // Optimized loading state calculation
  const isLoading = useMemo(() => {
    return authLoading || sectionsLoading || (issuesLoading && issues.length === 0) || featuredLoading;
  }, [authLoading, sectionsLoading, issuesLoading, issues.length, featuredLoading]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    issues,
    sectionVisibility,
    reviewerComments: optimizedSidebar.reviewerComments.data || [],
    featuredIssue,
    isLoading,
    errors,
    retryFailed,
  }), [
    issues,
    sectionVisibility,
    optimizedSidebar.reviewerComments.data,
    featuredIssue,
    isLoading,
    errors,
    retryFailed
  ]);
};
