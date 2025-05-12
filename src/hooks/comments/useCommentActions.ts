
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
  entityId: string, 
  entityType: EntityType = 'article',
  fetchComments: () => Promise<void>
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const addComment = async (content: string): Promise<void> => {
    if (!user) {
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
      const commentData = buildCommentData(content, user.id, entityType, entityId);
      
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

      // Auto-upvote the user's own comment as a separate operation
      if (newComment) {
        await supabase
          .from('comment_votes')
          .insert({
            comment_id: newComment.id,
            user_id: user.id,
            value: 1
          });
      }

      // Refresh comments to update the view
      await fetchComments();
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

  const replyToComment = async ({ parentId, content }: { parentId: string; content: string }): Promise<void> => {
    if (!user) {
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
        parent_id: parentId
      };
      
      const { data: newReply, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;

      // Auto-upvote the user's own reply as a separate operation
      if (newReply) {
        await supabase
          .from('comment_votes')
          .insert({
            comment_id: newReply.id,
            user_id: user.id,
            value: 1
          });
      }

      // Refresh all comments to get the proper structure
      await fetchComments();
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

  const deleteComment = async (id: string): Promise<void> => {
    if (!user) return;

    setIsDeletingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh comments to update the view
      await fetchComments();
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
    deleteComment,
    isAddingComment,
    isDeletingComment,
    isReplying
  };
}
