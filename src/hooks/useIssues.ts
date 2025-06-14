// ABOUTME: Hook for fetching issues. Placeholder.
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';

export const useIssues = () => {
  const fetchIssues = async () => {
    // Placeholder implementation
    return { issues: [], total: 0 };
  };

  return useQuery<{issues: Issue[], total: number}, Error>({
    queryKey: ['issues'],
    queryFn: fetchIssues,
  });
};
