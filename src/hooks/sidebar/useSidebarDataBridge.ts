
// ABOUTME: Fixed sidebar data bridge with proper cleanup and stable dependencies
import { useEffect, useCallback, useRef } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useOptimizedSidebarData } from '@/hooks/useOptimizedSidebarData';
import { supabase } from '@/integrations/supabase/client';
import { OnlineUser } from '@/types/sidebar';

export function useSidebarDataBridge(userId?: string) {
  // Get store actions directly from the store
  const { setSidebarData, setError, setLoading, setOnlineUsers } = useSidebarStore();
  
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Get sidebar data with optimized caching
  const {
    stats,
    reviewerComments,
    topThreads,
    hasError,
    isLoading
  } = useOptimizedSidebarData();

  // Fetch online users
  const fetchOnlineUsers = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('online_users')
        .select('id, full_name, avatar_url, last_active')
        .order('last_active', { ascending: false })
        .limit(15);
      
      if (error) throw error;
      
      if (isMountedRef.current) {
        // Update store with online users
        setOnlineUsers(data as OnlineUser[] || []);
      }
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  }, [setOnlineUsers]);

  // Memoized update function to prevent unnecessary re-renders
  const updateSidebarStore = useCallback(() => {
    if (!isMountedRef.current) return;

    setLoading(isLoading);
    
    if (hasError) {
      setError(true);
      return;
    }

    if (!isLoading && stats.data && reviewerComments.data && topThreads.data) {
      setSidebarData({
        stats: {
          totalUsers: stats.data.totalUsers || 0,
          onlineUsers: stats.data.onlineUsers || 0,
          totalIssues: stats.data.totalIssues || 0,
          totalPosts: stats.data.totalPosts || 0,
          totalComments: stats.data.totalComments || 0,
        },
        commentHighlights: reviewerComments.data.map(comment => ({
          id: comment.id,
          author_name: comment.reviewer_name,
          author_avatar: comment.reviewer_avatar,
          body: comment.comment,
          votes: 0,
          created_at: comment.created_at,
          thread_id: `comment-${comment.id}`
        })),
        topThreads: topThreads.data.map(thread => ({
          id: thread.id,
          title: thread.title,
          comments: Number(thread.comments) || 0,
          votes: thread.votes || 0,
          created_at: thread.created_at,
          thread_type: thread.thread_type
        })),
        polls: [],
        bookmarks: [],
        changelog: []
      });
      
      setError(false);
    }
  }, [
    isLoading,
    hasError,
    stats.data,
    reviewerComments.data,
    topThreads.data,
    setSidebarData,
    setError,
    setLoading
  ]);

  // Effect with stable dependencies
  useEffect(() => {
    updateSidebarStore();
    fetchOnlineUsers();
    
    // Set up interval for refreshing online users
    const intervalId = setInterval(fetchOnlineUsers, 60000); // Refresh every minute
    
    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [updateSidebarStore, fetchOnlineUsers]);

  // Return bridge status for debugging
  return {
    isActive: !hasError && !isLoading,
    hasData: !!stats.data && !!reviewerComments.data && !!topThreads.data,
    error: hasError
  };
}
