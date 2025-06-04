
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PostData } from '@/types/community';

export function usePosts(activeTab: string, searchTerm: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['community-posts', activeTab, searchTerm, user?.id],
    queryFn: async () => {
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
      
      if (searchTerm) {
        pinnedQuery = pinnedQuery.ilike('title', `%${searchTerm}%`);
        regularQuery = regularQuery.ilike('title', `%${searchTerm}%`);
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
      
      if (pinnedError) throw pinnedError;
      if (regularError) throw regularError;
      
      const allPosts = [...(pinnedPosts || []), ...(regularPosts || [])];
      
      if (!allPosts.length) return [];
      
      return allPosts;
    },
    enabled: true,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}
