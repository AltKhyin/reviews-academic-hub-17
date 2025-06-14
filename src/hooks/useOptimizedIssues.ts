
// ABOUTME: Optimized issues hooks using new RPC functions for better performance
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { Issue } from '@/types/issue';

interface IssueFilters {
  specialty?: string;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  limit?: number;
  offset?: number;
}

// Transform database response to Issue type
const transformIssueData = (data: any): Issue => ({
  id: data.id,
  title: data.title || '',
  cover_image_url: data.cover_image_url,
  specialty: data.specialty || '',
  published: data.published ?? true,
  featured: Boolean(data.featured),
  created_at: data.created_at,
  published_at: data.published_at,
  score: data.score || 0,
  description: data.description,
  authors: data.authors,
  year: data.year,
  // Default values for fields not fetched by RPC
  search_title: null,
  search_description: null,
  design: null,
  pdf_url: '',
  review_type: 'pdf' as const,
  backend_tags: '',
  updated_at: data.created_at,
  population: null,
  article_pdf_url: null,
  real_title: null,
  real_title_ptbr: null,
  review_content: null,
  toc_data: null,
});

// Main optimized issues hook using RPC function
export const useOptimizedIssues = (filters: IssueFilters = {}) => {
  const {
    specialty,
    featuredOnly = false,
    includeUnpublished = false,
    limit = 20,
    offset = 0
  } = filters;

  return useOptimizedQuery(
    queryKeys.issues({ specialty, featuredOnly, includeUnpublished, limit, offset }),
    async (): Promise<Issue[]> => {
      const { data, error } = await supabase.rpc('get_optimized_issues', {
        p_specialty: specialty || null,
        p_featured_only: featuredOnly,
        p_include_unpublished: includeUnpublished,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) {
        console.error('Error fetching optimized issues:', error);
        throw error;
      }

      return (data || []).map(transformIssueData);
    },
    {
      ...queryConfigs.static,
      staleTime: 10 * 60 * 1000, // 10 minutes for issues data
    }
  );
};

// Optimized featured issue hook using RPC function
export const useOptimizedFeaturedIssue = () => {
  return useOptimizedQuery(
    queryKeys.featuredIssue(),
    async (): Promise<Issue | null> => {
      const { data, error } = await supabase.rpc('get_featured_issue');

      if (error) {
        console.error('Error fetching featured issue:', error);
        throw error;
      }

      if (!data || data.length === 0) return null;
      
      return transformIssueData(data[0]);
    },
    {
      ...queryConfigs.static,
      staleTime: 15 * 60 * 1000, // 15 minutes for featured issue
    }
  );
};

// Batch issues fetcher using RPC function
export const useIssuesBatch = (issueIds: string[]) => {
  return useOptimizedQuery(
    queryKeys.issuesBatch(issueIds),
    async (): Promise<Issue[]> => {
      if (issueIds.length === 0) return [];

      const { data, error } = await supabase.rpc('get_issues_batch', {
        p_issue_ids: issueIds,
      });

      if (error) {
        console.error('Error fetching issues batch:', error);
        throw error;
      }

      return (data || []).map(transformIssueData);
    },
    {
      enabled: issueIds.length > 0,
      ...queryConfigs.static,
      staleTime: 12 * 60 * 1000, // 12 minutes for batch data
    }
  );
};

// Popular issues hook using RPC function
export const usePopularIssues = (periodDays = 7, maxItems = 10) => {
  return useOptimizedQuery(
    queryKeys.popularIssues(periodDays, maxItems),
    async (): Promise<Issue[]> => {
      const { data, error } = await supabase.rpc('get_popular_issues', {
        period_days: periodDays,
        max_items: maxItems,
      });

      if (error) {
        console.error('Error fetching popular issues:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...transformIssueData(item),
        view_count: item.view_count || 0,
      }));
    },
    {
      ...queryConfigs.realtime,
      staleTime: 8 * 60 * 1000, // 8 minutes for popular content
    }
  );
};
