
// ABOUTME: Optimized user interactions hook that batches reactions and bookmarks to reduce database calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { toast } from '@/hooks/use-toast';

interface UserReaction {
  issue_id: string;
  reaction_type: string;
}

interface UserBookmark {
  issue_id: string;
  article_id?: string;
}

interface UserInteractionsData {
  reactions: UserReaction[];
  bookmarks: UserBookmark[];
}

export const useOptimizedUserInteractions = () => {
  const { user } = useOptimizedAuth();
  const queryClient = useQueryClient();

  // Single query to get all user reactions and bookmarks
  const { data: interactions, isLoading } = useQuery({
    queryKey: queryKeys.userReactions(user?.id || ''),
    queryFn: async (): Promise<UserInteractionsData> => {
      if (!user) return { reactions: [], bookmarks: [] };

      const [reactionsResult, bookmarksResult] = await Promise.all([
        supabase
          .from('user_article_reactions')
          .select('issue_id, reaction_type')
          .eq('user_id', user.id),
        supabase
          .from('user_bookmarks')
          .select('issue_id, article_id')
          .eq('user_id', user.id)
      ]);

      if (reactionsResult.error) throw reactionsResult.error;
      if (bookmarksResult.error) throw bookmarksResult.error;

      return {
        reactions: reactionsResult.data || [],
        bookmarks: bookmarksResult.data || [],
      };
    },
    ...queryConfigs.profile,
    enabled: !!user,
  });

  // Helper functions to check specific interactions
  const hasReaction = (issueId: string, reactionType: string) => {
    return interactions?.reactions.some(
      r => r.issue_id === issueId && r.reaction_type === reactionType
    ) || false;
  };

  const isBookmarked = (issueId: string, articleId?: string) => {
    return interactions?.bookmarks.some(
      b => b.issue_id === issueId && (!articleId || b.article_id === articleId)
    ) || false;
  };

  // Optimized mutation for reactions
  const reactionMutation = useMutation({
    mutationFn: async ({ issueId, reactionType, action }: {
      issueId: string;
      reactionType: string;
      action: 'add' | 'remove';
    }) => {
      if (!user) throw new Error('User not authenticated');

      if (action === 'add') {
        const { error } = await supabase
          .from('user_article_reactions')
          .insert({
            user_id: user.id,
            issue_id: issueId,
            reaction_type: reactionType
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_article_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
          .eq('reaction_type', reactionType);
        if (error) throw error;
      }
    },
    onMutate: async ({ issueId, reactionType, action }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.userReactions(user?.id || '') });
      
      const previousData = queryClient.getQueryData<UserInteractionsData>(
        queryKeys.userReactions(user?.id || '')
      );

      if (previousData) {
        const newReactions = action === 'add'
          ? [...previousData.reactions, { issue_id: issueId, reaction_type: reactionType }]
          : previousData.reactions.filter(
              r => !(r.issue_id === issueId && r.reaction_type === reactionType)
            );

        queryClient.setQueryData(queryKeys.userReactions(user?.id || ''), {
          ...previousData,
          reactions: newReactions,
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.userReactions(user?.id || ''),
          context.previousData
        );
      }
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      });
    },
  });

  // Optimized mutation for bookmarks
  const bookmarkMutation = useMutation({
    mutationFn: async ({ issueId, articleId, action }: {
      issueId: string;
      articleId?: string;
      action: 'add' | 'remove';
    }) => {
      if (!user) throw new Error('User not authenticated');

      if (action === 'add') {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            issue_id: issueId,
            article_id: articleId || null
          });
        if (error) throw error;
      } else {
        let query = supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId);
        
        if (articleId) {
          query = query.eq('article_id', articleId);
        } else {
          query = query.is('article_id', null);
        }

        const { error } = await query;
        if (error) throw error;
      }
    },
    onMutate: async ({ issueId, articleId, action }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.userReactions(user?.id || '') });
      
      const previousData = queryClient.getQueryData<UserInteractionsData>(
        queryKeys.userReactions(user?.id || '')
      );

      if (previousData) {
        const newBookmarks = action === 'add'
          ? [...previousData.bookmarks, { issue_id: issueId, article_id: articleId }]
          : previousData.bookmarks.filter(
              b => !(b.issue_id === issueId && (!articleId || b.article_id === articleId))
            );

        queryClient.setQueryData(queryKeys.userReactions(user?.id || ''), {
          ...previousData,
          bookmarks: newBookmarks,
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.userReactions(user?.id || ''),
          context.previousData
        );
      }
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    reactions: interactions?.reactions || [],
    bookmarks: interactions?.bookmarks || [],
    isLoading,

    // Helper functions
    hasReaction,
    isBookmarked,

    // Actions
    toggleReaction: (issueId: string, reactionType: string) => {
      const currentlyHasReaction = hasReaction(issueId, reactionType);
      reactionMutation.mutate({
        issueId,
        reactionType,
        action: currentlyHasReaction ? 'remove' : 'add',
      });
    },

    toggleBookmark: (issueId: string, articleId?: string) => {
      const currentlyBookmarked = isBookmarked(issueId, articleId);
      bookmarkMutation.mutate({
        issueId,
        articleId,
        action: currentlyBookmarked ? 'remove' : 'add',
      });
    },

    // Loading states
    isUpdatingReaction: reactionMutation.isPending,
    isUpdatingBookmark: bookmarkMutation.isPending,
  };
};

