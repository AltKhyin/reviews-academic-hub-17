
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
    // No stale time, always fetch fresh data
    staleTime: 0,
    // Always enabled to ensure data is loaded
    enabled: true,
  });
};
