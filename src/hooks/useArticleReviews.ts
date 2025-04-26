
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArticleReview, ReviewStatus } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useArticleReviews = (articleId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['article-reviews', articleId],
    queryFn: async () => {
      if (!articleId) return [];

      const { data, error } = await supabase
        .from('article_reviews')
        .select(`
          *,
          reviewer:profiles(id, full_name, avatar_url, role)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ArticleReview[];
    },
    enabled: !!articleId,
  });

  const createReviewMutation = useMutation({
    mutationFn: async ({
      articleId,
      reviewerId,
      status = 'in_review',
      comments = null,
    }: {
      articleId: string;
      reviewerId: string;
      status?: ReviewStatus;
      comments?: string | null;
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
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to assign review: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateReviewStatusMutation = useMutation({
    mutationFn: async ({
      reviewId,
      status,
      comments,
    }: {
      reviewId: string;
      status: ReviewStatus;
      comments?: string | null;
    }) => {
      const updateData: { status: ReviewStatus; comments?: string | null } = { status };
      if (comments !== undefined) {
        updateData.comments = comments;
      }

      const { data, error } = await supabase
        .from('article_reviews')
        .update(updateData)
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
        description: 'The review status has been updated.',
      });
    },
    onError: (error: any) => {
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
    updateReviewStatus: updateReviewStatusMutation.mutate,
    isCreating: createReviewMutation.isPending,
    isUpdating: updateReviewStatusMutation.isPending,
  };
};
