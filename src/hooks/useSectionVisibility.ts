
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const useSectionVisibility = () => {
  const defaultSections: Section[] = [
    { id: "reviewer", title: "Notas do Revisor", visible: true, order: 0 },
    { id: "featured", title: "Edições em Destaque", visible: true, order: 1 },
    { id: "upcoming", title: "Próximas Edições", visible: true, order: 2 },
    { id: "recent", title: "Edições Recentes", visible: true, order: 3 },
    { id: "recommended", title: "Recomendados", visible: true, order: 4 },
    { id: "trending", title: "Mais Acessados", visible: true, order: 5 }
  ];

  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('*')
          .order('order', { ascending: true });
        
        if (error) throw error;
        return data && data.length > 0 ? data : defaultSections;
      } catch (error) {
        console.error('Error fetching section visibility:', error);
        return defaultSections;
      }
    }
  });

  const isSectionVisible = (sectionId: string): boolean => {
    if (!sections || sections.length === 0) return true;
    const section = sections.find(s => s.id === sectionId);
    return section ? section.visible : true;
  };

  const getSectionOrder = (sectionId: string): number => {
    if (!sections || sections.length === 0) {
      const defaultSection = defaultSections.find(s => s.id === sectionId);
      return defaultSection ? defaultSection.order : 999;
    }
    const section = sections.find(s => s.id === sectionId);
    return section ? section.order : 999;
  };

  const getSortedVisibleSectionIds = (): string[] => {
    if (!sections || sections.length === 0) {
      return defaultSections
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order)
        .map(s => s.id);
    }
    
    return sections
      .filter(s => s.visible)
      .sort((a, b) => a.order - b.order)
      .map(s => s.id);
  };

  return {
    sections,
    isLoading,
    isSectionVisible,
    getSectionOrder,
    getSortedVisibleSectionIds
  };
};
