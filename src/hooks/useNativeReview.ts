// ABOUTME: Optimized native review hook with analytics and performance monitoring
import { useState, useCallback } from 'react';
import { useUnifiedQuery } from '@/hooks/useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';

interface ReviewData {
  blocks: Array<{
    id: number;
    type: string;
    content: any; // Normalize payload to content
    sort_index: number;
    visible: boolean;
  }>;
}

interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, any>;
  scrollDepth?: number;
  timeSpent?: number;
}

export const useNativeReview = (issueId: string) => {
  const [isVoting, setIsVoting] = useState(false);

  // Use unified query system for review data
  const { 
    data: reviewData, 
    isLoading, 
    error 
  } = useUnifiedQuery<ReviewData>(
    ['review-blocks', issueId],
    async () => {
      console.log(`Fetching review blocks for issue: ${issueId}`);
      
      const { data: blocks, error: blocksError } = await supabase
        .from('review_blocks')
        .select('id, type, payload, sort_index, visible')
        .eq('issue_id', issueId)
        .eq('visible', true)
        .order('sort_index', { ascending: true });

      if (blocksError) {
        console.error('Error fetching review blocks:', blocksError);
        throw blocksError;
      }

      // Transform payload to content for compatibility
      const transformedBlocks = (blocks || []).map(block => ({
        id: block.id,
        type: block.type,
        content: block.payload, // Transform payload to content
        sort_index: block.sort_index,
        visible: block.visible
      }));

      return {
        blocks: transformedBlocks
      };
    },
    {
      priority: 'critical',
      enableMonitoring: false, // Reduce console noise
      rateLimit: {
        endpoint: 'review-blocks',
        maxRequests: 10,
        windowMs: 60000,
      },
    }
  );

  // Optimized analytics tracking with batching
  const trackAnalytics = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate session ID if not exists
      let sessionId = sessionStorage.getItem('review_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('review_session_id', sessionId);
      }

      const analyticsData = {
        issue_id: issueId,
        user_id: user?.id || null,
        event_type: event.eventType,
        event_data: event.eventData || {},
        scroll_depth: event.scrollDepth || null,
        time_spent: event.timeSpent || null,
        session_id: sessionId,
        referrer: document.referrer || null,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      };

      // Insert analytics data (fire and forget for performance)
      supabase
        .from('review_analytics')
        .insert([analyticsData])
        .then(({ error }) => {
          if (error) {
            console.warn('Analytics tracking failed:', error);
          }
        });

    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }, [issueId]);

  // Optimized poll voting with local state management
  const voteOnPoll = useCallback(async (pollId: string, optionIndex: number) => {
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required to vote');
      }

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('poll_user_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('poll_user_votes')
          .update({ option_index: optionIndex })
          .eq('id', existingVote.id);
        
        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('poll_user_votes')
          .insert([{
            poll_id: pollId,
            user_id: user.id,
            option_index: optionIndex,
          }]);
        
        if (error) throw error;
      }

      // Track voting event
      await trackAnalytics({
        eventType: 'poll_voted',
        eventData: {
          poll_id: pollId,
          option_index: optionIndex,
          vote_type: existingVote ? 'update' : 'new',
        },
      });

    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  }, [isVoting, trackAnalytics]);

  return {
    reviewData,
    isLoading,
    error,
    trackAnalytics,
    voteOnPoll,
    isVoting,
  };
};
