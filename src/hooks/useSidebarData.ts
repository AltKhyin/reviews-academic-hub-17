// ABOUTME: Hook for fetching sidebar data. Placeholder.
import { useQuery } from '@tanstack/react-query';

export const useSidebarData = () => {
  const fetchSidebarData = async () => {
    // Placeholder implementation
    return { topIssues: [], newComments: [] };
  };

  return useQuery({
    queryKey: ['sidebar-data'],
    queryFn: fetchSidebarData,
  });
};
