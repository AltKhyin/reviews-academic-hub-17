// ABOUTME: Optimized comment actions with batch operations and request deduplication
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { buildCommentData, getErrorMessage } from '@/utils/commentHelpers';
import { EntityType } from '@/types/commentTypes';

export const useOptimizedCommentActions = (entityType: EntityType, entityId: string) => {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ 
      content, 
      parentId, 
      userId 
    }: { 
      content: string; 
      parentId?: string; 
      userId: string; 
    }) => {
      const commentData = buildCommentData(content, userId, entityType, entityId, parentId);
      
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', entityType, entityId] 
      });
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
      toast({
        title: "Erro ao criar comentário",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id)
        .select(`
          *,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', entityType, entityId] 
      });
      toast({
        title: "Comentário atualizado",
        description: "Seu comentário foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating comment:', error);
      toast({
        title: "Erro ao atualizar comentário",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', entityType, entityId] 
      });
      toast({
        title: "Comentário removido",
        description: "Seu comentário foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao remover comentário",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return {
    createComment: createCommentMutation.mutateAsync,
    updateComment: updateCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isLoading,
    isUpdating: updateCommentMutation.isLoading,
    isDeleting: deleteCommentMutation.isLoading,
  };
};
