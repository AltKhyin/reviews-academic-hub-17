
// ABOUTME: Optimized user interactions hook with batched operations and intelligent caching
import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { toast } from '@/hooks/use-toast';

interface UserReaction {
  id: string;
  issue_id: string;
  reaction_type: string;
  created_at: string;
}

interface UserBookmark {
  id: string;
  issue_id: string;
  created_at: string;
}

// Batched state management for better performance
interface BatchedInteractions {
  reactions: Record<string, UserReaction>;
  bookmarks: Record<string, UserBookmark>;
  pendingReactions: Set<string>;
  pendingBookmarks: Set<string>;
}

export const useOptimizedUserInteractions = () => {
  const { user, isAuthenticated } = useOptimizedAuth();
  const queryClient = useQueryClient();

  // Consolidated user interactions query
  const { data: userInteractions, isLoading } = useQuery({
    queryKey: queryKeys.userReactions(user?.id || 'anonymous'),
    queryFn: async (): Promise<BatchedInteractions> => {
      if (!user?.id) {
        return {
          reactions: {},
          bookmarks: {},
          pendingReactions: new Set(),
          pendingBookmarks: new Set(),
        };
      }

      try {
        // Fetch reactions and bookmarks in parallel
        const [reactionsResponse, bookmarksResponse] = await Promise.all([
          supabase
            .from('user_article_reactions')
            .select('id, issue_id, reaction_type, created_at')
            .eq('user_id', user.id),
          supabase
            .from('user_bookmarks')
            .select('id, issue_id, created_at')
            .eq('user_id', user.id)
        ]);

        if (reactionsResponse.error) throw reactionsResponse.error;
        if (bookmarksResponse.error) throw bookmarksResponse.error;

        // Convert to lookup objects for O(1) access
        const reactions = (reactionsResponse.data || []).reduce((acc, reaction) => {
          const key = `${reaction.issue_id}-${reaction.reaction_type}`;
          acc[key] = reaction;
          return acc;
        }, {} as Record<string, UserReaction>);

        const bookmarks = (bookmarksResponse.data || []).reduce((acc, bookmark) => {
          acc[bookmark.issue_id] = bookmark;
          return acc;
        }, {} as Record<string, UserBookmark>);

        return {
          reactions,
          bookmarks,
          pendingReactions: new Set(),
          pendingBookmarks: new Set(),
        };
      } catch (error) {
        console.error('Error fetching user interactions:', error);
        return {
          reactions: {},
          bookmarks: {},
          pendingReactions: new Set(),
          pendingBookmarks: new Set(),
        };
      }
    },
    ...queryConfigs.user,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes - user interactions don't change frequently
  });

  // Memoized helper functions
  const hasReaction = useCallback((issueId: string, reactionType: string): boolean => {
    if (!userInteractions) return false;
    const key = `${issueId}-${reactionType}`;
    return key in userInteractions.reactions;
  }, [userInteractions]);

  const isBookmarked = useCallback((issueId: string): boolean => {
    if (!userInteractions) return false;
    return issueId in userInteractions.bookmarks;
  }, [userInteractions]);

  // Optimized reaction toggle with optimistic updates
  const toggleReaction = useMutation({
    mutationFn: async ({ issueId, reactionType }: { issueId: string; reactionType: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const key = `${issueId}-${reactionType}`;
      const hasExistingReaction = hasReaction(issueId, reactionType);

      if (hasExistingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('user_article_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
          .eq('reaction_type', reactionType);

        if (error) throw error;
        return { action: 'removed', issueId, reactionType };
      } else {
        // Add reaction
        const { error } = await supabase
          .from('user_article_reactions')
          .insert({
            user_id: user.id,
            issue_id: issueId,
            reaction_type: reactionType,
          });

        if (error) throw error;
        return { action: 'added', issueId, reactionType };
      }
    },
    onMutate: async ({ issueId, reactionType }) => {
      // Optimistic update
      if (!user?.id || !userInteractions) return;

      const key = `${issueId}-${reactionType}`;
      const previousData = userInteractions;

      queryClient.setQueryData(
        queryKeys.userReactions(user.id),
        (old: BatchedInteractions | undefined) => {
          if (!old) return old;

          const newData = { ...old };
          
          if (key in old.reactions) {
            // Remove reaction
            const { [key]: removed, ...remaining } = old.reactions;
            newData.reactions = remaining;
          } else {
            // Add reaction
            newData.reactions = {
              ...old.reactions,
              [key]: {
                id: 'temp-' + Date.now(),
                issue_id: issueId,
                reaction_type: reactionType,
                created_at: new Date().toISOString(),
              },
            };
          }

          return newData;
        }
      );

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousData && user?.id) {
        queryClient.setQueryData(queryKeys.userReactions(user.id), context.previousData);
      }
      
      console.error('Reaction toggle error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a reação.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.userReactions(user?.id || '') });
      
      console.log(`Reaction ${data.action} successfully for issue ${data.issueId}`);
    },
  });

  // Optimized bookmark toggle with optimistic updates
  const toggleBookmark = useMutation({
    mutationFn: async (issueId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const isCurrentlyBookmarked = isBookmarked(issueId);

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId);

        if (error) throw error;
        return { action: 'removed', issueId };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            issue_id: issueId,
          });

        if (error) throw error;
        return { action: 'added', issueId };
      }
    },
    onMutate: async (issueId) => {
      // Optimistic update
      if (!user?.id || !userInteractions) return;

      const previousData = userInteractions;

      queryClient.setQueryData(
        queryKeys.userReactions(user.id),
        (old: BatchedInteractions | undefined) => {
          if (!old) return old;

          const newData = { ...old };
          
          if (issueId in old.bookmarks) {
            // Remove bookmark
            const { [issueId]: removed, ...remaining } = old.bookmarks;
            newData.bookmarks = remaining;
          } else {
            // Add bookmark
            newData.bookmarks = {
              ...old.bookmarks,
              [issueId]: {
                id: 'temp-' + Date.now(),
                issue_id: issueId,
                created_at: new Date().toISOString(),
              },
            };
          }

          return newData;
        }
      );

      return { previousData };
    },
    onError: (error, issueId, context) => {
      // Revert optimistic update
      if (context?.previousData && user?.id) {
        queryClient.setQueryData(queryKeys.userReactions(user.id), context.previousData);
      }
      
      console.error('Bookmark toggle error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o marcador.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.userReactions(user?.id || '') });
      
      console.log(`Bookmark ${data.action} successfully for issue ${data.issueId}`);
    },
  });

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    hasReaction,
    isBookmarked,
    toggleReaction: toggleReaction.mutateAsync,
    toggleBookmark: toggleBookmark.mutateAsync,
    isUpdatingReaction: toggleReaction.isPending,
    isUpdatingBookmark: toggleBookmark.isPending,
    isLoading: isLoading && isAuthenticated,
  }), [
    hasReaction,
    isBookmarked,
    toggleReaction.mutateAsync,
    toggleBookmark.mutateAsync,
    toggleReaction.isPending,
    toggleBookmark.isPending,
    isLoading,
    isAuthenticated,
  ]);
};

