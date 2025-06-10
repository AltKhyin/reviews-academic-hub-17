
// ABOUTME: Enhanced hook for managing sidebar configuration data from site_meta table
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarConfig } from '@/types/sidebar';

// Helper function to validate and convert JSON to SidebarConfig
const validateSidebarConfig = (data: any): SidebarConfig => {
  // Check if data has the required structure for SidebarConfig
  if (data && 
      typeof data === 'object' && 
      typeof data.tagline === 'string' &&
      typeof data.nextReviewTs === 'string' &&
      Array.isArray(data.bookmarks) &&
      Array.isArray(data.rules) &&
      typeof data.changelog === 'object' &&
      Array.isArray(data.sections)) {
    return data as SidebarConfig;
  }
  
  // Return default configuration if validation fails
  return getDefaultSidebarConfig();
};

// Default configuration helper
const getDefaultSidebarConfig = (): SidebarConfig => ({
  tagline: 'Quem aprende junto, cresce.',
  nextReviewTs: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  bookmarks: [
    { label: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/', icon: '📚' },
    { label: 'Cochrane', url: 'https://www.cochranelibrary.com/', icon: '🔬' },
    { label: 'UpToDate', url: 'https://www.uptodate.com/', icon: '📖' }
  ],
  rules: [
    'Mantenha discussões respeitosas e científicas',
    'Cite fontes quando apropriado',
    'Evite spam ou conteúdo irrelevante',
    'Respeite a privacidade dos pacientes',
    'Contribua construtivamente para a comunidade'
  ],
  changelog: {
    show: true,
    entries: [
      { date: '2024-01-15', text: 'Nova funcionalidade de análise de artigos implementada' },
      { date: '2024-01-10', text: 'Melhorias na interface da comunidade' },
      { date: '2024-01-05', text: 'Sistema de bookmarks personalizado' }
    ]
  },
  sections: [
    { id: 'community-header', name: 'Cabeçalho da Comunidade', enabled: true, order: 0 },
    { id: 'active-avatars', name: 'Avatares Ativos', enabled: true, order: 1 },
    { id: 'top-threads', name: 'Discussões em Alta', enabled: true, order: 2 },
    { id: 'next-review', name: 'Próxima Edição', enabled: true, order: 3 },
    { id: 'weekly-poll', name: 'Enquete da Semana', enabled: true, order: 4 },
    { id: 'resource-bookmarks', name: 'Links Úteis', enabled: true, order: 5 },
    { id: 'rules-accordion', name: 'Regras da Comunidade', enabled: true, order: 6 },
    { id: 'mini-changelog', name: 'Changelog', enabled: true, order: 7 }
  ]
});

// Fetch sidebar configuration from site_meta table with enhanced error handling
const fetchSidebarConfig = async (): Promise<SidebarConfig> => {
  try {
    const { data, error } = await supabase
      .from('site_meta')
      .select('value')
      .eq('key', 'sidebar_config')
      .single();

    if (error) {
      console.warn('Error fetching sidebar config:', error.message);
      return getDefaultSidebarConfig();
    }

    if (!data || !data.value) {
      console.log('No sidebar config found, using defaults');
      return getDefaultSidebarConfig();
    }

    // Use the validation helper instead of direct casting
    return validateSidebarConfig(data.value);
  } catch (error) {
    console.error('Unexpected error in fetchSidebarConfig:', error);
    return getDefaultSidebarConfig();
  }
};

export const useSidebarConfig = () => {
  return useQuery({
    queryKey: ['sidebarConfig'],
    queryFn: fetchSidebarConfig,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
