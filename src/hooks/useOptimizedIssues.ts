
// ABOUTME: Fixed TypeScript errors in optimized issues hook
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { Issue } from '@/types/issue';

interface UseIssuesOptions {
  includeUnpublished?: boolean;
  featured?: boolean;
  limit?: number;
  select?: string;
}

export const useOptimizedIssues = (options: UseIssuesOptions = {}) => {
  const { isAdmin } = useOptimizedAuth();
  const queryClient = useQueryClient();
  
  const {
    includeUnpublished = false,
    featured = false,
    limit,
    select = '*'
  } = options;

  // Determine what fields to select based on context
  const selectFields = select === '*' 
    ? 'id, title, description, cover_image_url, published, featured, specialty, authors, search_title, search_description, year, design, score, created_at, updated_at'
    : select;

  return useQuery({
    queryKey: [...queryKeys.issues(), includeUnpublished, featured, limit, select],
    queryFn: async (): Promise<Issue[]> => {
      try {
        let query = supabase
          .from('issues')
          .select(selectFields)
          .order('created_at', { ascending: false });

        // Apply filters based on user permissions and options
        if (!includeUnpublished || !isAdmin) {
          query = query.eq('published', true);
        }

        if (featured) {
          query = query.eq('featured', true);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching issues:", error);
          throw error;
        }
        
        // Process the data to ensure proper typing
        const processedIssues: Issue[] = (data || []).map(issue => ({
          ...issue,
          backend_tags: typeof issue.backend_tags === 'string' ? issue.backend_tags : JSON.stringify(issue.backend_tags || ''),
          year: issue.year || '',
          pdf_url: issue.pdf_url || '',
          specialty: issue.specialty || '',
          published: issue.published || false,
          created_at: issue.created_at || new Date().toISOString(),
          updated_at: issue.updated_at || new Date().toISOString(),
        }));

        return processedIssues;
      } catch (error: any) {
        console.error("Error in useOptimizedIssues hook:", error);
        throw error; // Re-throw to let React Query handle it properly
      }
    },
    ...queryConfigs.static, // Use static config since issues don't change frequently
    enabled: true,
    // Add specific cache configuration for issues
    staleTime: includeUnpublished && isAdmin 
      ? 2 * 60 * 1000 // 2 minutes for admin with drafts
      : 15 * 60 * 1000, // 15 minutes for published issues
  });
};

// Optimized hook for single issue
export const useOptimizedIssue = (id: string) => {
  return useQuery({
    queryKey: queryKeys.issue(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Process the data to ensure proper typing
      const processedIssue: Issue = {
        ...data,
        backend_tags: typeof data.backend_tags === 'string' ? data.backend_tags : JSON.stringify(data.backend_tags || ''),
        year: data.year || '',
      };
      
      return processedIssue;
    },
    ...queryConfigs.static,
    enabled: !!id,
  });
};

// Optimized hook for featured issue
export const useOptimizedFeaturedIssue = () => {
  return useQuery({
    queryKey: queryKeys.featuredIssue(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, description, cover_image_url, specialty, authors, search_title, search_description')
        .eq('published', true)
        .eq('featured', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No featured issue found
          return null;
        }
        throw error;
      }
      
      // Process the data to ensure proper typing
      const processedIssue: Issue = {
        ...data,
        backend_tags: '',
        year: '',
        pdf_url: '',
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      return processedIssue;
    },
    ...queryConfigs.static,
    staleTime: 30 * 60 * 1000, // 30 minutes since featured issues change rarely
  });
};

// Batch issues operations
export const useIssuesBatch = () => {
  const { canEdit } = useOptimizedAuth();
  
  return {
    // Get published issues for public display
    published: useOptimizedIssues({ 
      includeUnpublished: false,
      select: 'id, title, description, cover_image_url, specialty, authors, search_title'
    }),
    
    // Get featured issue
    featured: useOptimizedFeaturedIssue(),
    
    // Get all issues for admin (only if admin)
    all: useOptimizedIssues({ 
      includeUnpublished: canEdit
    }),
    
    // Get recent issues for homepage
    recent: useOptimizedIssues({ 
      limit: 6,
      select: 'id, title, cover_image_url, specialty, search_title'
    }),
  };
};
