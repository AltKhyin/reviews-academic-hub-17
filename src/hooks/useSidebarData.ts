// ABOUTME: Optimized sidebar data fetching with improved query parameters and caching
// Manages all sidebar-related data fetching with proper loading states and error handling

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSidebarStore } from '@/stores/sidebarStore';
import { OnlineUser, CommentHighlight, TopThread, Poll, SidebarConfig, SiteStats } from '@/types/sidebar';

export const useSidebarData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  // SSR safety check
  const isClient = typeof window !== 'undefined';

  // Default config
  const defaultConfig: SidebarConfig = {
    tagline: 'Bem-vindo à nossa comunidade científica',
    nextReviewTs: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    bookmarks: [],
    rules: [],
    changelog: {
      show: true,
      entries: []
    },
    sections: [
      { id: 'header', name: 'Cabeçalho da Comunidade', enabled: true, order: 0 },
      { id: 'users', name: 'Usuários Ativos', enabled: true, order: 1 },
      { id: 'comments', name: 'Comentários em Destaque', enabled: true, order: 2 },
      { id: 'threads', name: 'Top Threads', enabled: true, order: 3 },
      { id: 'poll', name: 'Enquete Semanal', enabled: true, order: 4 },
      { id: 'countdown', name: 'Próxima Review', enabled: true, order: 5 },
      { id: 'bookmarks', name: 'Links Úteis', enabled: true, order: 6 },
      { id: 'rules', name: 'Regras da Comunidade', enabled: true, order: 7 },
      { id: 'changelog', name: 'Changelog', enabled: true, order: 8 }
    ]
  };

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
        
        if (error && error.code !== 'PGRST116') throw error;
        
        const config = data?.value as unknown as SidebarConfig || defaultConfig;
        setConfig(config);
        return config;
      } catch (error) {
        console.error('Failed to fetch sidebar config:', error);
        setConfig(defaultConfig);
        return defaultConfig;
      } finally {
        setLoading('Config', false);
      }
    },
    enabled: isClient,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Mutation to save config
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: SidebarConfig) => {
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'sidebar_config',
          value: newConfig as any,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return newConfig;
    },
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['sidebar-config'], newConfig);
      setConfig(newConfig);
    }
  });

  // Helper functions
  const updateConfig = (updates: Partial<SidebarConfig>) => {
    if (!config) return;
    const newConfig = { ...config, ...updates };
    queryClient.setQueryData(['sidebar-config'], newConfig);
    setConfig(newConfig);
  };

  const saveConfig = async () => {
    if (!config) throw new Error('No config to save');
    await saveConfigMutation.mutateAsync(config);
  };

  const resetConfig = () => {
    queryClient.setQueryData(['sidebar-config'], defaultConfig);
    setConfig(defaultConfig);
  };

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
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        return { totalUsers: 0, onlineUsers: 0 };
      } finally {
        setLoading('Stats', false);
      }
    },
    enabled: isClient,
    refetchInterval: 60 * 1000, // 1 minute
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Fetch online users with optimized query
  const { data: onlineUsers } = useQuery({
    queryKey: ['sidebar-online-users'],
    queryFn: async () => {
      setLoading('Users', true);
      try {
        const { data, error } = await supabase
          .from('online_users')
          .select('*')
          .order('last_seen', { ascending: false })
          .limit(20); // Fetch more for better avatar display
        
        if (error) throw error;
        const users = data as OnlineUser[];
        setOnlineUsers(users);
        return users;
      } catch (error) {
        console.error('Failed to fetch online users:', error);
        return [];
      } finally {
        setLoading('Users', false);
      }
    },
    enabled: isClient,
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
    retry: 2,
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
          .order('created_at', { ascending: false })
          .limit(8); // Increased for better carousel experience
        
        if (error) throw error;
        const comments = data as CommentHighlight[];
        setComments(comments);
        return comments;
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        return [];
      } finally {
        setLoading('Comments', false);
      }
    },
    enabled: isClient,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Fetch top threads with optimized parameters
  const { data: threads } = useQuery({
    queryKey: ['sidebar-threads'],
    queryFn: async () => {
      setLoading('Threads', true);
      try {
        // Use reduced minimum comments for better content availability
        const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 2 });
        
        if (error) throw error;
        const threads = data as TopThread[];
        setThreads(threads);
        return threads;
      } catch (error) {
        console.error('Failed to fetch threads:', error);
        return [];
      } finally {
        setLoading('Threads', false);
      }
    },
    enabled: isClient,
    refetchInterval: 3 * 60 * 1000, // 3 minutes (more frequent updates)
    staleTime: 90 * 1000, // 90 seconds
    retry: 2,
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
        
        // Normalize poll votes to handle null values
        const poll = data ? {
          ...data,
          votes: (data.votes as number[]).map(v => v ?? 0)
        } as Poll : null;
        
        setPoll(poll);
        return poll;
      } catch (error) {
        console.error('Failed to fetch poll:', error);
        return null;
      } finally {
        setLoading('Poll', false);
      }
    },
    enabled: isClient,
    refetchInterval: 2 * 60 * 1000, // 2 minutes (more frequent for live voting)
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });

  // Fetch user's poll vote
  const { data: userVote } = useQuery({
    queryKey: ['sidebar-poll-vote', poll?.id, user?.id],
    queryFn: async () => {
      if (!user || !poll) return null;
      
      try {
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
      } catch (error) {
        console.error('Failed to fetch user vote:', error);
        return null;
      }
    },
    enabled: isClient && !!user && !!poll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    config: config || defaultConfig,
    stats,
    onlineUsers,
    comments,
    threads,
    poll,
    userVote,
    updateConfig,
    saveConfig,
    resetConfig,
  };
};
