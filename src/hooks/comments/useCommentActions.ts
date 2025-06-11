
// ABOUTME: Fixed comment actions with proper error handling and entity validation
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EntityType } from '@/types/commentTypes';
import { buildCommentData } from '@/utils/commentHelpers';

export function useCommentActions(
  entityId: string, 
  entityType: EntityType,
  fetchComments: () => Promise<void>
) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const addComment = async (content: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to comment');
    }

    if (!entityId) {
      throw new Error('Entity ID is required');
    }

    setIsAddingComment(true);
    try {
      // First verify the entity exists
      const entityTable = entityType === 'article' ? 'articles' : 
                         entityType === 'post' ? 'posts' : 'issues';
      
      const { data: entityExists, error: entityError } = await supabase
        .from(entityTable)
        .select('id')
        .eq('id', entityId)
        .maybeSingle();

      if (entityError) {
        console.error(`Error checking entity existence:`, entityError);
        throw new Error(`Failed to verify ${entityType} exists`);
      }

      if (!entityExists) {
        throw new Error(`${entityType} not found`);
      }

      // Build comment data with proper entity field
      const commentData = buildCommentData(content, user.id, entityType, entityId);

      const { error: insertError } = await supabase
        .from('comments')
        .insert(commentData);

      if (insertError) {
        console.error('Error inserting comment:', insertError);
        throw insertError;
      }

      // Refresh comments after successful insertion
      await fetchComments();
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    } finally {
      setIsAddingComment(false);
    }
  };

  const replyToComment = async ({ parentId, content }: { parentId: string; content: string }): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to reply');
    }

    setIsReplying(true);
    try {
      const commentData = buildCommentData(content, user.id, entityType, entityId, parentId);

      const { error } = await supabase
        .from('comments')
        .insert(commentData);

      if (error) throw error;

      await fetchComments();
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    } finally {
      setIsReplying(false);
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to delete comments');
    }

    setIsDeletingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete own comments

      if (error) throw error;

      await fetchComments();
      
      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeletingComment(false);
    }
  };

  return {
    addComment,
    replyToComment,
    deleteComment,
    isAddingComment,
    isDeletingComment,
    isReplying
  };
}
