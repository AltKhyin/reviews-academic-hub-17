
// ABOUTME: Optimized archive search with proper interface definitions
import { useOptimizedQuery, queryKeys, queryConfigs } from '../useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface OptimizedArchiveResult {
  issues: Array<{
    id: string;
    title: string;
    cover_image_url?: string;
    specialty: string;
    published_at: string;
    authors?: string;
    year?: string;
    score?: number;
  }>;
  metadata: {
    totalCount: number;
    filteredCount: number;
    specialties: string[];
    years: string[];
  };
}

interface UseOptimizedArchiveSearchProps {
  searchQuery?: string;
  specialty?: string;
  year?: string;
  limit?: number;
  offset?: number;
}

export const useOptimizedArchiveSearch = ({
  searchQuery = '',
  specialty = '',
  year = '',
  limit = 20,
  offset = 0
}: UseOptimizedArchiveSearchProps) => {
  
  const { data, isLoading, error } = useOptimizedQuery<OptimizedArchiveResult>(
    queryKeys.archiveSearch(searchQuery, specialty),
    async (): Promise<OptimizedArchiveResult> => {
      try {
        // Build query with filters
        let query = supabase
          .from('issues')
          .select('id, title, cover_image_url, specialty, published_at, authors, year, score')
          .eq('published', true);

        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,authors.ilike.%${searchQuery}%`);
        }

        if (specialty) {
          query = query.eq('specialty', specialty);
        }

        if (year) {
          query = query.eq('year', year);
        }

        const { data: issues, error } = await query
          .order('score', { ascending: false })
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.warn('Archive search error:', error);
          return {
            issues: [],
            metadata: {
              totalCount: 0,
              filteredCount: 0,
              specialties: [],
              years: [],
            },
          };
        }

        // Get metadata separately for better performance - with proper typing
        const { data: metadataResult } = await supabase.rpc('get_archive_metadata');
        
        // Safe metadata parsing with type guards
        const parseMetadata = (data: any) => {
          if (!data || typeof data !== 'object') {
            return { total_published: 0, specialties: [], years: [] };
          }
          return {
            total_published: Number(data.total_published) || 0,
            specialties: Array.isArray(data.specialties) ? data.specialties : [],
            years: Array.isArray(data.years) ? data.years : [],
          };
        };

        const parsedMetadata = parseMetadata(metadataResult);
        
        return {
          issues: issues || [],
          metadata: {
            totalCount: parsedMetadata.total_published,
            filteredCount: issues?.length || 0,
            specialties: parsedMetadata.specialties,
            years: parsedMetadata.years,
          },
        };
      } catch (error) {
        console.warn('Archive search error:', error);
        return {
          issues: [],
          metadata: {
            totalCount: 0,
            filteredCount: 0,
            specialties: [],
            years: [],
          },
        };
      }
    },
    {
      ...queryConfigs.dynamic,
      enabled: true,
    }
  );

  const result = useMemo(() => ({
    issues: data?.issues || [],
    totalCount: data?.metadata.totalCount || 0,
    filteredCount: data?.metadata.filteredCount || 0,
    specialties: data?.metadata.specialties || [],
    years: data?.metadata.years || [],
    isLoading,
    error,
    hasError: Boolean(error),
  }), [data, isLoading, error]);

  return result;
};
