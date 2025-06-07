// ABOUTME: Search page with filters and results display
// Now uses optimal max-width containers for better content centering
// RESTRICTED: Admin access only for advanced search functionality

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Logo from '@/components/common/Logo';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { Card } from '@/components/ui/card';
import { Issue } from '@/types/issue';

const SearchPage: React.FC = () => {
  const { user, profile, isAdmin, isEditor } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [sortBy, setSortBy] = React.useState<'relevance' | 'recent' | 'popular'>('relevance');
  const [searchTags, setSearchTags] = React.useState<{ term: string; exclude: boolean }[]>([]);
  const [queryText, setQueryText] = React.useState<string>('');
  const [areaSearchText, setAreaSearchText] = React.useState<string>('');
  
  // Define filters state
  const CURRENT_YEAR = new Date().getFullYear();
  const DEFAULT_FILTERS = {
    area: [] as string[],
    studyType: [] as string[],
    year: [1980, CURRENT_YEAR] as [number, number],
    journal: [] as string[],
    population: [] as string[]
  };
  
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryText);
    }, 300);
    return () => clearTimeout(timer);
  }, [queryText]);

  // Search query function
  const searchQuery = async (): Promise<Issue[]> => {
    try {
      console.log("SearchPage: Executing search query", { 
        debouncedQuery, 
        searchTags, 
        filters, 
        currentPage, 
        sortBy 
      });

      let query = supabase
        .from('issues')
        .select('*');

      // Apply role-based filtering
      const hasAdminAccess = isAdmin || profile?.role === 'admin';
      const hasEditorAccess = isEditor || profile?.role === 'editor' || hasAdminAccess;
      
      if (!hasAdminAccess && !hasEditorAccess) {
        // Regular users only see published content
        query = query.eq('published', true);
      }

      // Apply text search across multiple fields
      if (debouncedQuery.trim()) {
        const searchTerm = debouncedQuery.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,authors.ilike.%${searchTerm}%`);
      }

      // Apply search tags
      searchTags.forEach(tag => {
        if (tag.exclude) {
          query = query.not('title', 'ilike', `%${tag.term}%`);
        } else {
          query = query.ilike('title', `%${tag.term}%`);
        }
      });

      // Apply filters
      if (filters.area.length > 0) {
        const areaQuery = filters.area.map(area => `specialty.ilike.%${area}%`).join(',');
        query = query.or(areaQuery);
      }

      if (filters.year[0] > 1980 || filters.year[1] < CURRENT_YEAR) {
        if (filters.year[0] === filters.year[1]) {
          query = query.eq('year', filters.year[0].toString());
        } else {
          query = query.gte('year', filters.year[0].toString())
                     .lte('year', filters.year[1].toString());
        }
      }

      if (filters.studyType.length > 0) {
        const designQuery = filters.studyType.map(type => `design.ilike.%${type}%`).join(',');
        query = query.or(designQuery);
      }

      if (filters.population.length > 0) {
        const populationQuery = filters.population.map(pop => `population.ilike.%${pop}%`).join(',');
        query = query.or(populationQuery);
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('score', { ascending: false });
          break;
        case 'relevance':
        default:
          if (debouncedQuery.trim()) {
            query = query.order('created_at', { ascending: false });
          } else {
            query = query.order('featured', { ascending: false })
                         .order('created_at', { ascending: false });
          }
          break;
      }

      // Apply pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      query = query.range(startIndex, startIndex + itemsPerPage - 1);

      const { data, error } = await query;
      
      if (error) {
        console.error("SearchPage: Query error:", error);
        throw error;
      }
      
      console.log(`SearchPage: Successfully fetched ${data?.length || 0} results`);
      return data as Issue[] || [];
      
    } catch (error: any) {
      console.error("SearchPage: Search query failed:", error);
      throw error;
    }
  };

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['search-issues', debouncedQuery, searchTags, filters, currentPage, sortBy, user?.id, profile?.role],
    queryFn: searchQuery,
    staleTime: 30000,
    enabled: true,
    retry: 1,
  });

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryText.trim()) {
      setSearchTags(prev => [...prev, { term: queryText.trim(), exclude: false }]);
      setQueryText('');
      setCurrentPage(1); // Reset to first page
    }
  };

  const handleTagRemove = (index: number) => {
    setSearchTags(searchTags.filter((_, i) => i !== index));
    setCurrentPage(1);
  };

  const handleTagToggleExclude = (index: number) => {
    setSearchTags(searchTags.map((tag, i) => 
      i === index ? { ...tag, exclude: !tag.exclude } : tag
    ));
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: keyof typeof DEFAULT_FILTERS, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTags([]);
    setQueryText('');
    setDebouncedQuery('');
    setCurrentPage(1);
  };

  // Generate a preview of the search query
  const generateQueryPreview = () => {
    if (searchTags.length === 0) return '';
    
    return searchTags.map(tag => 
      tag.exclude ? `NOT "${tag.term}"` : `"${tag.term}"`
    ).join(' AND ');
  };

  const queryPreview = generateQueryPreview();

  // List of facets to show in sidebar
  const facetGroups = {
    area: {
      title: 'Área',
      options: ['Cardiologia', 'Neurologia', 'Oncologia', 'Pediatria', 'Psiquiatria', 'Nutrição']
    },
    studyType: {
      title: 'Tipo de Estudo',
      options: ['Ensaio Clínico', 'Coorte', 'Caso-Controle', 'Metanálise', 'Revisão Sistemática']
    },
    journal: {
      title: 'Jornal',
      options: ['JAMA', 'The Lancet', 'BMJ', 'NEJM', 'Cochrane']
    },
    population: {
      title: 'População',
      options: ['Adultos', 'Pediátrico', 'Idosos', 'Gestantes']
    }
  };

  // Filter area options based on search
  const filteredAreaOptions = areaSearchText.trim() === '' 
    ? facetGroups.area.options 
    : facetGroups.area.options.filter(option => 
        option.toLowerCase().includes(areaSearchText.toLowerCase())
      );

  return (
    <AuthGuard requireAdmin={true}>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#121212' }}>
        {/* Logo Header */}
        <header className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="flex flex-col items-center space-y-2">
            <Logo dark={false} size="2xlarge" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Busca Avançada</h1>
              <p className="text-sm text-warning">🔒 Acesso Restrito - Administradores</p>
            </div>
          </div>
        </header>

        {/* Main content wrapper - Centered with optimal max-width */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Section */}
              <div className="lg:col-span-1">
                <Card className="p-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <h3 className="font-medium text-lg mb-2 text-white">Filtros</h3>
                  <SearchFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    facetGroups={facetGroups}
                    areaSearchText={areaSearchText}
                    setAreaSearchText={setAreaSearchText}
                    filteredAreaOptions={filteredAreaOptions}
                  />
                </Card>
              </div>

              {/* Search and Results Section */}
              <div className="lg:col-span-3">
                {/* Search Header */}
                <Card className="p-6 mb-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                  <SearchHeader 
                    queryText={queryText}
                    setQueryText={setQueryText}
                    handleSubmitSearch={handleSubmitSearch}
                    searchTags={searchTags}
                    handleTagRemove={handleTagRemove}
                    handleTagToggleExclude={handleTagToggleExclude}
                    clearFilters={clearFilters}
                    queryPreview={queryPreview}
                  />
                </Card>

                {/* Results area */}
                <SearchResults 
                  isLoading={isLoading}
                  error={error}
                  searchResults={searchResults}
                  refetch={refetch}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  clearFilters={clearFilters}
                  filters={filters}
                  searchTags={searchTags}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default SearchPage;
