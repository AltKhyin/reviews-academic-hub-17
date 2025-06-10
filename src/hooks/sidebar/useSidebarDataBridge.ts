
// ABOUTME: Optimized bridge hook that connects sidebar data with the sidebar store
import { useEffect, useMemo } from 'react';
import { useOptimizedSidebarData } from '../useOptimizedSidebarData';
import { useSidebarConfig } from './useSidebarConfig';
import { useWeeklyPoll, useUserPollVote } from './usePollData';
import { useSidebarStoreSync } from './useSidebarStoreSync';

export const useSidebarDataBridge = (userId?: string) => {
  const optimizedData = useOptimizedSidebarData();
  const { data: config, isLoading: configLoading, error: configError } = useSidebarConfig();
  const { data: poll, isLoading: pollLoading, error: pollError } = useWeeklyPoll();
  const { data: userVote, isLoading: userVoteLoading, error: userVoteError } = useUserPollVote(userId, poll?.id);
  
  const {
    setConfig,
    setStats,
    setOnlineUsers,
    setThreads,
    setPoll,
    setUserVote,
    setLoading
  } = useSidebarStoreSync();

  // Memoize loading states to prevent unnecessary re-renders
  const loadingStates = useMemo(() => ({
    config: configLoading,
    poll: pollLoading,
    userVote: userVoteLoading,
    stats: optimizedData.stats.isLoading,
    users: optimizedData.reviewerComments.isLoading,
    threads: optimizedData.topThreads.isLoading,
  }), [
    configLoading,
    pollLoading,
    userVoteLoading,
    optimizedData.stats.isLoading,
    optimizedData.reviewerComments.isLoading,
    optimizedData.topThreads.isLoading,
  ]);

  // Memoize error states
  const hasErrors = useMemo(() => {
    return Boolean(
      configError || 
      pollError || 
      userVoteError || 
      optimizedData.hasError
    );
  }, [configError, pollError, userVoteError, optimizedData.hasError]);

  // Update store when optimized data changes
  useEffect(() => {
    if (optimizedData.stats.data) {
      setStats(optimizedData.stats.data);
    }
  }, [optimizedData.stats.data, setStats]);

  useEffect(() => {
    if (optimizedData.reviewerComments.data) {
      setOnlineUsers(optimizedData.reviewerComments.data);
    }
  }, [optimizedData.reviewerComments.data, setOnlineUsers]);

  useEffect(() => {
    if (optimizedData.topThreads.data) {
      setThreads(optimizedData.topThreads.data);
    }
  }, [optimizedData.topThreads.data, setThreads]);

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

  // Update loading states efficiently
  useEffect(() => {
    setLoading('Config', loadingStates.config);
    setLoading('Poll', loadingStates.poll);
    setLoading('Stats', loadingStates.stats);
    setLoading('Users', loadingStates.users);
    setLoading('Threads', loadingStates.threads);
  }, [
    loadingStates.config,
    loadingStates.poll,
    loadingStates.stats,
    loadingStates.users,
    loadingStates.threads,
    setLoading
  ]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    isLoading: optimizedData.isLoading || configLoading || pollLoading,
    error: hasErrors
  }), [optimizedData.isLoading, configLoading, pollLoading, hasErrors]);
};
