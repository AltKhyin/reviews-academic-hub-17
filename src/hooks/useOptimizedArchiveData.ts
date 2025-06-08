
// ABOUTME: Optimized archive data fetching with hierarchical backend_tags support
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export interface ArchiveDataResult {
  issues: any[];
  totalCount: number;
  specialties: string[];
  years: string[];
  tagConfig: Record<string, string[]>;
}

const fetchArchiveData = async (): Promise<ArchiveDataResult> => {
  try {
    // Fetch all published issues with backend_tags
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select(`
        id,
        title,
        authors,
        description,
        specialty,
        backend_tags,
        published_at,
        created_at,
        score,
        cover_image_url,
        pdf_url,
        year,
        design,
        population,
        search_title,
        search_description,
        featured
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (issuesError) throw issuesError;

    const allIssues = issues || [];

    // Extract unique specialties and years
    const specialties = [...new Set(allIssues.map(issue => issue.specialty).filter(Boolean))];
    const years = [...new Set(allIssues.map(issue => issue.year).filter(Boolean))];

    // Get active tag configuration
    const { data: tagConfigData, error: tagConfigError } = await supabase
      .from('tag_configurations')
      .select('tag_data')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let tagConfig: Record<string, string[]> = {};
    
    if (!tagConfigError && tagConfigData?.tag_data) {
      tagConfig = tagConfigData.tag_data as Record<string, string[]>;
    } else {
      // Build tag config from existing backend_tags
      const backendTagsSet = new Set<string>();
      
      allIssues.forEach(issue => {
        if (issue.backend_tags) {
          try {
            const tags = typeof issue.backend_tags === 'string' 
              ? JSON.parse(issue.backend_tags) 
              : issue.backend_tags;
            
            if (typeof tags === 'object') {
              Object.entries(tags).forEach(([category, tagList]) => {
                if (Array.isArray(tagList)) {
                  tagList.forEach(tag => backendTagsSet.add(tag));
                }
              });
            }
          } catch (e) {
            // If parsing fails, treat as string
            if (typeof issue.backend_tags === 'string') {
              backendTagsSet.add(issue.backend_tags);
            }
          }
        }
        
        // Also include specialty as a tag category
        if (issue.specialty) {
          backendTagsSet.add(issue.specialty);
        }
      });

      // Organize tags by category
      tagConfig = {
        'Especialidades': specialties,
        'Metodologia': Array.from(backendTagsSet).filter(tag => 
          tag.toLowerCase().includes('estudo') || 
          tag.toLowerCase().includes('análise') ||
          tag.toLowerCase().includes('revisão') ||
          tag.toLowerCase().includes('meta') ||
          tag.toLowerCase().includes('randomizado')
        ),
        'População': Array.from(backendTagsSet).filter(tag => 
          tag.toLowerCase().includes('adulto') || 
          tag.toLowerCase().includes('criança') ||
          tag.toLowerCase().includes('idoso') ||
          tag.toLowerCase().includes('pediatria') ||
          tag.toLowerCase().includes('geriatria')
        ),
        'Outros': Array.from(backendTagsSet).filter(tag => 
          !specialties.includes(tag) &&
          !tag.toLowerCase().includes('estudo') &&
          !tag.toLowerCase().includes('análise') &&
          !tag.toLowerCase().includes('revisão') &&
          !tag.toLowerCase().includes('meta') &&
          !tag.toLowerCase().includes('randomizado') &&
          !tag.toLowerCase().includes('adulto') &&
          !tag.toLowerCase().includes('criança') &&
          !tag.toLowerCase().includes('idoso') &&
          !tag.toLowerCase().includes('pediatria') &&
          !tag.toLowerCase().includes('geriatria')
        )
      };
    }

    return {
      issues: allIssues,
      totalCount: allIssues.length,
      specialties,
      years,
      tagConfig
    };

  } catch (error) {
    console.error('Error fetching archive data:', error);
    return {
      issues: [],
      totalCount: 0,
      specialties: [],
      years: [],
      tagConfig: {}
    };
  }
};

export const useOptimizedArchiveData = (filters?: any) => {
  return useOptimizedQuery(
    queryKeys.archiveData(),
    fetchArchiveData,
    {
      ...queryConfigs.static,
      staleTime: 15 * 60 * 1000, // 15 minutes - archive data doesn't change frequently
      gcTime: 30 * 60 * 1000, // 30 minutes
    }
  );
};
