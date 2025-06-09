
// ABOUTME: Zustand store for managing section visibility configurations
import { create } from 'zustand';

interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface SectionVisibilityState {
  sections: SectionConfig[];
  getSectionConfig: () => SectionConfig[];
  setSectionVisibility: (id: string, visible: boolean) => void;
  updateSectionOrder: (sections: SectionConfig[]) => void;
}

export const useSectionVisibilityStore = create<SectionVisibilityState>((set, get) => ({
  sections: [
    { id: 'hero', name: 'Hero Section', enabled: true, order: 1 },
    { id: 'featured', name: 'Featured Section', enabled: true, order: 2 },
    { id: 'recent', name: 'Recent Section', enabled: true, order: 3 },
    { id: 'trending', name: 'Trending Section', enabled: true, order: 4 },
    { id: 'reviewer-notes', name: 'Reviewer Notes', enabled: true, order: 5 },
  ],
  
  getSectionConfig: () => get().sections,
  
  setSectionVisibility: (id: string, visible: boolean) =>
    set((state) => ({
      sections: state.sections.map(section =>
        section.id === id ? { ...section, enabled: visible } : section
      ),
    })),
  
  updateSectionOrder: (newSections: SectionConfig[]) =>
    set({ sections: newSections }),
}));
