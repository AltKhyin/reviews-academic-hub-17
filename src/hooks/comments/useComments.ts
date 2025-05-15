
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Comment, EntityType } from '@/types/commentTypes';
import { useCommentActions } from './useCommentActions';
import { useCommentVoting } from './useCommentVoting';
import { useCommentFetch } from './useCommentFetch';

export const useComments = (entityId: string, entityType: 'article' | 'issue' | 'post' = 'issue') => {
  // Use the dedicated hooks for fetching comments
  const { comments, loading: isLoading, error, fetchComments } = useCommentFetch(entityId, entityType);
  
  // Use the dedicated hooks for comment actions
  const { 
    addComment, 
    replyToComment, 
    deleteComment,
    isAddingComment, 
    isDeletingComment,
    isReplying
  } = useCommentActions(entityId, entityType, fetchComments);
  
  // Use the dedicated hook for voting
  const { voteComment, isVoting } = useCommentVoting(fetchComments);
  
  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments,
    // Comment action methods
    addComment,
    replyToComment,
    deleteComment,
    // Voting method
    voteComment,
    // Loading states
    isAddingComment,
    isDeletingComment,
    isReplying,
    isVoting
  };
};
