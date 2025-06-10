
// ABOUTME: Simplified bridge hook that connects optimized sidebar data with the sidebar store
import { useEffect } from 'react';
import { useOptimizedSidebarData } from '../useOptimizedSidebarData';
import { useSidebarConfig } from './useSidebarConfig';
import { useWeeklyPoll, useUserPollVote } from './usePollData';
import { useSidebarStoreSync } from './useSidebarStoreSync';

export const useSidebarDataBridge = (userId?: string) => {
  const optimizedData = useOptimizedSidebarData();
  const { data: config, isLoading: configLoading } = useSidebarConfig();
  const { data: poll, isLoading: pollLoading } = useWeeklyPoll();
  const { data: userVote, isLoading: userVoteLoading } = useUserPollVote(userId, poll?.id);
  
  const {
    setConfig,
    setStats,
    setOnlineUsers,
    setThreads,
    setPoll,
    setUserVote,
    setLoading
  } = useSidebarStoreSync();

  // Update store when optimized data changes
  useEffect(() => {
    setStats(optimizedData.stats.data);
  }, [optimizedData.stats.data, setStats]);

  useEffect(() => {
    setOnlineUsers(optimizedData.reviewerComments.data);
  }, [optimizedData.reviewerComments.data, setOnlineUsers]);

  useEffect(() => {
    setThreads(optimizedData.topThreads.data);
  }, [optimizedData.topThreads.data, setThreads]);

  // Update store when configuration loads
  useEffect(() => {
    setConfig(config);
  }, [config, setConfig]);

  // Update store when poll data loads
  useEffect(() => {
    setPoll(poll);
  }, [poll, setPoll]);

  // Update store when user vote loads
  useEffect(() => {
    setUserVote(userVote);
  }, [userVote, setUserVote]);

  // Update loading states
  useEffect(() => {
    setLoading('Config', configLoading);
    setLoading('Poll', pollLoading);
    setLoading('Stats', optimizedData.stats.isLoading);
    setLoading('Users', optimizedData.reviewerComments.isLoading);
    setLoading('Threads', optimizedData.topThreads.isLoading);
  }, [
    configLoading,
    pollLoading,
    optimizedData.stats.isLoading,
    optimizedData.reviewerComments.isLoading,
    optimizedData.topThreads.isLoading,
    setLoading
  ]);

  return {
    isLoading: optimizedData.isLoading || configLoading || pollLoading,
    error: optimizedData.hasError
  };
};
