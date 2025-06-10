
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

// Deep equality check for complex objects
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return obj1 === obj2;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

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

  // Optimized callbacks with deep value comparison to prevent unnecessary updates
  const setConfig = useCallback((config: SidebarConfig | null) => {
    if (!deepEqual(config, prevValuesRef.current.config)) {
      prevValuesRef.current.config = config;
      setConfigStore(config);
    }
  }, [setConfigStore]);

  const setStats = useCallback((stats: any) => {
    if (!deepEqual(stats, prevValuesRef.current.stats)) {
      prevValuesRef.current.stats = stats;
      setStatsStore(stats);
    }
  }, [setStatsStore]);

  const setOnlineUsers = useCallback((reviewerComments: any[]) => {
    if (reviewerComments && reviewerComments.length >= 0) {
      // Map reviewer comments to online users format for compatibility
      const mappedUsers = reviewerComments.map(comment => ({
        id: comment.id,
        full_name: comment.reviewer_name,
        avatar_url: comment.reviewer_avatar,
        last_active: comment.created_at
      }));
      
      if (!deepEqual(mappedUsers, prevValuesRef.current.onlineUsers)) {
        prevValuesRef.current.onlineUsers = mappedUsers;
        setOnlineUsersStore(mappedUsers);
      }
    }
  }, [setOnlineUsersStore]);

  const setThreads = useCallback((threads: any[]) => {
    if (threads && !deepEqual(threads, prevValuesRef.current.threads)) {
      prevValuesRef.current.threads = threads;
      setThreadsStore(threads);
    }
  }, [setThreadsStore]);

  const setPoll = useCallback((poll: Poll | null) => {
    if (!deepEqual(poll, prevValuesRef.current.poll)) {
      prevValuesRef.current.poll = poll;
      setPollStore(poll);
    }
  }, [setPollStore]);

  const setUserVote = useCallback((vote: number | null) => {
    if (vote !== prevValuesRef.current.userVote) {
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
