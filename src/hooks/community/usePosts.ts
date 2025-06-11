
// ABOUTME: Optimized posts hook with better performance and reduced API calls
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostData } from '@/types/community';

export function usePosts(activeTab: string, searchTerm: string) {
  const { user } = useAuth();
  
  // Create stable query key to prevent unnecessary refetches
  const trimmedSearchTerm = searchTerm.trim();
  const queryKey = ['community-posts', activeTab, trimmedSearchTerm, user?.id];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`Fetching posts for tab: ${activeTab}, search: "${trimmedSearchTerm}"`);
      
      // Only call unpin function when necessary (not for every query)
      if (activeTab !== 'my') {
        await supabase.rpc('unpin_expired_posts');
      }

      let pinnedQuery = supabase
        .from('posts')
        .select(`*`)
        .eq('published', true)
        .eq('pinned', true)
        .order('pinned_at', { ascending: false });

      let regularQuery = supabase
        .from('posts')
        .select(`*`)
        .eq('published', true)
        .eq('pinned', false);
      
      // Apply search filter only if term is not empty
      if (trimmedSearchTerm) {
        pinnedQuery = pinnedQuery.ilike('title', `%${trimmedSearchTerm}%`);
        regularQuery = regularQuery.ilike('title', `%${trimmedSearchTerm}%`);
      }
      
      // Apply ordering based on active tab
      if (activeTab === 'popular') {
        regularQuery = regularQuery.order('score', { ascending: false });
      } else if (activeTab === 'oldest') {
        regularQuery = regularQuery.order('created_at', { ascending: true });
      } else {
        regularQuery = regularQuery.order('created_at', { ascending: false });
      }

      // Apply user filter for 'my' tab
      if (activeTab === 'my' && user) {
        pinnedQuery = pinnedQuery.eq('user_id', user.id);
        regularQuery = regularQuery.eq('user_id', user.id);
      }

      // Execute queries in parallel
      const [{ data: pinnedPosts, error: pinnedError }, { data: regularPosts, error: regularError }] = await Promise.all([
        pinnedQuery,
        regularQuery
      ]);
      
      if (pinnedError) {
        console.error('Error fetching pinned posts:', pinnedError);
        throw pinnedError;
      }
      if (regularError) {
        console.error('Error fetching regular posts:', regularError);
        throw regularError;
      }
      
      const allPosts = [...(pinnedPosts || []), ...(regularPosts || [])];
      
      console.log(`Fetched ${allPosts.length} posts (${pinnedPosts?.length || 0} pinned, ${regularPosts?.length || 0} regular)`);
      
      return allPosts;
    },
    enabled: true,
    // Optimized caching and refresh intervals
    staleTime: 2 * 60 * 1000, // 2 minutes - increased from 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes - increased cache time
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchInterval: false, // Disable automatic polling - only manual refresh
    refetchIntervalInBackground: false,
    // Add retry logic for failed requests
    retry: (failureCount, error) => {
      console.log('Posts query retry:', failureCount, error);
      return failureCount < 2; // Only retry twice
    },
  });
}
