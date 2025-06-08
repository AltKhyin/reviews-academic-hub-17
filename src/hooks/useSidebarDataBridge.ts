
// ABOUTME: Bridge hook that connects optimized sidebar data fetching with the sidebar store
import { useEffect } from 'react';
import { useOptimizedSidebarData } from './useOptimizedSidebarData';
import { useSidebarStore } from '@/stores/sidebarStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { SidebarConfig, Poll } from '@/types/sidebar';

// Fetch sidebar configuration from site_meta table
const fetchSidebarConfig = async (): Promise<SidebarConfig> => {
  const { data, error } = await supabase
    .from('site_meta')
    .select('value')
    .eq('key', 'sidebar_config')
    .single();

  if (error || !data) {
    // Return default configuration if none exists
    return {
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
    };
  }

  // Type-safe check and conversion for SidebarConfig
  const configValue = data.value;
  if (typeof configValue === 'object' && configValue !== null && !Array.isArray(configValue)) {
    return configValue as SidebarConfig;
  }

  // If the stored value is not a valid config object, return default
  return {
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
  };
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
  const {
    setConfig,
    setStats,
    setOnlineUsers,
    setThreads,
    setPoll,
    setUserVote,
    setLoading
  } = useSidebarStore();

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

  // Update store when optimized data changes
  useEffect(() => {
    if (optimizedData.stats) {
      setStats(optimizedData.stats);
    }
  }, [optimizedData.stats, setStats]);

  useEffect(() => {
    if (optimizedData.onlineUsers) {
      // Map last_seen to last_active for type compatibility
      const mappedUsers = optimizedData.onlineUsers.map(user => ({
        ...user,
        last_active: user.last_seen
      }));
      setOnlineUsers(mappedUsers);
    }
  }, [optimizedData.onlineUsers, setOnlineUsers]);

  useEffect(() => {
    if (optimizedData.topThreads) {
      setThreads(optimizedData.topThreads);
    }
  }, [optimizedData.topThreads, setThreads]);

  // Update store when configuration loads
  useEffect(() => {
    if (config) {
      setConfig(config);
    }
  }, [config, setConfig]);

  // Update store when poll data loads
  useEffect(() => {
    if (poll) {
      setPoll(poll);
    }
  }, [poll, setPoll]);

  // Update store when user vote loads
  useEffect(() => {
    if (userVote !== undefined) {
      setUserVote(userVote);
    }
  }, [userVote, setUserVote]);

  // Update loading states
  useEffect(() => {
    setLoading('Config', configLoading);
    setLoading('Poll', pollLoading);
    setLoading('Stats', optimizedData.isLoading);
    setLoading('Users', optimizedData.isLoading);
    setLoading('Threads', optimizedData.isLoading);
  }, [
    configLoading,
    pollLoading,
    optimizedData.isLoading,
    setLoading
  ]);

  return {
    isLoading: optimizedData.isLoading || configLoading || pollLoading,
    error: optimizedData.error
  };
};
