
// ABOUTME: Optimized issues hook with proper parameter handling and type safety
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedIssuesProps {
  limit?: number;
  offset?: number;
  specialty?: string;
  featured?: boolean;
  orderBy?: 'score' | 'published_at' | 'created_at';
  ascending?: boolean;
}

interface IssueResult {
  id: string;
  title: string;
  cover_image_url?: string;
  specialty: string;
  published_at: string;
  authors?: string;
  year?: string;
  score?: number;
  featured?: boolean;
}

export const useOptimizedIssues = (props: OptimizedIssuesProps = {}) => {
  const {
    limit = 20,
    offset = 0,
    specialty,
    featured,
    orderBy = 'score',
    ascending = false
  } = props;

  const { data, isLoading, error } = useOptimizedQuery<IssueResult[]>(
    queryKeys.issues({ specialty, featured, orderBy, limit, offset }),
    async (): Promise<IssueResult[]> => {
      try {
        let query = supabase
          .from('issues')
          .select('id, title, cover_image_url, specialty, published_at, authors, year, score, featured')
          .eq('published', true);

        if (specialty) {
          query = query.eq('specialty', specialty);
        }

        if (typeof featured === 'boolean') {
          query = query.eq('featured', featured);
        }

        const { data: issues, error } = await query
          .order(orderBy, { ascending })
          .range(offset, offset + limit - 1);

        if (error) {
          console.warn('Issues fetch error:', error);
          return [];
        }

        return issues || [];
      } catch (error) {
        console.warn('Issues fetch error:', error);
        return [];
      }
    },
    {
      ...queryConfigs.dynamic,
      enabled: true,
    }
  );

  return {
    issues: data || [],
    isLoading,
    error,
    hasError: Boolean(error),
  };
};
