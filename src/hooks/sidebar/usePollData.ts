
// ABOUTME: Hook for managing poll data and user votes
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Poll } from '@/types/sidebar';

// Fetch weekly poll data
const fetchWeeklyPoll = async (): Promise<Poll | null> => {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

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
};

// Fetch user's poll vote
const fetchUserPollVote = async (userId: string, pollId: string) => {
  if (!userId || !pollId) return null;

  const { data, error } = await supabase
    .from('poll_user_votes')
    .select('option_index')
    .eq('user_id', userId)
    .eq('poll_id', pollId)
    .single();

  if (error || !data) return null;
  
  return data.option_index;
};

export const useWeeklyPoll = () => {
  return useQuery({
    queryKey: ['weeklyPoll'],
    queryFn: fetchWeeklyPoll,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUserPollVote = (userId?: string, pollId?: string) => {
  return useQuery({
    queryKey: ['userPollVote', userId, pollId],
    queryFn: () => fetchUserPollVote(userId!, pollId!),
    enabled: !!(userId && pollId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
