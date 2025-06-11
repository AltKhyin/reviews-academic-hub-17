
// ABOUTME: Fixed sidebar data bridge with proper cleanup and stable dependencies
import { useEffect, useCallback, useRef } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useOptimizedSidebarData } from '@/hooks/useOptimizedSidebarData';

export function useSidebarDataBridge(userId?: string) {
  const setSidebarData = useSidebarStore(state => state.setSidebarData);
  const setError = useSidebarStore(state => state.setError);
  const setLoading = useSidebarStore(state => state.setLoading);
  
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
        onlineUsers: [], // Will be populated by separate hook
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
  }, [updateSidebarStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Return bridge status for debugging
  return {
    isActive: !hasError && !isLoading,
    hasData: !!stats.data && !!reviewerComments.data && !!topThreads.data,
    error: hasError
  };
}
