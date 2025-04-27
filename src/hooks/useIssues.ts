
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useIssues = () => {
  return useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching issues:", error);
        toast({
          title: "Error loading issues",
          description: "Could not load the issues list.",
          variant: "destructive",
        });
        return [];
      }
      return data as Issue[];
    }
  });
};
