
// ABOUTME: Unified comment management with optimized data fetching and comprehensive interface
import { useOptimizedCommentActions } from './useOptimizedCommentActions';
import { useOptimizedCommentVoting } from './useOptimizedCommentVoting';
import { useCommentFetch } from './useCommentFetch';
import { EntityType } from '@/types/commentTypes';

export const useOptimizedComments = (entityType: EntityType, entityId: string) => {
  const commentFetch = useCommentFetch(entityId, entityType);
  const commentActions = useOptimizedCommentActions(entityType, entityId);
  const commentVoting = useOptimizedCommentVoting(entityType, entityId);

  // Create unified interface with proper method names
  const addComment = async (content: string, userId: string) => {
    return commentActions.createComment({ content, userId });
  };

  const replyToComment = async (content: string, parentId: string, userId: string) => {
    return commentActions.createComment({ content, parentId, userId });
  };

  return {
    // Data
    ...commentFetch,
    
    // Actions with unified naming
    addComment,
    replyToComment,
    updateComment: commentActions.updateComment,
    deleteComment: commentActions.deleteComment,
    
    // Voting
    ...commentVoting,
    
    // Loading states with unified naming
    isLoading: commentFetch.loading, // Explicitly expose isLoading to fix type inference issues
    isAddingComment: commentActions.isCreating,
    isDeletingComment: commentActions.isDeleting,
    isReplying: commentActions.isCreating,
    isUpdating: commentActions.isUpdating,
  };
};
