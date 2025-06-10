
// ABOUTME: Hook for syncing sidebar data with the Zustand store
import { useEffect, useCallback } from 'react';
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
  // Extract store setters as stable callbacks to prevent infinite loops
  const setConfigStore = useSidebarStore(state => state.setConfig);
  const setStatsStore = useSidebarStore(state => state.setStats);
  const setOnlineUsersStore = useSidebarStore(state => state.setOnlineUsers);
  const setThreadsStore = useSidebarStore(state => state.setThreads);
  const setPollStore = useSidebarStore(state => state.setPoll);
  const setUserVoteStore = useSidebarStore(state => state.setUserVote);
  const setLoadingStore = useSidebarStore(state => state.setLoading);

  // Stable callbacks for setting store data - prevent infinite loops
  const setConfig = useCallback((config: SidebarConfig | null) => {
    if (config) {
      setConfigStore(config);
    }
  }, [setConfigStore]);

  const setStats = useCallback((stats: any) => {
    if (stats) {
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
      
      setOnlineUsersStore(mappedUsers);
    }
  }, [setOnlineUsersStore]);

  const setThreads = useCallback((threads: any[]) => {
    if (threads) {
      setThreadsStore(threads);
    }
  }, [setThreadsStore]);

  const setPoll = useCallback((poll: Poll | null) => {
    if (poll) {
      setPollStore(poll);
    }
  }, [setPollStore]);

  const setUserVote = useCallback((vote: number | null) => {
    if (vote !== undefined) {
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
