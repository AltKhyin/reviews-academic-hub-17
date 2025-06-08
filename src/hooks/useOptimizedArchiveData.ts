
// ABOUTME: Optimized archive data hook with intelligent filtering and caching
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { Issue } from '@/types/issue';

interface ArchiveFilters {
  search?: string;
  tags?: string[];
  specialty?: string;
  year?: number;
  sortBy?: 'newest' | 'oldest' | 'title' | 'score';
}

interface ArchiveData {
  issues: Issue[];
  totalCount: number;
  specialties: string[];
  years: number[];
  availableTags: string[];
}

export const useOptimizedArchiveData = (filters: ArchiveFilters = {}) => {
  const { search, tags, specialty, year, sortBy = 'newest' } = filters;

  return useQuery({
    queryKey: [...queryKeys.archiveData(search, tags), specialty, year, sortBy],
    queryFn: async (): Promise<ArchiveData> => {
      try {
        // Build the query with filters
        let query = supabase
          .from('issues')
          .select('*')
          .eq('published', true);

        // Apply search filter
        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,authors.ilike.%${search}%,search_title.ilike.%${search}%,search_description.ilike.%${search}%`);
        }

        // Apply specialty filter
        if (specialty) {
          query = query.eq('specialty', specialty);
        }

        // Apply year filter
        if (year) {
          query = query.eq('year', year.toString());
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'title':
            query = query.order('title', { ascending: true });
            break;
          case 'score':
            query = query.order('score', { ascending: false, nullsFirst: false });
            break;
        }

        const { data: issues, error } = await query;

        if (error) {
          console.error('Error fetching archive data:', error);
          throw error;
        }

        // Process issues to ensure proper typing
        const processedIssues: Issue[] = (issues || []).map(issue => ({
          ...issue,
          backend_tags: typeof issue.backend_tags === 'string' ? issue.backend_tags : JSON.stringify(issue.backend_tags || ''),
          year: issue.year || '',
        }));

        // Get unique specialties and years for filters
        const specialties = [...new Set(processedIssues.map(issue => issue.specialty).filter(Boolean))] as string[];
        const years = [...new Set(processedIssues.map(issue => issue.year).filter(Boolean).map(y => parseInt(y)).filter(y => !isNaN(y)))] as number[];
        
        // For now, return empty tags array - this would need to be implemented based on your tag system
        const availableTags: string[] = [];

        return {
          issues: processedIssues,
          totalCount: processedIssues.length,
          specialties: specialties.sort(),
          years: years.sort((a, b) => b - a), // Most recent first
          availableTags,
        };
      } catch (error) {
        console.error('Error in useOptimizedArchiveData:', error);
        return {
          issues: [],
          totalCount: 0,
          specialties: [],
          years: [],
          availableTags: [],
        };
      }
    },
    ...queryConfigs.static,
    // Cache longer for archive data since it doesn't change frequently
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Enable the query
    enabled: true,
  });
};

// Simplified hook for backward compatibility
export const useArchiveData = useOptimizedArchiveData;
