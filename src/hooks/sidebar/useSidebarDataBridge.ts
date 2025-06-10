
// ABOUTME: Optimized bridge hook with strict dependency control and request deduplication
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useOptimizedSidebarData } from '../useOptimizedSidebarData';
import { useSidebarConfig } from './useSidebarConfig';
import { useWeeklyPoll, useUserPollVote } from './usePollData';
import { useSidebarStoreSync } from './useSidebarStoreSync';

export const useSidebarDataBridge = (userId?: string) => {
  const optimizedData = useOptimizedSidebarData();
  const { data: config, isLoading: configLoading, error: configError } = useSidebarConfig();
  const { data: poll, isLoading: pollLoading, error: pollError } = useWeeklyPoll();
  const { data: userVote, isLoading: userVoteLoading, error: userVoteError } = useUserPollVote(userId, poll?.id);
  
  // Track processing state to prevent loops
  const processingRef = useRef(false);
  const lastUpdateRef = useRef<{
    configHash?: string;
    pollHash?: string;
    userVoteHash?: string;
    statsHash?: string;
    usersHash?: string;
    threadsHash?: string;
  }>({});

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

  // Hash function for change detection
  const createHash = useCallback((data: any): string => {
    return JSON.stringify(data);
  }, []);

  // Debounced store updates with change detection
  useEffect(() => {
    if (processingRef.current) return;
    
    const updateStore = () => {
      processingRef.current = true;
      
      try {
        // Update stats only if changed
        if (optimizedData.stats.data) {
          const statsHash = createHash(optimizedData.stats.data);
          if (statsHash !== lastUpdateRef.current.statsHash) {
            lastUpdateRef.current.statsHash = statsHash;
            setStats(optimizedData.stats.data);
          }
        }

        // Update users only if changed
        if (optimizedData.reviewerComments.data) {
          const usersHash = createHash(optimizedData.reviewerComments.data);
          if (usersHash !== lastUpdateRef.current.usersHash) {
            lastUpdateRef.current.usersHash = usersHash;
            setOnlineUsers(optimizedData.reviewerComments.data);
          }
        }

        // Update threads only if changed
        if (optimizedData.topThreads.data) {
          const threadsHash = createHash(optimizedData.topThreads.data);
          if (threadsHash !== lastUpdateRef.current.threadsHash) {
            lastUpdateRef.current.threadsHash = threadsHash;
            setThreads(optimizedData.topThreads.data);
          }
        }

        // Update config only if changed
        if (config) {
          const configHash = createHash(config);
          if (configHash !== lastUpdateRef.current.configHash) {
            lastUpdateRef.current.configHash = configHash;
            setConfig(config);
          }
        }

        // Update poll only if changed
        if (poll) {
          const pollHash = createHash(poll);
          if (pollHash !== lastUpdateRef.current.pollHash) {
            lastUpdateRef.current.pollHash = pollHash;
            setPoll(poll);
          }
        }

        // Update user vote only if changed
        if (userVote !== undefined) {
          const userVoteHash = createHash(userVote);
          if (userVoteHash !== lastUpdateRef.current.userVoteHash) {
            lastUpdateRef.current.userVoteHash = userVoteHash;
            setUserVote(userVote);
          }
        }
      } finally {
        processingRef.current = false;
      }
    };

    // Debounce updates to prevent rapid firing
    const timeoutId = setTimeout(updateStore, 50);
    return () => clearTimeout(timeoutId);
  }, [
    optimizedData.stats.data,
    optimizedData.reviewerComments.data,
    optimizedData.topThreads.data,
    config,
    poll,
    userVote,
    setConfig,
    setStats,
    setOnlineUsers,
    setThreads,
    setPoll,
    setUserVote,
    createHash
  ]);

  // Debounced loading state updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading('Config', loadingStates.config);
      setLoading('Poll', loadingStates.poll);
      setLoading('Stats', loadingStates.stats);
      setLoading('Users', loadingStates.users);
      setLoading('Threads', loadingStates.threads);
    }, 100); // Increased debounce for loading states

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
