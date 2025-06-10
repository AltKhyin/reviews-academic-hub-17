
// ABOUTME: Bridge hook that connects optimized sidebar data fetching with the sidebar store
import { useEffect, useCallback, useMemo } from 'react';
import { useOptimizedSidebarData } from './useOptimizedSidebarData';
import { useSidebarStore } from '@/stores/sidebarStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { SidebarConfig, Poll } from '@/types/sidebar';

// Helper function to validate and convert JSON to SidebarConfig
const validateSidebarConfig = (data: any): SidebarConfig => {
  // Check if data has the required structure for SidebarConfig
  if (data && 
      typeof data === 'object' && 
      typeof data.tagline === 'string' &&
      typeof data.nextReviewTs === 'string' &&
      Array.isArray(data.bookmarks) &&
      Array.isArray(data.rules) &&
      typeof data.changelog === 'object' &&
      Array.isArray(data.sections)) {
    return data as SidebarConfig;
  }
  
  // Return default configuration if validation fails
  return getDefaultSidebarConfig();
};

// Default configuration helper
const getDefaultSidebarConfig = (): SidebarConfig => ({
  tagline: 'Quem aprende junto, cresce.',
  nextReviewTs: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  bookmarks: [
    { label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/', icon: '📚' },
    { label: 'Cochrane', url: 'https://www.cochranelibrary.com/', icon: '🔬' },
    { label: 'UpToDate', url: 'https://www.uptodate.com/', icon: '📖' }
  ],
  rules: [
    'Mantenha discussões respeitosas e científicas',
    'Cite fontes quando apropriado',
    'Evite spam ou conteúdo irrelevante',
    'Respeite a privacidade dos pacientes',
    'Contribua construtivamente para a comunidade'
  ],
  changelog: {
    show: true,
    entries: [
      { date: '2024-01-15', text: 'Nova funcionalidade de análise de artigos implementada' },
      { date: '2024-01-10', text: 'Melhorias na interface da comunidade' },
      { date: '2024-01-05', text: 'Sistema de bookmarks personalizado' }
    ]
  },
  sections: [
    { id: 'community-header', name: 'Cabeçalho da Comunidade', enabled: true, order: 0 },
    { id: 'active-avatars', name: 'Avatares Ativos', enabled: true, order: 1 },
    { id: 'top-threads', name: 'Discussões em Alta', enabled: true, order: 2 },
    { id: 'next-review', name: 'Próxima Edição', enabled: true, order: 3 },
    { id: 'weekly-poll', name: 'Enquete da Semana', enabled: true, order: 4 },
    { id: 'resource-bookmarks', name: 'Links Úteis', enabled: true, order: 5 },
    { id: 'rules-accordion', name: 'Regras da Comunidade', enabled: true, order: 6 },
    { id: 'mini-changelog', name: 'Changelog', enabled: true, order: 7 }
  ]
});

// Fetch sidebar configuration from site_meta table
const fetchSidebarConfig = async (): Promise<SidebarConfig> => {
  const { data, error } = await supabase
    .from('site_meta')
    .select('value')
    .eq('key', 'sidebar_config')
    .single();

  if (error || !data) {
    return getDefaultSidebarConfig();
  }

  // Use the validation helper instead of direct casting
  return validateSidebarConfig(data.value);
};

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

export const useSidebarDataBridge = (userId?: string) => {
  const optimizedData = useOptimizedSidebarData();
  const sidebarStore = useSidebarStore();

  // Memoize store setters to prevent unnecessary re-renders
  const storeSetters = useMemo(() => ({
    setConfig: (config: SidebarConfig | null) => sidebarStore.setConfig(config),
    setStats: (stats: any) => sidebarStore.setStats(stats),
    setOnlineUsers: (users: any[]) => sidebarStore.setOnlineUsers(users),
    setThreads: (threads: any[]) => sidebarStore.setThreads(threads),
    setPoll: (poll: Poll | null) => sidebarStore.setPoll(poll),
    setUserVote: (vote: number | null) => sidebarStore.setUserVote(vote),
    setLoading: (section: string, loading: boolean) => sidebarStore.setLoading(section as any, loading),
  }), [sidebarStore]);

  // Fetch sidebar configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['sidebarConfig'],
    queryFn: fetchSidebarConfig,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch weekly poll
  const { data: poll, isLoading: pollLoading } = useQuery({
    queryKey: ['weeklyPoll'],
    queryFn: fetchWeeklyPoll,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch user poll vote if poll exists and user is logged in
  const { data: userVote, isLoading: userVoteLoading } = useQuery({
    queryKey: ['userPollVote', userId, poll?.id],
    queryFn: () => fetchUserPollVote(userId!, poll!.id),
    enabled: !!(userId && poll?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Memoize data comparisons to prevent unnecessary updates
  const memoizedData = useMemo(() => ({
    stats: optimizedData.stats.data,
    reviewerComments: optimizedData.reviewerComments.data,
    topThreads: optimizedData.topThreads.data,
    config,
    poll,
    userVote
  }), [optimizedData.stats.data, optimizedData.reviewerComments.data, optimizedData.topThreads.data, config, poll, userVote]);

  // Update store when optimized data changes - with memoized comparisons
  useEffect(() => {
    if (memoizedData.stats) {
      storeSetters.setStats(memoizedData.stats);
    }
  }, [memoizedData.stats, storeSetters.setStats]);

  useEffect(() => {
    if (memoizedData.reviewerComments && memoizedData.reviewerComments.length > 0) {
      // Map reviewer comments to online users format for compatibility
      const mappedUsers = memoizedData.reviewerComments.map(comment => ({
        id: comment.id,
        full_name: comment.reviewer_name,
        avatar_url: comment.reviewer_avatar,
        last_active: comment.created_at
      }));
      
      storeSetters.setOnlineUsers(mappedUsers);
    }
  }, [memoizedData.reviewerComments, storeSetters.setOnlineUsers]);

  useEffect(() => {
    if (memoizedData.topThreads) {
      storeSetters.setThreads(memoizedData.topThreads);
    }
  }, [memoizedData.topThreads, storeSetters.setThreads]);

  // Update store when configuration loads
  useEffect(() => {
    if (memoizedData.config) {
      storeSetters.setConfig(memoizedData.config);
    }
  }, [memoizedData.config, storeSetters.setConfig]);

  // Update store when poll data loads
  useEffect(() => {
    if (memoizedData.poll) {
      storeSetters.setPoll(memoizedData.poll);
    }
  }, [memoizedData.poll, storeSetters.setPoll]);

  // Update store when user vote loads
  useEffect(() => {
    if (memoizedData.userVote !== undefined) {
      storeSetters.setUserVote(memoizedData.userVote);
    }
  }, [memoizedData.userVote, storeSetters.setUserVote]);

  // Update loading states
  useEffect(() => {
    storeSetters.setLoading('Config', configLoading);
    storeSetters.setLoading('Poll', pollLoading);
    storeSetters.setLoading('Stats', optimizedData.stats.isLoading);
    storeSetters.setLoading('Users', optimizedData.reviewerComments.isLoading);
    storeSetters.setLoading('Threads', optimizedData.topThreads.isLoading);
  }, [
    configLoading,
    pollLoading,
    optimizedData.stats.isLoading,
    optimizedData.reviewerComments.isLoading,
    optimizedData.topThreads.isLoading,
    storeSetters.setLoading
  ]);

  return {
    isLoading: optimizedData.isLoading || configLoading || pollLoading,
    error: optimizedData.hasError
  };
};
