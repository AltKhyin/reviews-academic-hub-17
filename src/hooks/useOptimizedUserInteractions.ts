
// ABOUTME: Optimized user interactions hook using global context to prevent API cascade
import { useUserInteractionContext } from '@/contexts/UserInteractionContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useOptimizedUserInteractions = () => {
  const { user } = useAuth();
  const {
    userInteractions,
    isBookmarked,
    hasReaction,
    getVote,
    toggleBookmark: contextToggleBookmark,
    toggleReaction: contextToggleReaction,
    updateVote: contextUpdateVote,
    isUpdating,
    batchLoadUserData
  } = useUserInteractionContext();

  const checkAuthAndProceed = (callback: () => Promise<void>) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "Você precisa estar logado para realizar essa ação",
      });
      return;
    }
    callback();
  };

  const toggleBookmark = (itemId: string) => {
    checkAuthAndProceed(() => contextToggleBookmark(itemId));
  };

  const toggleReaction = (params: { issueId: string; reactionType: string }) => {
    checkAuthAndProceed(() => contextToggleReaction(params));
  };

  const updateVote = (itemId: string, value: number) => {
    checkAuthAndProceed(() => contextUpdateVote(itemId, value));
  };

  return {
    // State accessors
    isBookmarked,
    hasReaction,
    getVote,

    // Actions
    toggleBookmark,
    toggleReaction,
    updateVote,
    batchLoadUserData,

    // Loading states
    isUpdatingBookmark: isUpdating,
    isUpdatingReaction: isUpdating,
    isUpdatingVote: isUpdating,

    // User state
    isAuthenticated: !!user,
    userInteractions
  };
};
