
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReviewerComment {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  comment: string;
  created_at: string;
}

// Mock data for reviewer comments
const mockComments: ReviewerComment[] = [
  {
    id: '1',
    reviewer_id: '123',
    reviewer_name: 'Igor Eckert',
    reviewer_avatar: '/lovable-uploads/0fcc2db7-d9e2-495a-b51e-7f8260ace1c2.png',
    comment: 'Esta edição traz avanços significativos no entendimento do tratamento da hipertensão em pacientes geriátricos.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  }
];

export const useReviewerComments = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';

  const { data: comments = mockComments, isLoading } = useQuery({
    queryKey: ['reviewerComments'],
    queryFn: async () => {
      // In a real implementation, we would fetch from Supabase
      // For now, return mock data
      return mockComments;
    }
  });

  const addComment = useMutation({
    mutationFn: async ({ comment }: { comment: string }) => {
      if (!user || !isEditorOrAdmin) {
        throw new Error('Only editors can add reviewer comments');
      }

      // In a real implementation, we would insert to Supabase
      const newComment: ReviewerComment = {
        id: Math.random().toString(36).substring(2, 9),
        reviewer_id: user.id,
        reviewer_name: profile?.full_name || 'Unknown Reviewer',
        reviewer_avatar: profile?.avatar_url || '/placeholder.svg',
        comment,
        created_at: new Date().toISOString()
      };

      // For mock purposes, add to the mock array
      mockComments.push(newComment);
      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewerComments'] });
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso.'
      });
    }
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user || !isEditorOrAdmin) {
        throw new Error('Only editors can delete comments');
      }
      
      // In a real implementation, we would delete from Supabase
      const index = mockComments.findIndex(c => c.id === commentId);
      if (index !== -1) {
        mockComments.splice(index, 1);
      }
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewerComments'] });
      toast({
        title: 'Comentário removido',
        description: 'O comentário foi removido com sucesso.'
      });
    }
  });

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    hasComments: comments.length > 0
  };
};
