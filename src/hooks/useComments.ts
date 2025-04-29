
import { useCommentQueries } from './comment/useCommentQueries';
import { useCommentOrganizer } from './comment/useCommentOrganizer';
import { useCommentActions } from './comment/useCommentActions';

export const useComments = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const { commentsData, isLoading } = useCommentQueries(entityId, entityType);
  
  const organizedComments = useCommentOrganizer(commentsData);
  
  const { 
    addComment,
    replyToComment,
    deleteComment,
    voteComment,
    isAddingComment,
    isDeletingComment,
    isVoting,
    isReplying 
  } = useCommentActions(entityId, entityType);

  return {
    comments: organizedComments,
    isLoading,
    addComment,
    replyToComment,
    deleteComment,
    voteComment,
    isAddingComment,
    isDeletingComment,
    isVoting,
    isReplying
  };
};
