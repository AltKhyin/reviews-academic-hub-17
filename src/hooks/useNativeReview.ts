
// ABOUTME: Hook for managing native review data and interactions
// Handles fetching, caching, and real-time updates for review content

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedIssue, ReviewBlock, ReviewPoll, ReviewAnalytics, AnalyticsEventType } from '@/types/review';

export const useNativeReview = (issueId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch complete review data with blocks
  const { data: reviewData, isLoading, error } = useQuery({
    queryKey: ['native-review', issueId],
    queryFn: async (): Promise<{
      issue: EnhancedIssue;
      blocks: ReviewBlock[];
      polls: ReviewPoll[];
    }> => {
      // Use the database function for efficient fetching
      const { data, error } = await supabase.rpc('get_review_with_blocks', {
        review_id: issueId
      });

      if (error) throw error;
      if (!data) throw new Error('Review not found');

      const result = data as any;
      return {
        issue: result.issue,
        blocks: result.blocks || [],
        polls: result.polls || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!issueId
  });

  // Track analytics events
  const trackAnalytics = useMutation({
    mutationFn: async (params: {
      eventType: AnalyticsEventType;
      eventData?: Record<string, any>;
      scrollDepth?: number;
      timeSpent?: number;
    }) => {
      const { data, error } = await supabase
        .from('review_analytics')
        .insert({
          issue_id: issueId,
          user_id: user?.id,
          session_id: generateSessionId(),
          event_type: params.eventType,
          event_data: params.eventData,
          scroll_depth: params.scrollDepth,
          time_spent: params.timeSpent,
          referrer: document.referrer || null,
          device_type: getDeviceType()
        });

      if (error) throw error;
      return data;
    }
  });

  // Vote on polls
  const voteOnPoll = useMutation({
    mutationFn: async (params: {
      pollId: string;
      optionIndex: number;
    }) => {
      // First, record the vote in poll votes tracking
      await trackAnalytics.mutateAsync({
        eventType: 'poll_voted',
        eventData: {
          poll_id: params.pollId,
          option_index: params.optionIndex
        }
      });

      // Update poll vote counts
      const { data: currentPoll } = await supabase
        .from('review_polls')
        .select('votes, total_votes')
        .eq('id', params.pollId)
        .single();

      if (!currentPoll) throw new Error('Poll not found');

      const votes = Array.isArray(currentPoll.votes) ? [...currentPoll.votes] : [];
      
      // Ensure votes array has enough elements
      while (votes.length <= params.optionIndex) {
        votes.push(0);
      }
      
      votes[params.optionIndex] = (votes[params.optionIndex] || 0) + 1;

      const { data, error } = await supabase
        .from('review_polls')
        .update({
          votes,
          total_votes: (currentPoll.total_votes || 0) + 1
        })
        .eq('id', params.pollId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the review data to get updated poll results
      queryClient.invalidateQueries({ queryKey: ['native-review', issueId] });
    }
  });

  return {
    reviewData,
    isLoading,
    error,
    trackAnalytics: trackAnalytics.mutateAsync,
    voteOnPoll: voteOnPoll.mutateAsync,
    isVoting: voteOnPoll.isPending
  };
};

// Utility functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
