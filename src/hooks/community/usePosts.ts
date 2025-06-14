// ABOUTME: Simplified posts hook. Primary data fetching for community page moved to useCommunityPosts with RPC.
// This hook might be used for other, simpler post listings or could be deprecated.
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
// PostData type might still be relevant if this hook is used elsewhere.
// For now, we assume it might return a simpler version of Post data.

export function usePosts(activeTab: string, searchTerm: string) {
  const { user } = useAuth();
  const trimmedSearchTerm = searchTerm.trim();
  // This queryKey should be different from the one in useCommunityPosts
  const queryKey = ['community-posts-basic', activeTab, trimmedSearchTerm, user?.id];

  // This hook is now significantly simplified.
  // It NO LONGER fetches detailed posts for the main community page.
  // That logic is in `useCommunityPosts` using an RPC.
  // If this hook is still needed for other parts of the app
  // that require a basic list of posts, its queryFn would be simpler.
  // For now, let's make it return an empty array and log a warning,
  // indicating it should be refactored or removed if not used.

  console.warn(`usePosts hook is being called for tab: ${activeTab}, search: "${trimmedSearchTerm}". 
    Consider migrating to useCommunityPosts for detailed post fetching or ensure this basic version is still required.`);

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Placeholder: If this hook is truly needed elsewhere, implement a simplified query.
      // Otherwise, it should be removed.
      // Example: Fetch only post IDs and titles for a very basic list.
      
      // The unpin_expired_posts call was moved to useCommunityPosts.ts
      // If this hook has other responsibilities, they should be clearly defined.

      // For now, returning empty to avoid breaking components that might still import it,
      // but it signals that this hook's original purpose for the community page is gone.
      return Promise.resolve([]); 
    },
    enabled: true, 
    staleTime: 5 * 60 * 1000, // 5 minutes, less critical now
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
