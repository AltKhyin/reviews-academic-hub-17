
// ABOUTME: Centralized section registry for homepage sections with new optimized sections
// Provides unified configuration for homepage sections with metadata

export interface SectionDefinition {
  id: string;
  title: string;
  component: string;
  defaultVisible: boolean;
  defaultOrder: number;
  description?: string;
  adminOnly?: boolean;
  dependencies?: string[];
}

export const SECTION_REGISTRY: SectionDefinition[] = [
  {
    id: 'reviewer',
    title: 'Comentários dos Revisores',
    component: 'ReviewerNotesSection',
    defaultVisible: true,
    defaultOrder: 0,
    description: 'Notas e comentários dos revisores médicos',
    adminOnly: false
  },
  {
    id: 'featured',
    title: 'Edição em Destaque',
    component: 'FeaturedSection',
    defaultVisible: true,
    defaultOrder: 1,
    description: 'Edição principal em destaque na homepage',
    adminOnly: false
  },
  {
    id: 'recent',
    title: 'Edições Recentes',
    component: 'OptimizedRecentSection',
    defaultVisible: true,
    defaultOrder: 2,
    description: 'Edições recentes em layout horizontal otimizado',
    adminOnly: false
  },
  {
    id: 'upcoming',
    title: 'Próximas Edições',
    component: 'UpcomingSection',
    defaultVisible: true,
    defaultOrder: 3,
    description: 'Próximos lançamentos e cronograma',
    adminOnly: false
  },
  {
    id: 'recommended',
    title: 'Recomendados para você',
    component: 'OptimizedRecommendedSection',
    defaultVisible: true,
    defaultOrder: 4,
    description: 'Edições recomendadas em grid 2x3 otimizado',
    adminOnly: false
  },
  {
    id: 'trending',
    title: 'Mais Acessados',
    component: 'TrendingSection',
    defaultVisible: false,
    defaultOrder: 5,
    description: 'Conteúdo mais acessado (arquivado)',
    adminOnly: false
  }
];

// Helper function to get section by ID
export const getSectionById = (id: string): SectionDefinition | undefined => {
  return SECTION_REGISTRY.find(section => section.id === id);
};

// Helper function to get all section IDs
export const getAllSectionIds = (): string[] => {
  return SECTION_REGISTRY.map(section => section.id);
};

// Helper function to get sections by visibility
export const getVisibleSections = (): SectionDefinition[] => {
  return SECTION_REGISTRY.filter(section => section.defaultVisible);
};

// Helper function to get sections sorted by default order
export const getSectionsByOrder = (): SectionDefinition[] => {
  return [...SECTION_REGISTRY].sort((a, b) => a.defaultOrder - b.defaultOrder);
};
