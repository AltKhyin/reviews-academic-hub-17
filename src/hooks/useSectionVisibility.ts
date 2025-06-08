
// ABOUTME: Enhanced unified hook with complete section schema and better synchronization
import { useState, useEffect, useCallback } from 'react';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 'reviews', title: 'Reviews do Editor', visible: true, order: 0 },
  { id: 'featured', title: 'Edições em Destaque', visible: true, order: 1 },
  { id: 'upcoming', title: 'Próximas Edições', visible: true, order: 2 },
  { id: 'recent', title: 'Edições Recentes', visible: true, order: 3 },
  { id: 'recommended', title: 'Recomendados', visible: true, order: 4 },
  { id: 'trending', title: 'Mais Acessados', visible: true, order: 5 },
];

const STORAGE_KEY = 'homepage_sections';

export const useSectionVisibility = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced cross-tab synchronization
  const broadcastChannel = new BroadcastChannel(STORAGE_KEY);

  // Load sections from localStorage on mount
  useEffect(() => {
    const loadSections = () => {
      try {
        const savedSections = localStorage.getItem(STORAGE_KEY);
        if (savedSections) {
          const parsed = JSON.parse(savedSections) as Section[];
          
          // Ensure all default sections exist, merge with saved data
          const mergedSections = DEFAULT_SECTIONS.map(defaultSection => {
            const savedSection = parsed.find(s => s.id === defaultSection.id);
            return savedSection ? { ...defaultSection, ...savedSection } : defaultSection;
          });
          
          // Add any saved sections that don't exist in defaults (for extensibility)
          const savedOnlySections = parsed.filter(saved => 
            !DEFAULT_SECTIONS.find(def => def.id === saved.id)
          );
          
          const allSections = [...mergedSections, ...savedOnlySections]
            .sort((a, b) => a.order - b.order);
          
          setSections(allSections);
          console.log('SectionVisibility: Loaded sections from localStorage:', allSections);
        } else {
          setSections(DEFAULT_SECTIONS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SECTIONS));
          console.log('SectionVisibility: Initialized with default sections:', DEFAULT_SECTIONS);
        }
      } catch (error) {
        console.error('SectionVisibility: Error loading section visibility:', error);
        setSections(DEFAULT_SECTIONS);
        // Try to save defaults in case of corrupted data
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SECTIONS));
        } catch (saveError) {
          console.error('SectionVisibility: Failed to save default sections:', saveError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSections();
  }, []);

  // Enhanced save function with broadcasting
  const saveSections = useCallback((newSections: Section[]) => {
    try {
      // Validate sections before saving
      const validatedSections = newSections.map(section => ({
        ...section,
        order: typeof section.order === 'number' ? section.order : 0,
        visible: typeof section.visible === 'boolean' ? section.visible : true
      }));

      setSections(validatedSections);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedSections));
      console.log('SectionVisibility: Sections saved successfully:', validatedSections);
      
      // Broadcast to other tabs/windows
      broadcastChannel.postMessage({
        type: 'SECTIONS_UPDATED',
        sections: validatedSections
      });
    } catch (error) {
      console.error('SectionVisibility: Error saving sections:', error);
      // Fallback: try to restore previous state
      setSections(prevSections => prevSections);
    }
  }, [broadcastChannel]);

  // Listen for broadcasts from other tabs
  useEffect(() => {
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data.type === 'SECTIONS_UPDATED') {
        setSections(event.data.sections);
        console.log('SectionVisibility: Sections updated from broadcast:', event.data.sections);
      }
    };

    broadcastChannel.addEventListener('message', handleBroadcast);
    
    return () => {
      broadcastChannel.removeEventListener('message', handleBroadcast);
      broadcastChannel.close();
    };
  }, [broadcastChannel]);

  // Get visible sections in order
  const getVisibleSections = useCallback(() => {
    return sections
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
  }, [sections]);

  // Get all sections in order (including hidden ones)
  const getAllSections = useCallback(() => {
    return sections.sort((a, b) => a.order - b.order);
  }, [sections]);

  // Check if a specific section is visible
  const isSectionVisible = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.visible ?? false;
  }, [sections]);

  // Get section by ID
  const getSection = useCallback((sectionId: string) => {
    return sections.find(s => s.id === sectionId);
  }, [sections]);

  // Update specific section
  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    saveSections(updatedSections);
  }, [sections, saveSections]);

  // Toggle section visibility
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSection(sectionId, { visible: !section.visible });
    }
  }, [sections, updateSection]);

  // Reorder sections
  const reorderSections = useCallback((newOrder: string[]) => {
    const reorderedSections = newOrder.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as Section[];

    // Add any sections not included in the new order at the end
    const includedIds = new Set(newOrder);
    const remainingSections = sections.filter(s => !includedIds.has(s.id));
    const allSections = [...reorderedSections, ...remainingSections.map((s, index) => ({
      ...s,
      order: reorderedSections.length + index
    }))];

    saveSections(allSections);
  }, [sections, saveSections]);

  // Reset to default configuration
  const resetToDefaults = useCallback(() => {
    setSections(DEFAULT_SECTIONS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SECTIONS));
      console.log('SectionVisibility: Reset to default sections');
      
      // Broadcast reset to other tabs
      broadcastChannel.postMessage({
        type: 'SECTIONS_UPDATED',
        sections: DEFAULT_SECTIONS
      });
    } catch (error) {
      console.error('SectionVisibility: Error resetting to defaults:', error);
    }
  }, [broadcastChannel]);

  return {
    sections,
    isLoading,
    saveSections,
    getVisibleSections,
    getAllSections,
    isSectionVisible,
    getSection,
    updateSection,
    toggleSectionVisibility,
    reorderSections,
    resetToDefaults,
  };
};
