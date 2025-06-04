
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';

export const useIssues = () => {
  const { user, isAdmin, isEditor, profile } = useAuth();

  return useQuery({
    queryKey: ['issues', user?.id, profile?.role],
    queryFn: async () => {
      try {
        console.log("useIssues: Fetching issues - User:", user?.id, "Role:", profile?.role, "IsAdmin:", isAdmin, "IsEditor:", isEditor);
        
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching issues:", error);
          throw error;
        }
        
        console.log(`useIssues: Successfully fetched ${data?.length || 0} issues`);
        
        // Log sample of data for debugging
        if (data && data.length > 0) {
          console.log("useIssues: First issue sample:", {
            id: data[0].id,
            title: data[0].title,
            published: data[0].published,
            featured: data[0].featured
          });
        }
        
        return data as Issue[];
      } catch (error: any) {
        console.error("Error in useIssues hook:", error);
        // Return empty array on error to prevent crashes
        return [];
      }
    },
    // Fresh data on every load to ensure we see latest content
    staleTime: 30000, // 30 seconds stale time
    // Always enabled
    enabled: true,
    // Retry once on failure
    retry: 1,
    // Show cached data while refetching
    refetchOnMount: true,
  });
};
