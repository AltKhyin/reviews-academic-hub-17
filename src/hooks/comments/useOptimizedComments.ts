
// ABOUTME: Optimized comments system with intelligent caching and minimal refetches
import { useUnifiedQuery } from '@/hooks/useUnifiedQuery';
import { Comment, EntityType } from '@/types/commentTypes';
import { useOptimizedCommentActions } from './useOptimizedCommentActions';
import { useOptimizedCommentVoting } from './useOptimizedCommentVoting';
import { fetchCommentsData, appendUserVotesToComments } from '@/utils/commentFetch';
import { organizeCommentsInTree } from '@/utils/commentOrganize';

export const useOptimizedComments = (entityId: string, entityType: EntityType = 'issue') => {
  // Main comments query with intelligent caching
  const { 
    data: comments = [], 
    isLoading, 
    error,
    refetch
  } = useUnifiedQuery<Comment[]>(
    ['comments', entityType, entityId],
    async () => {
      console.log(`Fetching comments for ${entityType} with ID: ${entityId}`);
      const { comments: fetchedComments, userVotes } = await fetchCommentsData(entityId, entityType);
      
      const commentsWithVotes = appendUserVotesToComments(fetchedComments, userVotes);
      return organizeCommentsInTree(commentsWithVotes);
    },
    {
      priority: 'normal',
      staleTime: 5 * 60 * 1000, // 5 minutes - comments don't change that often
      enableMonitoring: false, // Reduce console noise
      rateLimit: {
        endpoint: 'comments',
        maxRequests: 20,
        windowMs: 60000,
      },
    }
  );

  // Create a wrapper function that matches the expected signature
  const refetchComments = async () => {
    await refetch();
  };

  // Optimized comment actions that use local state management
  const { 
    addComment, 
    replyToComment, 
    deleteComment,
    isAddingComment, 
    isDeletingComment,
    isReplying
  } = useOptimizedCommentActions(entityId, entityType, refetchComments);

  // Optimized voting that doesn't trigger full refetches
  const { voteComment, isVoting } = useOptimizedCommentVoting(entityType, entityId);

  return {
    comments,
    isLoading,
    error,
    refetch: refetchComments,
    addComment,
    replyToComment,
    deleteComment,
    voteComment,
    isAddingComment,
    isDeletingComment,
    isReplying,
    isVoting
  };
};
