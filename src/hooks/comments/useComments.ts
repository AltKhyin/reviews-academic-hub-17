
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment, BaseComment, EntityType } from '@/types/commentTypes';
import { toast } from '@/components/ui/use-toast';
import { buildCommentData } from '@/utils/commentHelpers';
import { useCommentFetch } from './useCommentFetch';
import { useCommentVoting } from './useCommentVoting';
import { useCommentActions } from './useCommentActions';

export const useComments = (entityId: string, entityType: EntityType = 'article') => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use hook for fetching comments
  const { comments, loading, error, fetchComments } = useCommentFetch(entityId, entityType);
  
  // Use hook for voting on comments
  const { voteComment, isVoting } = useCommentVoting(fetchComments);
  
  // Use hook for comment actions (edit, delete)
  const { 
    addComment: addCommentAction, 
    replyToComment, 
    editComment, 
    deleteComment, 
    isAddingComment, 
    isDeletingComment, 
    isReplying 
  } = useCommentActions(entityId, entityType, fetchComments);

  // Function to add a new comment
  const addComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Comment content cannot be empty', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (parentId) {
        await replyToComment({ parentId, content });
      } else {
        await addCommentAction(content);
      }
      
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    isLoading: loading,  // Rename to match expected property in CommentSection
    error,
    addComment,
    replyToComment,
    deleteComment,
    voteComment,       // Return voteComment instead of voteOnComment
    isAddingComment,
    isDeletingComment,
    isReplying,
    isVoting
  };
};

export * from './useCommentFetch';
export * from './useCommentVoting';
export * from './useCommentActions';
