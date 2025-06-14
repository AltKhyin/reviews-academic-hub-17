
// ABOUTME: Enhanced archive search hook with state management and proper interfaces
import { useState, useCallback } from 'react';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

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

export const useOptimizedArchiveSearch = (props: UseOptimizedArchiveSearchProps = {}) => {
  const [searchQuery, setSearchQuery] = useState(props.searchQuery || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>(props.specialty);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(props.year);

  const { data, isLoading, error } = useOptimizedQuery<OptimizedArchiveResult>(
    queryKeys.archiveSearch(searchQuery, selectedSpecialty),
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

        if (selectedSpecialty) {
          query = query.eq('specialty', selectedSpecialty);
        }

        if (selectedYear) {
          query = query.eq('year', selectedYear);
        }

        const { data: issues, error } = await query
          .order('score', { ascending: false })
          .order('published_at', { ascending: false })
          .range(props.offset || 0, (props.offset || 0) + (props.limit || 20) - 1);

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

        // Get metadata separately for better performance
        const { data: metadataResult } = await supabase.rpc('get_archive_metadata');
        
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

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedSpecialty(undefined);
    setSelectedYear(undefined);
  }, []);

  return {
    issues: data?.issues || [],
    totalCount: data?.metadata.totalCount || 0,
    filteredCount: data?.metadata.filteredCount || 0,
    specialties: data?.metadata.specialties || [],
    years: data?.metadata.years || [],
    searchQuery,
    selectedTags,
    selectedSpecialty,
    selectedYear,
    setSearchQuery,
    setSelectedTags,
    setSelectedSpecialty,
    setSelectedYear,
    clearAllFilters,
    isLoading,
    error,
    hasError: Boolean(error),
  };
};
