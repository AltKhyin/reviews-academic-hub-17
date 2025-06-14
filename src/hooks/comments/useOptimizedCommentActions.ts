// ABOUTME: Hook for comment actions (create, update, delete). Placeholder.
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EntityType } from '@/types/commentTypes';
import { toast } from '@/hooks/use-toast';

export const useOptimizedCommentActions = (entityType: EntityType, entityId: string) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryKey = ['comments', entityType, entityId];

  const createComment = useCallback(async (params: { content: string; userId: string; parentId?: string }) => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para comentar.",
          variant: "destructive",
        });
        return;
      }

      const { content, parentId, userId } = params;

      const { data: newComment, error } = await supabase
        .from('comments')
        .insert([{
          content,
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
          parent_id: parentId || null,
        }])
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            avatar_url
          ),
          score,
          parent_id
        `)
        .single();

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Comentário Adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }, [entityId, entityType, queryClient]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Comentário Atualizado",
        description: "Seu comentário foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient, queryKey]);

  const deleteComment = useCallback(async (commentId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Comentário Excluído",
        description: "Seu comentário foi excluído com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [queryClient, queryKey]);

  return {
    isCreating,
    isUpdating,
    isDeleting,
    createComment,
    updateComment,
    deleteComment,
  };
};
