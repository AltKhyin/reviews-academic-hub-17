
// ABOUTME: Hook for managing homepage section visibility and ordering
import { useState, useEffect, useCallback } from 'react';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 'hero', title: 'Hero Section', visible: true, order: 0 },
  { id: 'articles', title: 'Articles Grid', visible: true, order: 1 },
  { id: 'reviews', title: 'Reviews do Editor', visible: true, order: 2 },
  { id: 'reviewer', title: 'Notas do Revisor', visible: true, order: 3 },
  { id: 'featured', title: 'Edições em Destaque', visible: true, order: 4 },
  { id: 'upcoming', title: 'Próximas Edições', visible: true, order: 5 },
  { id: 'recent', title: 'Edições Recentes', visible: true, order: 6 },
  { id: 'recommended', title: 'Recomendados', visible: true, order: 7 },
  { id: 'trending', title: 'Mais Acessados', visible: true, order: 8 },
];

const STORAGE_KEY = 'homepage_sections';

export const useSectionVisibility = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sections from localStorage on mount
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem(STORAGE_KEY);
      if (savedSections) {
        const parsed = JSON.parse(savedSections) as Section[];
        
        // Ensure all default sections exist, merge with saved data
        const mergedSections = DEFAULT_SECTIONS.map(defaultSection => {
          const savedSection = parsed.find(s => s.id === defaultSection.id);
          return savedSection ? { ...defaultSection, ...savedSection } : defaultSection;
        });
        
        setSections(mergedSections.sort((a, b) => a.order - b.order));
      } else {
        setSections(DEFAULT_SECTIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SECTIONS));
      }
    } catch (error) {
      console.error('Error loading section visibility:', error);
      setSections(DEFAULT_SECTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save sections to localStorage
  const saveSections = useCallback((newSections: Section[]) => {
    try {
      setSections(newSections);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
      console.log('Sections saved successfully:', newSections);
    } catch (error) {
      console.error('Error saving sections:', error);
    }
  }, []);

  // Get visible sections in order
  const getVisibleSections = useCallback(() => {
    return sections
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
  }, [sections]);

  // Check if a specific section is visible
  const isSectionVisible = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.visible ?? false;
  }, [sections]);

  return {
    sections,
    isLoading,
    saveSections,
    getVisibleSections,
    isSectionVisible,
  };
};
