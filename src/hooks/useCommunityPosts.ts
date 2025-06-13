
// ABOUTME: Hook for community posts data fetching
// Simplified to avoid circular dependencies

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCommunityPosts = (activeTab: string, searchTerm: string) => {
  return useQuery({
    queryKey: ['community-posts', activeTab, searchTerm],
    queryFn: async () => {
      console.log(`Fetching posts for tab: ${activeTab}, search: "${searchTerm}"`);
      
      let query = supabase
        .from('posts')
        .select('*')
        .eq('published', true);
      
      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (activeTab === 'popular') {
        query = query.order('score', { ascending: false });
      } else if (activeTab === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });
};

export const usePostFlairs = () => {
  return useQuery({
    queryKey: ['post-flairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_flairs')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000
  });
};
