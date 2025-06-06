
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { buildCommentData } from '@/utils/commentHelpers';

/**
 * Hook for comment actions (add, reply, delete, vote)
 */
export function useCommentActions(
  entityId?: string, 
  entityType?: EntityType,
  fetchComments?: () => Promise<void>
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const addComment = async (content: string, imageUrl?: string): Promise<void> => {
    if (!user || !entityId || !entityType) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para comentar.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) return;

    setIsAddingComment(true);
    try {
      // Create the data object with the right entity ID field
      const commentData = {
        ...buildCommentData(content, user.id, entityType, entityId),
        image_url: imageUrl || null
      };
      
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          profiles:user_id (
            id, 
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Auto-upvote the user's own comment
      if (newComment) {
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: newComment.id,
            user_id: user.id,
            value: 1
          });
          
        if (voteError) {
          console.error('Error auto-upvoting comment:', voteError);
        }
      }

      // Refresh comments to update the view
      if (fetchComments) await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar seu comentário.",
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const replyToComment = async ({ parentId, content, imageUrl }: { parentId: string; content: string; imageUrl?: string }): Promise<void> => {
    if (!user || !entityId || !entityType) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para responder aos comentários.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) return;

    setIsReplying(true);
    try {
      // Create comment data with parent_id
      const commentData = {
        ...buildCommentData(content, user.id, entityType, entityId),
        parent_id: parentId,
        image_url: imageUrl || null
      };
      
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;

      // Auto-upvote the user's own reply
      if (newReply) {
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: newReply.id,
            user_id: user.id,
            value: 1
          });
          
        if (voteError) {
          console.error('Error auto-upvoting reply:', voteError);
        }
      }

      // Refresh all comments to get the proper structure
      if (fetchComments) await fetchComments();
    } catch (error) {
      console.error('Error replying to comment:', error);
      toast({
        title: "Erro ao responder",
        description: "Não foi possível adicionar sua resposta.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const editComment = async (id: string, content: string): Promise<void> => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh comments to update the view
      if (fetchComments) await fetchComments();
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: "Erro ao editar",
        description: "Não foi possível editar o comentário.",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    if (!user) return;

    setIsDeletingComment(true);
    try {
      // Delete comment votes first
      await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', id);
        
      // Then delete the comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh comments to update the view
      if (fetchComments) await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  return {
    addComment,
    replyToComment,
    editComment,
    deleteComment,
    isAddingComment,
    isDeletingComment,
    isReplying
  };
}
