
// ABOUTME: Section visibility management hook for dashboard layout configuration
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface SectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const defaultSections: SectionConfig[] = [
  { id: 'reviews', title: 'Reviewer Comments', visible: true, order: 0 },
  { id: 'featured', title: 'Featured Content', visible: true, order: 1 },
  { id: 'recent', title: 'Recent Issues', visible: true, order: 2 },
  { id: 'recommended', title: 'Recommended', visible: true, order: 3 },
  { id: 'trending', title: 'Trending', visible: true, order: 4 },
  { id: 'upcoming', title: 'Upcoming Releases', visible: true, order: 5 },
];

export const useSectionVisibility = () => {
  const { 
    data: sections = defaultSections, 
    isLoading,
    error 
  } = useOptimizedQuery(
    queryKeys.homeSettings(),
    async (): Promise<SectionConfig[]> => {
      try {
        const { data, error } = await supabase.rpc('get_home_settings');
        
        if (error) throw error;
        
        // Parse the home settings and extract section configuration
        const settings = data;
        if (settings?.sections) {
          return Object.entries(settings.sections).map(([id, config]: [string, any]) => ({
            id,
            title: config.title || id.replace('_', ' '),
            visible: config.visible !== false,
            order: config.order || 0,
          }));
        }
        
        return defaultSections;
      } catch (error) {
        console.warn('Failed to load section visibility settings:', error);
        return defaultSections;
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 15 * 60 * 1000, // 15 minutes for section config
    }
  );

  const getVisibleSections = () => {
    return sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
  };

  const getSectionById = (id: string) => {
    return sections.find(section => section.id === id);
  };

  return {
    sections,
    isLoading,
    error,
    getVisibleSections,
    getSectionById,
  };
};
