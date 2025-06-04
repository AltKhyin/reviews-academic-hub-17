
import { useState, useEffect } from 'react';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const useSectionVisibility = () => {
  const defaultSections: Section[] = [
    { id: "reviews", title: "Reviews do Editor", visible: true, order: 0 },
    { id: "reviewer", title: "Notas do Revisor", visible: true, order: 1 },
    { id: "featured", title: "Edições em Destaque", visible: true, order: 2 },
    { id: "upcoming", title: "Próximas Edições", visible: true, order: 3 },
    { id: "recent", title: "Edições Recentes", visible: true, order: 4 },
    { id: "recommended", title: "Recomendados", visible: true, order: 5 },
    { id: "trending", title: "Mais Acessados", visible: true, order: 6 }
  ];

  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSections = () => {
      try {
        const savedSections = localStorage.getItem('homepage_sections');
        if (savedSections) {
          const parsed = JSON.parse(savedSections);
          // Check if the saved sections include the "reviews" section
          const hasReviewsSection = parsed.some((s: Section) => s.id === 'reviews');
          
          if (!hasReviewsSection) {
            // Add the reviews section if it's missing from saved data
            const updatedSections = [
              { id: "reviews", title: "Reviews do Editor", visible: true, order: 0 },
              ...parsed.map((s: Section) => ({ ...s, order: s.order + 1 }))
            ];
            localStorage.setItem('homepage_sections', JSON.stringify(updatedSections));
            setSections(updatedSections);
          } else {
            setSections(parsed);
          }
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
