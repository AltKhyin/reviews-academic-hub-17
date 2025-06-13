
// ABOUTME: Simple hook to load post flairs
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePostFlairs = () => {
  return useQuery({
    queryKey: ['post-flairs'],
    queryFn: async () => {
      console.log('Loading post flairs...');
      
      const { data, error } = await supabase
        .from('post_flairs')
        .select('id, name, color')
        .order('name');

      if (error) {
        console.error('Error loading post flairs:', error);
        throw error;
      }
      
      console.log('Successfully loaded', data?.length || 0, 'post flairs');
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - flairs change very rarely
  });
};
