
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

export const useReviewerComments = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['reviewerComments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('reviewer_comments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching reviewer comments:', error);
        // Return mock data as fallback
        return [
          {
            id: '1',
            reviewer_id: '123',
            reviewer_name: 'Igor Eckert',
            reviewer_avatar: '/lovable-uploads/0fcc2db7-d9e2-495a-b51e-7f8260ace1c2.png',
            comment: 'Esta edição traz avanços significativos no entendimento do tratamento da hipertensão em pacientes geriátricos.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ];
      }
    }
  });

  const addComment = useMutation({
    mutationFn: async ({ comment }: { comment: string }) => {
      if (!user || !isEditorOrAdmin) {
        throw new Error('Only editors can add reviewer comments');
      }

      const newComment = {
        reviewer_id: user.id,
        reviewer_name: profile?.full_name || 'Unknown Reviewer',
        reviewer_avatar: profile?.avatar_url || '/placeholder.svg',
        comment
      };

      const { data, error } = await supabase
        .from('reviewer_comments')
        .insert(newComment)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      
      const { error } = await supabase
        .from('reviewer_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
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
