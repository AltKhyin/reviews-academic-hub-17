
// ABOUTME: Optimized sidebar data fetching with reduced polling and intelligent caching
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { useSidebarStore } from '@/stores/sidebarStore';
import { OnlineUser, CommentHighlight, TopThread, Poll, SidebarConfig, SiteStats } from '@/types/sidebar';

export const useOptimizedSidebarData = () => {
  const queryClient = useQueryClient();
  const {
    setConfig,
    setStats,
    setOnlineUsers,
    setComments,
    setThreads,
    setPoll,
    setUserVote,
  } = useSidebarStore();

  // SSR safety check
  const isClient = typeof window !== 'undefined';

  // Batch all sidebar queries with optimized refresh intervals
  const sidebarQueries = {
    // Static config - cache aggressively
    config: useQuery({
      queryKey: queryKeys.sidebarConfig(),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('site_meta')
          .select('value')
          .eq('key', 'sidebar_config')
          .single();
        
        if (error) throw error;
        const config = data.value as unknown as SidebarConfig;
        setConfig(config);
        return config;
      },
      ...queryConfigs.static,
      enabled: isClient,
    }),

    // Stats - moderate refresh (reduced from 1 minute to 5 minutes)
    stats: useQuery({
      queryKey: queryKeys.sidebarStats(),
      queryFn: async () => {
        const [
          { data: totalUsers },
          { data: onlineUsers }
        ] = await Promise.all([
          supabase.rpc('get_total_users'),
          supabase.rpc('get_online_users_count')
        ]);
        
        const stats = {
          totalUsers: totalUsers || 0,
          onlineUsers: onlineUsers || 0
        };
        setStats(stats);
        return stats;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes instead of 30 seconds
      gcTime: 10 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000, // 5 minutes instead of 1 minute
      enabled: isClient,
    }),

    // Online users - reduced refresh frequency
    onlineUsers: useQuery({
      queryKey: queryKeys.onlineUsers(),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('online_users')
          .select('*')
          .order('last_seen', { ascending: false })
          .limit(12); // Reduced from 20 to 12
        
        if (error) throw error;
        const users = data as OnlineUser[];
        setOnlineUsers(users);
        return users;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes instead of 15 seconds
      refetchInterval: 2 * 60 * 1000, // 2 minutes instead of 30 seconds
      enabled: isClient,
    }),

    // Comments - much less frequent refresh
    comments: useQuery({
      queryKey: ['sidebar-comments'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('comments_highlight')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6); // Reduced from 8 to 6
        
        if (error) throw error;
        const comments = data as CommentHighlight[];
        setComments(comments);
        return comments;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes instead of 2 minutes
      refetchInterval: 15 * 60 * 1000, // 15 minutes instead of 5 minutes
      enabled: isClient,
    }),

    // Threads - reduced frequency
    threads: useQuery({
      queryKey: ['sidebar-threads'],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 1 }); // Reduced from 2
        
        if (error) throw error;
        const threads = data as TopThread[];
        setThreads(threads);
        return threads;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes instead of 90 seconds
      refetchInterval: 10 * 60 * 1000, // 10 minutes instead of 3 minutes
      enabled: isClient,
    }),

    // Poll - moderate refresh for voting
    poll: useQuery({
      queryKey: ['sidebar-poll'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .eq('active', true)
          .gte('closes_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        
        const poll = data ? {
          ...data,
          votes: (data.votes as number[]).map(v => v ?? 0)
        } as Poll : null;
        
        setPoll(poll);
        return poll;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes instead of 1 minute
      refetchInterval: 5 * 60 * 1000, // 5 minutes instead of 2 minutes
      enabled: isClient,
    }),
  };

  // Return optimized data with loading states
  return {
    config: sidebarQueries.config.data,
    stats: sidebarQueries.stats.data,
    onlineUsers: sidebarQueries.onlineUsers.data,
    comments: sidebarQueries.comments.data,
    threads: sidebarQueries.threads.data,
    poll: sidebarQueries.poll.data,
    isLoading: Object.values(sidebarQueries).some(query => query.isLoading),
    
    // Manual refresh function for critical updates
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar'] });
    },
    
    // Selective refresh functions
    refreshStats: () => sidebarQueries.stats.refetch(),
    refreshPoll: () => sidebarQueries.poll.refetch(),
  };
};

