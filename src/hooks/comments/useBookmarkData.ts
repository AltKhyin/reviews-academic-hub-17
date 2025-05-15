
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookmarkData = (articleId: string) => {
  const { data: isBookmarked = false, isLoading: isLoadingBookmark } = useQuery({
    queryKey: ['issue-bookmark', articleId],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('id')
          .eq('issue_id', articleId)
          .eq('user_id', user.id)
          .maybeSingle();
        
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
