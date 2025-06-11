
// ABOUTME: Comment actions hook with fixed entity validation and improved error handling
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/commentTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { buildCommentData } from '@/utils/commentHelpers';
import { useFileUpload } from '@/hooks/useFileUpload';

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
  const { uploadFile } = useFileUpload();
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // Validate entity exists before attempting to add comment
  const validateEntityExists = async (id: string, type: EntityType): Promise<boolean> => {
    try {
      const tableName = type === 'article' ? 'articles' : type === 'post' ? 'posts' : 'issues';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error(`Error validating ${type} exists:`, error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error(`Error in validateEntityExists for ${type}:`, err);
      return false;
    }
  };

  const addComment = async (content: string, imageUrl?: string): Promise<void> => {
    if (!user || !entityId || !entityType) {
      console.error('Missing requirements for comment:', { user: !!user, entityId, entityType });
      toast({
        title: "Erro de autenticação",
        description: "Faça login para comentar.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, escreva algo antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingComment(true);
    console.log(`Adding comment for ${entityType} ${entityId}:`, content.substring(0, 50) + '...');
    
    try {
      // Validate that the entity exists
      const entityExists = await validateEntityExists(entityId, entityType);
      if (!entityExists) {
        throw new Error(`${entityType === 'article' ? 'Artigo' : entityType === 'post' ? 'Publicação' : 'Edição'} não encontrada`);
      }

      let finalImageUrl = imageUrl;
      
      // Handle blob URL upload
      if (imageUrl && imageUrl.startsWith('blob:')) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'comment-image.jpg', { type: blob.type });
          finalImageUrl = await uploadFile(file, 'community/comments');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload da imagem.",
            variant: "destructive",
          });
          // Continue without image instead of failing completely
          finalImageUrl = undefined;
        }
      }
      
      // Build comment data with proper entity field
      const commentData = {
        ...buildCommentData(content, user.id, entityType, entityId),
        image_url: finalImageUrl || null
      };
      
      console.log('Inserting comment data:', commentData);
      
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

      if (error) {
        console.error('Supabase comment insert error:', error);
        throw error;
      }

      console.log('Comment inserted successfully:', newComment);

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
        } else {
          console.log('Auto-upvoted comment successfully');
        }
      }

      // Refresh comments to update the view
      if (fetchComments) {
        console.log('Refreshing comments after successful insert');
        await fetchComments();
      }
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Provide more specific error messages
      let errorMessage = "Não foi possível adicionar seu comentário.";
      
      if (error?.message?.includes('violates row-level security')) {
        errorMessage = "Você não tem permissão para comentar neste item.";
      } else if (error?.message?.includes('duplicate key')) {
        errorMessage = "Este comentário já foi enviado.";
      } else if (error?.message?.includes('não encontrada') || error?.message?.includes('not found')) {
        errorMessage = "O item que você está tentando comentar não foi encontrado.";
      }
      
      toast({
        title: "Erro ao adicionar comentário",
        description: errorMessage,
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
      // Validate entity exists
      const entityExists = await validateEntityExists(entityId, entityType);
      if (!entityExists) {
        throw new Error(`${entityType === 'article' ? 'Artigo' : entityType === 'post' ? 'Publicação' : 'Edição'} não encontrada`);
      }

      let finalImageUrl = imageUrl;
      
      // Handle blob URL upload
      if (imageUrl && imageUrl.startsWith('blob:')) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'comment-reply-image.jpg', { type: blob.type });
          finalImageUrl = await uploadFile(file, 'community/comments');
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload da imagem.",
            variant: "destructive",
          });
          finalImageUrl = undefined;
        }
      }
      
      // Create comment data with parent_id
      const commentData = {
        ...buildCommentData(content, user.id, entityType, entityId),
        parent_id: parentId,
        image_url: finalImageUrl || null
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
