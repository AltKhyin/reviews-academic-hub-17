
// ABOUTME: Parallel data loading hook with integrated section visibility management
import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Section visibility - now properly integrated with actual settings
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibilityConfig[]>([]);

  // Update section visibility when sections change
  useEffect(() => {
    if (!sectionsLoading && sections.length > 0) {
      const visibleSections = getVisibleSections();
      const mappedSections = mapSectionVisibilityToConfig(visibleSections);
      setSectionVisibility(mappedSections);
      console.log('ParallelDataLoader: Updated section visibility from hook:', mappedSections);
    }
  }, [sections, sectionsLoading, getVisibleSections]);

  // Error management
  useEffect(() => {
    const newErrors: Record<string, Error> = {};
    
    if (issuesError) newErrors.issues = issuesError as Error;
    if (featuredError) newErrors.featured = featuredError as Error;
    if (optimizedSidebar.hasError) newErrors.sidebar = new Error('Sidebar data error');
    
    setErrors(newErrors);
  }, [issuesError, featuredError, optimizedSidebar.hasError]);

  // Retry mechanism for failed requests
  const retryFailed = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      
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
