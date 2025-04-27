import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';

export const useIssues = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['issues', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching issues:", error);
          throw error;
        }
        
        return data as Issue[];
      } catch (error: any) {
        console.error("Error in useIssues hook:", error);
        return [];
      }
    },
    // Ensure we don't get stale data
    staleTime: 0,
    // Disabled when user is null, refetch when user becomes available
    enabled: true,
    // Keep previous data while refetching to prevent UI flicker
    keepPreviousData: true,
  });
};
