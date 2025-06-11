
// ABOUTME: Archive data hook using unified query system with intelligent caching
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';

interface ArchiveFilters {
  specialty?: string;
  year?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const useArchiveData = (filters: ArchiveFilters = {}) => {
  const {
    specialty,
    year,
    search,
    featured,
    page = 1,
    limit = 20
  } = filters;

  return useUnifiedQuery<Issue[]>(
    ['archive-issues', { specialty, year, search, featured, page, limit }],
    async (): Promise<Issue[]> => {
      console.log('useArchiveData: Fetching with filters:', filters);
      
      let query = supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (specialty) {
        query = query.eq('specialty', specialty);
      }
      
      if (year) {
        query = query.eq('year', year);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,authors.ilike.%${search}%`);
      }
      
      if (featured !== undefined) {
        query = query.eq('featured', featured);
      }
      
      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      
      if (error) {
        console.error('useArchiveData: Error fetching issues:', error);
        throw error;
      }
      
      console.log(`useArchiveData: Fetched ${data?.length || 0} issues`);
      return data || [];
    },
    {
      priority: 'normal',
      staleTime: 10 * 60 * 1000, // 10 minutes
      enableMonitoring: true,
      rateLimit: {
        endpoint: 'archive',
        maxRequests: 15,
        windowMs: 60000,
      },
    }
  );
};

// Optimized hook for archive metadata (specialties, years, etc.)
export const useArchiveMetadata = () => {
  return useUnifiedQuery(
    ['archive-metadata'],
    async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('specialty, year')
        .eq('published', true);
      
      if (error) {
        console.error('useArchiveMetadata: Error fetching metadata:', error);
        throw error;
      }
      
      // Extract unique specialties and years
      const specialties = [...new Set(data?.map(issue => issue.specialty).filter(Boolean))];
      const years = [...new Set(data?.map(issue => issue.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));
      
      return { specialties, years };
    },
    {
      priority: 'background',
      staleTime: 30 * 60 * 1000, // 30 minutes
      enableMonitoring: false,
      rateLimit: {
        endpoint: 'archive',
        maxRequests: 5,
        windowMs: 300000, // 5 minutes
      },
    }
  );
};

// Export for backward compatibility
export { useArchiveData as useOptimizedArchiveData };
