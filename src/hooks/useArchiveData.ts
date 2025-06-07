// Custom hook for managing archive data and interactions
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ArchiveIssue, TagHierarchy, TagFilterState } from '@/types/archive';

export const useArchiveData = () => {
  const [filterState, setFilterState] = useState<TagFilterState>({
    selectedTags: [],
    searchQuery: '',
    sortMode: 'relevance',
    contextualTags: []
  });

  // Fetch published issues
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['archive-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('score', { ascending: false });

      if (error) throw error;
      return data as ArchiveIssue[];
    }
  });

  // Temporary hardcoded tag configuration until migration is run
  const tagConfig: TagHierarchy = {
    "Cardiologia": [
      "Dislipidemia",
      "Estatinas",
      "Hipertensão",
      "Risco cardiovascular"
    ],
    "Endocrinologia": [
      "Diabetes tipo 2",
      "Remissão",
      "Controle glicêmico",
      "Obesidade"
    ],
    "Fisioterapia": [],
    "Fonoaudiologia": [],
    "Psicologia": [
      "Depressão",
      "Psicoterapia",
      "Suporte psicossocial"
    ],
    "Psiquiatria": [
      "Depressão",
      "Psicoterapia",
      "Suporte psicossocial"
    ],
    "Saúde mental": [
      "Escuta ativa",
      "Psicoeducação"
    ],
    "Nutrição": [
      "Educação alimentar",
      "Nutrição clínica",
      "Suplementação"
    ],
    "Atividade física": [
      "Adesão"
    ],
    "Clínica médica": [
      "Nefrologia",
      "Gastroenterologia",
      "Reumatologia",
      "Infectologia",
      "Pneumologia"
    ],
    "Geriatria": [],
    "Pediatria": [
      "Nutrição infantil",
      "Prevenção pediátrica",
      "Rastreios pediátricos"
    ],
    "Medicina de família": [
      "Atenção primária",
      "Seguimento longitudinal"
    ],
    "Decisão compartilhada": [
      "Comunicação clínica"
    ],
    "Saúde pública": [
      "Políticas públicas",
      "Programas populacionais",
      "Ações coletivas",
      "Vacinação"
    ],
    "Farmacologia": [
      "Desprescrição"
    ],
    "Enfermagem": [],
    "Real world evidence": [
      "Estudos pragmáticos",
      "Aplicação clínica",
      "Barreiras de implementação"
    ],
    "Bioestatística": [],
    "Inferência causal": [],
    "Rastreio clínico": [],
    "Testes diagnósticos": [],
    "Odontologia": [],
    "Educação em saúde": [],
    "Hospital": [],
    "Cirurgia": [
      "Ortopedia",
      "Urologia",
      "Cirurgia geral",
      "Indicação cirúrgica",
      "Otorrinologia"
    ]
  };

  // Get all available tags from the configuration
  const allTags = useMemo(() => {
    const tags: string[] = [];
    Object.entries(tagConfig).forEach(([category, subcategories]) => {
      tags.push(category);
      if (Array.isArray(subcategories)) {
        tags.push(...subcategories);
      }
    });
    return [...new Set(tags)];
  }, []);

  // Calculate tag matches for each issue
  const calculateTagMatches = (issue: ArchiveIssue, selectedTags: string[]): number => {
    if (selectedTags.length === 0) return 0;
    
    let matches = 0;
    
    // Check specialty tags (user-facing)
    const specialtyTags = issue.specialty?.toLowerCase().split(',').map(t => t.trim()) || [];
    selectedTags.forEach(tag => {
      if (specialtyTags.some(st => st.includes(tag.toLowerCase()))) {
        matches++;
      }
    });

    // Check backend tags (hierarchical JSON)
    if (issue.backend_tags) {
      try {
        const backendTags = JSON.parse(issue.backend_tags) as TagHierarchy;
        selectedTags.forEach(tag => {
          // Check if tag is a category
          if (backendTags[tag]) {
            matches += 2; // Higher weight for category matches
          } else {
            // Check if tag is in any subcategory
            Object.values(backendTags).forEach(subcategories => {
              if (Array.isArray(subcategories) && subcategories.includes(tag)) {
                matches++;
              }
            });
          }
        });
      } catch (e) {
        console.warn('Invalid backend_tags JSON for issue:', issue.id);
      }
    }

    return matches;
  };

  // Generate contextual tags based on selected tags
  const generateContextualTags = (selectedTags: string[]): string[] => {
    if (selectedTags.length === 0) return [];
    
    const contextual = new Set<string>();
    
    selectedTags.forEach(selectedTag => {
      // Find related tags in the same category
      Object.entries(tagConfig).forEach(([category, subcategories]) => {
        if (category === selectedTag && Array.isArray(subcategories)) {
          // If selected tag is a category, suggest its subcategories
          subcategories.slice(0, 3).forEach(sub => contextual.add(sub));
        } else if (Array.isArray(subcategories) && subcategories.includes(selectedTag)) {
          // If selected tag is a subcategory, suggest the category and sibling subcategories
          contextual.add(category);
          subcategories.filter(sub => sub !== selectedTag).slice(0, 2).forEach(sub => contextual.add(sub));
        }
      });
    });

    return Array.from(contextual).filter(tag => !selectedTags.includes(tag)).slice(0, 5);
  };

  // Filter and sort issues based on current state
  const processedIssues = useMemo(() => {
    let filtered = [...issues];

    // Apply search filter (never eliminate all results)
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      const searchResults = filtered.filter(issue => 
        issue.title.toLowerCase().includes(query) ||
        issue.authors?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        issue.search_title?.toLowerCase().includes(query) ||
        issue.search_description?.toLowerCase().includes(query)
      );
      
      // If search yields results, use them; otherwise keep all issues
      if (searchResults.length > 0) {
        filtered = searchResults;
      }
    }

    // Calculate tag matches for sorting
    const issuesWithMatches = filtered.map(issue => ({
      ...issue,
      tagMatches: calculateTagMatches(issue, filterState.selectedTags)
    }));

    // Sort based on mode
    if (filterState.sortMode === 'tag_match' && filterState.selectedTags.length > 0) {
      issuesWithMatches.sort((a, b) => {
        if (b.tagMatches !== a.tagMatches) {
          return b.tagMatches - a.tagMatches;
        }
        // Secondary sort by score/relevance
        return (b.score || 0) - (a.score || 0);
      });
    } else {
      // Default relevance sort (featured first, then by score, then by date)
      issuesWithMatches.sort((a, b) => {
        if (a.featured !== b.featured) {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        if ((b.score || 0) !== (a.score || 0)) {
          return (b.score || 0) - (a.score || 0);
        }
        return new Date(b.published_at || b.created_at).getTime() - 
               new Date(a.published_at || a.created_at).getTime();
      });
    }

    return issuesWithMatches;
  }, [issues, filterState]);

  // Update contextual tags when selected tags change
  useEffect(() => {
    const contextual = generateContextualTags(filterState.selectedTags);
    setFilterState(prev => ({ ...prev, contextualTags: contextual }));
  }, [filterState.selectedTags]);

  const selectTag = (tag: string) => {
    setFilterState(prev => {
      const isFirstTag = prev.selectedTags.length === 0;
      const newSelectedTags = prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag];
      
      return {
        ...prev,
        selectedTags: newSelectedTags,
        sortMode: isFirstTag && newSelectedTags.length > 0 ? 'tag_match' : prev.sortMode
      };
    });
  };

  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  };

  const clearFilters = () => {
    setFilterState({
      selectedTags: [],
      searchQuery: '',
      sortMode: 'relevance',
      contextualTags: []
    });
  };

  return {
    issues: processedIssues,
    tagConfig,
    allTags,
    filterState,
    isLoading: issuesLoading,
    selectTag,
    setSearchQuery,
    clearFilters
  };
};
