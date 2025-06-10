
// ABOUTME: Optimized hook for syncing sidebar data with the Zustand store
import { useCallback, useRef } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { SidebarConfig, Poll } from '@/types/sidebar';

interface SidebarStoreSync {
  setConfig: (config: SidebarConfig | null) => void;
  setStats: (stats: any) => void;
  setOnlineUsers: (users: any[]) => void;
  setThreads: (threads: any[]) => void;
  setPoll: (poll: Poll | null) => void;
  setUserVote: (vote: number | null) => void;
  setLoading: (section: string, loading: boolean) => void;
}

export const useSidebarStoreSync = (): SidebarStoreSync => {
  // Extract store setters as stable references
  const setConfigStore = useSidebarStore(state => state.setConfig);
  const setStatsStore = useSidebarStore(state => state.setStats);
  const setOnlineUsersStore = useSidebarStore(state => state.setOnlineUsers);
  const setThreadsStore = useSidebarStore(state => state.setThreads);
  const setPollStore = useSidebarStore(state => state.setPoll);
  const setUserVoteStore = useSidebarStore(state => state.setUserVote);
  const setLoadingStore = useSidebarStore(state => state.setLoading);

  // Use refs to track previous values and prevent unnecessary updates
  const prevValuesRef = useRef<{
    config?: SidebarConfig | null;
    stats?: any;
    onlineUsers?: any[];
    threads?: any[];
    poll?: Poll | null;
    userVote?: number | null;
  }>({});

  // Optimized callbacks with value comparison to prevent unnecessary updates
  const setConfig = useCallback((config: SidebarConfig | null) => {
    if (config && JSON.stringify(config) !== JSON.stringify(prevValuesRef.current.config)) {
      prevValuesRef.current.config = config;
      setConfigStore(config);
    }
  }, [setConfigStore]);

  const setStats = useCallback((stats: any) => {
    if (stats && JSON.stringify(stats) !== JSON.stringify(prevValuesRef.current.stats)) {
      prevValuesRef.current.stats = stats;
      setStatsStore(stats);
    }
  }, [setStatsStore]);

  const setOnlineUsers = useCallback((reviewerComments: any[]) => {
    if (reviewerComments && reviewerComments.length > 0) {
      // Map reviewer comments to online users format for compatibility
      const mappedUsers = reviewerComments.map(comment => ({
        id: comment.id,
        full_name: comment.reviewer_name,
        avatar_url: comment.reviewer_avatar,
        last_active: comment.created_at
      }));
      
      const currentUsersKey = JSON.stringify(mappedUsers);
      const prevUsersKey = JSON.stringify(prevValuesRef.current.onlineUsers);
      
      if (currentUsersKey !== prevUsersKey) {
        prevValuesRef.current.onlineUsers = mappedUsers;
        setOnlineUsersStore(mappedUsers);
      }
    }
  }, [setOnlineUsersStore]);

  const setThreads = useCallback((threads: any[]) => {
    if (threads) {
      const currentThreadsKey = JSON.stringify(threads);
      const prevThreadsKey = JSON.stringify(prevValuesRef.current.threads);
      
      if (currentThreadsKey !== prevThreadsKey) {
        prevValuesRef.current.threads = threads;
        setThreadsStore(threads);
      }
    }
  }, [setThreadsStore]);

  const setPoll = useCallback((poll: Poll | null) => {
    if (poll && JSON.stringify(poll) !== JSON.stringify(prevValuesRef.current.poll)) {
      prevValuesRef.current.poll = poll;
      setPollStore(poll);
    }
  }, [setPollStore]);

  const setUserVote = useCallback((vote: number | null) => {
    if (vote !== undefined && vote !== prevValuesRef.current.userVote) {
      prevValuesRef.current.userVote = vote;
      setUserVoteStore(vote);
    }
  }, [setUserVoteStore]);

  const setLoading = useCallback((section: string, loading: boolean) => {
    setLoadingStore(section as any, loading);
  }, [setLoadingStore]);

  return {
    setConfig,
    setStats,
    setOnlineUsers,
    setThreads,
    setPoll,
    setUserVote,
    setLoading,
  };
};
