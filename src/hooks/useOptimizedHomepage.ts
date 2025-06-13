
// ABOUTME: Optimized homepage data fetching with cascade prevention
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedHomepage = () => {
  return useQuery({
    queryKey: ['homepage-data'],
    queryFn: async () => {
      console.log('🏠 Fetching homepage data (optimized)');
      
      const [issuesResult, featuredResult, commentsResult, sectionsResult] = await Promise.all([
        supabase
          .from('issues')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(20),
        
        supabase
          .from('issues')
          .select('*')
          .eq('published', true)
          .eq('featured', true)
          .limit(1)
          .single(),
        
        supabase
          .from('reviewer_comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('homepage_sections')
          .select('*')
          .eq('visible', true)
          .order('order_index', { ascending: true })
      ]);

      return {
        issues: issuesResult.data || [],
        featuredIssue: featuredResult.data,
        reviewerComments: commentsResult.data || [],
        sectionVisibility: sectionsResult.data || []
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};
