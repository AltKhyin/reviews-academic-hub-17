
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useIssues = () => {
  return useQuery({
    queryKey: ['issues'],
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
        toast({
          title: "Error loading issues",
          description: error.message || "Could not load the issues list.",
          variant: "destructive",
        });
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
