
// ABOUTME: Simple posts hook that loads data directly without complex optimizations
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SimplePost {
  id: string;
  title: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  user_id: string;
  flair_id?: string;
  published: boolean;
  score: number;
  created_at: string;
  updated_at: string;
  poll_id?: string;
  pinned?: boolean;
  pinned_at?: string;
  pinned_by?: string;
  issue_id?: string;
  auto_generated?: boolean;
  pin_duration_days?: number;
}

export const useSimplePosts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('Loading posts with simple query...');
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading posts:', error);
        throw error;
      }
      
      console.log('Successfully loaded', data?.length || 0, 'posts');
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
