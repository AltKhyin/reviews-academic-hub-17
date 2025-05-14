
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
  const { voteOnComment } = useCommentVoting(fetchComments);
  
  // Use hook for comment actions (edit, delete)
  const { editComment, deleteComment } = useCommentActions(fetchComments);

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
      // Get the current user's ID from auth context
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User is not authenticated');

      // Build comment data object
      const data = buildCommentData(
        content,
        user.id,
        entityType,
        entityId,
        parentId
      );

      // Insert the comment
      const { error } = await supabase.from('comments').insert(data);
      if (error) throw error;

      // Refresh the comments list
      fetchComments();
      
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
    loading,
    error,
    addComment,
    voteOnComment,
    editComment,
    deleteComment,
    isSubmitting
  };
};

export * from './useCommentFetch';
export * from './useCommentVoting';
export * from './useCommentActions';
