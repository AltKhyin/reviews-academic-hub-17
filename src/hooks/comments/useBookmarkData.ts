
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookmarkData = (entityId: string, entityType: 'article' | 'issue' = 'issue') => {
  const { data: isBookmarked = false, isLoading: isLoadingBookmark } = useQuery({
    queryKey: ['entity-bookmark', entityId, entityType],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        let query = supabase
          .from('user_bookmarks')
          .select('id')
          .eq('user_id', user.id);
        
        // Apply the correct filter based on entityType
        if (entityType === 'article') {
          query = query.eq('article_id', entityId).is('issue_id', null);
        } else {
          query = query.eq('issue_id', entityId).is('article_id', null);
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) throw error;
        return !!data;
      } catch (err) {
        console.error('Error fetching bookmark status:', err);
        return false;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  return { isBookmarked, isLoadingBookmark };
};
