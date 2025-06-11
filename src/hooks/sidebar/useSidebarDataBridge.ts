
// ABOUTME: Fixed sidebar data bridge with proper cleanup, stable dependencies, and error handling
import { useEffect, useCallback, useRef } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useOptimizedSidebarData } from '@/hooks/useOptimizedSidebarData';
import { supabase } from '@/integrations/supabase/client';
import { OnlineUser } from '@/types/sidebar';

export function useSidebarDataBridge(userId?: string) {
  // Get store actions directly from the store
  const { setStats, setComments, setThreads, setError, setLoading, setOnlineUsers } = useSidebarStore();
  
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

  // Fetch online users with proper error handling
  const fetchOnlineUsers = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('online_users')
        .select('id, full_name, avatar_url, last_active')
        .order('last_active', { ascending: false })
        .limit(15);
      
      if (error) {
        console.warn('Error fetching online users:', error);
        // Don't throw, just log and continue with empty array
        if (isMountedRef.current) {
          setOnlineUsers([]);
        }
        return;
      }
      
      if (isMountedRef.current) {
        // Ensure data has proper structure for OnlineUser type
        const validUsers = (data || []).map(user => ({
          id: user.id || '',
          full_name: user.full_name || 'Usuário',
          avatar_url: user.avatar_url || null,
          last_active: user.last_active || new Date().toISOString()
        })) as OnlineUser[];
        
        setOnlineUsers(validUsers);
      }
    } catch (err) {
      console.error('Unexpected error fetching online users:', err);
      if (isMountedRef.current) {
        setOnlineUsers([]);
        setError(err);
      }
    }
  }, [setOnlineUsers, setError]);

  // Memoized update function to prevent unnecessary re-renders
  const updateSidebarStore = useCallback(() => {
    if (!isMountedRef.current) return;

    setLoading(isLoading);
    
    if (hasError) {
      setError(hasError);
      return;
    }

    if (!isLoading) {
      // Update stats with fallback values
      if (stats.data) {
        setStats({
          totalUsers: stats.data.totalUsers || 0,
          onlineUsers: stats.data.onlineUsers || 0,
          totalIssues: stats.data.totalIssues || 0,
          totalPosts: stats.data.totalPosts || 0,
          totalComments: stats.data.totalComments || 0,
        });
      }
      
      // Update comments with proper transformation
      if (reviewerComments.data && Array.isArray(reviewerComments.data)) {
        setComments(reviewerComments.data.map(comment => ({
          id: comment.id,
          author_name: comment.reviewer_name || 'Reviewer',
          author_avatar: comment.reviewer_avatar || null,
          body: comment.comment || '',
          votes: 0,
          created_at: comment.created_at,
          thread_id: `comment-${comment.id}`
        })));
      }
      
      // Update threads with proper transformation
      if (topThreads.data && Array.isArray(topThreads.data)) {
        setThreads(topThreads.data.map(thread => ({
          id: thread.id,
          title: thread.title || 'Discussão',
          comments: Number(thread.comments) || 0,
          votes: thread.votes || 0,
          created_at: thread.created_at,
          thread_type: thread.thread_type || 'post'
        })));
      }
      
      setError(null);
    }
  }, [
    isLoading,
    hasError,
    stats.data,
    reviewerComments.data,
    topThreads.data,
    setStats,
    setComments,
    setThreads,
    setError,
    setLoading
  ]);

  // Effect with stable dependencies and proper cleanup
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
