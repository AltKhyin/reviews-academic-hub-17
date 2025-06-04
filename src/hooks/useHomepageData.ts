
// ABOUTME: Aggregated data hook for the new magazine-style homepage
// Optimizes data fetching by combining multiple queries into a single efficient load

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';

export interface HomepageData {
  featuredIssue: Issue | null;
  recentIssues: Issue[];
  recommendedIssues: Issue[];
  trendingIssues: Issue[];
  editorialTagline: string | null;
  nextIssueDate: string | null;
  activePoll: any | null;
  topThreads: any[];
}

export const useHomepageData = () => {
  return useQuery({
    queryKey: ['homepage-data'],
    queryFn: async (): Promise<HomepageData> => {
      console.log('🔄 Fetching homepage data...');
      
      // Fetch all issues (we'll filter client-side for better caching)
      const { data: allIssues, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (issuesError) {
        console.error('❌ Error fetching issues:', issuesError);
        throw issuesError;
      }

      // Fetch site metadata
      const { data: siteMeta, error: metaError } = await supabase
        .from('site_meta')
        .select('key, value')
        .in('key', ['tagline', 'next_issue_date']);
      
      if (metaError) {
        console.error('❌ Error fetching site meta:', metaError);
      }

      // Fetch active poll
      const { data: activePoll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('active', true)
        .single();
      
      if (pollError && pollError.code !== 'PGRST116') {
        console.error('❌ Error fetching active poll:', pollError);
      }

      // Fetch top threads
      const { data: topThreads, error: threadsError } = await supabase
        .rpc('get_top_threads', { min_comments: 3 });
      
      if (threadsError) {
        console.error('❌ Error fetching top threads:', threadsError);
      }

      // Process the data
      const issues = allIssues || [];
      const featuredIssue = issues.find(issue => issue.featured) || issues[0] || null;
      const recentIssues = issues.slice(0, 6);
      
      // Simple recommendation: shuffle and take 12
      const shuffledIssues = [...issues].sort(() => Math.random() - 0.5);
      const recommendedIssues = shuffledIssues.slice(0, 12);
      
      // Trending: most recent issues as trending
      const trendingIssues = issues.slice(0, 12);

      // Extract metadata
      const metaMap = (siteMeta || []).reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, any>);

      const result: HomepageData = {
        featuredIssue,
        recentIssues,
        recommendedIssues,
        trendingIssues,
        editorialTagline: metaMap.tagline || null,
        nextIssueDate: metaMap.next_issue_date || null,
        activePoll: activePoll || null,
        topThreads: topThreads || []
      };

      console.log('✅ Homepage data loaded:', {
        featuredIssue: !!result.featuredIssue,
        recentIssues: result.recentIssues.length,
        recommendedIssues: result.recommendedIssues.length,
        hasTagline: !!result.editorialTagline,
        hasActivePoll: !!result.activePoll,
        topThreads: result.topThreads.length
      });

      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
