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
            *
          `)
          .order('votes', { ascending: false });

        if (error) throw error;
        
        // After getting suggestions, fetch the user info for each one
        const suggestionsWithUsers: Suggestion[] = [];
        
        for (const suggestion of data) {
          // Get user profile for each suggestion
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', suggestion.user_id)
            .single();
          
          suggestionsWithUsers.push({
            ...suggestion,
            user: profileData ? {
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url
            } : null,
            hasVoted: 0
          });
        }
        
        return suggestionsWithUsers;
      }

      // For a specific release, first get the suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('content_suggestions')
        .select(`
          *,
          user_votes (
            id,
            user_id,
            created_at
          )
        `)
        .eq('upcoming_release_id', upcomingReleaseId)
        .order('votes', { ascending: false });

      if (suggestionsError) throw suggestionsError;
      
      // Now fetch user profile for each suggestion
      const suggestionsWithUsers: Suggestion[] = [];
      
      for (const suggestion of suggestionsData) {
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', suggestion.user_id)
          .single();
        
        // Add hasVoted property based on user_votes
        const hasUserVote = suggestion.user_votes?.some(v => v.user_id === user?.id);
        
        // Create a new suggestion object without the user_votes property
        const { user_votes, ...suggestionWithoutUserVotes } = suggestion;
        
        suggestionsWithUsers.push({
          ...suggestionWithoutUserVotes,
          user: profileData ? {
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url
          } : null,
          hasVoted: hasUserVote ? 1 : 0
        });
      }
      
      return suggestionsWithUsers;
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
