
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ReviewerComment {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  comment: string;
  created_at: string;
}

export const useReviewerComments = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Only fetch on homepage or when explicitly needed
  const shouldFetch = location.pathname === '/homepage' || location.pathname === '/';

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['reviewer-comments'],
    queryFn: async () => {
      // Only log when actually fetching, not on every hook call
      console.log("Fetching reviewer comments for homepage...");
      
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5); // Limit to reduce data transfer

      if (error) {
        console.error("Error fetching reviewer comments:", error);
        throw error;
      }

      return data as ReviewerComment[];
    },
    enabled: shouldFetch,
    staleTime: 10 * 60 * 1000, // 10 minutes - comments don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false, // Disable refetch on focus
    refetchOnMount: false, // Don't refetch on every mount
    refetchInterval: false, // Disable polling - comments are updated weekly
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
      const { error } = await supabase
        .from('reviewer_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error("Error deleting reviewer comment:", error);
        throw error;
      }

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
