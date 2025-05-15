
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Suggestion, UserVote } from '@/types/comment';

export const useContentSuggestions = (upcomingReleaseId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get suggestions with user vote status
  const { data, isLoading, error } = useQuery({
    queryKey: ['contentSuggestions', upcomingReleaseId],
    queryFn: async () => {
      if (!upcomingReleaseId || upcomingReleaseId === 'default') {
        // If using default release, just get suggestions ordered by votes
        const { data, error } = await supabase
          .from('content_suggestions')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .order('votes', { ascending: false });

        if (error) throw error;
        
        // Reshape data to include user info
        return data.map(item => ({
          ...item,
          user: {
            full_name: item.profiles?.full_name || null,
            avatar_url: item.profiles?.avatar_url || null
          },
          profiles: undefined,
          hasVoted: 0
        })) as Suggestion[];
      }

      // For a specific release, include vote information
      const { data, error } = await supabase
        .from('content_suggestions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          user_votes (
            id,
            user_id,
            created_at
          )
        `)
        .eq('upcoming_release_id', upcomingReleaseId)
        .order('votes', { ascending: false });

      if (error) throw error;
      
      // Add hasVoted property based on user_votes
      return data.map(suggestion => {
        const hasUserVote = suggestion.user_votes?.some(v => v.user_id === user?.id);
        return {
          ...suggestion,
          user: {
            full_name: suggestion.profiles?.full_name || null,
            avatar_url: suggestion.profiles?.avatar_url || null
          },
          profiles: undefined,
          user_votes: undefined,
          hasVoted: hasUserVote ? 1 : 0
        };
      }) as Suggestion[];
    },
    enabled: !!upcomingReleaseId || upcomingReleaseId === 'default'
  });

  // Add a suggestion
  const addSuggestion = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      if (!user) throw new Error('Must be logged in to add suggestions');
      
      const releaseId = upcomingReleaseId === 'default' ? null : upcomingReleaseId;
      
      const { data, error } = await supabase
        .from('content_suggestions')
        .insert({
          title,
          description,
          user_id: user.id,
          upcoming_release_id: releaseId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentSuggestions', upcomingReleaseId] });
    },
    onError: (error) => {
      console.error('Error adding suggestion:', error);
      toast({ 
        title: 'Erro ao adicionar sugestão',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  });

  // Vote on a suggestion
  const voteSuggestion = useMutation({
    mutationFn: async ({ suggestionId, value }: { suggestionId: string; value: 1 | -1 }) => {
      if (!user) throw new Error('Must be logged in to vote');

      // Check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from('user_votes')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      // If already voted, remove vote
      if (existingVote) {
        // Remove the vote record
        const { error: deleteError } = await supabase
          .from('user_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) throw deleteError;

        // Update vote count directly
        const { data: suggestion, error: fetchError } = await supabase
          .from('content_suggestions')
          .select('votes')
          .eq('id', suggestionId)
          .single();
            
        if (fetchError) throw fetchError;
        
        const { error: updateError } = await supabase
          .from('content_suggestions')
          .update({ votes: suggestion.votes - 1 })
          .eq('id', suggestionId);
        
        if (updateError) throw updateError;
        
        return { action: 'removed' };
      } 
      
      // Otherwise add a new vote
      const { error } = await supabase
        .from('user_votes')
        .insert({
          user_id: user.id,
          suggestion_id: suggestionId
        });

      if (error) throw error;

      // Update vote count directly
      const { data: suggestion, error: fetchError } = await supabase
        .from('content_suggestions')
        .select('votes')
        .eq('id', suggestionId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const { error: updateError } = await supabase
        .from('content_suggestions')
        .update({ votes: suggestion.votes + value })
        .eq('id', suggestionId);
      
      if (updateError) throw updateError;
      
      return { action: 'added', value };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contentSuggestions', upcomingReleaseId] });
      toast({ 
        title: result.action === 'added' ? 'Voto registrado' : 'Voto removido',
        description: result.action === 'added' 
          ? 'Sua opinião foi contabilizada.' 
          : 'Seu voto foi removido desta sugestão.'
      });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast({ 
        title: 'Erro ao votar',
        description: 'Não foi possível processar seu voto. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  return {
    suggestions: data || [],
    isLoading,
    error,
    addSuggestion,
    voteSuggestion
  };
};
