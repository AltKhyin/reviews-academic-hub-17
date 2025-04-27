
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';

export const useIssues = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['issues', user?.role],
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
        // Return empty array instead of throwing to prevent UI breakage
        return [];
      }
    },
    // Add retry configuration and staleTime
    retry: 1,
    staleTime: 30000,
    // Make it safer by adding initialData
    initialData: [],
  });
};
