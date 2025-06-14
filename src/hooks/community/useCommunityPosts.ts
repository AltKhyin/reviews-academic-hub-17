
// ABOUTME: Hook for fetching community posts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostData } from '@/types/postTypes';

export const useCommunityPosts = () => {
  const fetchPosts = async (): Promise<PostData[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select(`*`);

    if (error) {
      throw error;
    }
    
    // Casting to unknown first to fix the build error.
    return (data?.map(p => ({ ...p, tags: p.tags || [] })) || []) as unknown as PostData[];
  };

  return useQuery<PostData[], Error>({
    queryKey: ['community-posts'],
    queryFn: fetchPosts
  });
};
