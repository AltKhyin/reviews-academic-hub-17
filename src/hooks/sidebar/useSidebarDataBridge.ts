
// ABOUTME: Optimized bridge hook with strict dependency control and request deduplication
import { useEffect, useMemo, useRef } from 'react';
import { useOptimizedSidebarData } from '../useOptimizedSidebarData';
import { useSidebarConfig } from './useSidebarConfig';
import { useWeeklyPoll, useUserPollVote } from './usePollData';
import { useSidebarStoreSync } from './useSidebarStoreSync';

export const useSidebarDataBridge = (userId?: string) => {
  const optimizedData = useOptimizedSidebarData();
  const { data: config, isLoading: configLoading, error: configError } = useSidebarConfig();
  const { data: poll, isLoading: pollLoading, error: pollError } = useWeeklyPoll();
  const { data: userVote, isLoading: userVoteLoading, error: userVoteError } = useUserPollVote(userId, poll?.id);
  
  // Track previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    config: null,
    poll: null,
    userVote: null,
    stats: null,
    onlineUsers: null,
    threads: null,
  });

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

  // Update store only when data actually changes
  useEffect(() => {
    if (optimizedData.stats.data && 
        JSON.stringify(optimizedData.stats.data) !== JSON.stringify(prevValuesRef.current.stats)) {
      prevValuesRef.current.stats = optimizedData.stats.data;
      setStats(optimizedData.stats.data);
    }
  }, [optimizedData.stats.data, setStats]);

  useEffect(() => {
    if (optimizedData.reviewerComments.data && 
        JSON.stringify(optimizedData.reviewerComments.data) !== JSON.stringify(prevValuesRef.current.onlineUsers)) {
      prevValuesRef.current.onlineUsers = optimizedData.reviewerComments.data;
      setOnlineUsers(optimizedData.reviewerComments.data);
    }
  }, [optimizedData.reviewerComments.data, setOnlineUsers]);

  useEffect(() => {
    if (optimizedData.topThreads.data && 
        JSON.stringify(optimizedData.topThreads.data) !== JSON.stringify(prevValuesRef.current.threads)) {
      prevValuesRef.current.threads = optimizedData.topThreads.data;
      setThreads(optimizedData.topThreads.data);
    }
  }, [optimizedData.topThreads.data, setThreads]);

  useEffect(() => {
    if (config && JSON.stringify(config) !== JSON.stringify(prevValuesRef.current.config)) {
      prevValuesRef.current.config = config;
      setConfig(config);
    }
  }, [config, setConfig]);

  useEffect(() => {
    if (poll && JSON.stringify(poll) !== JSON.stringify(prevValuesRef.current.poll)) {
      prevValuesRef.current.poll = poll;
      setPoll(poll);
    }
  }, [poll, setPoll]);

  useEffect(() => {
    if (userVote !== undefined && userVote !== prevValuesRef.current.userVote) {
      prevValuesRef.current.userVote = userVote;
      setUserVote(userVote);
    }
  }, [userVote, setUserVote]);

  // Debounced loading state updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading('Config', loadingStates.config);
      setLoading('Poll', loadingStates.poll);
      setLoading('Stats', loadingStates.stats);
      setLoading('Users', loadingStates.users);
      setLoading('Threads', loadingStates.threads);
    }, 50); // 50ms debounce

    return () => clearTimeout(timeoutId);
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
