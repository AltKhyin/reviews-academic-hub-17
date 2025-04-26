
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArticleReviewData, ReviewStatus } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useArticleReviews = (articleId?: string) => {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['article-reviews', articleId],
    queryFn: async () => {
      if (!articleId) return [];

      const { data, error } = await supabase
        .from('article_reviews')
        .select(`
          *,
          reviewer:profiles!article_reviews_reviewer_id_fkey(*)
        `)
        .eq('article_id', articleId);

      if (error) throw error;
      return data as ArticleReviewData[];
    },
    enabled: !!articleId,
  });

  const createReviewMutation = useMutation({
    mutationFn: async ({
      articleId,
      reviewerId,
      status = 'in_review' as ReviewStatus,
      comments = '',
    }: {
      articleId: string;
      reviewerId: string;
      status?: ReviewStatus;
      comments?: string;
    }) => {
      const { data, error } = await supabase
        .from('article_reviews')
        .insert({
          article_id: articleId,
          reviewer_id: reviewerId,
          status,
          comments,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-reviews', articleId] });
      toast({
        title: 'Review assigned',
        description: 'The review has been successfully assigned.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to assign review: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({
      reviewId,
      status,
      comments,
    }: {
      reviewId: string;
      status: ReviewStatus;
      comments?: string;
    }) => {
      const { data, error } = await supabase
        .from('article_reviews')
        .update({ status, comments })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-reviews', articleId] });
      toast({
        title: 'Review updated',
        description: 'The review has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update review: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    reviews,
    isLoading,
    error,
    createReview: createReviewMutation.mutate,
    updateReview: updateReviewMutation.mutate,
    isCreating: createReviewMutation.isPending,
    isUpdating: updateReviewMutation.isPending,
  };
};
