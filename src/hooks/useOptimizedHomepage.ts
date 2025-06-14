
// ABOUTME: Optimized homepage data hook with proper type definitions
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

export const useOptimizedHomepage = () => {
  const { data, isLoading, error } = useOptimizedQuery<HomepageData>(
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

        // Fetch stats
        const { data: stats } = await supabase.rpc('get_homepage_stats');

        return {
          featuredIssue: featuredIssue || null,
          recentIssues: recentIssues || [],
          stats: {
            totalIssues: stats?.total_issues || 0,
            totalSpecialties: stats?.total_specialties || 0,
            totalAuthors: stats?.total_authors || 0,
          },
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

  return {
    featuredIssue: data?.featuredIssue || null,
    recentIssues: data?.recentIssues || [],
    stats: data?.stats || { totalIssues: 0, totalSpecialties: 0, totalAuthors: 0 },
    isLoading,
    error,
    hasError: Boolean(error),
  };
};
