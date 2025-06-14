
// ABOUTME: Optimized archive data hook that consolidates multiple API calls into efficient queries
// Reduces API cascade from 25+ requests to <5 requests per page load

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OptimizedArchiveIssue {
  id: string;
  title: string;
  cover_image_url: string | null;
  specialty: string;
  authors: string | null;
  year: string | null;
  published_at: string;
  created_at: string;
  featured: boolean;
  published: boolean;
  score: number;
  description: string | null;
  // Enhanced fields from consolidation
  tag_matches: number;
  search_relevance: number;
}

interface OptimizedArchiveResult {
  issues: OptimizedArchiveIssue[];
  totalCount: number;
  filteredCount: number;
  specialties: string[];
  years: string[];
  tagCategories: Array<{
    name: string;
    tags: string[];
  }>;
  userInteractions: {
    bookmarkedIssues: Set<string>;
    recentViews: Set<string>;
  };
}

export const useOptimizedArchiveData = (
  searchQuery: string = '',
  selectedTags: string[] = [],
  specialty?: string,
  year?: string
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['archive-data-optimized', { searchQuery, selectedTags, specialty, year, userId: user?.id }],
    queryFn: async (): Promise<OptimizedArchiveResult> => {
      console.log('useOptimizedArchiveData: Fetching with params:', { searchQuery, selectedTags, specialty, year });

      try {
        // Single consolidated query for all archive data
        let query = supabase
          .from('issues')
          .select(`
            id,
            title,
            cover_image_url,
            specialty,
            authors,
            year,
            published_at,
            created_at,
            featured,
            published,
            score,
            description,
            backend_tags
          `)
          .eq('published', true);

        // Apply filters
        if (specialty) {
          query = query.eq('specialty', specialty);
        }
        
        if (year) {
          query = query.eq('year', year);
        }
        
        // Apply search filtering
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,authors.ilike.%${searchQuery}%,specialty.ilike.%${searchQuery}%`);
        }
        
        // Order by relevance and score
        query = query.order('score', { ascending: false }).order('created_at', { ascending: false });

        const { data: rawIssues, error, count } = await query;

        if (error) {
          console.error('useOptimizedArchiveData: Error fetching issues:', error);
          throw error;
        }

        // Get metadata in parallel
        const [specialtiesResponse, yearsResponse, userBookmarksResponse] = await Promise.all([
          // Get unique specialties
          supabase
            .from('issues')
            .select('specialty')
            .eq('published', true)
            .not('specialty', 'is', null),
          
          // Get unique years
          supabase
            .from('issues')
            .select('year')
            .eq('published', true)
            .not('year', 'is', null),
          
          // Get user bookmarks if logged in
          user ? supabase
            .from('user_bookmarks')
            .select('issue_id')
            .eq('user_id', user.id)
            .not('issue_id', 'is', null) : Promise.resolve({ data: [] })
        ]);

        // Process and enhance issues
        const processedIssues: OptimizedArchiveIssue[] = (rawIssues || []).map((issue, index) => {
          let tagMatches = 0;
          let searchRelevance = 0;

          // Calculate search relevance
          if (searchQuery.trim()) {
            const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
            const searchableText = `${issue.title || ''} ${issue.description || ''} ${issue.authors || ''} ${issue.specialty || ''}`.toLowerCase();
            
            searchTerms.forEach(term => {
              if (searchableText.includes(term)) {
                searchRelevance++;
                if (issue.title?.toLowerCase().includes(term)) searchRelevance += 2; // Title matches more important
              }
            });
          }

          // Calculate tag matches for selected tags
          if (selectedTags.length > 0) {
            const issueText = `${issue.title || ''} ${issue.description || ''} ${issue.authors || ''} ${issue.specialty || ''} ${issue.backend_tags || ''}`.toLowerCase();
            selectedTags.forEach(tag => {
              if (issueText.includes(tag.toLowerCase())) {
                tagMatches++;
              }
            });
          }

          return {
            ...issue,
            published_at: issue.published_at || issue.created_at,
            tag_matches: tagMatches,
            search_relevance: searchRelevance,
          };
        });

        // Sort by relevance if searching or tag filtering
        const sortedIssues = (searchQuery.trim() || selectedTags.length > 0) 
          ? processedIssues.sort((a, b) => {
              const aRelevance = a.search_relevance + a.tag_matches;
              const bRelevance = b.search_relevance + b.tag_matches;
              if (aRelevance !== bRelevance) return bRelevance - aRelevance;
              return b.score - a.score; // Fallback to score
            })
          : processedIssues;

        // Extract unique values for filters
        const specialties = [...new Set((specialtiesResponse.data || []).map(s => s.specialty).filter(Boolean))];
        const years = [...new Set((yearsResponse.data || []).map(y => y.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));

        // Process user interactions
        const bookmarkedIssues = new Set((userBookmarksResponse.data || []).map(b => b.issue_id).filter(Boolean));

        const result: OptimizedArchiveResult = {
          issues: sortedIssues,
          totalCount: count || sortedIssues.length,
          filteredCount: sortedIssues.length,
          specialties,
          years,
          tagCategories: [], // Will be populated by tag system if needed
          userInteractions: {
            bookmarkedIssues,
            recentViews: new Set(), // Could be enhanced with user session data
          },
        };

        console.log(`useOptimizedArchiveData: Processed ${result.issues.length} issues with ${result.specialties.length} specialties`);
        return result;

      } catch (error) {
        console.error('useOptimizedArchiveData: Critical error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });
};

// Export for backward compatibility
export { useOptimizedArchiveData as useConsolidatedArchiveData };
