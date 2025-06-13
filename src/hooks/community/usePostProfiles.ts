
// ABOUTME: Simple hook to load user profiles for posts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePostProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['profiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      
      console.log('Loading profiles for', userIds.length, 'users');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (error) {
        console.error('Error loading profiles:', error);
        throw error;
      }
      
      console.log('Successfully loaded', data?.length || 0, 'profiles');
      return data || [];
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - profiles change less frequently
  });
};
