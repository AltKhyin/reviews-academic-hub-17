
// ABOUTME: Global context for user interactions (bookmarks/reactions) to prevent API cascade
// Centralizes user interaction data with bulk fetching to reduce API calls from 100+ to <10

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  initializeUserInteractions: (issueIds: string[]) => Promise<void>;
}

const UserInteractionContext = createContext<UserInteractionContextType | null>(null);

export const UserInteractionProvider: React.FC<{ 
  children: React.ReactNode; 
  issueIds?: string[]; 
}> = ({ children, issueIds = [] }) => {
  const { user } = useAuth();
  const [state, setState] = useState<UserInteractionState>({
    bookmarks: new Set(),
    reactions: new Map(),
    isLoading: false,
    error: null,
  });

  // Bulk fetch user interactions for all issues - CRITICAL: Single API call instead of 100+
  const initializeUserInteractions = useCallback(async (ids: string[]) => {
    if (!user?.id || ids.length === 0) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // PERFORMANCE FIX: Single batch call for ALL user interactions
      const [bookmarksResponse, reactionsResponse] = await Promise.all([
        supabase
          .from('user_bookmarks')
          .select('issue_id')
          .eq('user_id', user.id)
          .in('issue_id', ids),
        supabase
          .from('user_article_reactions')
          .select('issue_id, reaction_type')
          .eq('user_id', user.id)
          .in('issue_id', ids)
      ]);

      if (bookmarksResponse.error) throw bookmarksResponse.error;
      if (reactionsResponse.error) throw reactionsResponse.error;

      // Build efficient lookup structures
      const bookmarks = new Set(bookmarksResponse.data?.map(b => b.issue_id) || []);
      const reactions = new Map<string, string[]>();
      
      reactionsResponse.data?.forEach(r => {
        const existing = reactions.get(r.issue_id) || [];
        reactions.set(r.issue_id, [...existing, r.reaction_type]);
      });

      setState(prev => ({
        ...prev,
        bookmarks,
        reactions,
        isLoading: false,
      }));

      console.log(`UserInteractionContext: Loaded interactions for ${ids.length} issues with 2 API calls`);
    } catch (error) {
      console.error('Error loading user interactions:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load interactions',
        isLoading: false,
      }));
    }
  }, [user?.id]);

  // Initialize on mount and when issueIds change
  useEffect(() => {
    if (issueIds.length > 0) {
      initializeUserInteractions(issueIds);
    }
  }, [issueIds, initializeUserInteractions]);

  // Bookmark toggle with optimistic updates
  const toggleBookmark = useCallback(async (issueId: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar artigos.",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlyBookmarked = state.bookmarks.has(issueId);

    // Optimistic update
    setState(prev => {
      const newBookmarks = new Set(prev.bookmarks);
      if (isCurrentlyBookmarked) {
        newBookmarks.delete(issueId);
      } else {
        newBookmarks.add(issueId);
      }
      return { ...prev, bookmarks: newBookmarks };
    });

    try {
      if (isCurrentlyBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({ user_id: user.id, issue_id: issueId });
        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      setState(prev => {
        const newBookmarks = new Set(prev.bookmarks);
        if (isCurrentlyBookmarked) {
          newBookmarks.add(issueId);
        } else {
          newBookmarks.delete(issueId);
        }
        return { ...prev, bookmarks: newBookmarks };
      });

      console.error('Bookmark toggle error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o marcador.",
        variant: "destructive"
      });
    }
  }, [user?.id, state.bookmarks]);

  // Reaction toggle with optimistic updates
  const toggleReaction = useCallback(async (issueId: string, reactionType: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para reagir.",
        variant: "destructive"
      });
      return;
    }

    const currentReactions = state.reactions.get(issueId) || [];
    const hasReaction = currentReactions.includes(reactionType);

    // Optimistic update
    setState(prev => {
      const newReactions = new Map(prev.reactions);
      if (hasReaction) {
        const filtered = currentReactions.filter(r => r !== reactionType);
        if (filtered.length === 0) {
          newReactions.delete(issueId);
        } else {
          newReactions.set(issueId, filtered);
        }
      } else {
        newReactions.set(issueId, [...currentReactions, reactionType]);
      }
      return { ...prev, reactions: newReactions };
    });

    try {
      if (hasReaction) {
        const { error } = await supabase
          .from('user_article_reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('issue_id', issueId)
          .eq('reaction_type', reactionType);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_article_reactions')
          .insert({ 
            user_id: user.id, 
            issue_id: issueId, 
            reaction_type: reactionType 
          });
        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      setState(prev => {
        const newReactions = new Map(prev.reactions);
        if (hasReaction) {
          newReactions.set(issueId, [...currentReactions, reactionType]);
        } else {
          const filtered = currentReactions.filter(r => r !== reactionType);
          if (filtered.length === 0) {
            newReactions.delete(issueId);
          } else {
            newReactions.set(issueId, filtered);
          }
        }
        return { ...prev, reactions: newReactions };
      });

      console.error('Reaction toggle error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a reação.",
        variant: "destructive"
      });
    }
  }, [user?.id, state.reactions]);

  // Helper functions
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

  const contextValue = useMemo(() => ({
    ...state,
    toggleBookmark,
    toggleReaction,
    hasBookmark,
    hasReaction,
    getReactions,
    initializeUserInteractions,
  }), [state, toggleBookmark, toggleReaction, hasBookmark, hasReaction, getReactions, initializeUserInteractions]);

  return (
    <UserInteractionContext.Provider value={contextValue}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteractionContext = () => {
  const context = useContext(UserInteractionContext);
  if (!context) {
    throw new Error('useUserInteractionContext must be used within a UserInteractionProvider');
  }
  return context;
};
