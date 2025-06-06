// ABOUTME: Hook for managing native review data with enhanced error handling
// Handles database inconsistencies and provides robust content access

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedIssue, ReviewBlock, ReviewPoll, ReviewAnalytics, AnalyticsEventType, BlockType } from '@/types/review';

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
      console.log('Fetching review data for issue:', issueId);

      // Fetch issue data
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('*')
        .eq('id', issueId)
        .single();

      if (issueError) {
        console.error('Issue fetch error:', issueError);
        throw issueError;
      }

      if (!issueData) {
        throw new Error('Issue not found');
      }

      // Fetch review blocks with proper error handling
      const { data: blocksData, error: blocksError } = await supabase
        .from('review_blocks')
        .select('*')
        .eq('issue_id', issueId)
        .order('sort_index', { ascending: true });

      if (blocksError) {
        console.error('Blocks fetch error:', blocksError);
        // Don't throw here, just log and continue with empty blocks
      }

      // Fetch review polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('review_polls')
        .select('*')
        .eq('issue_id', issueId);

      if (pollsError) {
        console.error('Polls fetch error:', pollsError);
        // Don't throw here, just log and continue with empty polls
      }

      // Normalize blocks to handle database schema inconsistencies
      const normalizedBlocks: ReviewBlock[] = (blocksData || []).map(block => ({
        id: block.id, // Keep as number from database
        type: block.type as BlockType,
        // Handle both 'payload' from database and 'content' from types
        content: (block.payload as any) || {},
        sort_index: block.sort_index,
        visible: block.visible ?? true,
        meta: (block.meta as any) || {},
        issue_id: block.issue_id,
        created_at: block.created_at,
        updated_at: block.updated_at
      }));

      console.log('Fetched review data:', {
        issue: issueData,
        blocksCount: normalizedBlocks.length,
        pollsCount: (pollsData || []).length
      });

      return {
        issue: {
          id: issueData.id,
          title: issueData.title || '',
          description: issueData.description || '',
          authors: issueData.authors || '',
          specialty: issueData.specialty || '',
          year: issueData.year ? parseInt(issueData.year) : undefined,
          population: issueData.population || '',
          review_type: issueData.review_type || 'native',
          article_pdf_url: issueData.article_pdf_url || '',
          pdf_url: issueData.pdf_url || ''
        },
        blocks: normalizedBlocks,
        polls: (pollsData || []).map(poll => ({
          id: poll.id,
          issue_id: poll.issue_id,
          block_id: poll.block_id || undefined, // Keep as number from database or undefined
          question: poll.question || '',
          options: Array.isArray(poll.options) ? (poll.options as string[]) : [],
          poll_type: (poll.poll_type === 'single_choice' || poll.poll_type === 'multiple_choice') 
            ? poll.poll_type as 'single_choice' | 'multiple_choice'
            : 'single_choice', // Safe fallback
          votes: Array.isArray(poll.votes) ? (poll.votes as number[]) : [],
          total_votes: typeof poll.total_votes === 'number' ? poll.total_votes : 0,
          opens_at: poll.opens_at,
          closes_at: poll.closes_at,
          created_at: poll.created_at
        }))
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!issueId,
    retry: (failureCount, error) => {
      console.log('Query retry attempt:', failureCount, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  // Track analytics events
  const trackAnalytics = useMutation({
    mutationFn: async (params: {
      eventType: AnalyticsEventType;
      eventData?: Record<string, any>;
      scrollDepth?: number;
      timeSpent?: number;
    }) => {
      if (!user?.id) {
        console.log('No user ID for analytics tracking');
        return null;
      }

      console.log('Tracking analytics event:', params);

      const { data, error } = await supabase
        .from('review_analytics')
        .insert({
          issue_id: issueId,
          user_id: user.id,
          session_id: generateSessionId(),
          event_type: params.eventType,
          event_data: params.eventData,
          scroll_depth: params.scrollDepth,
          time_spent: params.timeSpent,
          referrer: document.referrer || null,
          device_type: getDeviceType()
        });

      if (error) {
        console.error('Analytics tracking error:', error);
        throw error;
      }
      
      return data;
    },
    onError: (error) => {
      console.error('Analytics mutation error:', error);
      // Don't throw analytics errors to avoid disrupting user experience
    }
  });

  // Vote on polls
  const voteOnPoll = useMutation({
    mutationFn: async (params: {
      pollId: string;
      optionIndex: number;
    }) => {
      console.log('Voting on poll:', params);

      // First, record the vote in analytics
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

      if (!currentPoll) {
        throw new Error('Poll not found');
      }

      // Safely handle votes as Json type
      const existingVotes = Array.isArray(currentPoll.votes) ? (currentPoll.votes as number[]) : [];
      const votes = [...existingVotes];
      
      // Ensure votes array has enough elements
      while (votes.length <= params.optionIndex) {
        votes.push(0);
      }
      
      votes[params.optionIndex] = (votes[params.optionIndex] || 0) + 1;

      // Safely handle total_votes as number
      const currentTotalVotes = typeof currentPoll.total_votes === 'number' 
        ? currentPoll.total_votes 
        : 0;

      const { data, error } = await supabase
        .from('review_polls')
        .update({
          votes,
          total_votes: currentTotalVotes + 1
        })
        .eq('id', params.pollId);

      if (error) {
        console.error('Poll vote error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Poll vote successful, invalidating queries');
      // Invalidate and refetch the review data to get updated poll results
      queryClient.invalidateQueries({ queryKey: ['native-review', issueId] });
    },
    onError: (error) => {
      console.error('Vote mutation error:', error);
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
