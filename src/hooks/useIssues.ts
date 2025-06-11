
// ABOUTME: Enhanced issues hook with rate limiting and improved caching
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';

interface UseIssuesOptions {
  includeUnpublished?: boolean;
  filters?: {
    specialty?: string;
    featured?: boolean;
    limit?: number;
  };
}

export const useIssues = (options: UseIssuesOptions = {}) => {
  const { includeUnpublished = false, filters = {} } = options;
  
  return useUnifiedQuery<Issue[]>(
    ['issues', { includeUnpublished, ...filters }],
    async (): Promise<Issue[]> => {
      let query = supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (!includeUnpublished) {
        query = query.eq('published', true);
      }
      
      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('useIssues: Error fetching issues:', error);
        throw error;
      }
      
      console.log(`useIssues: Fetched ${data?.length || 0} issues with filters:`, filters);
      return data || [];
    },
    {
      priority: 'normal',
      staleTime: 10 * 60 * 1000, // 10 minutes
      enableMonitoring: true,
      rateLimit: {
        endpoint: 'issues',
        maxRequests: 10,
        windowMs: 60000,
      },
    }
  );
};

// Optimized hook for featured issue with enhanced caching
export const useFeaturedIssue = () => {
  return useUnifiedQuery<Issue | null>(
    ['featured-issue'],
    async (): Promise<Issue | null> => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('useFeaturedIssue: Error fetching featured issue:', error);
        throw error;
      }
      
      return data || null;
    },
    {
      priority: 'critical',
      staleTime: 15 * 60 * 1000, // 15 minutes
      enableMonitoring: true,
      rateLimit: {
        endpoint: 'issues',
        maxRequests: 5,
        windowMs: 60000,
      },
    }
  );
};

// Batch hook for multiple issue types with intelligent rate limiting
export const useIssuesBatch = () => {
  const featured = useFeaturedIssue();
  const recent = useIssues({ filters: { limit: 10 } });
  const trending = useIssues({ filters: { limit: 8 } });
  
  return {
    featured,
    recent,
    trending,
    isLoading: featured.isLoading || recent.isLoading || trending.isLoading,
    error: featured.error || recent.error || trending.error,
  };
};

// Export for backward compatibility
export { useIssues as useOptimizedIssues, useFeaturedIssue as useOptimizedFeaturedIssue };
