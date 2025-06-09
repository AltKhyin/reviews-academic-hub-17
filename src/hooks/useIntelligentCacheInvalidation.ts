
// ABOUTME: Intelligent cache invalidation system based on data relationships
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InvalidationStrategy {
  triggers: string[];
  affectedQueries: string[];
  immediate: boolean;
  batchDelay?: number;
}

// Define intelligent invalidation strategies
const invalidationStrategies: InvalidationStrategy[] = [
  {
    triggers: ['issue-published', 'issue-updated'],
    affectedQueries: ['archive-rpc', 'sidebar-stats', 'featured-issue'],
    immediate: true,
  },
  {
    triggers: ['comment-created', 'comment-updated'],
    affectedQueries: ['review-consolidated', 'sidebar-stats'],
    immediate: false,
    batchDelay: 2000, // 2 second batch delay
  },
  {
    triggers: ['post-created', 'post-voted'],
    affectedQueries: ['posts-list', 'sidebar-stats', 'top-threads'],
    immediate: false,
    batchDelay: 1000, // 1 second batch delay
  },
  {
    triggers: ['user-login', 'user-logout'],
    affectedQueries: ['user-permissions', 'user-reactions', 'sidebar-stats'],
    immediate: true,
  },
];

export const useIntelligentCacheInvalidation = () => {
  const queryClient = useQueryClient();
  const pendingInvalidations = new Set<string>();

  // Intelligent invalidation function
  const invalidateByTrigger = useCallback((trigger: string, data?: any) => {
    const relevantStrategies = invalidationStrategies.filter(s => 
      s.triggers.includes(trigger)
    );

    relevantStrategies.forEach(strategy => {
      if (strategy.immediate) {
        // Immediate invalidation for critical updates
        strategy.affectedQueries.forEach(queryPattern => {
          queryClient.invalidateQueries({ 
            queryKey: [queryPattern],
            exact: false 
          });
        });
      } else {
        // Batch invalidation for less critical updates
        strategy.affectedQueries.forEach(queryPattern => {
          pendingInvalidations.add(queryPattern);
        });

        // Schedule batch invalidation
        setTimeout(() => {
          pendingInvalidations.forEach(queryPattern => {
            queryClient.invalidateQueries({ 
              queryKey: [queryPattern],
              exact: false 
            });
          });
          pendingInvalidations.clear();
        }, strategy.batchDelay || 1000);
      }
    });
  }, [queryClient]);

  // Selective cache warming for related data
  const warmRelatedCache = useCallback(async (trigger: string, data?: any) => {
    switch (trigger) {
      case 'issue-view':
        // Prefetch related issues when viewing an issue
        if (data?.specialty) {
          queryClient.prefetchQuery({
            queryKey: ['issues', { specialty: data.specialty, limit: 5 }],
            queryFn: () => supabase.rpc('get_optimized_issues', {
              p_specialty: data.specialty,
              p_limit: 5,
            }),
            staleTime: 10 * 60 * 1000,
          });
        }
        break;
      
      case 'archive-navigation':
        // Prefetch next page of archive results
        if (data?.nextPage) {
          queryClient.prefetchQuery({
            queryKey: ['archive-rpc', { offset: data.nextPage * 20 }],
            queryFn: () => supabase.rpc('get_optimized_issues', {
              p_offset: data.nextPage * 20,
              p_limit: 20,
            }),
            staleTime: 8 * 60 * 1000,
          });
        }
        break;
    }
  }, [queryClient]);

  // Monitor database changes for automatic invalidation
  useEffect(() => {
    const channels: any[] = [];

    // Listen for issues table changes
    const issuesChannel = supabase
      .channel('issues-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'issues' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.published) {
            invalidateByTrigger('issue-published', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            invalidateByTrigger('issue-updated', payload.new);
          }
        }
      )
      .subscribe();

    // Listen for comments table changes
    const commentsChannel = supabase
      .channel('comments-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            invalidateByTrigger('comment-created', payload.new);
          } else if (payload.eventType === 'UPDATE') {
            invalidateByTrigger('comment-updated', payload.new);
          }
        }
      )
      .subscribe();

    channels.push(issuesChannel, commentsChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [invalidateByTrigger]);

  return {
    invalidateByTrigger,
    warmRelatedCache,
  };
};
