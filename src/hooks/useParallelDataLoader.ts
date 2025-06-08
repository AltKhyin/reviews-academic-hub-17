// ABOUTME: Parallel data loading hook that prevents waterfall dependencies
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useStableAuth } from './useStableAuth';

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

// Optimized issues query with minimal fields for initial load
const fetchMinimalIssues = async (): Promise<Issue[]> => {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      id,
      title,
      cover_image_url,
      specialty,
      published,
      featured,
      created_at,
      published_at,
      score
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map(issue => ({
    id: issue.id,
    title: issue.title || '',
    cover_image_url: issue.cover_image_url,
    specialty: issue.specialty || '',
    published: true,
    featured: Boolean(issue.featured),
    created_at: issue.created_at,
    published_at: issue.published_at,
    score: issue.score || 0,
    // Default values for fields not fetched initially
    description: null,
    authors: null,
    search_title: null,
    search_description: null,
    year: null,
    design: null,
    pdf_url: '',
    review_type: 'pdf' as const,
    backend_tags: '',
    updated_at: issue.created_at,
    population: null,
    article_pdf_url: null,
    real_title: null,
    real_title_ptbr: null,
    review_content: null,
    toc_data: null,
  }));
};

// Default section visibility for immediate rendering
const getDefaultSectionVisibility = (): SectionVisibilityConfig[] => [
  { id: 'reviews', name: 'Reviewer Comments', enabled: true, order: 0 },
  { id: 'featured', name: 'Featured Article', enabled: true, order: 1 },
  { id: 'recent', name: 'Recent Issues', enabled: true, order: 2 },
  { id: 'recommended', name: 'Recommended', enabled: true, order: 3 },
  { id: 'trending', name: 'Trending', enabled: true, order: 4 },
];

// Minimal reviewer comments for quick load
const fetchMinimalReviewerComments = async () => {
  const { data, error } = await supabase
    .from('reviewer_comments')
    .select('id, reviewer_name, comment, created_at, reviewer_avatar')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return data || [];
};

export const useParallelDataLoader = (): ParallelDataState => {
  const { isAuthenticated, isLoading: authLoading } = useStableAuth();
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Issues query - runs immediately, doesn't wait for auth
  const { 
    data: issues = [], 
    isLoading: issuesLoading, 
    error: issuesError,
    refetch: refetchIssues
  } = useQuery({
    queryKey: ['parallel-issues'],
    queryFn: fetchMinimalIssues,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount) => failureCount < maxRetries,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Section visibility - use defaults immediately, load real config in background
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibilityConfig[]>(
    getDefaultSectionVisibility()
  );

  // Reviewer comments query - runs in parallel
  const { 
    data: reviewerComments = [], 
    isLoading: commentsLoading, 
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['parallel-reviewer-comments'],
    queryFn: fetchMinimalReviewerComments,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 45 * 60 * 1000, // 45 minutes
    retry: (failureCount) => failureCount < maxRetries,
  });

  // Featured issue - derived from issues data
  const featuredIssue = issues.find(issue => issue.featured) || issues[0] || null;

  // Background section visibility loading (non-blocking)
  useEffect(() => {
    const loadSectionVisibility = async () => {
      try {
        // This could load from site_meta or other configuration
        // For now, we use the defaults which are sufficient
        // Real implementation would fetch from database but not block rendering
        
        // Simulated async config load that doesn't block
        setTimeout(() => {
          // If real config differs from defaults, update here
          // setSectionVisibility(realConfig);
        }, 1000);
      } catch (error) {
        console.warn('Section visibility config load failed, using defaults:', error);
        // Keep using defaults - no user impact
      }
    };

    loadSectionVisibility();
  }, []);

  // Error management
  useEffect(() => {
    const newErrors: Record<string, Error> = {};
    
    if (issuesError) newErrors.issues = issuesError as Error;
    if (commentsError) newErrors.comments = commentsError as Error;
    
    setErrors(newErrors);
  }, [issuesError, commentsError]);

  // Retry mechanism for failed requests
  const retryFailed = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      
      if (issuesError) refetchIssues();
      if (commentsError) refetchComments();
      
      // Clear errors temporarily to show loading state
      setErrors({});
    }
  }, [issuesError, commentsError, refetchIssues, refetchComments]);

  // Reset retry count on successful loads
  useEffect(() => {
    if (!issuesError && !commentsError) {
      retryCountRef.current = 0;
    }
  }, [issuesError, commentsError]);

  const isLoading = authLoading || (issuesLoading && issues.length === 0);

  return {
    issues,
    sectionVisibility,
    reviewerComments,
    featuredIssue,
    isLoading,
    errors,
    retryFailed,
  };
};
