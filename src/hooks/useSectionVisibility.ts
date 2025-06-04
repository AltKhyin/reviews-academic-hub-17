
import { useState, useEffect } from 'react';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const useSectionVisibility = () => {
  // Updated sections for new magazine layout
  const defaultSections: Section[] = [
    { id: "featured", title: "Edição em Destaque", visible: true, order: 0 },
    { id: "recent", title: "Edições Recentes", visible: true, order: 1 },
    { id: "recommended", title: "Recomendados para Você", visible: true, order: 2 },
    { id: "trending", title: "Mais Acessados", visible: true, order: 3 },
    { id: "reviews", title: "Reviews do Editor", visible: true, order: 4 },
    { id: "reviewer", title: "Notas do Revisor", visible: true, order: 5 },
    { id: "upcoming", title: "Próximas Edições", visible: true, order: 6 }
  ];

  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSections = () => {
      try {
        const savedSections = localStorage.getItem('homepage_sections');
        if (savedSections) {
          const parsed = JSON.parse(savedSections);
          
          // Ensure all default sections exist, especially new magazine sections
          const updatedSections = [...defaultSections];
          
          // Update with saved preferences while preserving all sections
          parsed.forEach((savedSection: Section) => {
            const existingIndex = updatedSections.findIndex(s => s.id === savedSection.id);
            if (existingIndex !== -1) {
              updatedSections[existingIndex] = { ...savedSection };
            }
          });
          
          // Sort by order
          updatedSections.sort((a, b) => a.order - b.order);
          
          localStorage.setItem('homepage_sections', JSON.stringify(updatedSections));
          setSections(updatedSections);
        } else {
          setSections(defaultSections);
          localStorage.setItem('homepage_sections', JSON.stringify(defaultSections));
        }
      } catch (error) {
        console.error('Error loading section visibility:', error);
        setSections(defaultSections);
        localStorage.setItem('homepage_sections', JSON.stringify(defaultSections));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSections();
  }, []);

  const saveSections = (updatedSections: Section[]) => {
    try {
      localStorage.setItem('homepage_sections', JSON.stringify(updatedSections));
      setSections(updatedSections);
    } catch (error) {
      console.error('Error saving section visibility:', error);
    }
  };

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
    saveSections,
    isSectionVisible,
    getSectionOrder,
    getSortedVisibleSectionIds
  };
};
