
// ABOUTME: Optimized posts hook with better query key stability and reduced polling
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostData } from '@/types/community';

export function usePosts(activeTab: string, searchTerm: string) {
  const { user } = useAuth();
  
  // Fix: Create stable query key to prevent unnecessary refetches
  const queryKey = ['community-posts', activeTab, searchTerm.trim(), user?.id];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`Fetching posts for tab: ${activeTab}, search: "${searchTerm}"`);
      
      await supabase.rpc('unpin_expired_posts');

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
      
      // Fix: Only apply search if term is not empty to avoid unnecessary filtering
      if (searchTerm.trim()) {
        pinnedQuery = pinnedQuery.ilike('title', `%${searchTerm.trim()}%`);
        regularQuery = regularQuery.ilike('title', `%${searchTerm.trim()}%`);
      }
      
      if (activeTab === 'popular') {
        regularQuery = regularQuery.order('score', { ascending: false });
      } else if (activeTab === 'oldest') {
        regularQuery = regularQuery.order('created_at', { ascending: true });
      } else {
        regularQuery = regularQuery.order('created_at', { ascending: false });
      }

      if (activeTab === 'my' && user) {
        pinnedQuery = pinnedQuery.eq('user_id', user.id);
        regularQuery = regularQuery.eq('user_id', user.id);
      }

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
    // Fix: Reduce unnecessary polling and improve performance
    staleTime: 60000, // 1 minute instead of 30 seconds
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
    refetchInterval: 120000, // Only auto-refetch every 2 minutes
    refetchIntervalInBackground: false, // Don't refetch when tab is not visible
  });
}
