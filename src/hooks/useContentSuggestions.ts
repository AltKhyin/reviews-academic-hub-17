
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useContentSuggestions = (upcomingReleaseId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const suggestions = useQuery({
    queryKey: ['contentSuggestions', upcomingReleaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_suggestions')
        .select(`
          *,
          user_votes!inner (
            user_id
          )
        `)
        .eq('upcoming_release_id', upcomingReleaseId)
        .order('votes', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!upcomingReleaseId
  });

  const addSuggestion = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      if (!user) throw new Error('Must be logged in to add suggestions');
      
      const { data, error } = await supabase
        .from('content_suggestions')
        .insert({
          title,
          description,
          user_id: user.id,
          upcoming_release_id: upcomingReleaseId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentSuggestions', upcomingReleaseId] });
      toast({ title: 'Sugestão adicionada com sucesso!' });
    }
  });

  const voteSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!user) throw new Error('Must be logged in to vote');

      const { error } = await supabase
        .from('user_votes')
        .insert({
          user_id: user.id,
          suggestion_id: suggestionId
        });

      if (error) throw error;

      // Use the correct RPC function name 'increment_votes'
      const { error: rpcError } = await supabase.rpc('increment_votes', { 
        suggestion_id: suggestionId 
      });

      if (rpcError) throw rpcError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentSuggestions', upcomingReleaseId] });
    }
  });

  return {
    suggestions: suggestions.data || [],
    isLoading: suggestions.isLoading,
    addSuggestion,
    voteSuggestion
  };
};
