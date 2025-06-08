
// ABOUTME: Heavily optimized archive data hook with intelligent caching and field selection
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useStableAuth } from './useStableAuth';

interface TagConfig {
  [category: string]: string[];
}

interface ArchiveDataState {
  issues: Issue[];
  totalCount: number;
  specialties: string[];
  years: string[];
  tagConfig: TagConfig;
}

// Optimized query for archive with minimal fields
const fetchArchiveIssues = async (includeUnpublished: boolean = false): Promise<Issue[]> => {
  let query = supabase
    .from('issues')
    .select(`
      id,
      title,
      cover_image_url,
      specialty,
      authors,
      year,
      published,
      featured,
      created_at,
      published_at,
      backend_tags,
      description,
      search_title,
      search_description
    `)
    .order('created_at', { ascending: false });

  if (!includeUnpublished) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  
  if (error) throw error;

  return (data || []).map(issue => ({
    id: issue.id,
    title: issue.title || '',
    cover_image_url: issue.cover_image_url,
    specialty: issue.specialty || '',
    authors: issue.authors,
    year: issue.year,
    published: Boolean(issue.published),
    featured: Boolean(issue.featured),
    created_at: issue.created_at,
    published_at: issue.published_at,
    backend_tags: typeof issue.backend_tags === 'string' 
      ? issue.backend_tags 
      : JSON.stringify(issue.backend_tags || ''),
    description: issue.description,
    search_title: issue.search_title,
    search_description: issue.search_description,
    // Defaults for non-archive-critical fields
    pdf_url: '',
    review_type: 'pdf' as const,
    score: 0,
    updated_at: issue.created_at,
    population: null,
    article_pdf_url: null,
    real_title: null,
    real_title_ptbr: null,
    review_content: null,
    toc_data: null,
    design: null,
  }));
};

// Optimized metadata fetching
const fetchArchiveMetadata = async (issues: Issue[]) => {
  // Extract unique specialties and years from issues data
  const specialties = [...new Set(issues.map(issue => issue.specialty).filter(Boolean))].sort();
  const years = [...new Set(issues.map(issue => issue.year).filter(Boolean))].sort().reverse();
  
  // Get active tag configuration
  const { data: tagConfigData } = await supabase
    .from('tag_configurations')
    .select('tag_data')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let tagConfig: TagConfig = {};
  
  if (tagConfigData?.tag_data) {
    try {
      tagConfig = typeof tagConfigData.tag_data === 'object' 
        ? tagConfigData.tag_data as TagConfig
        : JSON.parse(tagConfigData.tag_data as string);
    } catch (error) {
      console.warn('Failed to parse tag configuration:', error);
      // Fallback to extracting tags from issues
      tagConfig = extractTagsFromIssues(issues);
    }
  } else {
    // Fallback: extract tag configuration from issues backend_tags
    tagConfig = extractTagsFromIssues(issues);
  }

  return { specialties, years, tagConfig };
};

// Fallback function to extract tag structure from issues
const extractTagsFromIssues = (issues: Issue[]): TagConfig => {
  const tagConfig: TagConfig = {};
  
  issues.forEach(issue => {
    if (issue.backend_tags) {
      try {
        const tags = typeof issue.backend_tags === 'string' 
          ? JSON.parse(issue.backend_tags) 
          : issue.backend_tags;
        
        if (typeof tags === 'object' && tags !== null) {
          Object.entries(tags).forEach(([category, tagList]) => {
            if (!tagConfig[category]) {
              tagConfig[category] = [];
            }
            
            if (Array.isArray(tagList)) {
              tagList.forEach(tag => {
                if (typeof tag === 'string' && !tagConfig[category].includes(tag)) {
                  tagConfig[category].push(tag);
                }
              });
            }
          });
        }
      } catch (error) {
        // Skip parsing errors for individual issues
      }
    }
  });
  
  // Sort tag arrays for consistency
  Object.keys(tagConfig).forEach(category => {
    tagConfig[category].sort();
  });
  
  return tagConfig;
};

export const useOptimizedArchiveData = () => {
  const { permissions } = useStableAuth();
  
  // Main issues query
  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery({
    queryKey: ['archive-issues', permissions.isAdmin],
    queryFn: () => fetchArchiveIssues(permissions.isAdmin),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Metadata query (depends on issues but runs in parallel once issues load)
  const { data: metadata, isLoading: metadataLoading, error: metadataError } = useQuery({
    queryKey: ['archive-metadata', issues.length],
    queryFn: () => fetchArchiveMetadata(issues),
    enabled: issues.length > 0,
    staleTime: 15 * 60 * 1000, // 15 minutes - metadata changes less frequently
    gcTime: 45 * 60 * 1000, // 45 minutes
    retry: 1, // Less critical, single retry
  });

  const isLoading = issuesLoading || (issues.length > 0 && metadataLoading);
  const error = issuesError || metadataError;

  return {
    data: {
      issues,
      totalCount: issues.length,
      specialties: metadata?.specialties || [],
      years: metadata?.years || [],
      tagConfig: metadata?.tagConfig || {},
    } as ArchiveDataState,
    isLoading,
    error,
  };
};
