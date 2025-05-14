
import { EntityType, Comment } from '@/types/commentTypes';
import { useCommentFetch } from './useCommentFetch';
import { useCommentActions } from './useCommentActions';
import { useCommentVoting } from './useCommentVoting';

/**
 * Main hook that combines fetching, actions, and voting for comments
 */
export function useComments(entityId: string, entityType: EntityType = 'article') {
  const { comments, loading: isLoading, fetchComments, error } = useCommentFetch(entityId, entityType);
  
  const { 
    addComment, 
    replyToComment, 
    deleteComment,
    isAddingComment,
    isDeletingComment,
    isReplying
  } = useCommentActions(entityId, entityType, fetchComments);
  
  const { voteComment, isVoting } = useCommentVoting(fetchComments);

  return {
    comments,
    isLoading,
    addComment,
    replyToComment,
    deleteComment,
    voteComment,
    isAddingComment,
    isDeletingComment,
    isReplying,
    isVoting,
    fetchComments,
    error
  };
}

// Re-export from the new structure to maintain the original import path
export * from './useComments';
