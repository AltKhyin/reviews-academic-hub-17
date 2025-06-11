
// ABOUTME: Hook for managing section visibility configuration with caching
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface SectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const useSectionVisibility = () => {
  const { 
    data: sections, 
    isLoading, 
    error 
  } = useOptimizedQuery<SectionConfig[]>(
    ['home-sections'],
    async (): Promise<SectionConfig[]> => {
      try {
        // Try to get home settings which might contain section configuration
        const { data, error } = await supabase.rpc('get_home_settings');
        
        if (error) {
          console.warn('Home settings error, using defaults:', error);
          return getDefaultSections();
        }

        // If we have data, process it, otherwise use defaults
        if (data && typeof data === 'object' && 'sections' in data) {
          return processSectionData(data.sections);
        }
        
        return getDefaultSections();
      } catch (error) {
        console.warn('Section visibility error, using defaults:', error);
        return getDefaultSections();
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 20 * 60 * 1000, // 20 minutes for section config
    }
  );

  const getVisibleSections = () => {
    return (sections || []).filter(section => section.visible);
  };

  return {
    sections: sections || [],
    isLoading,
    error,
    getVisibleSections,
  };
};

// Default sections configuration
const getDefaultSections = (): SectionConfig[] => [
  { id: 'featured', title: 'Featured Issue', visible: true, order: 1 },
  { id: 'recent', title: 'Recent Issues', visible: true, order: 2 },
  { id: 'popular', title: 'Popular This Week', visible: true, order: 3 },
  { id: 'discussions', title: 'Latest Discussions', visible: true, order: 4 },
];

// Process section data from database
const processSectionData = (sectionsData: any): SectionConfig[] => {
  if (!Array.isArray(sectionsData)) {
    return getDefaultSections();
  }

  return sectionsData.map((section, index) => ({
    id: section.id || `section-${index}`,
    title: section.title || section.name || `Section ${index + 1}`,
    visible: section.visible !== false,
    order: section.order || index + 1,
  }));
};
