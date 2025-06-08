
// ABOUTME: Hook for managing reviewer notes (admin messages on homepage)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReviewerNote } from '@/types/home';

export const useReviewerNotes = () => {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['reviewerNotes'],
    queryFn: async (): Promise<ReviewerNote[]> => {
      const { data, error } = await supabase
        .from('reviewer_notes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: Omit<ReviewerNote, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reviewer_notes')
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewerNotes'] });
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReviewerNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviewer_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewerNotes'] });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviewer_notes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewerNotes'] });
    }
  });

  return {
    notes,
    isLoading,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending
  };
};
