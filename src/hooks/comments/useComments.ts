
import { EntityType } from '@/types/commentTypes';
import { useOptimizedComments } from './useOptimizedComments';

export const useComments = (entityId: string, entityType: 'article' | 'issue' | 'post' = 'issue') => {
  // Replace the old implementation with the new optimized hook
  const optimized = useOptimizedComments(entityType, entityId);

  // Adapt the voteComment signature for backward compatibility.
  // The old signature was an object: voteComment({ commentId, value })
  // The new signature uses direct arguments: voteComment(commentId, value)
  const voteCommentAdapter = async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
    return optimized.voteComment(commentId, value);
  };
  
  return {
    // Spread all properties from the optimized hook
    ...optimized,
    // Override voteComment with the backward-compatible adapter
    voteComment: voteCommentAdapter,
  };
};
