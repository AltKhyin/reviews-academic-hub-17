
// ABOUTME: Global user interaction context to prevent API cascade from user data requests
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRequestBatcher } from '@/hooks/useRequestBatcher';

interface UserInteraction {
  bookmarks: Set<string>;
  reactions: Record<string, string[]>;
  votes: Record<string, number>;
}

interface UserInteractionContextType {
  userInteractions: UserInteraction;
  isBookmarked: (itemId: string) => boolean;
  hasReaction: (itemId: string, reactionType: string) => boolean;
  getVote: (itemId: string) => number;
  toggleBookmark: (itemId: string) => Promise<void>;
  toggleReaction: (params: { issueId: string; reactionType: string }) => Promise<void>;
  updateVote: (itemId: string, value: number) => Promise<void>;
  isUpdating: boolean;
  batchLoadUserData: (itemIds: string[]) => Promise<void>;
}

const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);

export const UserInteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { batchRequest } = useRequestBatcher();
  const [userInteractions, setUserInteractions] = useState<UserInteraction>({
    bookmarks: new Set(),
    reactions: {},
    votes: {}
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Batch load user data for multiple items to prevent cascade
  const batchLoadUserData = useCallback(async (itemIds: string[]) => {
    if (!user || itemIds.length === 0) return;

    try {
      // Batch fetch all user interactions in parallel
      const [bookmarksData, reactionsData, votesData] = await Promise.all([
        supabase
          .from('user_bookmarks')
          .select('issue_id')
          .eq('user_id', user.id)
          .in('issue_id', itemIds),
        
        supabase
          .from('user_article_reactions')
          .select('issue_id, reaction_type')
          .eq('user_id', user.id)
          .in('issue_id', itemIds),
        
        supabase
          .from('comment_votes')
          .select('comment_id, value')
          .eq('user_id', user.id)
      ]);

      setUserInteractions(prev => ({
        bookmarks: new Set([
          ...prev.bookmarks,
          ...(bookmarksData.data?.map(b => b.issue_id) || [])
        ]),
        reactions: {
          ...prev.reactions,
          ...(reactionsData.data?.reduce((acc, r) => {
            if (!acc[r.issue_id]) acc[r.issue_id] = [];
            acc[r.issue_id].push(r.reaction_type);
            return acc;
          }, {} as Record<string, string[]>) || {})
        },
        votes: {
          ...prev.votes,
          ...(votesData.data?.reduce((acc, v) => {
            acc[v.comment_id] = v.value;
            return acc;
          }, {} as Record<string, number>) || {})
        }
      }));

      console.log(`🚀 Batch loaded user data for ${itemIds.length} items`);
    } catch (error) {
      console.error('Error batch loading user data:', error);
    }
  }, [user, batchRequest]);

  // Optimized individual interaction functions
  const isBookmarked = useCallback((itemId: string) => 
    userInteractions.bookmarks.has(itemId), [userInteractions.bookmarks]);

  const hasReaction = useCallback((itemId: string, reactionType: string) => 
    userInteractions.reactions[itemId]?.includes(reactionType) || false, [userInteractions.reactions]);

  const getVote = useCallback((itemId: string) => 
    userInteractions.votes[itemId] || 0, [userInteractions.votes]);

  const toggleBookmark = useCallback(async (itemId: string) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const isCurrentlyBookmarked = userInteractions.bookmarks.has(itemId);
      
      if (isCurrentlyBookmarked) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', itemId);
        
        setUserInteractions(prev => {
          const newBookmarks = new Set(prev.bookmarks);
          newBookmarks.delete(itemId);
          return { ...prev, bookmarks: newBookmarks };
        });
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({ user_id: user.id, issue_id: itemId });
        
        setUserInteractions(prev => ({
          ...prev,
          bookmarks: new Set([...prev.bookmarks, itemId])
        }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, userInteractions.bookmarks]);

  const toggleReaction = useCallback(async ({ issueId, reactionType }: { issueId: string; reactionType: string }) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const currentReactions = userInteractions.reactions[issueId] || [];
      const hasCurrentReaction = currentReactions.includes(reactionType);
      
      if (hasCurrentReaction) {
        await supabase
          .from('user_article_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
          .eq('reaction_type', reactionType);
        
        setUserInteractions(prev => ({
          ...prev,
          reactions: {
            ...prev.reactions,
            [issueId]: currentReactions.filter(r => r !== reactionType)
          }
        }));
      } else {
        await supabase
          .from('user_article_reactions')
          .insert({ user_id: user.id, issue_id: issueId, reaction_type: reactionType });
        
        setUserInteractions(prev => ({
          ...prev,
          reactions: {
            ...prev.reactions,
            [issueId]: [...currentReactions, reactionType]
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, userInteractions.reactions]);

  const updateVote = useCallback(async (itemId: string, value: number) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      if (value === 0) {
        await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', itemId);
      } else {
        await supabase
          .from('comment_votes')
          .upsert({ user_id: user.id, comment_id: itemId, value });
      }
      
      setUserInteractions(prev => ({
        ...prev,
        votes: { ...prev.votes, [itemId]: value }
      }));
    } catch (error) {
      console.error('Error updating vote:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    userInteractions,
    isBookmarked,
    hasReaction,
    getVote,
    toggleBookmark,
    toggleReaction,
    updateVote,
    isUpdating,
    batchLoadUserData
  }), [
    userInteractions,
    isBookmarked,
    hasReaction,
    getVote,
    toggleBookmark,
    toggleReaction,
    updateVote,
    isUpdating,
    batchLoadUserData
  ]);

  return (
    <UserInteractionContext.Provider value={contextValue}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteractionContext = () => {
  const context = useContext(UserInteractionContext);
  if (!context) {
    throw new Error('useUserInteractionContext must be used within UserInteractionProvider');
  }
  return context;
};
