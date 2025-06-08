
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
    ? 'id, title, description, cover_image_url, published, featured, specialty, authors, search_title, search_description, year, design, score, created_at, updated_at, pdf_url, review_type, published_at, backend_tags'
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
        
        // Process the data to ensure proper typing - check if data exists and is an array
        if (!data || !Array.isArray(data)) {
          return [];
        }

        // Type assertion to ensure we're working with the correct data structure
        const issueData = data as any[];

        const processedIssues: Issue[] = issueData
          .filter(item => item && typeof item === 'object' && item.id) // Filter out invalid items
          .map(issue => ({
            id: issue.id,
            title: issue.title || '',
            description: issue.description || null,
            cover_image_url: issue.cover_image_url || null,
            published: Boolean(issue.published),
            featured: Boolean(issue.featured),
            specialty: issue.specialty || '',
            authors: issue.authors || null,
            search_title: issue.search_title || null,
            search_description: issue.search_description || null,
            year: issue.year || null,
            design: issue.design || null,
            score: issue.score || null,
            created_at: issue.created_at || new Date().toISOString(),
            updated_at: issue.updated_at || new Date().toISOString(),
            pdf_url: issue.pdf_url || '',
            review_type: (issue.review_type as 'pdf' | 'native' | 'hybrid') || 'pdf',
            published_at: issue.published_at || null,
            backend_tags: typeof issue.backend_tags === 'string' 
              ? issue.backend_tags 
              : JSON.stringify(issue.backend_tags || ''),
            // Optional fields with defaults
            article_pdf_url: issue.article_pdf_url || null,
            real_title: issue.real_title || null,
            real_title_ptbr: issue.real_title_ptbr || null,
            population: issue.population || null,
            review_content: issue.review_content || null,
            toc_data: issue.toc_data || null,
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
        id: data.id,
        title: data.title || '',
        description: data.description || null,
        cover_image_url: data.cover_image_url || null,
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        specialty: data.specialty || '',
        authors: data.authors || null,
        search_title: data.search_title || null,
        search_description: data.search_description || null,
        year: data.year || null,
        design: data.design || null,
        score: data.score || null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        pdf_url: data.pdf_url || '',
        review_type: (data.review_type as 'pdf' | 'native' | 'hybrid') || 'pdf',
        published_at: data.published_at || null,
        backend_tags: typeof data.backend_tags === 'string' 
          ? data.backend_tags 
          : JSON.stringify(data.backend_tags || ''),
        // Optional fields
        article_pdf_url: data.article_pdf_url || null,
        real_title: data.real_title || null,
        real_title_ptbr: data.real_title_ptbr || null,
        population: data.population || null,
        review_content: data.review_content || null,
        toc_data: data.toc_data || null,
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
        .select('id, title, description, cover_image_url, specialty, authors, search_title, search_description, published_at, pdf_url, published, created_at, updated_at, featured')
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
        id: data.id,
        title: data.title || '',
        description: data.description || null,
        cover_image_url: data.cover_image_url || null,
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        specialty: data.specialty || '',
        authors: data.authors || null,
        search_title: data.search_title || null,
        search_description: data.search_description || null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        pdf_url: data.pdf_url || '',
        published_at: data.published_at || null,
        review_type: 'pdf' as const,
        // Default values for missing fields
        backend_tags: '',
        year: null,
        design: null,
        score: null,
        population: null,
        article_pdf_url: null,
        real_title: null,
        real_title_ptbr: null,
        review_content: null,
        toc_data: null,
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
      select: 'id, title, description, cover_image_url, specialty, authors, search_title, published_at, pdf_url, published, created_at, updated_at'
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
      select: 'id, title, cover_image_url, specialty, search_title, published_at, pdf_url, published, created_at, updated_at'
    }),
  };
};
