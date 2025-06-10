
// ABOUTME: Enhanced hook for managing poll data and user votes with improved error handling
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/sidebar';

// Fetch weekly poll data with enhanced error handling
const fetchWeeklyPoll = async (): Promise<Poll | null> => {
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Only log non-PGRST116 errors (no rows found is expected)
      if (error.code !== 'PGRST116') {
        console.warn('Error fetching weekly poll:', error.message);
      }
      return null;
    }

    if (!data) return null;

    // Type-safe conversion from database poll to Poll interface
    return {
      id: data.id,
      question: data.question,
      options: Array.isArray(data.options) ? data.options as string[] : [],
      votes: Array.isArray(data.votes) ? data.votes as number[] : [],
      closes_at: data.closes_at,
      created_at: data.created_at,
      active: data.active
    };
  } catch (error) {
    console.error('Unexpected error fetching weekly poll:', error);
    return null;
  }
};

// Fetch user's poll vote with enhanced error handling
const fetchUserPollVote = async (userId: string, pollId: string) => {
  if (!userId || !pollId) return null;

  try {
    const { data, error } = await supabase
      .from('poll_user_votes')
      .select('option_index')
      .eq('user_id', userId)
      .eq('poll_id', pollId)
      .single();

    if (error) {
      // Only log non-PGRST116 errors (no rows found is expected)
      if (error.code !== 'PGRST116') {
        console.warn('Error fetching user poll vote:', error.message);
      }
      return null;
    }

    return data?.option_index ?? null;
  } catch (error) {
    console.error('Unexpected error fetching user poll vote:', error);
    return null;
  }
};

export const useWeeklyPoll = () => {
  return useQuery({
    queryKey: ['weeklyPoll'],
    queryFn: fetchWeeklyPoll,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useUserPollVote = (userId?: string, pollId?: string) => {
  return useQuery({
    queryKey: ['userPollVote', userId, pollId],
    queryFn: () => fetchUserPollVote(userId!, pollId!),
    enabled: !!(userId && pollId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
