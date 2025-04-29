
import { useCommentQueries } from './comment/useCommentQueries';
import { useCommentOrganizer } from './comment/useCommentOrganizer';
import { useCommentActions } from './comment/useCommentActions';

export const useComments = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const { commentsData, isLoading } = useCommentQueries(entityId, entityType);
  
  const organizedComments = useCommentOrganizer(commentsData);
  
  const { 
    addComment: addCommentAction,
    replyToComment: replyToCommentAction,
    deleteComment: deleteCommentAction,
    voteComment: voteCommentAction,
    isAddingComment,
    isDeletingComment,
    isVoting,
    isReplying 
  } = useCommentActions(entityId, entityType);

  // Wrap action functions to return promises
  const addComment = async (content: string): Promise<void> => {
    await addCommentAction(content);
  };

  const replyToComment = async (parentId: string, content: string): Promise<void> => {
    await replyToCommentAction(parentId, content);
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    await deleteCommentAction(commentId);
  };

  const voteComment = async (params: { commentId: string; value: 1 | -1 | 0 }): Promise<void> => {
    await voteCommentAction(params);
  };

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
