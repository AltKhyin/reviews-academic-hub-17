
// ABOUTME: Migrated user interactions to use unified data access layer
import { useUnifiedQuery } from './useUnifiedQuery';
import { useAuth } from '@/contexts/AuthContext';
import { DataAccessLayer } from '@/core/DataAccessLayer';
import { useCallback } from 'react';

export const useOptimizedUserInteractions = (issueIds: string[] = []) => {
  const { user } = useAuth();
  const dataLayer = DataAccessLayer.getInstance();

  // Bulk load user interactions using unified system
  const { data: interactions, isLoading, error, refetch } = useUnifiedQuery(
    ['user-interactions', user?.id, ...issueIds.sort()],
    async () => {
      if (!user?.id || issueIds.length === 0) return { bookmarks: [], reactions: [] };

      // Use unified data layer for bulk operations
      const [bookmarksResult, reactionsResult] = await Promise.all([
        dataLayer.executeOperation({
          type: 'query',
          resource: 'user_bookmarks',
          parameters: {
            user_id: user.id,
            issue_ids: issueIds
          }
        }),
        dataLayer.executeOperation({
          type: 'query',
          resource: 'user_article_reactions',
          parameters: {
            user_id: user.id,
            issue_ids: issueIds
          }
        })
      ]);

      return {
        bookmarks: bookmarksResult.data || [],
        reactions: reactionsResult.data || []
      };
    },
    { 
      priority: 'normal',
      enabled: !!user?.id && issueIds.length > 0
    }
  );

  const toggleBookmark = useCallback(async (issueId: string) => {
    if (!user?.id) return;

    const existingBookmark = interactions?.bookmarks?.find(b => b.issue_id === issueId);
    
    if (existingBookmark) {
      await dataLayer.executeOperation({
        type: 'mutation',
        resource: 'user_bookmarks',
        parameters: {
          action: 'delete',
          id: existingBookmark.id
        }
      });
    } else {
      await dataLayer.executeOperation({
        type: 'mutation',
        resource: 'user_bookmarks',
        parameters: {
          action: 'insert',
          data: {
            user_id: user.id,
            issue_id: issueId
          }
        }
      });
    }

    refetch();
  }, [user?.id, interactions, dataLayer, refetch]);

  const toggleReaction = useCallback(async (issueId: string, reactionType: string) => {
    if (!user?.id) return;

    const existingReaction = interactions?.reactions?.find(
      r => r.issue_id === issueId && r.reaction_type === reactionType
    );
    
    if (existingReaction) {
      await dataLayer.executeOperation({
        type: 'mutation',
        resource: 'user_article_reactions',
        parameters: {
          action: 'delete',
          id: existingReaction.id
        }
      });
    } else {
      await dataLayer.executeOperation({
        type: 'mutation',
        resource: 'user_article_reactions',
        parameters: {
          action: 'insert',
          data: {
            user_id: user.id,
            issue_id: issueId,
            reaction_type: reactionType
          }
        }
      });
    }

    refetch();
  }, [user?.id, interactions, dataLayer, refetch]);

  return {
    bookmarks: interactions?.bookmarks || [],
    reactions: interactions?.reactions || [],
    isLoading,
    error,
    toggleBookmark,
    toggleReaction,
    hasBookmark: (issueId: string) => 
      interactions?.bookmarks?.some(b => b.issue_id === issueId) || false,
    hasReaction: (issueId: string, reactionType: string) => 
      interactions?.reactions?.some(r => r.issue_id === issueId && r.reaction_type === reactionType) || false
  };
};
