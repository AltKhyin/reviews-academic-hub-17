
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUpcomingRelease = () => {
  return useQuery({
    queryKey: ['upcomingRelease'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upcoming_releases')
        .select('*')
        .order('release_date', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    }
  });
};
