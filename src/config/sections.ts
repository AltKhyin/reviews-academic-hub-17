
// ABOUTME: Section registry configuration for homepage management
export interface SectionDefinition {
  id: string;
  title: string;
  defaultVisible: boolean;
  defaultOrder: number;
  adminOnly?: boolean;
  description?: string;
}

export const SECTION_REGISTRY: SectionDefinition[] = [
  {
    id: 'reviewer',
    title: 'Comentários dos Revisores',
    defaultVisible: true,
    defaultOrder: 0,
    description: 'Comentários e notas dos revisores'
  },
  {
    id: 'featured',
    title: 'Edição em Destaque',
    defaultVisible: true,
    defaultOrder: 1,
    description: 'Edição principal em destaque na página'
  },
  {
    id: 'upcoming',
    title: 'Próximas Edições',
    defaultVisible: true,
    defaultOrder: 2,
    description: 'Seção de próximas edições'
  },
  {
    id: 'recent',
    title: 'Edições Recentes',
    defaultVisible: true,
    defaultOrder: 3,
    description: 'Edições publicadas recentemente'
  },
  {
    id: 'recommended',
    title: 'Recomendadas',
    defaultVisible: true,
    defaultOrder: 4,
    description: 'Edições recomendadas para o usuário'
  },
  {
    id: 'trending',
    title: 'Mais Acessadas',
    defaultVisible: true,
    defaultOrder: 5,
    description: 'Edições com mais visualizações'
  }
];

export const getSectionById = (id: string): SectionDefinition | undefined => {
  return SECTION_REGISTRY.find(section => section.id === id);
};
