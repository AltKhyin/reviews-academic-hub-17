
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

export interface ReviewerComment {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  comment: string;
  created_at: string;
}

export const useReviewerComments = (enableFetching: boolean = false) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Only enable fetching on homepage or when explicitly requested
  const shouldFetch = enableFetching || location.pathname === '/';

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['reviewer-comments'],
    queryFn: async () => {
      console.log("Fetching reviewer comments for:", location.pathname);
      
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reviewer comments:", error);
        throw error;
      }

      console.log("Fetched reviewer comments:", data?.length || 0, "comments");
      return data as ReviewerComment[];
    },
    enabled: shouldFetch,
    refetchInterval: shouldFetch ? 5 * 60 * 1000 : false, // 5 minutes instead of 30 seconds, only when enabled
    staleTime: 10 * 60 * 1000, // 10 minutes - comments don't change frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const addComment = useMutation({
    mutationFn: async ({ 
      comment, 
      reviewerName, 
      reviewerAvatar 
    }: { 
      comment: string; 
      reviewerName: string; 
      reviewerAvatar: string; 
    }) => {
      console.log("Adding reviewer comment:", { comment, reviewerName, reviewerAvatar });
      
      const { data, error } = await supabase
        .from('reviewer_comments')
        .insert({
          reviewer_id: (await supabase.auth.getUser()).data.user?.id,
          reviewer_name: reviewerName,
          reviewer_avatar: reviewerAvatar,
          comment: comment,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding reviewer comment:", error);
        throw error;
      }

      console.log("Added reviewer comment:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewer-comments'] });
      toast({
        title: "Comentário adicionado",
        description: "O comentário do revisor foi publicado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive"
      });
    }
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      console.log("Deleting reviewer comment:", commentId);
      
      const { error } = await supabase
        .from('reviewer_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error("Error deleting reviewer comment:", error);
        throw error;
      }

      console.log("Deleted reviewer comment:", commentId);
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewer-comments'] });
      toast({
        title: "Comentário removido",
        description: "O comentário foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o comentário.",
        variant: "destructive"
      });
    }
  });

  const hasComments = comments && comments.length > 0;

  return {
    comments,
    hasComments,
    isLoading: shouldFetch ? isLoading : false,
    addComment,
    deleteComment
  };
};
