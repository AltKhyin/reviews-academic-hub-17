
// ABOUTME: Archive-specific RPC optimization with materialized view support
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { Issue } from '@/types/issue';

interface ArchiveParams {
  limit?: number;
  offset?: number;
  specialty?: string;
  year?: string;
  featured?: boolean;
}

interface ArchiveResponse {
  issues: Issue[];
  total_count: number;
  specialties: string[];
  years: string[];
}

// Primary archive function using materialized views for performance
export const useArchiveRPCOptimization = (params: ArchiveParams = {}) => {
  const {
    limit = 20,
    offset = 0,
    specialty,
    year,
    featured = false
  } = params;

  return useOptimizedQuery(
    queryKeys.issues({ ...params, type: 'archive-rpc' }),
    async (): Promise<ArchiveResponse> => {
      try {
        // First try the optimized RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_optimized_issues', {
          p_limit: limit,
          p_offset: offset,
          p_specialty: specialty || null,
          p_featured_only: featured,
          p_include_unpublished: false,
        });

        if (rpcError) {
          console.warn('RPC fallback triggered:', rpcError);
          // Fallback to direct query if RPC fails
          return await fallbackArchiveQuery(params);
        }

        // Get additional metadata for filters
        const [specialtiesResult, yearsResult] = await Promise.all([
          supabase.from('issues')
            .select('specialty')
            .eq('published', true)
            .not('specialty', 'is', null),
          supabase.from('issues')
            .select('year')
            .eq('published', true)
            .not('year', 'is', null)
        ]);

        const specialties = [...new Set((specialtiesResult.data || []).map(i => i.specialty))];
        const years = [...new Set((yearsResult.data || []).map(i => i.year))];

        return {
          issues: rpcData || [],
          total_count: rpcData?.length || 0,
          specialties,
          years,
        };
      } catch (error) {
        console.error('Archive RPC optimization error:', error);
        return await fallbackArchiveQuery(params);
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 8 * 60 * 1000, // 8 minutes for archive data
    }
  );
};

// Fallback query function for RPC failures
const fallbackArchiveQuery = async (params: ArchiveParams): Promise<ArchiveResponse> => {
  const { limit = 20, offset = 0, specialty, year, featured = false } = params;
  
  let query = supabase
    .from('issues')
    .select('*')
    .eq('published', true);

  if (specialty) query = query.eq('specialty', specialty);
  if (year) query = query.eq('year', year);
  if (featured) query = query.eq('featured', true);

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    issues: data || [],
    total_count: data?.length || 0,
    specialties: [],
    years: [],
  };
};

// Prefetch function for route transitions
export const prefetchArchiveData = (params: ArchiveParams) => {
  return {
    queryKey: queryKeys.issues({ ...params, type: 'archive-rpc' }),
    queryFn: () => supabase.rpc('get_optimized_issues', {
      p_limit: params.limit || 20,
      p_offset: params.offset || 0,
      p_specialty: params.specialty || null,
      p_featured_only: params.featured || false,
      p_include_unpublished: false,
    }),
    staleTime: 8 * 60 * 1000,
  };
};
