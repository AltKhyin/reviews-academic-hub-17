// ABOUTME: Hook for fetching native review data. Placeholder.
import { useQuery } from '@tanstack/react-query';
import { ReviewBlock } from '@/types/review';

export const useNativeReview = (issueId?: string) => {
  const fetchNativeReview = async (): Promise<{ blocks: ReviewBlock[] }> => {
    // Placeholder implementation
    return { blocks: [] };
  };

  return useQuery<{ blocks: ReviewBlock[] }, Error>({
    queryKey: ['native-review', issueId],
    queryFn: fetchNativeReview,
    enabled: !!issueId,
  });
};
