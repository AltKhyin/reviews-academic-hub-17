
// ABOUTME: Optimized homepage data hook with proper type definitions and RPC function name
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface HomepageData {
  featuredIssue: {
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at: string;
    authors?: string;
    description?: string;
  } | null;
  recentIssues: Array<{
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at: string;
    authors?: string;
    score?: number;
  }>;
  stats: {
    totalIssues: number;
    totalSpecialties: number;
    totalAuthors: number;
  };
}

interface HomepageResult extends HomepageData {
  isLoading: boolean;
  error: any;
  hasError: boolean;
  data?: HomepageData;
  refetch?: () => void;
}

export const useOptimizedHomepage = (): HomepageResult => {
  const { data, isLoading, error, refetch } = useOptimizedQuery<HomepageData>(
    queryKeys.homepage(),
    async (): Promise<HomepageData> => {
      try {
        // Fetch featured issue
        const { data: featuredIssue } = await supabase
          .from('issues')
          .select('id, title, cover_image_url, specialty, published_at, authors, description')
          .eq('published', true)
          .eq('featured', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .single();

        // Fetch recent issues
        const { data: recentIssues } = await supabase
          .from('issues')
          .select('id, title, cover_image_url, specialty, published_at, authors, score')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(6);

        // Fetch stats using the correct RPC function name
        const { data: statsData } = await supabase.rpc('get_archive_metadata');

        // Parse stats with proper type handling
        const parseStats = (data: any) => {
          if (!data || typeof data !== 'object') {
            return { totalIssues: 0, totalSpecialties: 0, totalAuthors: 0 };
          }
          return {
            totalIssues: Number(data.total_published || data.total_issues || 0),
            totalSpecialties: Number(data.total_specialties || 0),
            totalAuthors: Number(data.total_authors || 0),
          };
        };

        return {
          featuredIssue: featuredIssue || null,
          recentIssues: recentIssues || [],
          stats: parseStats(statsData),
        };
      } catch (error) {
        console.warn('Homepage data fetch error:', error);
        return {
          featuredIssue: null,
          recentIssues: [],
          stats: {
            totalIssues: 0,
            totalSpecialties: 0,
            totalAuthors: 0,
          },
        };
      }
    },
    {
      ...queryConfigs.static,
      enabled: true,
    }
  );

  const result = data || {
    featuredIssue: null,
    recentIssues: [],
    stats: { totalIssues: 0, totalSpecialties: 0, totalAuthors: 0 },
  };

  return {
    ...result,
    isLoading,
    error,
    hasError: Boolean(error),
    data: result,
    refetch,
  };
};
