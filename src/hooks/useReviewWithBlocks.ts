
// ABOUTME: Optimized review hook using RPC function to fetch issue and blocks in single query
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';

export interface ReviewWithBlocks {
  issue: any;
  blocks: any[];
  polls: any[];
}

export const useReviewWithBlocks = (reviewId?: string) => {
  return useOptimizedQuery(
    queryKeys.reviewWithBlocks(reviewId || ''),
    async (): Promise<ReviewWithBlocks | null> => {
      if (!reviewId) return null;

      const { data, error } = await supabase.rpc('get_review_with_blocks', {
        review_id: reviewId,
      });

      if (error) {
        console.error('Error fetching review with blocks:', error);
        throw error;
      }

      // Type assertion to handle Supabase JSON response
      const result = data as any;
      
      return result ? {
        issue: result.issue || null,
        blocks: Array.isArray(result.blocks) ? result.blocks : [],
        polls: Array.isArray(result.polls) ? result.polls : [],
      } : null;
    },
    {
      enabled: !!reviewId,
      ...queryConfigs.static,
      staleTime: 20 * 60 * 1000, // 20 minutes for review content
    }
  );
};
