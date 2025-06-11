// ABOUTME: Unified section registry - single source of truth for all homepage sections
export interface SectionDefinition {
  id: string;
  title: string;
  component: string;
  order: number;
  defaultVisible: boolean;
  adminOnly: boolean;
  description?: string;
}

export const SECTION_REGISTRY: Record<string, SectionDefinition> = {
  reviewer: {
    id: 'reviewer',
    title: 'Reviewer Notes',
    component: 'ReviewerNotesSection',
    order: 0,
    defaultVisible: true,
    adminOnly: true,
    description: 'Administrative reviewer notes and comments'
  },
  featured: {
    id: 'featured',
    title: 'Featured Issue',
    component: 'FeaturedSection',
    order: 1,
    defaultVisible: true,
    adminOnly: false,
    description: 'Highlighted featured issue of the month'
  },
  upcoming: {
    id: 'upcoming',
    title: 'Próxima Edição',
    component: 'UpcomingSection',
    order: 2,
    defaultVisible: true,
    adminOnly: false,
    description: 'Information about upcoming releases'
  },
  recent: {
    id: 'recent',
    title: 'Recent Issues',
    component: 'RecentSection',
    order: 3,
    defaultVisible: true,
    adminOnly: false,
    description: 'Latest published issues'
  },
  recommended: {
    id: 'recommended',
    title: 'Recommended',
    component: 'RecommendedSection',
    order: 4,
    defaultVisible: true,
    adminOnly: false,
    description: 'Recommended content based on user preferences'
  },
  trending: {
    id: 'trending',
    title: 'Trending',
    component: 'TrendingSection',
    order: 5,
    defaultVisible: true,
    adminOnly: false,
    description: 'Currently trending and popular content'
  }
} as const;

export type SectionId = keyof typeof SECTION_REGISTRY;

// Utility functions for section management
export const getSectionById = (id: string): SectionDefinition | undefined => {
  return SECTION_REGISTRY[id as SectionId];
};

export const getAllSections = (): SectionDefinition[] => {
  return Object.values(SECTION_REGISTRY).sort((a, b) => a.order - b.order);
};

export const getVisibleSections = (userIsAdmin: boolean = false): SectionDefinition[] => {
  return getAllSections().filter(section => 
    section.defaultVisible && (!section.adminOnly || userIsAdmin)
  );
};

export const getDefaultSectionConfig = (userIsAdmin: boolean = false) => {
  return getVisibleSections(userIsAdmin).map(section => ({
    id: section.id,
    title: section.title,
    visible: section.defaultVisible,
    order: section.order,
  }));
};
