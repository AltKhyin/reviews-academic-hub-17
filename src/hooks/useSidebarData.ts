
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSidebarStore } from '@/stores/sidebarStore';
import { OnlineUser, CommentHighlight, TopThread, Poll, SidebarConfig, SiteStats } from '@/types/sidebar';

export const useSidebarData = () => {
  const { user } = useAuth();
  const {
    setConfig,
    setStats,
    setOnlineUsers,
    setComments,
    setThreads,
    setPoll,
    setUserVote,
    setLoading
  } = useSidebarStore();

  // Fetch sidebar configuration
  const { data: config } = useQuery({
    queryKey: ['sidebar-config'],
    queryFn: async () => {
      setLoading('Config', true);
      try {
        const { data, error } = await supabase
          .from('site_meta')
          .select('value')
          .eq('key', 'sidebar_config')
          .single();
        
        if (error) throw error;
        const config = data.value as unknown as SidebarConfig;
        setConfig(config);
        return config;
      } finally {
        setLoading('Config', false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch site statistics
  const { data: stats } = useQuery({
    queryKey: ['sidebar-stats'],
    queryFn: async () => {
      setLoading('Stats', true);
      try {
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
      } finally {
        setLoading('Stats', false);
      }
    },
    refetchInterval: 60 * 1000, // 1 minute
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch online users
  const { data: onlineUsers } = useQuery({
    queryKey: ['sidebar-online-users'],
    queryFn: async () => {
      setLoading('Users', true);
      try {
        const { data, error } = await supabase
          .from('online_users')
          .select('*')
          .limit(7);
        
        if (error) throw error;
        const users = data as OnlineUser[];
        setOnlineUsers(users);
        return users;
      } finally {
        setLoading('Users', false);
      }
    },
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });

  // Fetch comment highlights
  const { data: comments } = useQuery({
    queryKey: ['sidebar-comments'],
    queryFn: async () => {
      setLoading('Comments', true);
      try {
        const { data, error } = await supabase
          .from('comments_highlight')
          .select('*')
          .limit(6);
        
        if (error) throw error;
        const comments = data as CommentHighlight[];
        setComments(comments);
        return comments;
      } finally {
        setLoading('Comments', false);
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch top threads
  const { data: threads } = useQuery({
    queryKey: ['sidebar-threads'],
    queryFn: async () => {
      setLoading('Threads', true);
      try {
        const { data, error } = await supabase
          .from('threads_top')
          .select('*')
          .limit(3);
        
        if (error) throw error;
        const threads = data as TopThread[];
        setThreads(threads);
        return threads;
      } finally {
        setLoading('Threads', false);
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch active poll
  const { data: poll } = useQuery({
    queryKey: ['sidebar-poll'],
    queryFn: async () => {
      setLoading('Poll', true);
      try {
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .eq('active', true)
          .gte('closes_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        const poll = data as Poll | null;
        setPoll(poll);
        return poll;
      } finally {
        setLoading('Poll', false);
      }
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch user's poll vote
  const { data: userVote } = useQuery({
    queryKey: ['sidebar-poll-vote', poll?.id, user?.id],
    queryFn: async () => {
      if (!user || !poll) return null;
      
      const { data, error } = await supabase
        .from('poll_user_votes')
        .select('option_index')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      const vote = data?.option_index ?? null;
      setUserVote(vote);
      return vote;
    },
    enabled: !!user && !!poll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    config,
    stats,
    onlineUsers,
    comments,
    threads,
    poll,
    userVote,
  };
};
