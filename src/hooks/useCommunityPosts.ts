
// ABOUTME: Optimized community posts hook with proper caching and error handling
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunitySettings, PostData } from '@/types/community';
import { usePosts } from '@/hooks/community/usePosts';
import { enhancePostsWithDetails } from '@/hooks/community/usePostEnhancement';

export function useCommunityPosts(activeTab: string, searchTerm: string) {
  const { data: rawPosts, isLoading: isRawPostsLoading, error: rawPostsError, refetch: refetchRawPosts } = usePosts(activeTab, searchTerm);
  
  // Enhanced posts query with optimized caching
  const enhancedQuery = useQuery({
    queryKey: ['enhanced-posts', rawPosts?.map(p => p.id).join(','), activeTab],
    queryFn: async () => {
      if (!rawPosts || rawPosts.length === 0) return [] as PostData[];
      
      try {
        return await enhancePostsWithDetails(rawPosts);
      } catch (error) {
        console.error('Error enhancing posts:', error);
        // Return empty array if enhancement fails to ensure type safety
        return [] as PostData[];
      }
    },
    enabled: !!rawPosts && rawPosts.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    data: enhancedQuery.data as PostData[] | undefined,
    isLoading: isRawPostsLoading || enhancedQuery.isLoading,
    error: rawPostsError || enhancedQuery.error,
    refetch: async () => {
      await refetchRawPosts();
      await enhancedQuery.refetch();
    }
  };
}

export function usePostFlairs() {
  return useQuery({
    queryKey: ['flairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_flairs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCommunitySettings() {
  return useQuery<CommunitySettings>({
    queryKey: ['community-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('community_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          // Return default settings if none exist
          return {
            id: 'default',
            header_image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
            theme_color: '#1e40af',
            description: 'Comunidade científica para discussão de evidências médicas',
            allow_polls: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching community settings:', error);
        // Return default settings on error
        return {
          id: 'default',
          header_image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2942&auto=format&fit=crop',
          theme_color: '#1e40af',
          description: 'Comunidade científica para discussão de evidências médicas',
          allow_polls: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}
