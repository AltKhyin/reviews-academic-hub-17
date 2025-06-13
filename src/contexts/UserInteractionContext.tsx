
// ABOUTME: Global context for user interactions (bookmarks/reactions) to prevent API cascade
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStableAuth } from '@/hooks/useStableAuth';

interface UserInteractionState {
  bookmarks: Set<string>;
  reactions: Map<string, string[]>;
  isLoading: boolean;
  error: string | null;
}

interface UserInteractionContextType extends UserInteractionState {
  toggleBookmark: (issueId: string) => Promise<void>;
  toggleReaction: (issueId: string, reactionType: string) => Promise<void>;
  hasBookmark: (issueId: string) => boolean;
  hasReaction: (issueId: string, reactionType: string) => boolean;
  getReactions: (issueId: string) => string[];
  refreshUserData: () => Promise<void>;
}

const UserInteractionContext = createContext<UserInteractionContextType | null>(null);

export const UserInteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useStableAuth();
  const [state, setState] = useState<UserInteractionState>({
    bookmarks: new Set(),
    reactions: new Map(),
    isLoading: false,
    error: null,
  });

  // Bulk fetch user interactions for all issues on the page
  const fetchUserInteractions = useCallback(async (issueIds: string[]) => {
    if (!user || !isAuthenticated || issueIds.length === 0) {
      setState(prev => ({ ...prev, bookmarks: new Set(), reactions: new Map() }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Single batch request for all bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('user_bookmarks')
        .select('issue_id')
        .eq('user_id', user.id)
        .in('issue_id', issueIds)
        .is('article_id', null);

      // Single batch request for all reactions
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('user_article_reactions')
        .select('issue_id, reaction_type')
        .eq('user_id', user.id)
        .in('issue_id', issueIds)
        .is('article_id', null);

      if (bookmarksError) throw bookmarksError;
      if (reactionsError) throw reactionsError;

      // Process bookmarks
      const bookmarkSet = new Set(bookmarksData?.map(b => b.issue_id) || []);

      // Process reactions
      const reactionMap = new Map<string, string[]>();
      reactionsData?.forEach(r => {
        if (!reactionMap.has(r.issue_id)) {
          reactionMap.set(r.issue_id, []);
        }
        reactionMap.get(r.issue_id)?.push(r.reaction_type);
      });

      setState(prev => ({
        ...prev,
        bookmarks: bookmarkSet,
        reactions: reactionMap,
        isLoading: false,
      }));

      console.log(`✅ User interactions loaded for ${issueIds.length} issues with 2 requests`);
    } catch (error) {
      console.error('Failed to fetch user interactions:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, [user, isAuthenticated]);

  // Auto-refresh when user changes
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setState(prev => ({ ...prev, bookmarks: new Set(), reactions: new Map() }));
    }
  }, [user, isAuthenticated]);

  const toggleBookmark = useCallback(async (issueId: string) => {
    if (!user || !isAuthenticated) return;

    const hasBookmark = state.bookmarks.has(issueId);

    try {
      if (hasBookmark) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
          .is('article_id', null);
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            issue_id: issueId,
            article_id: null,
          });
      }

      // Update local state optimistically
      setState(prev => {
        const newBookmarks = new Set(prev.bookmarks);
        if (hasBookmark) {
          newBookmarks.delete(issueId);
        } else {
          newBookmarks.add(issueId);
        }
        return { ...prev, bookmarks: newBookmarks };
      });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }, [user, isAuthenticated, state.bookmarks]);

  const toggleReaction = useCallback(async (issueId: string, reactionType: string) => {
    if (!user || !isAuthenticated) return;

    const currentReactions = state.reactions.get(issueId) || [];
    const hasReaction = currentReactions.includes(reactionType);

    try {
      if (hasReaction) {
        await supabase
          .from('user_article_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
          .eq('reaction_type', reactionType)
          .is('article_id', null);
      } else {
        await supabase
          .from('user_article_reactions')
          .insert({
            user_id: user.id,
            issue_id: issueId,
            article_id: null,
            reaction_type: reactionType,
          });
      }

      // Update local state optimistically
      setState(prev => {
        const newReactions = new Map(prev.reactions);
        let reactions = newReactions.get(issueId) || [];
        
        if (hasReaction) {
          reactions = reactions.filter(r => r !== reactionType);
        } else {
          reactions = [...reactions, reactionType];
        }
        
        newReactions.set(issueId, reactions);
        return { ...prev, reactions: newReactions };
      });
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, [user, isAuthenticated, state.reactions]);

  const hasBookmark = useCallback((issueId: string) => {
    return state.bookmarks.has(issueId);
  }, [state.bookmarks]);

  const hasReaction = useCallback((issueId: string, reactionType: string) => {
    const reactions = state.reactions.get(issueId) || [];
    return reactions.includes(reactionType);
  }, [state.reactions]);

  const getReactions = useCallback((issueId: string) => {
    return state.reactions.get(issueId) || [];
  }, [state.reactions]);

  const refreshUserData = useCallback(async () => {
    // This will be called by the parent component with current issue IDs
    // We don't have access to issue IDs here, so this is a placeholder
    console.log('UserInteractionContext: refreshUserData called');
  }, []);

  return (
    <UserInteractionContext.Provider value={{
      ...state,
      toggleBookmark,
      toggleReaction,
      hasBookmark,
      hasReaction,
      getReactions,
      refreshUserData,
      fetchUserInteractions, // Expose for parent components
    }}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteractions = () => {
  const context = useContext(UserInteractionContext);
  if (!context) {
    throw new Error('useUserInteractions must be used within UserInteractionProvider');
  }
  return context;
};

// Hook to initialize user interactions for a set of issues
export const useUserInteractionInit = (issueIds: string[]) => {
  const context = useContext(UserInteractionContext);
  
  useEffect(() => {
    if (context && issueIds.length > 0) {
      context.fetchUserInteractions(issueIds);
    }
  }, [context, issueIds.join(',')]);
  
  return context;
};
