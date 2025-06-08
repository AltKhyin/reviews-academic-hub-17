
// ABOUTME: Heavily optimized sidebar data hook with intelligent caching and minimal database queries
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';

interface SidebarStats {
  totalUsers: number;
  onlineUsers: number;
  totalIssues: number;
  featuredIssues: number;
}

interface HighlightComment {
  id: string;
  author_name: string;
  author_avatar: string;
  body: string;
  votes: number;
  created_at: string;
  thread_id: string;
}

interface TopThread {
  id: string;
  title: string;
  comments: number;
  votes: number;
  created_at: string;
  thread_type: string;
}

interface SidebarData {
  stats: SidebarStats;
  topThreads: TopThread[];
  highlightComments: HighlightComment[];
  isLoading: boolean;
  error: Error | null;
}

// Optimized stats fetching with single query
const fetchSidebarStats = async (): Promise<SidebarStats> => {
  try {
    // Use Promise.allSettled for better error handling and parallel execution
    const [usersResult, onlineResult, issuesResult] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('online_users').select('id', { count: 'exact', head: true }),
      supabase.from('issues').select('id, featured', { count: 'exact' }).eq('published', true)
    ]);

    // Extract results with fallbacks
    const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0;
    const onlineUsers = onlineResult.status === 'fulfilled' ? (onlineResult.value.count || 0) : 0;
    const totalIssues = issuesResult.status === 'fulfilled' ? (issuesResult.value.count || 0) : 0;
    
    // Count featured issues from the data
    let featuredIssues = 0;
    if (issuesResult.status === 'fulfilled' && issuesResult.value.data) {
      featuredIssues = issuesResult.value.data.filter(issue => issue.featured).length;
    }

    return {
      totalUsers,
      onlineUsers,
      totalIssues,
      featuredIssues,
    };
  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    // Return default values instead of throwing
    return {
      totalUsers: 0,
      onlineUsers: 0,
      totalIssues: 0,
      featuredIssues: 0,
    };
  }
};

// Optimized top threads fetching using database function
const fetchTopThreads = async (): Promise<TopThread[]> => {
  try {
    const { data, error } = await supabase.rpc('get_top_threads', { min_comments: 3 });
    
    if (error) {
      console.error('Error fetching top threads:', error);
      return [];
    }

    return (data || []).map((thread: any) => ({
      id: thread.id,
      title: thread.title || 'Untitled Thread',
      comments: Number(thread.comments) || 0,
      votes: Number(thread.votes) || 0,
      created_at: thread.created_at,
      thread_type: thread.thread_type || 'post',
    }));
  } catch (error) {
    console.error('Error in fetchTopThreads:', error);
    return [];
  }
};

// Optimized highlight comments fetching
const fetchHighlightComments = async (): Promise<HighlightComment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments_highlight')
      .select('id, author_name, author_avatar, body, votes, created_at, thread_id')
      .order('votes', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching highlight comments:', error);
      return [];
    }

    return (data || []).map(comment => ({
      id: comment.id || '',
      author_name: comment.author_name || 'Anonymous',
      author_avatar: comment.author_avatar || '',
      body: comment.body || '',
      votes: Number(comment.votes) || 0,
      created_at: comment.created_at || new Date().toISOString(),
      thread_id: comment.thread_id || '',
    }));
  } catch (error) {
    console.error('Error in fetchHighlightComments:', error);
    return [];
  }
};

export const useOptimizedSidebarData = (): SidebarData => {
  // Stats query with aggressive caching
  const { data: stats = { totalUsers: 0, onlineUsers: 0, totalIssues: 0, featuredIssues: 0 }, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: queryKeys.sidebarStats(),
    queryFn: fetchSidebarStats,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Limited retries for stats
  });

  // Top threads query with moderate caching
  const { data: topThreads = [], isLoading: threadsLoading, error: threadsError } = useQuery({
    queryKey: ['sidebar-top-threads'],
    queryFn: fetchTopThreads,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Highlight comments query with moderate caching
  const { data: highlightComments = [], isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['sidebar-highlight-comments'],
    queryFn: fetchHighlightComments,
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 12 * 60 * 1000, // 12 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isLoading = statsLoading || threadsLoading || commentsLoading;
  const error = statsError || threadsError || commentsError || null;

  return {
    stats,
    topThreads,
    highlightComments,
    isLoading,
    error: error as Error | null,
  };
};

// Backward compatibility export
export const useSidebarData = useOptimizedSidebarData;
