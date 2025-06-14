
// ABOUTME: Simplified archive data hook without tag hierarchy - only fetches issues and basic metadata
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';

interface ArchiveDataState {
  issues: Issue[];
  totalCount: number;
  specialties: string[];
  years: string[];
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
    backend_tags: null, // Not used in simplified archive
  }));
};

// Simple metadata extraction without tag configuration
const fetchArchiveMetadata = async (issues: Issue[]) => {
  // Extract unique specialties and years from issues data
  const specialties = [...new Set(issues.map(issue => issue.specialty).filter(Boolean))].sort();
  const years = [...new Set(issues.map(issue => issue.year).filter(Boolean))].sort().reverse();
  
  return { specialties, years };
};

export const useOptimizedArchiveData = () => {
  const { isAdmin } = useAuth();
  
  // Main issues query using unified system
  const { 
    data: issues = [], 
    isLoading: issuesLoading, 
    error: issuesError 
  } = useUnifiedQuery(
    ['archive-issues', isAdmin],
    () => fetchArchiveIssues(isAdmin),
    {
      priority: 'normal',
      staleTime: 10 * 60 * 1000, // 10 minutes
      enableMonitoring: true,
    }
  );

  // Metadata query using unified system
  const { 
    data: metadata, 
    isLoading: metadataLoading, 
    error: metadataError 
  } = useUnifiedQuery(
    ['archive-metadata', issues.length],
    () => fetchArchiveMetadata(issues),
    {
      enabled: issues.length > 0,
      priority: 'background',
      staleTime: 15 * 60 * 1000, // 15 minutes
      enableMonitoring: false,
    }
  );

  const isLoading = issuesLoading || (issues.length > 0 && metadataLoading);
  const error = issuesError || metadataError;

  return {
    data: {
      issues,
      totalCount: issues.length,
      specialties: metadata?.specialties || [],
      years: metadata?.years || [],
    } as ArchiveDataState,
    isLoading,
    error,
  };
};
