
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';

export const useIssues = () => {
  const { user, isAdmin, isEditor } = useAuth();

  return useQuery({
    queryKey: ['issues', user?.id, isAdmin, isEditor],
    queryFn: async () => {
      try {
        console.log('Fetching issues - User:', user?.id, 'IsAdmin:', isAdmin, 'IsEditor:', isEditor);
        
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching issues:", error);
          throw error;
        }
        
        console.log('Issues fetched successfully:', data?.length || 0, 'issues');
        return (data as Issue[]) || [];
      } catch (error: any) {
        console.error("Error in useIssues hook:", error);
        // Don't throw the error, return empty array to prevent crash
        return [];
      }
    },
    // Always enabled to ensure data is loaded
    enabled: true,
    // Refetch when user authentication state changes
    staleTime: 0,
    // Retry failed requests
    retry: (failureCount, error) => {
      console.log('useIssues retry attempt:', failureCount, error);
      return failureCount < 2;
    },
  });
};
