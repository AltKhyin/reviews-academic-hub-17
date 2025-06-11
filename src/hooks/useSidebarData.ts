
// ABOUTME: Sidebar data hook using unified query system with intelligent caching
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';

interface SidebarStats {
  totalUsers: number;
  onlineUsers: number;
  totalIssues: number;
  totalPosts: number;
  totalComments: number;
}

interface TopThread {
  id: string;
  title: string;
  comments: number;
  votes: number;
  created_at: string;
  thread_type: string;
}

interface HighlightComment {
  id: string;
  votes: number;
  created_at: string;
  body: string;
  author_avatar: string;
  author_name: string;
  thread_id: string;
}

export const useSidebarStats = () => {
  return useUnifiedQuery<SidebarStats>(
    ['sidebar-stats'],
    async (): Promise<SidebarStats> => {
      console.log('useSidebarStats: Fetching sidebar statistics');
      
      const { data, error } = await supabase.rpc('get_sidebar_stats');
      
      if (error) {
        console.error('useSidebarStats: Error fetching stats:', error);
        throw error;
      }
      
      console.log('useSidebarStats: Fetched stats:', data);
      return data;
    },
    {
      priority: 'normal',
      staleTime: 5 * 60 * 1000, // 5 minutes
      enableMonitoring: true,
    }
  );
};

export const useTopThreads = () => {
  return useUnifiedQuery<TopThread[]>(
    ['top-threads'],
    async (): Promise<TopThread[]> => {
      console.log('useTopThreads: Fetching top threads');
      
      const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 3 });
      
      if (error) {
        console.error('useTopThreads: Error fetching top threads:', error);
        throw error;
      }
      
      console.log(`useTopThreads: Fetched ${data?.length || 0} threads`);
      return data || [];
    },
    {
      priority: 'background',
      staleTime: 10 * 60 * 1000, // 10 minutes
      enableMonitoring: false,
    }
  );
};

export const useHighlightComments = () => {
  return useUnifiedQuery<HighlightComment[]>(
    ['highlight-comments'],
    async (): Promise<HighlightComment[]> => {
      console.log('useHighlightComments: Fetching highlight comments');
      
      const { data, error } = await supabase
        .from('comments_highlight')
        .select('*')
        .order('votes', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('useHighlightComments: Error fetching comments:', error);
        throw error;
      }
      
      console.log(`useHighlightComments: Fetched ${data?.length || 0} comments`);
      return data || [];
    },
    {
      priority: 'background',
      staleTime: 15 * 60 * 1000, // 15 minutes
      enableMonitoring: false,
    }
  );
};

// Batch hook for all sidebar data
export const useSidebarData = () => {
  const stats = useSidebarStats();
  const threads = useTopThreads();
  const comments = useHighlightComments();
  
  return {
    stats,
    threads,
    comments,
    isLoading: stats.isLoading || threads.isLoading || comments.isLoading,
    error: stats.error || threads.error || comments.error,
  };
};

// Export for backward compatibility
export { useSidebarData as useOptimizedSidebarData };
